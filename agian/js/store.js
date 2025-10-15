document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const storeGrid = document.getElementById('store-items-grid');

    // --- Store Data (Prices Removed) ---
    const STORE_ITEMS = [
        { id: 'theme-default', name: 'Default Blue', type: 'theme', previewClass: 'preview-default' },
        { id: 'theme-sunset', name: 'Sunset Orange', type: 'theme', previewClass: 'preview-sunset' },
        { id: 'theme-forest', name: 'Forest Green', type: 'theme', previewClass: 'preview-forest' },
        { id: 'theme-midnight', name: 'Midnight Purple', type: 'theme', previewClass: 'preview-midnight' }
    ];

    // --- Simplified User Data State ---
    let activeTheme = 'theme-default';

    // --- Core Functions ---

    function loadActiveTheme() {
        const savedTheme = localStorage.getItem('notionx-activeTheme');
        if (savedTheme) {
            activeTheme = savedTheme;
        }
    }

    function saveActiveTheme() {
        localStorage.setItem('notionx-activeTheme', activeTheme);
    }

    function applyThemeToPage() {
        // Remove all possible theme classes from the body
        STORE_ITEMS.forEach(item => {
            if (item.type === 'theme') {
                document.body.classList.remove(item.id);
            }
        });
        // Add the currently active theme class
        if (activeTheme) {
            document.body.classList.add(activeTheme);
        }
    }

    function renderStoreItems() {
        storeGrid.innerHTML = ''; // Clear existing items

        STORE_ITEMS.forEach(item => {
            const isActive = (activeTheme === item.id);

            let buttonHtml;
            if (isActive) {
                buttonHtml = `<button class="btn btn-light w-100" disabled><i class="bi bi-check-circle-fill"></i> Active</button>`;
            } else {
                buttonHtml = `<button class="btn btn-primary w-100 btn-apply" data-id="${item.id}">Apply Theme</button>`;
            }

            const itemCard = document.createElement('div');
            itemCard.className = 'col-md-6 col-lg-4';
            itemCard.innerHTML = `
                <div class="store-item ${isActive ? 'active' : ''}">
                    <div class="theme-preview ${item.previewClass}"></div>
                    <h5 class="store-item-title">${item.name}</h5>
                    ${buttonHtml}
                </div>
            `;
            storeGrid.appendChild(itemCard);
        });

        // Add event listeners after rendering
        addEventListenersToButtons();
    }

    function addEventListenersToButtons() {
        document.querySelectorAll('.btn-apply').forEach(button => {
            button.addEventListener('click', handleApplyTheme);
        });
    }

    function handleApplyTheme(event) {
        const itemId = event.currentTarget.dataset.id;
        activeTheme = itemId;

        saveActiveTheme();
        applyThemeToPage();
        renderStoreItems(); // Re-render to update the active states
    }

    // --- Initialization ---
    function init() {
        loadActiveTheme();
        applyThemeToPage(); // Apply theme on page load
        renderStoreItems();
    }

    init();
});