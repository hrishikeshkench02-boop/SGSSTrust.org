document.addEventListener('DOMContentLoaded', () => {

    // --- State & Config ---
    const API_BASE = '/api';
    let contentData = null;
    let authToken = localStorage.getItem('sgss_admin_token');

    // --- DOM Elements ---
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const navButtons = document.querySelectorAll('.nav-btn');
    const adminPanels = document.querySelectorAll('.admin-panel');

    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal');
    const editCardForm = document.getElementById('edit-card-form');

    // --- Initialization ---
    if (authToken) {
        showDashboard();
        fetchContent();
    } else {
        loginContainer.classList.remove('hidden');
    }

    // --- Navigation Logic ---
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            navButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const targetId = e.target.getAttribute('data-target');
            adminPanels.forEach(panel => {
                if (panel.id === targetId) panel.classList.add('active');
                else panel.classList.remove('active');
            });
        });
    });

    // --- Authentication ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                authToken = data.token;
                localStorage.setItem('sgss_admin_token', authToken);
                showDashboard();
                fetchContent();
                errorEl.innerText = '';
            } else {
                errorEl.innerText = data.message || 'Login failed';
            }
        } catch (err) {
            errorEl.innerText = 'Network error during login';
        }
    });

    logoutBtn.addEventListener('click', () => {
        authToken = null;
        localStorage.removeItem('sgss_admin_token');
        dashboardContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    function showDashboard() {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
    }

    // --- API Interactions ---

    async function fetchContent() {
        try {
            const res = await fetch(`${API_BASE}/content`);
            contentData = await res.json();
            populateAllForms();
        } catch (err) {
            console.error('Failed to fetch content:', err);
        }
    }

    async function saveGlobalContent(statusElementId) {
        const btn = document.querySelector(`#${statusElementId}`).previousElementSibling;
        const statusEl = document.getElementById(statusElementId);

        btn.disabled = true;
        statusEl.innerText = 'Saving...';
        statusEl.className = 'status-msg';

        try {
            const res = await fetch(`${API_BASE}/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(contentData)
            });
            const result = await res.json();
            if (result.success) {
                statusEl.innerText = 'Saved Successfully!';
                statusEl.className = 'status-msg status-success';
                setTimeout(() => statusEl.innerText = '', 3000);
            } else {
                if (res.status === 401) {
                    alert('Session expired. Please log in again.');
                    logoutBtn.click();
                } else {
                    throw new Error(result.error || 'Server error');
                }
            }
        } catch (err) {
            statusEl.innerText = err.message;
            statusEl.className = 'status-msg error-text';
        } finally {
            btn.disabled = false;
        }
    }

    async function uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Upload failed');
        return data.path;
    }

    // --- Populate Forms ---
    function populateAllForms() {
        if (!contentData) return;

        // 1. Hero
        document.getElementById('hero-headline').value = contentData.hero.headline || '';
        document.getElementById('hero-subtext').value = contentData.hero.subtext || '';
        document.getElementById('hero-btn-primary').value = contentData.hero.primaryDonateBtn || '';
        document.getElementById('hero-btn-secondary').value = contentData.hero.secondaryPartnerBtn || '';
        document.getElementById('hero-badges').value = (contentData.hero.badges || []).join(', ');
        renderHeroImages();

        // 2. WWD
        document.getElementById('wwd-title').value = contentData.whatWeDo.title || '';
        document.getElementById('wwd-subtitle').value = contentData.whatWeDo.subtitle || '';
        renderWwdCards();

        // 3. Impact
        document.getElementById('impact-title').value = contentData.impact.title || '';
        document.getElementById('impact-subtitle').value = contentData.impact.subtitle || '';
        renderImpactCards();

        // 4. Why
        document.getElementById('why-title').value = contentData.whyThisMatters.title || '';
        document.getElementById('why-paragraphs').value = (contentData.whyThisMatters.paragraphs || []).join('\n');

        // 5. Donations
        document.getElementById('don-title').value = contentData.donations.title || '';
        document.getElementById('don-subtitle').value = contentData.donations.subtitle || '';
        document.getElementById('don-gateway').value = contentData.donations.gatewayIntegrationText || '';
        renderDonationTiers();

        // 6. Partners
        document.getElementById('partner-title').value = contentData.partners.title || '';
        document.getElementById('partner-subtitle').value = contentData.partners.subtitle || '';
        document.getElementById('partner-intro-head').value = contentData.partners.introHeading || '';
        document.getElementById('partner-intro-text').value = contentData.partners.introText || '';
        document.getElementById('partner-email').value = contentData.partners.contactEmail || '';
        document.getElementById('partner-btn').value = contentData.partners.contactBtnText || '';
        document.getElementById('partner-badges').value = (contentData.partners.badges || []).join(', ');
        document.getElementById('partner-features-json').value = JSON.stringify(contentData.partners.features, null, 2);

        // 7. Footer
        document.getElementById('foot-tagline').value = contentData.footer.brandTagline || '';
        document.getElementById('foot-cert').value = contentData.footer.brandCertText || '';
        document.getElementById('foot-emails').value = (contentData.footer.emails || []).join(', ');
        document.getElementById('foot-phones').value = (contentData.footer.phones || []).join(', ');
        document.getElementById('foot-copy').value = contentData.footer.copyright || '';
    }

    // --- Section Savers ---

    document.getElementById('hero-text-form').addEventListener('submit', (e) => {
        e.preventDefault();
        contentData.hero.headline = document.getElementById('hero-headline').value;
        contentData.hero.subtext = document.getElementById('hero-subtext').value;
        contentData.hero.primaryDonateBtn = document.getElementById('hero-btn-primary').value;
        contentData.hero.secondaryPartnerBtn = document.getElementById('hero-btn-secondary').value;
        contentData.hero.badges = document.getElementById('hero-badges').value.split(',').map(s => s.trim()).filter(Boolean);
        saveGlobalContent('hero-text-status');
    });

    document.getElementById('wwd-text-form').addEventListener('submit', (e) => {
        e.preventDefault();
        contentData.whatWeDo.title = document.getElementById('wwd-title').value;
        contentData.whatWeDo.subtitle = document.getElementById('wwd-subtitle').value;
        saveGlobalContent('wwd-text-status');
    });

    document.getElementById('impact-text-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // Since API saves entire JSON tree for these, we just mutate state and save
        contentData.impact.title = document.getElementById('impact-title').value;
        contentData.impact.subtitle = document.getElementById('impact-subtitle').value;
        saveGlobalContent('impact-title'); // using a generic ID to trigger global save
    });

    document.getElementById('why-form').addEventListener('submit', (e) => {
        e.preventDefault();
        contentData.whyThisMatters.title = document.getElementById('why-title').value;
        contentData.whyThisMatters.paragraphs = document.getElementById('why-paragraphs').value.split('\n').filter(Boolean);
        saveGlobalContent('why-status');
    });

    document.getElementById('don-text-form').addEventListener('submit', (e) => {
        e.preventDefault();
        contentData.donations.title = document.getElementById('don-title').value;
        contentData.donations.subtitle = document.getElementById('don-subtitle').value;
        contentData.donations.gatewayIntegrationText = document.getElementById('don-gateway').value;
        saveGlobalContent('don-title');
    });

    document.getElementById('partner-form').addEventListener('submit', (e) => {
        e.preventDefault();
        contentData.partners.title = document.getElementById('partner-title').value;
        contentData.partners.subtitle = document.getElementById('partner-subtitle').value;
        contentData.partners.introHeading = document.getElementById('partner-intro-head').value;
        contentData.partners.introText = document.getElementById('partner-intro-text').value;
        contentData.partners.contactEmail = document.getElementById('partner-email').value;
        contentData.partners.contactBtnText = document.getElementById('partner-btn').value;
        contentData.partners.badges = document.getElementById('partner-badges').value.split(',').map(s => s.trim()).filter(Boolean);
        saveGlobalContent('partner-title');
    });

    document.getElementById('save-partner-features-btn').addEventListener('click', () => {
        try {
            contentData.partners.features = JSON.parse(document.getElementById('partner-features-json').value);
            saveGlobalContent('save-partner-features-btn');
        } catch (e) { alert('Invalid JSON Format'); }
    });

    document.getElementById('footer-form').addEventListener('submit', (e) => {
        e.preventDefault();
        contentData.footer.brandTagline = document.getElementById('foot-tagline').value;
        contentData.footer.brandCertText = document.getElementById('foot-cert').value;
        contentData.footer.copyright = document.getElementById('foot-copy').value;
        contentData.footer.emails = document.getElementById('foot-emails').value.split(',').map(s => s.trim()).filter(Boolean);
        contentData.footer.phones = document.getElementById('foot-phones').value.split(',').map(s => s.trim()).filter(Boolean);
        saveGlobalContent('foot-status');
    });

    // --- Complex Sub-Lists Renders & Listeners ---

    function renderHeroImages() {
        const grid = document.getElementById('hero-images-grid');
        grid.innerHTML = '';
        (contentData.hero.slides || []).forEach((imgPath, index) => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `<img src="/${imgPath}"><button class="remove-btn" data-index="${index}">&times;</button>`;
            grid.appendChild(card);
        });

        grid.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Remove slide?')) {
                    contentData.hero.slides.splice(e.target.getAttribute('data-index'), 1);
                    await saveGlobalContent('hero-upload-status');
                    renderHeroImages();
                }
            });
        });
    }

    document.getElementById('hero-upload-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('hero-file-input');
        if (!fileInput.files[0]) return;
        try {
            const uploadedPath = await uploadImage(fileInput.files[0]);
            contentData.hero.slides.push(uploadedPath);
            await saveGlobalContent('hero-upload-status');
            renderHeroImages();
            fileInput.value = '';
        } catch (err) { alert(err.message); }
    });

    function renderWwdCards() {
        const list = document.getElementById('wwd-cards-list');
        list.innerHTML = '';
        (contentData.whatWeDo.cards || []).forEach((card, idx) => {
            list.innerHTML += `<div class="list-item">
                <div><strong>${card.step}:</strong> ${card.title}</div>
                <button class="btn btn-danger btn-sm" onclick="deleteWwdCard(${idx})">Delete</button>
            </div>`;
        });
    }
    window.deleteWwdCard = async (idx) => {
        if (!confirm('Delete card?')) return;
        contentData.whatWeDo.cards.splice(idx, 1);
        await saveGlobalContent('wwd-text-status');
        renderWwdCards();
    };
    document.getElementById('wwd-add-card-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        contentData.whatWeDo.cards.push({
            id: 'wwd-' + Date.now(),
            step: document.getElementById('wwd-card-step').value,
            title: document.getElementById('wwd-card-title').value,
            description: document.getElementById('wwd-card-desc').value
        });
        await saveGlobalContent('wwd-text-status');
        renderWwdCards();
        e.target.reset();
    });

    function renderDonationTiers() {
        const list = document.getElementById('don-tiers-list');
        list.innerHTML = '';
        (contentData.donations.tiers || []).forEach((tier, idx) => {
            list.innerHTML += `<div class="list-item">
                <div><strong>${tier.amount}:</strong> ${tier.buttonText} ${tier.isPopular ? '(Popular)' : ''}</div>
                <button class="btn btn-danger btn-sm" onclick="deleteDonTier(${idx})">Delete</button>
            </div>`;
        });
    }
    window.deleteDonTier = async (idx) => {
        if (!confirm('Delete tier?')) return;
        contentData.donations.tiers.splice(idx, 1);
        await saveGlobalContent('don-title');
        renderDonationTiers();
    };
    document.getElementById('don-add-tier-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        contentData.donations.tiers.push({
            id: 'don-' + Date.now(),
            amount: document.getElementById('tier-amount').value,
            buttonText: document.getElementById('tier-btn').value,
            impact: document.getElementById('tier-impact').value,
            isPopular: document.getElementById('tier-popular').checked
        });
        await saveGlobalContent('don-title');
        renderDonationTiers();
        e.target.reset();
    });


    // --- Impact Cards Logic Using Dedicated API ---
    function renderImpactCards() {
        const list = document.getElementById('impact-cards-list');
        list.innerHTML = '';

        (contentData.impact.cards || []).forEach((card) => {
            const el = document.createElement('div');
            el.className = 'impact-admin-card';
            el.innerHTML = `
                <img src="/${card.image}" alt="${card.title}" style="opacity: ${card.visible === false ? '0.3' : '1'}">
                <div class="impact-details">
                    <h4>${card.title} ${card.visible === false ? '(Hidden)' : ''}</h4>
                    <p>${(card.description || '').substring(0, 60)}...</p>
                </div>
                <div class="impact-actions">
                    <button class="btn btn-outline btn-edit" data-id="${card.id}">Edit</button>
                    <button class="btn btn-danger btn-delete" data-id="${card.id}">Remove</button>
                </div>
            `;
            list.appendChild(el);
        });

        list.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!confirm('Are you sure you want to delete this impact card?')) return;
                const id = e.target.getAttribute('data-id');
                try {
                    const res = await fetch(`${API_BASE}/card/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const result = await res.json();
                    if (result.success) {
                        contentData.impact.cards = contentData.impact.cards.filter(c => c.id !== id);
                        renderImpactCards();
                    } else alert(result.error);
                } catch (err) { alert('Error deleting card'); }
            });
        });

        list.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const card = contentData.impact.cards.find(c => c.id === id);
                if (!card) return;

                document.getElementById('edit-card-id').value = card.id;
                document.getElementById('edit-card-title').value = card.title || '';
                document.getElementById('edit-card-subtitle').value = card.subtitle || '';
                document.getElementById('edit-card-desc').value = card.description || '';
                document.getElementById('edit-card-donor').value = card.donor || '';
                document.getElementById('edit-card-year').value = card.year || '';
                document.getElementById('edit-card-status-input').value = card.status || '';
                document.getElementById('edit-card-visible').checked = card.visible !== false;
                editModal.classList.remove('hidden');
            });
        });
    }

    document.getElementById('add-card-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('card-image-input');
        const btn = document.getElementById('card-add-btn');
        btn.disabled = true;

        try {
            let uploadedPath = 'src/assets/placeholders/skill_training.png';
            if (fileInput.files[0]) uploadedPath = await uploadImage(fileInput.files[0]);

            const newCard = {
                id: 'card-' + Date.now(),
                title: document.getElementById('card-title').value,
                subtitle: document.getElementById('card-subtitle').value,
                description: document.getElementById('card-desc').value,
                donor: document.getElementById('card-donor').value,
                year: document.getElementById('card-year').value,
                status: document.getElementById('card-status-input').value,
                image: uploadedPath,
                visible: true
            };

            contentData.impact.cards.push(newCard);

            // Need to save full structure here because POST /api/content replaces the full file
            await saveGlobalContent('card-status');
            renderImpactCards();
            e.target.reset();

        } catch (err) { alert(err.message); } finally { btn.disabled = false; }
    });

    closeEditModalBtn.addEventListener('click', () => { editModal.classList.add('hidden'); });

    editCardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('card-save-btn');
        btn.disabled = true;

        try {
            const id = document.getElementById('edit-card-id').value;
            const fileInput = document.getElementById('edit-card-image-input');
            const cardIndex = contentData.impact.cards.findIndex(c => c.id === id);
            if (cardIndex === -1) throw new Error('Card not found');

            let uploadedPath = contentData.impact.cards[cardIndex].image;
            if (fileInput.files[0]) uploadedPath = await uploadImage(fileInput.files[0]);

            const updatedCard = {
                title: document.getElementById('edit-card-title').value,
                subtitle: document.getElementById('edit-card-subtitle').value,
                description: document.getElementById('edit-card-desc').value,
                donor: document.getElementById('edit-card-donor').value,
                year: document.getElementById('edit-card-year').value,
                status: document.getElementById('edit-card-status-input').value,
                visible: document.getElementById('edit-card-visible').checked,
                image: uploadedPath
            };

            const res = await fetch(`${API_BASE}/card/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify(updatedCard)
            });
            const result = await res.json();

            if (!result.success) throw new Error(result.error);

            contentData.impact.cards[cardIndex] = { id, ...updatedCard };
            renderImpactCards();
            editModal.classList.add('hidden');
        } catch (err) { alert(err.message); } finally { btn.disabled = false; }
    });

});
