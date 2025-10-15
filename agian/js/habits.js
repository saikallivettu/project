document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and DOM Elements ---
    const XP_PER_HABIT_COMPLETION = 15;
    const addHabitForm = document.getElementById('add-habit-form');
    const habitInput = document.getElementById('habit-input');
    const habitsList = document.getElementById('habits-list');
    const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // --- Load User Data ---
    let userData = JSON.parse(localStorage.getItem('notionx_user'));

    // --- Core Functions ---

    const saveUserData = () => {
        localStorage.setItem('notionx_user', JSON.stringify(userData));
    };

    const addXp = (amount) => {
        userData.xp += amount;
        if (userData.xp >= 100) {
            userData.level++;
            userData.xp -= 100;
            userData.store.coins = (userData.store.coins || 0) + 100; // Award coins for leveling up
        }
        // No need to save here, as the calling function will save.
        // Re-rendering the global navbar is handled by main.js on page load,
        // but can be manually updated if needed.
    };
    /**
     * Calculates the current weekly streak for a habit.
     * @param {Array<boolean>} days - The array of completed days for the week.
     * @returns {number} The current streak.
     */
    const calculateStreak = (days) => {
        let currentStreak = 0;
        const todayIndex = new Date().getDay(); // Sunday is 0
        for (let i = todayIndex; i >= 0; i--) {
            if (days[i]) {
                currentStreak++;
            } else {
                break; // Streak is broken
            }
        }
        return currentStreak;
    };

    /**
     * Renders all habits to the page.
     */
    const renderHabits = () => {
        habitsList.innerHTML = ''; // Clear the list before rendering

        if (!userData.habits || userData.habits.length === 0) {
            habitsList.innerHTML = `<p class="text-secondary">No habits yet. Add one to get started!</p>` ;
            return;
        }

        userData.habits.forEach(habit => {
            const habitRow = document.createElement('div');
            habitRow.className = 'habit-row';
            habitRow.dataset.id = habit.id;

            const streak = calculateStreak(habit.days);

            let gridHtml = '';
            DAYS_OF_WEEK.forEach((day, index) => {
                const isCompleted = habit.days[index];
                gridHtml += `
                    <div class="day-cell ${isCompleted ? 'completed' : ''}" data-day-index="${index}">
                        <span class="day-label">${day}</span>
                        <i class="checkmark bi bi-check-lg"></i>
                    </div>
                `;
            });

            habitRow.innerHTML = `
                <div class="habit-header">
                    <span class="habit-title">${habit.title}</span>
                    <div class="d-flex align-items-center">
                         <span class="habit-stats me-3">
                            Streak: <i class="bi bi-fire streak-fire"></i> ${streak}
                        </span>
                        <button class="btn delete-habit-btn text-secondary"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
                <div class="weekly-grid">${gridHtml}</div>
            `;
            habitsList.appendChild(habitRow);
        });
    };

    /**
     * Checks if a new week has started and resets habit data if necessary.
     */
    const checkForWeeklyReset = () => {
        const now = new Date();
        const startOfWeek = now.getDate() - now.getDay(); // Get the date of the most recent Sunday
        const lastReset = localStorage.getItem('notionx_last_habit_reset');

        if (!lastReset || parseInt(lastReset) < startOfWeek) {
            if (userData.habits) {
                userData.habits.forEach(habit => {
                    habit.days = Array(7).fill(false);
                });
                saveUserData();
            }
            localStorage.setItem('notionx_last_habit_reset', startOfWeek);
        }
    };


    // --- Event Handlers ---

    const handleAddHabit = (e) => {
        e.preventDefault();
        const habitText = habitInput.value.trim();
        if (habitText) {
            const newHabit = {
                id: Date.now(),
                title: habitText,
                days: Array(7).fill(false) // [Sun, Mon, ..., Sat]
            };
            userData.habits.push(newHabit);
            saveUserData();
            renderHabits();
            habitInput.value = '';
        }
    };

    const handleHabitInteraction = (e) => {
        const target = e.target;

        // Handle deleting a habit
        const deleteBtn = target.closest('.delete-habit-btn');
        if(deleteBtn) {
            const habitRow = target.closest('.habit-row');
            const habitId = Number(habitRow.dataset.id);
            userData.habits = userData.habits.filter(h => h.id !== habitId);
            saveUserData();
            renderHabits();
            return; // Stop further execution
        }

        // Handle toggling a day
        const dayCell = target.closest('.day-cell');
        if (dayCell) {
            const habitRow = target.closest('.habit-row');
            const habitId = Number(habitRow.dataset.id);
            const dayIndex = Number(dayCell.dataset.dayIndex);

            const habit = userData.habits.find(h => h.id === habitId);
            if (habit) {
                // Toggle the completion state and add XP only if marking as complete
                if (!habit.days[dayIndex]) {
                    habit.days[dayIndex] = true;
                    addXp(XP_PER_HABIT_COMPLETION);
                } else {
                    habit.days[dayIndex] = false;
                    // Optional: remove XP here if desired
                }

                saveUserData();
                renderHabits(); // Re-render to update streak and styles
            }
        }
    };

    // --- Initial Setup ---
    if (userData) {
        // Initialize habits array if it doesn't exist
        if (!userData.habits) {
            userData.habits = [];
        }

        checkForWeeklyReset();

        addHabitForm.addEventListener('submit', handleAddHabit);
        habitsList.addEventListener('click', handleHabitInteraction);

        renderHabits();
    } else {
        console.error("User data not found.");
    }
});
