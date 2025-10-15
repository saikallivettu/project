document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const exportBtn = document.getElementById('export-data-btn');
    const importInput = document.getElementById('import-data-input');
    const resetBtn = document.getElementById('reset-data-btn');
    const notificationsToggle = document.getElementById('notifications-toggle');

    // --- State ---
    let userData = JSON.parse(localStorage.getItem('notionx_user'));

    // --- Event Handlers ---

    /**
     * Handles exporting user data to a JSON file.
     */
    const handleExport = () => {
        const userData = localStorage.getItem('notionx_user');
        if (!userData) {
            alert("No data found to export!");
            return;
        }

        const blob = new Blob([userData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        a.href = url;
        a.download = `notionx_backup_${timestamp}.json` ;
        document.body.appendChild(a);
        a.click();

        // Clean up the temporary URL and link
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /**
     * Handles importing user data from a selected JSON file.
     */
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                // Basic validation: Check if essential keys exist
                if (importedData && 'level' in importedData && 'xp' in importedData && 'tasks' in importedData) {
                    if (confirm("Are you sure you want to import this data? Your current progress will be overwritten.")) {
                        localStorage.setItem('notionx_user', JSON.stringify(importedData));
                        alert("Data imported successfully! The page will now reload.");
                        location.reload();
                    }
                } else {
                    alert("Invalid or corrupted backup file.");
                }
            } catch (error) {
                alert("Error reading the file. Please ensure it is a valid JSON backup file.");
                console.error("Import error:", error);
            }
        };

        reader.readAsText(file);
    };

    /**
     * Handles resetting all user data.
     */
    const handleReset = () => {
        const isConfirmed = confirm("Are you absolutely sure you want to delete all your data? This action cannot be undone.");
        if (isConfirmed) {
            const isConfirmedAgain = confirm("Please confirm one last time. All progress, tasks, and notes will be lost forever.");
            if (isConfirmedAgain) {
                localStorage.removeItem('notionx_user');
                localStorage.removeItem('notionx_last_habit_reset'); // Also clear the habit reset tracker
                alert("All data has been reset. You will be returned to the login page.");
                window.location.href = '../index.html'; // Redirect to home
            }
        }
    };

    /**
     * Loads the current state of user preferences into the UI.
     */
    const loadPreferences = () => {
        if (userData && userData.settings) {
            notificationsToggle.checked = userData.settings.notificationsEnabled;
        }
    };

    /**
     * Handles changes to the notification toggle.
     */
    const handleToggleNotifications = () => {
        if (!userData.settings) {
            userData.settings = {};
        }
        userData.settings.notificationsEnabled = notificationsToggle.checked;

        // If the user is ENABLING notifications, we must request permission now.
        if (notificationsToggle.checked && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission !== 'granted') {
                    // If they deny, uncheck the box.
                    notificationsToggle.checked = false;
                }
            });
        }

        localStorage.setItem('notionx_user', JSON.stringify(userData));
    }
    // --- Initial Setup ---
    exportBtn.addEventListener('click', handleExport);
    importInput.addEventListener('change', handleImport);
    resetBtn.addEventListener('click', handleReset);
    notificationsToggle.addEventListener('change', handleToggleNotifications);
    loadPreferences();
});
