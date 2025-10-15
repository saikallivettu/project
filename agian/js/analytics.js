document.addEventListener('DOMContentLoaded', () => {
    // --- Load User Data ---
    const userData = JSON.parse(localStorage.getItem('notionx_user'));
    if (!userData) {
        console.error("User data not found.");
        return;
    }

    // --- Chart Default Options ---
    Chart.defaults.color = '#f8fafc';
    Chart.defaults.font.family = "'Poppins', sans-serif";

    // --- Data Processing Functions ---

    /**
     * Processes task data to get a count of completed tasks for each day of the last 7 days.
     */
    const processTaskData = () => {
        const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = Array(7).fill(0);
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

        if (userData.tasks) {
            const completedTasks = userData.tasks.filter(t => t.completed && t.completionDate);
            completedTasks.forEach(task => {
                const completionDate = new Date(task.completionDate);
                if (completionDate >= startOfWeek) {
                    data[completionDate.getDay()]++;
                }
            });
        }
        return { labels, data };
    };

    /**
     * Processes journal data to get a count for each mood.
     */
    const processMoodData = () => {
        const moodCounts = {};
        if (userData.journal) {
            userData.journal.forEach(entry => {
                moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            });
        }
        return {
            labels: Object.keys(moodCounts),
            data: Object.values(moodCounts)
        };
    };

    // --- Chart Rendering Functions ---

    const renderTasksChart = () => {
        const ctx = document.getElementById('tasks-chart').getContext('2d');
        const taskData = processTaskData();
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: taskData.labels,
                datasets: [{
                    label: 'Tasks Completed',
                    data: taskData.data,
                    backgroundColor: 'rgba(56, 189, 248, 0.6)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                    borderWidth: 1
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    };

    const renderMoodChart = () => {
        const ctx = document.getElementById('mood-chart').getContext('2d');
        const moodData = processMoodData();
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: moodData.labels,
                datasets: [{
                    data: moodData.data,
                    backgroundColor: ['#facc15', '#94a3b8', '#60a5fa', '#f97316', '#a78bfa'],
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    };

    // --- Initial Render ---
    renderTasksChart();
    renderMoodChart();
});
