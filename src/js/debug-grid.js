(function () {
    // Only run if grid is enabled
    if (!document.body.classList.contains('show-grid')) return;

    function createGridLabels() {
        // Remove existing container if any
        const existing = document.getElementById('debug-grid-labels');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'debug-grid-labels';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '10000';
        container.style.overflow = 'hidden';

        const width = Math.max(document.body.scrollWidth, window.innerWidth);
        const height = Math.max(document.body.scrollHeight, window.innerHeight);

        // X-Axis Labels (every 100px)
        for (let x = 0; x < width; x += 100) {
            const label = document.createElement('div');
            label.textContent = x;
            label.className = 'grid-label-x';
            label.style.position = 'absolute';
            label.style.left = x + 'px';
            label.style.top = '0';
            label.style.padding = '2px 5px';
            label.style.fontSize = '10px';
            label.style.color = 'red';
            label.style.fontWeight = 'bold';
            label.style.borderLeft = '1px solid red';
            container.appendChild(label);
        }

        // Y-Axis Labels (every 100px)
        for (let y = 0; y < height; y += 100) {
            if (y === 0) continue; // Skip 0,0 overlap
            const label = document.createElement('div');
            label.textContent = y;
            label.className = 'grid-label-y';
            label.style.position = 'absolute';
            label.style.top = y + 'px';
            label.style.left = '0';
            label.style.padding = '2px 5px';
            label.style.fontSize = '10px';
            label.style.color = 'red';
            label.style.fontWeight = 'bold';
            label.style.borderTop = '1px solid red';
            container.appendChild(label);
        }

        document.body.appendChild(container);
    }

    // Run on load and resize
    window.addEventListener('load', createGridLabels);
    window.addEventListener('resize', createGridLabels);
    // Also run immediately in case we're late
    if (document.readyState === 'complete') createGridLabels();
})();
