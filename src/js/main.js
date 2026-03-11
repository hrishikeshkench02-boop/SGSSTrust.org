// Main JavaScript File - Fully Dynamic Site

document.addEventListener('DOMContentLoaded', () => {

    const API_URL = '/api/content';
    let slideshowInterval = null;
    let isSlideshowPaused = false;

    // --- Mobile Navigation ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle icon between hamburger and cross
            if (navLinks.classList.contains('active')) {
                mobileMenuToggle.innerHTML = '✕';
            } else {
                mobileMenuToggle.innerHTML = '☰';
            }
        });

        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuToggle.innerHTML = '☰';
            });
        });
    }

    // --- Fetch Data ---
    async function fetchWebsiteContent() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();

            renderHero(data.hero);
            renderWhatWeDo(data.whatWeDo);
            renderImpactCards(data.impact);
            renderWhyMatters(data.whyThisMatters);
            renderDonations(data.donations);
            renderPartners(data.partners);
            renderFooter(data.footer);
        } catch (err) {
            console.error('Failed to load website content:', err);
            document.getElementById('dynamic-hero-container').innerHTML = '<p style="color:white;">Site currently undergoing maintenance.</p>';
        }
    }

    // --- 1. Hero Section ---
    function renderHero(hero) {
        if (!hero) return;

        // Slideshow
        const slideshowContainer = document.getElementById('hero-slideshow');
        if (slideshowContainer && hero.slides && hero.slides.length > 0) {
            slideshowContainer.innerHTML = '';
            hero.slides.forEach((img, idx) => {
                const slide = document.createElement('div');
                slide.className = 'hero-slide' + (idx === 0 ? ' active' : '');
                slide.style.backgroundImage = `url('/${img}')`;
                slideshowContainer.appendChild(slide);
            });

            const slides = slideshowContainer.querySelectorAll('.hero-slide');
            let currentIdx = 0;

            if (slides.length > 1) {
                if (slideshowInterval) clearInterval(slideshowInterval);
                const nextSlide = () => {
                    if (isSlideshowPaused) return;
                    slides[currentIdx].classList.remove('active');
                    currentIdx = (currentIdx + 1) % slides.length;
                    slides[currentIdx].classList.add('active');
                };

                slideshowInterval = setInterval(nextSlide, 5000);

                const heroSection = document.getElementById('home');
                if (heroSection) {
                    heroSection.addEventListener('mouseenter', () => isSlideshowPaused = true);
                    heroSection.addEventListener('mouseleave', () => isSlideshowPaused = false);
                }
            }
        }

        // Hero Content
        const container = document.getElementById('dynamic-hero-container');
        if (container) {
            let badgesHtml = '';
            (hero.badges || []).forEach(b => {
                badgesHtml += `<span class="signal-badge">${b}</span>`;
            });

            container.innerHTML = `
                <div class="hero-content">
                    <h1>${hero.headline || ''}</h1>
                    <p class="hero-mission">${hero.subtext || ''}</p>
                    <div class="trust-signals">${badgesHtml}</div>
                    <div class="hero-actions">
                        <a href="#donate" class="btn btn-primary">${hero.primaryDonateBtn || 'Donate'}</a>
                        <a href="#partner" class="btn btn-secondary">${hero.secondaryPartnerBtn || 'Partner'}</a>
                     </div>
                </div>
            `;
        }
    }

    // --- 2. What We Do Section ---
    function renderWhatWeDo(wwd) {
        const container = document.getElementById('dynamic-what-we-do');
        if (!container || !wwd) return;

        let cardsHtml = '';
        (wwd.cards || []).forEach(card => {
            cardsHtml += `
            <div class="info-card journey-card">
                <div class="journey-step">${card.step}</div>
                <h3>${card.title}</h3>
                <p>${card.description}</p>
            </div>`;
        });

        container.innerHTML = `
            <h2 class="section-title">${wwd.title || ''}</h2>
            <p class="section-subtitle">${wwd.subtitle || ''}</p>
            <div class="cards-grid journey-grid">
                ${cardsHtml}
            </div>
        `;
    }

    // --- 3. Dynamic Impact Cards Logic ---
    function renderImpactCards(impact) {
        const container = document.getElementById('dynamic-impact');
        if (!container || !impact) return;

        let cardsHtml = '';
        const visibleCards = (impact.cards || []).filter(c => c.visible !== false);

        if (visibleCards.length === 0) {
            cardsHtml = '<p>No impact stories to show currently.</p>';
        } else {
            visibleCards.forEach(card => {
                let tagsHtml = '';
                if (card.subtitle) tagsHtml += `<span class="badge-impl" style="margin-right: 5px;">Partner: ${card.subtitle}</span>`;
                if (card.donor) tagsHtml += `<span class="badge-impact" style="margin-right: 5px;">Donor: ${card.donor}</span>`;
                if (card.year) tagsHtml += `<span class="badge-years" style="margin-right: 5px;">${card.year}</span>`;
                if (card.status) tagsHtml += `<span class="badge-new" style="margin-right: 5px;">${card.status}</span>`;

                cardsHtml += `
                <div class="impact-category">
                    <div class="category-header header-with-img" style="background-image: url('/${card.image}');">
                        <h3>${card.title}</h3>
                        <p>${card.description}</p>
                    </div>
                    <div class="partner-list">
                        <div class="partner-row">
                            <div class="partner-info" style="margin-bottom: 0.5rem;">
                                ${tagsHtml}
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        }

        container.innerHTML = `
            <h2 class="section-title">${impact.title || ''}</h2>
            <p class="section-subtitle">${impact.subtitle || ''}</p>
            <div class="impact-grid" id="impact-cards-container">
                ${cardsHtml}
            </div>
        `;
    }

    // --- 4. Why This Matters Section ---
    function renderWhyMatters(why) {
        const container = document.getElementById('dynamic-why-matters');
        if (!container || !why) return;

        let p_html = '';
        (why.paragraphs || []).forEach(p => {
            p_html += `<p>${p}</p>`;
        });

        container.innerHTML = `
            <h2 class="section-title" style="color: white;">${why.title || ''}</h2>
            <div class="content-block centered-text">
                ${p_html}
            </div>
        `;
    }

    // --- 5. Donate Section ---
    function renderDonations(dons) {
        const container = document.getElementById('dynamic-donations');
        if (!container || !dons) return;

        let tiersHtml = '';
        (dons.tiers || []).forEach(tier => {
            const featuredClass = tier.isPopular ? ' featured-card' : '';
            const featuredBadge = tier.isPopular ? '<div class="featured-badge">Most Popular</div>' : '';
            const btnClass = tier.isPopular ? 'btn-primary' : 'btn-outline-primary';

            tiersHtml += `
             <div class="donate-card${featuredClass}">
                 ${featuredBadge}
                 <div class="donate-amount">${tier.amount}</div>
                 <p class="donate-impact">${tier.impact}</p>
                 <button class="btn ${btnClass} btn-block">${tier.buttonText}</button>
             </div>
             `;
        });

        container.innerHTML = `
             <h2 class="section-title">${dons.title || ''}</h2>
             <p class="section-subtitle">${dons.subtitle || ''}</p>
             <div class="donation-grid">
                 ${tiersHtml}
             </div>
             <div class="transparency-box">
                 <div class="trust-badges">
                     <span class="trust-badge">✅ 80G Tax Exemption</span>
                     <span class="trust-badge">✅ 12A Certified</span>
                     <span class="trust-badge">✅ 100% Impact Transparency</span>
                 </div>
                 <p class="small-text text-muted">A donation receipt will be emailed to you instantly after payment.</p>
                 <div class="alert-box" style="margin-top: 1.5rem;">
                     <strong>Payment Gateway Integration:</strong><br>
                     ${dons.gatewayIntegrationText || ''}
                 </div>
             </div>
         `;
    }

    // --- 6. Partners Section ---
    function renderPartners(partners) {
        const container = document.getElementById('dynamic-partners');
        if (!container || !partners) return;

        let badgesHtml = '';
        (partners.badges || []).forEach(b => {
            badgesHtml += `<span class="comp-badge">${b}</span>`;
        });

        let featsHtml = '';
        (partners.features || []).forEach(f => {
            let bulletsHtml = '';
            (f.bullets || []).forEach(bul => bulletsHtml += `<li>${bul}</li>`);
            featsHtml += `
            <div class="feature-block">
                <h4>${f.title}</h4>
                <ul class="check-list">
                    ${bulletsHtml}
                </ul>
            </div>`;
        });

        container.innerHTML = `
            <h2 class="section-title">${partners.title || ''}</h2>
            <p class="section-subtitle">${partners.subtitle || ''}</p>
            <div class="partner-wrapper">
                <div class="partner-intro">
                    <h3>${partners.introHeading || ''}</h3>
                    <p>${partners.introText || ''}</p>
                    <div class="compliance-box">${badgesHtml}</div>
                    <div class="partner-cta">
                        <a href="mailto:${partners.contactEmail}" class="btn btn-secondary btn-large">${partners.contactBtnText}: ${partners.contactEmail}</a>
                    </div>
                </div>
                <div class="partner-features">
                    ${featsHtml}
                </div>
            </div>
        `;
    }

    // --- 7. Footer ---
    function renderFooter(footer) {
        const container = document.getElementById('dynamic-footer');
        if (!container || !footer) return;

        let emailsHtml = '';
        (footer.emails || []).forEach(e => emailsHtml += `<p><a href="mailto:${e}">${e}</a></p>`);

        let phonesHtml = '';
        (footer.phones || []).forEach(p => phonesHtml += `<p><a href="tel:${p.replace(/\s+/g, '')}">${p}</a></p>`);

        let socialHtml = '';
        (footer.social || []).forEach(s => {
            socialHtml += `
             <a href="${s.url}" target="_blank" rel="noopener" class="social-link">
                 <span class="social-icon">${s.icon}</span> ${s.name}
             </a>`;
        });

        container.innerHTML = `
            <div class="footer-grid">
                <div class="footer-col">
                    <h3>Sai Gokula Seva Samsthe</h3>
                    <p>${footer.brandTagline || ''}</p>
                    <p class="footer-cert">${footer.brandCertText || ''}</p>
                </div>
                <div class="footer-col">
                    <h4>Contact Us</h4>
                    <div class="contact-group">
                        <h5>Emails</h5>
                        ${emailsHtml}
                    </div>
                    <div class="contact-group">
                        <h5>Phone</h5>
                        ${phonesHtml}
                    </div>
                </div>
                <div class="footer-col">
                    <h4>Social Media</h4>
                    <div class="social-links">
                        ${socialHtml}
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${footer.copyright || ''}</p>
            </div>
        `;
    }

    // Bootstrap
    fetchWebsiteContent();
});
