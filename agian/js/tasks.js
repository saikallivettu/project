document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and DOM Elements ---
    const TASK_XP_REWARD = 10;
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const tasksProgressBar = document.getElementById('tasks-progress-bar');
    const xpToastElement = document.getElementById('xp-toast');
    const xpToast = new bootstrap.Toast(xpToastElement);

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
     * This is a local version to keep the module self-contained.
     */
    const updateNavbarXP = () => {
        const levelEl = document.getElementById('global-level');
        const xpEl = document.getElementById('global-xp');
        const xpBarEl = document.getElementById('global-xp-bar');

        const xpForNextLevel = 100; // 100 XP per level
        const xpProgress = (userData.xp / xpForNextLevel) * 100;

        if(levelEl) levelEl.textContent = userData.level;
        if(xpEl) xpEl.textContent = `${userData.xp} / ${xpForNextLevel}` ;
        if(xpBarEl) {
            xpBarEl.style.width = `${xpProgress}%` ;
            xpBarEl.setAttribute('aria-valuenow', xpProgress);
        }
    }

    /**
     * Adds XP, handles level ups, saves data, and updates the UI.
     * @param {number} amount - The amount of XP to add.
     */
    const addXp = (amount) => {
        userData.xp += amount;

        // Check for level up
        const xpForNextLevel = 100;
        if (userData.xp >= xpForNextLevel) {
            userData.level++;
            userData.xp -= xpForNextLevel; // Reset XP for the new level
            userData.store.coins = (userData.store.coins || 0) + 100; // Award coins for leveling up
        }

        saveUserData();
        window.checkAndUnlockAchievements(); // <-- ADD THIS LINE
        updateNavbarXP();
        showXpToast(`+${amount} XP!` );
    };

    /**
     * Renders all tasks from userData to the page.
     */
    const renderTasks = () => {
        taskList.innerHTML = ''; // Clear the list before rendering

        if (userData.tasks.length === 0) {
            taskList.innerHTML = `<li class="list-group-item text-secondary">No tasks yet. Add one to get started!</li>` ;
            updateProgress();
            return;
        }

        userData.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `list-group-item task ${task.completed ? 'completed' : ''}` ;
            li.dataset.id = task.id;

            li.innerHTML = `
                <input class="task-checkbox" type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text" draggable="true">${task.text}</span>
                <button class="delete-btn btn-close"></button>
            `;

            taskList.appendChild(li);
        });

        updateProgress();
    };

    /**
     * Updates the progress bar based on completed tasks.
     */
    const updateProgress = () => {
        const completedTasks = userData.tasks.filter(task => task.completed).length;
        const totalTasks = userData.tasks.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        tasksProgressBar.style.width = `${progress}%` ;
        tasksProgressBar.setAttribute('aria-valuenow', progress);

        // Trigger confetti when all tasks are done
        if (progress === 100 && totalTasks > 0) {
            confetti({
                particleCount: 150,
                spread: 180,
                origin: { y: 0.6 }
            });
        }
    };

    /**
     * Shows a toast notification.
     * @param {string} message - The message to display.
     */
    const showXpToast = (message) => {
        const toastBody = xpToastElement.querySelector('.toast-body');
        toastBody.textContent = message;
        xpToast.show();
    }


    // --- Event Handlers ---

    /**
     * Handles the form submission to add a new task.
     */
    const handleAddTask = (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();

        if (taskText) {
            const newTask = {
                id: Date.now(), // Simple unique ID
                text: taskText,
                completed: false
            };
            userData.tasks.push(newTask);
            saveUserData();
            renderTasks();
            taskInput.value = '';
        }
    };

    /**
     * Handles clicks within the task list (for completing or deleting).
     */
    const handleTaskListClick = (e) => {
        const target = e.target;
        const taskLi = target.closest('.task');
        if (!taskLi) return;

        const taskId = Number(taskLi.dataset.id);

        // Handle task completion toggle
        if (target.matches('.task-checkbox')) {
            const task = userData.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                if (task.completed) {
                    task.completionDate = new Date().toISOString(); // <-- ADD THIS LINE
                    addXp(TASK_XP_REWARD);
                    window.checkAndUnlockAchievements(); // <-- ADD THIS LINE
                } else {
                    delete task.completionDate; // <-- ADD THIS LINE (optional, but good practice)
                }
                saveUserData();
                renderTasks(); // Re-render to update style
            }
        }

        // Handle task deletion
        if (target.matches('.delete-btn')) {
            // Remove task from userData
            userData.tasks = userData.tasks.filter(t => t.id !== taskId);
            saveUserData();
            renderTasks();
        }
    };

    /**
     * Handles the drag-and-drop reordering of tasks.
     */
    const handleDragAndDrop = () => {
        let draggedItemId = null;

        // When a user starts dragging a task
        taskList.addEventListener('dragstart', (e) => {
            if (e.target.matches('.task-text')) {
                const taskLi = e.target.closest('.task');
                draggedItemId = Number(taskLi.dataset.id);
                // Add a class for visual feedback
                taskLi.classList.add('dragging');
            }
        });

        // When the drag ends (whether it was successful or not)
        taskList.addEventListener('dragend', (e) => {
            const draggingElement = document.querySelector('.task.dragging');
            if (draggingElement) {
                draggingElement.classList.remove('dragging');
            }
            draggedItemId = null;
        });

        // When a dragged item is over the list container
        taskList.addEventListener('dragover', (e) => {
            e.preventDefault(); // This is necessary to allow a drop
            const afterElement = getDragAfterElement(e.clientY);
            const allTasks = [...taskList.querySelectorAll('.task:not(.dragging)')];

            // Remove any existing placeholder lines
            allTasks.forEach(task => task.classList.remove('drag-over'));

            // Add the placeholder line to the correct element
            if (afterElement == null) {
                // If null, we're at the end of the list
                const lastTask = allTasks[allTasks.length - 1];
                if(lastTask) lastTask.style.borderBottom = `2px solid var(--primary-color)` ; // Special case for end
            } else {
                 allTasks.forEach(task => task.style.borderBottom = ''); // Clear special case
                afterElement.classList.add('drag-over');
            }
        });

        // When the user drops the item
        taskList.addEventListener('drop', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(e.clientY);
            document.querySelectorAll('.task').forEach(task => {
                task.classList.remove('drag-over');
                task.style.borderBottom = '';
            });

            // Reorder the actual data array
            const draggedTaskIndex = userData.tasks.findIndex(t => t.id === draggedItemId);
            const draggedTask = userData.tasks.splice(draggedTaskIndex, 1)[0];

            if (afterElement == null) {
                userData.tasks.push(draggedTask); // Dropped at the end
            } else {
                const afterElementId = Number(afterElement.dataset.id);
                const afterElementIndex = userData.tasks.findIndex(t => t.id === afterElementId);
                userData.tasks.splice(afterElementIndex, 0, draggedTask); // Insert before the target
            }

            saveUserData();
            renderTasks(); // Re-render the UI from the updated data
        });

        // Helper function to determine where to place the drop placeholder
        function getDragAfterElement(y) {
            const draggableElements = [...taskList.querySelectorAll('.task:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    };

    // --- Initial Setup ---
    if (userData) {
        addTaskForm.addEventListener('submit', handleAddTask);
        taskList.addEventListener('click', handleTaskListClick);
        handleDragAndDrop(); // <-- ADD THIS LINE
        renderTasks(); // Initial render of tasks on page load
    } else {
        console.error("User data not found. Please log in again.");
    }
});
