// js/main.js

// This constant defines all achievements.
const ALL_ACHIEVEMENTS = [
    { id: 'level_5', title: 'Novice Adventurer', description: 'Reach Level 5.', icon: 'bi-shield-check', checker: (data) => data.level >= 5 },
    { id: 'level_10', title: 'Seasoned Explorer', description: 'Reach Level 10.', icon: 'bi-shield-fill-check', checker: (data) => data.level >= 10 },
    { id: 'tasks_1', title: 'First Step', description: 'Complete your first task.', icon: 'bi-check2-circle', checker: (data) => data.tasks && data.tasks.filter(t => t.completed).length >= 1 },
    { id: 'tasks_50', title: 'Task Master', description: 'Complete 50 tasks.', icon: 'bi-list-task', checker: (data) => data.tasks && data.tasks.filter(t => t.completed).length >= 50 },
    { id: 'pomodoro_10', title: 'Focused Mind', description: 'Complete 10 Pomodoro cycles.', icon: 'bi-clock-history', checker: (data) => data.pomodoro && data.pomodoro.cycles >= 10 },
    { id: 'coins_1000', title: 'Coin Collector', description: 'Possess 1000 coins.', icon: 'bi-coin', checker: (data) => data.store && data.store.coins >= 1000 },
    { id: 'buy_theme', title: 'Personal Touch', description: 'Buy your first theme.', icon: 'bi-palette-fill', checker: (data) => data.store && data.store.ownedThemes.length > 1 }
];

// This constant holds the complete HTML for the navbar and all global modals.
const NAV_BAR_HTML = `
    <nav class="navbar navbar-expand-lg  boarder navbar-dark nx-glass glow-on-hover fixed-top">
        <div class="container">
            <a class="navbar-brand fw-bold" href="dashboard.html">TaskNova</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="mainNavbar">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item"><a class="nav-link" href="dashboard.html">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="tasks.html">Tasks</a></li>
                    <li class="nav-item"><a class="nav-link" href="habits.html">Habits</a></li>
                    <li class="nav-item"><a class="nav-link" href="calendar.html">Calendar</a></li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Tools</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="notes.html">Notes</a></li>
                            <li><a class="dropdown-item" href="pomodoro.html">Pomodoro</a></li>
                            <li><a class="dropdown-item" href="water.html">Water Tracker</a></li>
                            <li><a class="dropdown-item" href="budget.html">Budget</a></li>
                            <li><a class="dropdown-item" href="journal.html">Journal</a></li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">More</a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="analytics.html">Analytics</a></li>
                            <li><a class="dropdown-item" href="achievements.html">Achievements</a></li>
                            <li><a class="dropdown-item" href="store.html">Reward Store</a></li>
                            <li><a class="dropdown-item" href="games.html">Arcade Zone</a></li>
                        </ul>
                    </li>
                </ul>
                <div class="d-flex align-items-center">
                    <button id="global-search-btn" class="btn btn-outline-secondary me-3" data-bs-toggle="modal" data-bs-target="#search-modal"><i class="bi bi-search"></i></button>
                    <div class="xp-bar-container me-3">
                        <div class="d-flex justify-content-between align-items-center mb-1"><span class="text-white small fw-bold">Level <span id="global-level">1</span></span><span class="text-white-50 small"><span id="global-xp">0</span> / 100 XP</span></div>
                        <div class="progress" style="height: 8px; width: 150px;"><div id="global-xp-bar" class="progress-bar bg-primary" role="progressbar" style="width: 0%;"></div></div>
                    </div>
                    <div class="dropdown">
                        <a href="#" class="text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrBn_e_72BEO9S8px_3bM_EjsFVez0jdr7Dgh6499WHQ&s" alt="User Avatar" class="rounded-circle" style="width: 40px; height: 40px;"></a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
                            <li><a class="dropdown-item" href="settings.html">Settings</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" id="logout-btn">Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Toasts and Modals Container -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1100">
        <div id="achievement-toast" class="toast hide" role="alert"><div class="toast-header"><strong class="me-auto text-warning"><i class="bi bi-trophy-fill"></i> Achievement Unlocked!</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div><div class="toast-body"></div></div>
    </div>
    <div class="modal fade" id="welcome-modal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false"><div class="modal-dialog modal-dialog-centered"><div class="modal-content nx-glass"><div class="modal-header"><h5 class="modal-title">Welcome to NotionX!</h5></div><div class="modal-body"><p>Here's a quick guide:</p><ul class="list-unstyled"><li class="mb-2"><i class="bi bi-star-fill text-primary me-2"></i><strong>Earn XP:</strong> Complete tasks, track habits, and use timers.</li><li class="mb-2"><i class="bi bi-shield-fill-check text-success me-2"></i><strong>Level Up:</strong> Gaining XP increases your level.</li><li class="mb-2"><i class="bi bi-coin text-warning me-2"></i><strong>Earn Coins:</strong> Leveling up grants you coins for the store.</li><li><i class="bi bi-palette-fill text-info me-2"></i><strong>Customize:</strong> Use coins to buy new themes!</li></ul></div><div class="modal-footer"><button type="button" id="welcome-modal-btn" class="btn btn-primary w-100" data-bs-dismiss="modal">Get Started</button></div></div></div></div>
    <div class="modal fade" id="search-modal" tabindex="-1"><div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content nx-glass"><div class="modal-header"><div class="input-group"><span class="input-group-text"><i class="bi bi-search"></i></span><input type="text" id="search-input" class="form-control" placeholder="Search across tasks, notes, and journal..."></div></div><div class="modal-body" style="min-height: 300px; max-height: 400px; overflow-y: auto;"><ul id="search-results-list" class="list-group list-group-flush"></ul></div></div></div></div>
`;

function checkAndUnlockAchievements() {
    let userData = JSON.parse(localStorage.getItem('notionx_user'));
    if (!userData || !userData.achievements) return;
    const achievementToastEl = document.getElementById('achievement-toast');
    if (!achievementToastEl) return;
    const achievementToast = new bootstrap.Toast(achievementToastEl);
    ALL_ACHIEVEMENTS.forEach(achievement => {
        const isAlreadyUnlocked = userData.achievements.unlocked.includes(achievement.id);
        if (!isAlreadyUnlocked && achievement.checker(userData)) {
            userData.achievements.unlocked.push(achievement.id);
            achievementToastEl.querySelector('.toast-body').innerHTML = `<i class="bi ${achievement.icon} text-warning me-2"></i><strong>${achievement.title}</strong> Unlocked!`;
            achievementToast.show();
        }
    });
    localStorage.setItem('notionx_user', JSON.stringify(userData));
}
window.checkAndUnlockAchievements = checkAndUnlockAchievements;

document.addEventListener('DOMContentLoaded', () => {

    function initializeBootstrapComponents() {
        const dropdownElementList = [].slice.call(document.querySelectorAll('[data-bs-toggle="dropdown"]'));
        dropdownElementList.map(function (dropdownToggleEl) {
            return new bootstrap.Dropdown(dropdownToggleEl);
        });
    }

    function applyTheme() {
        const userData = JSON.parse(localStorage.getItem('notionx_user'));
        const theme = (userData && userData.store && userData.store.equippedTheme) ? userData.store.equippedTheme : 'default';
        document.documentElement.setAttribute('data-theme', theme);
    }

    function loadNavbar() {
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.innerHTML = NAV_BAR_HTML;
        }
    }

    function initUserData() {
        if (!localStorage.getItem('notionx_user')) {
            const defaultUser = {
                level: 1, xp: 0, username: "User", tasks: [], notes: [],
                water: { intake: 0, goal: 8, streak: 0 },
                pomodoro: { cycles: 0, streak: 0 },
                habits: [], budget: { transactions: [] }, journal: [],
                calendar: { events: {} },
                store: { coins: 0, ownedThemes: ['default'], equippedTheme: 'default' },
                achievements: { unlocked: [] },
                settings: { notificationsEnabled: false, dashboardLayout: ['xp', 'tasks', 'water', 'pomodoro'] }
            };
            localStorage.setItem('notionx_user', JSON.stringify(defaultUser));
        }
    }

    function updateNavbarXP() {
        const userData = JSON.parse(localStorage.getItem('notionx_user'));
        if (!userData) return;
        const xpForNextLevel = 100;
        const xpProgress = (userData.xp / xpForNextLevel) * 100;
        document.getElementById('global-level').textContent = userData.level;
        document.getElementById('global-xp').textContent = `${userData.xp} / ${xpForNextLevel}`;
        document.getElementById('global-xp-bar').style.width = `${xpProgress}%`;
    }

    function handleWelcomeModal() {
        if (!localStorage.getItem('notionx_has_visited')) {
            const welcomeModal = new bootstrap.Modal(document.getElementById('welcome-modal'));
            welcomeModal.show();
            document.getElementById('welcome-modal-btn').addEventListener('click', () => {
                localStorage.setItem('notionx_has_visited', 'true');
            });
        }
    }

    function highlightActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.navbar-nav .nav-link, .dropdown-menu .dropdown-item').forEach(link => {
            if (link.getAttribute('href') === currentPage) link.classList.add('active');
        });
    }

    function handleGlobalSearch() {
        const searchInput = document.getElementById('search-input');
        const resultsList = document.getElementById('search-results-list');
        if (!searchInput) return;
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            resultsList.innerHTML = '';
            if (query.length < 2) return;
            const userData = JSON.parse(localStorage.getItem('notionx_user'));
            let results = [];
            if (userData.tasks) userData.tasks.forEach(t => { if (t.text.toLowerCase().includes(query)) results.push({ type: 'Task', title: t.text, link: 'tasks.html' }); });
            if (userData.notes) userData.notes.forEach(n => { if (n.content.toLowerCase().includes(query)) results.push({ type: 'Note', title: n.content.substring(0, 40) + '...', link: 'notes.html' }); });
            if (userData.journal) userData.journal.forEach(j => { if (j.text.toLowerCase().includes(query)) results.push({ type: 'Journal', title: `Entry from ${new Date(j.date).toDateString()}`, link: 'journal.html' }); });
            if (results.length > 0) {
                results.forEach(res => {
                    resultsList.innerHTML += `<li class="list-group-item"><a href="${res.link}"><div class="d-flex justify-content-between"><span>${res.title}</span><span class="badge bg-primary">${res.type}</span></div></a></li>`;
                });
            } else {
                resultsList.innerHTML = `<li class="list-group-item text-secondary">No results found.</li>`;
            }
        });
    }

    // --- Main Execution ---
    applyTheme();
    loadNavbar();
    initUserData();

    // The rest must run AFTER the navbar and modals are loaded
    updateNavbarXP();
    handleGlobalSearch();
    handleWelcomeModal();
    highlightActiveNavLink();
    checkAndUnlockAchievements();
    initializeBootstrapComponents();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to logout? This will clear all data.")) {
                localStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }
});