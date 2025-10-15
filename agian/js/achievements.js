document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const achievementsGrid = document.getElementById('achievements-grid');

    // --- Load User Data ---
    let userData = JSON.parse(localStorage.getItem('notionx_user'));

    // --- Achievement Definitions ---
    // This is the "rules engine" for all achievements.
    // Each has an id, title, description, icon, and a checker function that returns true or false.
    const ALL_ACHIEVEMENTS = [
        // Level Achievements
        {
            id: 'level_5',
            title: 'Novice Adventurer',
            description: 'Reach Level 5.',
            icon: 'bi-shield-check',
            checker: (data) => data.level >= 5
        },
        {
            id: 'level_10',
            title: 'Seasoned Explorer',
            description: 'Reach Level 10.',
            icon: 'bi-shield-fill-check',
            checker: (data) => data.level >= 10
        },
        // Task Achievements
        {
            id: 'tasks_1',
            title: 'First Step',
            description: 'Complete your first task.',
            icon: 'bi-check2-circle',
            checker: (data) => data.tasks && data.tasks.filter(t => t.completed).length >= 1
        },
        {
            id: 'tasks_50',
            title: 'Task Master',
            description: 'Complete 50 tasks.',
            icon: 'bi-list-task',
            checker: (data) => data.tasks && data.tasks.filter(t => t.completed).length >= 50
        },
        // Pomodoro Achievements
        {
            id: 'pomodoro_10',
            title: 'Focused Mind',
            description: 'Complete 10 Pomodoro cycles.',
            icon: 'bi-clock-history',
            checker: (data) => data.pomodoro && data.pomodoro.cycles >= 10
        },
        // Store/Coin Achievements
        {
            id: 'coins_1000',
            title: 'Coin Collector',
            description: 'Possess 1000 coins at one time.',
            icon: 'bi-coin',
            checker: (data) => data.store && data.store.coins >= 1000
        },
        {
            id: 'buy_theme',
            title: 'Personal Touch',
            description: 'Buy your first theme from the store.',
            icon: 'bi-palette-fill',
            checker: (data) => data.store && data.store.ownedThemes.length > 1 // Everyone starts with 1 (default)
        }
    ];

    // --- Core Functions ---
    const saveUserData = () => {
        localStorage.setItem('notionx_user', JSON.stringify(userData));
    };

    /**
     * Iterates through all achievements, checks their conditions against user data,
     * and adds any newly earned achievement IDs to the user's profile.
     */
    const checkAndUnlockAchievements = () => {
        let newAchievementsUnlocked = false;
        ALL_ACHIEVEMENTS.forEach(achievement => {
            const isAlreadyUnlocked = userData.achievements.unlocked.includes(achievement.id);

            if (!isAlreadyUnlocked && achievement.checker(userData)) {
                userData.achievements.unlocked.push(achievement.id);
                newAchievementsUnlocked = true;
                // A toast notification could be triggered here for immediate feedback
            }
        });

        if (newAchievementsUnlocked) {
            saveUserData();
        }
    };

    /**
     * Renders the grid of all achievements, applying locked/unlocked styles.
     */
    const renderAchievements = () => {
        achievementsGrid.innerHTML = '';

        ALL_ACHIEVEMENTS.forEach(achievement => {
            const isUnlocked = userData.achievements.unlocked.includes(achievement.id);
            const statusClass = isUnlocked ? 'unlocked' : 'locked';

            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4';
            card.innerHTML = `
                <div class="achievement-card ${statusClass}">
                    <i class="bi ${achievement.icon} achievement-icon"></i>
                    <h5 class="achievement-title">${achievement.title}</h5>
                    <p class="achievement-desc">${achievement.description}</p>
                </div>
            `;
            achievementsGrid.appendChild(card);
        });
    };

    // --- Initial Setup ---
    if (userData) {
        // Initialize achievements object if it doesn't exist
        if (!userData.achievements || !Array.isArray(userData.achievements.unlocked)) {
            userData.achievements = { unlocked: [] };
            saveUserData();
        }

        // Always check for new unlocks when the page is loaded
        checkAndUnlockAchievements();

        // Then render the final state
        renderAchievements();
    } else {
        console.error("User data not found. Cannot load achievements.");
    }
});
