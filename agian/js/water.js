document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and DOM Elements ---
    const XP_PER_GLASS = 5;
    const XP_GOAL_BONUS = 50;

    const addGlassBtn = document.getElementById('add-glass-btn');
    const removeGlassBtn = document.getElementById('remove-glass-btn');
    const waterWave = document.getElementById('water-wave');
    const waterIntakeEl = document.getElementById('water-intake');
    const waterGoalEl = document.getElementById('water-goal');
    const waterStreakEl = document.getElementById('water-streak');

    // --- Load User Data ---
    let userData = JSON.parse(localStorage.getItem('notionx_user'));

    // --- Core Functions ---

    /**
     * Saves the current state of userData to localStorage.
     */
    const saveUserData = () => {
        localStorage.setItem('notionx_user', JSON.stringify(userData));
    };

    /**
     * Updates the navbar XP display.
     */
    const updateNavbarXP = () => {
        const levelEl = document.getElementById('global-level');
        const xpEl = document.getElementById('global-xp');
        const xpBarEl = document.getElementById('global-xp-bar');

        const xpForNextLevel = 100;
        const xpProgress = (userData.xp / xpForNextLevel) * 100;

        if(levelEl) levelEl.textContent = userData.level;
        if(xpEl) xpEl.textContent = `${userData.xp} / ${xpForNextLevel}` ;
        if(xpBarEl) {
            xpBarEl.style.width = `${xpProgress}%` ;
            xpBarEl.setAttribute('aria-valuenow', xpProgress);
        }
    }
    /**
     * Adds XP, handles level ups, and saves data.
     * @param {number} amount - The amount of XP to add.
     */
    const addXp = (amount) => {
        userData.xp += amount;

        const xpForNextLevel = 100;
        if (userData.xp >= xpForNextLevel) {
            userData.level++;
            userData.xp -= xpForNextLevel;
            userData.store.coins = (userData.store.coins || 0) + 100; // Award coins for leveling up
        }

        saveUserData();
        window.checkAndUnlockAchievements(); // <-- ADD THIS LINE
        updateNavbarXP();
    };
    /**
     * Updates the entire UI based on the current user data.
     */
    const updateUI = () => {
        const { intake, goal, streak } = userData.water;

        // Update text content
        waterIntakeEl.textContent = intake;
        waterGoalEl.textContent = goal;
        waterStreakEl.textContent = streak;

        // Calculate and update wave height
        // We use Math.min to ensure the wave doesn't go over 100%
        const fillPercentage = Math.min((intake / goal) * 100, 100);
        waterWave.style.height = `${fillPercentage}%` ;

        // Disable/enable buttons based on state
        addGlassBtn.disabled = intake >= goal;
        removeGlassBtn.disabled = intake <= 0;
    };

    /**
     * Triggers a confetti celebration.
     */
    const celebrate = () => {
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.7 },
            colors: ['#38bdf8', '#0ea5e9', '#ffffff']
        });
    };

    // --- Event Handlers ---

    const handleAddGlass = () => {
        if (userData.water.intake < userData.water.goal) {
            userData.water.intake++;
            addXp(XP_PER_GLASS);

            // Check if goal is met
            if (userData.water.intake === userData.water.goal) {
                addXp(XP_GOAL_BONUS);
                celebrate();
                // We will handle streak logic later (it requires checking dates)
            }

            saveUserData();
            updateUI();
        }
    };

    const handleRemoveGlass = () => {
        if (userData.water.intake > 0) {
            userData.water.intake--;
            // Note: We don't remove XP, as that's generally a bad user experience.
            saveUserData();
            updateUI();
        }
    };

    // --- Initial Setup ---
    if (userData) {
        addGlassBtn.addEventListener('click', handleAddGlass);
        removeGlassBtn.addEventListener('click', handleRemoveGlass);
        updateUI(); // Set the initial state of the page
    } else {
        console.error("User data not found. Cannot initialize Water Tracker.");
    }
});
