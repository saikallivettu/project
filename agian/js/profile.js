document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const usernameInput = document.getElementById('username-input');
    const editUsernameBtn = document.getElementById('edit-username-btn');
    const profileLevelEl = document.getElementById('profile-level');
    const profileXpEl = document.getElementById('profile-xp');
    const profileXpBar = document.getElementById('profile-xp-bar');
    const totalXpStatEl = document.getElementById('total-xp-stat');
    const tasksCompletedStatEl = document.getElementById('tasks-completed-stat');
    const pomodoroCyclesStatEl = document.getElementById('pomodoro-cycles-stat');

    // --- State ---
    let isEditingUsername = false;
    let userData = JSON.parse(localStorage.getItem('notionx_user'));

    // --- Core Functions ---

    /**
     * Saves the current state of userData to localStorage.
     */
    const saveUserData = () => {
        localStorage.setItem('notionx_user', JSON.stringify(userData));
    };

    /**
     * Populates all the fields on the page with data from localStorage.
     */
    const loadProfileData = () => {
        if (!userData) {
            console.error("User data not found.");
            return;
        }

        // --- 1. Populate Main Profile Card ---
        usernameInput.value = userData.username || 'User';
        profileLevelEl.textContent = userData.level;
        profileXpEl.textContent = userData.xp;

        const xpForNextLevel = 100;
        const xpProgress = (userData.xp / xpForNextLevel) * 100;
        profileXpBar.style.width = `${xpProgress}%` ;
        profileXpBar.setAttribute('aria-valuenow', xpProgress);

        // --- 2. Calculate and Populate Stat Cards ---

        // Total XP = (levels completed * 100) + current XP
        const totalXp = ((userData.level - 1) * 100) + userData.xp;
        totalXpStatEl.textContent = totalXp;

        // Tasks Completed
        const tasksCompleted = userData.tasks ? userData.tasks.filter(task => task.completed).length : 0;
        tasksCompletedStatEl.textContent = tasksCompleted;

        // Pomodoro Cycles
        const pomodoroCycles = userData.pomodoro ? userData.pomodoro.cycles : 0;
        pomodoroCyclesStatEl.textContent = pomodoroCycles;
    };

    // --- 3. Populate Recent Achievements ---
    const loadRecentAchievements = () => {
        const recentAchievementsEl = document.getElementById('recent-achievements');
        const unlocked = userData.achievements ? userData.achievements.unlocked : [];

        if (unlocked.length > 0) {
            // Get the last 3 unlocked achievements
            const recentUnlocked = unlocked.slice(-3).reverse();

            recentUnlocked.forEach(achId => {
                const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achId);
                if(achievement) {
                    const card = document.createElement('div');
                    card.className = 'col-md-6 col-lg-4';
                    card.innerHTML = `
                        <div class="card nx-glass stat-card h-100">
                            <i class="bi ${achievement.icon} stat-icon text-warning"></i>
                            <h5 class="stat-value fs-4">${achievement.title}</h5>
                            <p class="stat-label">${achievement.description}</p>
                        </div>
                    `;
                    recentAchievementsEl.appendChild(card);
                }
            });
        } else {
            recentAchievementsEl.innerHTML = `<p class="text-secondary text-center">No achievements unlocked yet. Keep going!</p>` ;
        }
    };

    // --- Event Handlers ---

    /**
     * Handles the logic for the edit/save username button.
     */
    const handleEditUsername = () => {
        if (isEditingUsername) {
            // --- Save Mode ---
            usernameInput.disabled = true;
            editUsernameBtn.innerHTML = `<i class="bi bi-pencil-fill"></i>` ;
            isEditingUsername = false;

            // Save the new username
            userData.username = usernameInput.value.trim();
            saveUserData();

        } else {
            // --- Edit Mode ---
            usernameInput.disabled = false;
            usernameInput.focus();
            // Move cursor to the end of the input
            usernameInput.setSelectionRange(usernameInput.value.length, usernameInput.value.length);

            editUsernameBtn.innerHTML = `<i class="bi bi-check-lg"></i>` ;
            isEditingUsername = true;
        }
    };

    /**
     * Allows saving the username by pressing 'Enter'.
     */
    const handleUsernameKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleEditUsername();
        }
    };


    // --- Initial Setup ---
    if (userData) {
        // Initialize username if it doesn't exist
        if (!userData.username) {
            userData.username = "User";
            saveUserData();
        }

        editUsernameBtn.addEventListener('click', handleEditUsername);
        usernameInput.addEventListener('keypress', handleUsernameKeyPress);
        loadProfileData();
        loadRecentAchievements();
    }
});
