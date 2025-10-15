document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const widgetsContainer = document.getElementById('dashboard-widgets-container');

    // --- State ---
    let userData = JSON.parse(localStorage.getItem('notionx_user'));

    /**
     * Renders the dashboard widgets in the order specified by the user's settings.
     */
    const renderDashboardLayout = () => {
        if (!userData || !userData.settings || !Array.isArray(userData.settings.dashboardLayout)) return;

        const layout = userData.settings.dashboardLayout;
        const widgetElements = {};
        widgetsContainer.querySelectorAll('[data-widget-id]').forEach(el => {
            widgetElements[el.dataset.widgetId] = el;
        });

        widgetsContainer.innerHTML = '';
        layout.forEach(widgetId => {
            if (widgetElements[widgetId]) {
                widgetsContainer.appendChild(widgetElements[widgetId]);
            }
        });
    };

    /**
     * Handles the drag-and-drop reordering of dashboard widgets.
     */
    const handleDragAndDrop = () => {
        let draggedElement = null;

        widgetsContainer.addEventListener('dragstart', (e) => {
            const draggableCard = e.target.closest('[draggable="true"]');
            if (draggableCard) {
                draggedElement = draggableCard.closest('[data-widget-id]');
                setTimeout(() => {
                    draggedElement.classList.add('widget-dragging');
                }, 0);
            }
        });

        widgetsContainer.addEventListener('dragend', () => {
            if (draggedElement) {
                draggedElement.classList.remove('widget-dragging');
                draggedElement = null;
            }
        });

        widgetsContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(e.clientX);
            if (afterElement == null) {
                widgetsContainer.appendChild(draggedElement);
            } else {
                widgetsContainer.insertBefore(draggedElement, afterElement);
            }
        });

        widgetsContainer.addEventListener('drop', () => {
            const newLayout = [...widgetsContainer.querySelectorAll('[data-widget-id]')].map(el => el.dataset.widgetId);
            userData.settings.dashboardLayout = newLayout;
            localStorage.setItem('notionx_user', JSON.stringify(userData));
        });

        function getDragAfterElement(x) {
            const draggableElements = [...widgetsContainer.querySelectorAll('[data-widget-id]:not(.widget-dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = x - box.left - box.width / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    };

    /**
     * Fetches user data from localStorage and populates the content of the dashboard widgets.
     */
    const updateDashboardData = () => {
        if (!userData) {
            console.error('NotionX user data not found in localStorage.');
            return;
        }

        // --- 1. Update Daily XP Widget ---
        const dailyXpEl = document.getElementById('daily-xp-value');
        const dailyXpBar = document.querySelector('#daily-xp-value + .progress .progress-bar');

        if (dailyXpEl) {
            const dailyXpGoal = 300;
            const xpProgress = Math.min((userData.xp / dailyXpGoal) * 100, 100);

            dailyXpEl.textContent = userData.xp;
            if(dailyXpBar) {
                dailyXpBar.style.width = `${xpProgress}%` ;
                dailyXpBar.setAttribute('aria-valuenow', xpProgress);
            }
        }

        // --- 2. Update Tasks Widget ---
        const tasksCompletedEl = document.getElementById('tasks-completed-value');
        if (tasksCompletedEl && userData.tasks) {
            const completedTasks = userData.tasks.filter(task => task.completed).length;
            const totalTasks = userData.tasks.length;
            tasksCompletedEl.textContent = `${completedTasks} / ${totalTasks}` ;
        }

        // --- 3. Update Water Tracker Widget ---
        const waterIntakeEl = document.getElementById('water-intake-value');
        if (waterIntakeEl && userData.water) {
            waterIntakeEl.textContent = `${userData.water.intake} / ${userData.water.goal}` ;
        }

        // --- 4. Update Pomodoro Widget ---
        const pomodoroStreakEl = document.getElementById('pomodoro-streak-value');
        if(pomodoroStreakEl && userData.pomodoro) {
            pomodoroStreakEl.textContent = userData.pomodoro.streak;
        }

        // --- 5. Update Mascot Message ---
        const mascotMessageEl = document.getElementById('mascot-message');
        if (mascotMessageEl) {
            const messages = [
                "Consistency is the key to unlocking your potential. Keep going!",
                "Every small step you take today leads to a giant leap tomorrow.",
                "Believe in yourself and all that you are. You've got this!"
            ];
            const randomIndex = Math.floor(Math.random() * messages.length);
            mascotMessageEl.textContent = `"${messages[randomIndex]}"` ;
        }
    };

    // --- Initial Setup ---
    if (userData) {
        if (!userData.settings || !Array.isArray(userData.settings.dashboardLayout)) {
            userData.settings = userData.settings || {};
            userData.settings.dashboardLayout = ['xp', 'tasks', 'water', 'pomodoro'];
            localStorage.setItem('notionx_user', JSON.stringify(userData));
        }

        renderDashboardLayout(); // First, set the order of widgets
        updateDashboardData(); // Then, fill them with the correct data
        handleDragAndDrop(); // Finally, enable drag and drop
    }
});
