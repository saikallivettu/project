document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements (no changes here)
    const timeDisplay = document.getElementById('time-display');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeLabel = document.getElementById('timer-mode-label');
    const progressCircle = document.getElementById('progress-ring-circle');
    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const pomodoroCyclesDisplay = document.getElementById('pomodoro-cycles');
    const timerContainer = document.getElementById('timer-container');
    const modeTabs = document.querySelectorAll('.nav-link');
    const notificationSound = document.getElementById('notification-sound');

    // Settings Modal Elements
    const settingsModal = new bootstrap.Modal(document.getElementById('settings-modal'));
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // State
    // REMOVED: `timer` (setInterval ID)
    // ADDED: `animationFrameId` to control the animation loop
    // ADDED: `endTime` to track the exact finish time for smooth animation
    let animationFrameId = null;
    let isRunning = false;
    let settings = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15
    };
    let mode = 'pomodoro';
    let timeRemaining; // This will now represent seconds for the text display
    let endTime = 0; // This will be the high-precision timestamp for the animation
    let pomodorosUntilLongBreak = 4;
    let cycleCount = 0;

    // --- NEW: Animation Loop using requestAnimationFrame ---
    // This function is the new heart of the timer. It runs ~60 times per second.
    function animateTimer() {
        // Calculate remaining milliseconds for smooth animation
        const remainingMilliseconds = endTime - Date.now();
        const remainingSeconds = Math.round(remainingMilliseconds / 1000);

        // Update the visual progress circle on every frame for smoothness
        updateProgressCircle(remainingMilliseconds);

        // Update the text display only when the second changes, to save resources
        if (remainingSeconds !== timeRemaining) {
            timeRemaining = remainingSeconds;
            updateTimeTextDisplay();
        }

        // Check if the timer has finished
        if (remainingMilliseconds <= 0) {
            pauseTimer();
            notificationSound.play();
            if (mode === 'pomodoro') {
                confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
                cycleCount++;
                pomodorosUntilLongBreak--;
                updateCycleCount();
            }
            switchMode();
        } else {
            // If not finished, request the next animation frame
            animationFrameId = requestAnimationFrame(animateTimer);
        }
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startPauseBtn.innerHTML = '<i class="bi bi-pause-fill fs-4"></i> PAUSE';

        // Set the exact end time based on the time remaining
        endTime = Date.now() + (timeRemaining * 1000);

        // Start the animation loop
        animationFrameId = requestAnimationFrame(animateTimer);
    }

    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        startPauseBtn.innerHTML = '<i class="bi bi-play-fill fs-4"></i> START';

        // Stop the animation loop
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    }

    function resetTimer() {
        pauseTimer();
        timeRemaining = settings[mode] * 60;
        updateTimeTextDisplay();
        updateProgressCircle(timeRemaining * 1000); // Reset circle to full
    }

    // --- Mode and Display Management ---

    function switchMode() {
        if (mode === 'pomodoro') {
            mode = (pomodorosUntilLongBreak === 0) ? 'longBreak' : 'shortBreak';
            if (pomodorosUntilLongBreak === 0) pomodorosUntilLongBreak = 4;
        } else {
            mode = 'pomodoro';
        }
        changeMode(mode, true);
    }

    function changeMode(newMode, isAuto = false) {
        mode = newMode;
        pauseTimer();
        timeRemaining = settings[mode] * 60;

        timerContainer.className = 'card nx-glass text-center p-4';
        timerContainer.classList.add(`${mode}-mode`);

        modeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        const modeText = {
            pomodoro: 'Time to focus!',
            shortBreak: 'Time for a short break!',
            longBreak: 'Time for a long break!'
        };
        modeLabel.textContent = modeText[mode];

        updateTimeTextDisplay();
        updateProgressCircle(timeRemaining * 1000); // Reset circle to full

        if (isAuto) startTimer();
    }

    // MODIFIED: This function now only handles the text
    function updateTimeTextDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        const display = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        timeDisplay.textContent = display;
        document.title = `${display} - ${modeLabel.textContent}`;
    }

    // MODIFIED: This function now uses milliseconds for high precision
    function updateProgressCircle(remainingMs) {
        const totalDurationMs = settings[mode] * 60 * 1000;
        const elapsedMs = totalDurationMs - Math.max(0, remainingMs);
        const progress = elapsedMs / totalDurationMs;
        const offset = circumference * (1 - progress);

        progressCircle.style.strokeDashoffset = offset;
    }

    function updateCycleCount() {
        pomodoroCyclesDisplay.textContent = cycleCount;
        localStorage.setItem('pomodoroCycles', JSON.stringify({
            count: cycleCount,
            date: new Date().toLocaleDateString()
        }));
    }

    // --- Settings and Persistence (no changes here) ---

    function saveSettings() {
        settings.pomodoro = document.getElementById('pomodoro-duration').value;
        settings.shortBreak = document.getElementById('short-break-duration').value;
        settings.longBreak = document.getElementById('long-break-duration').value;
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        settingsModal.hide();
        changeMode(mode); // Re-apply settings to the current mode
    }

    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('pomodoroSettings'));
        if (savedSettings) {
            settings = savedSettings;
        }
        document.getElementById('pomodoro-duration').value = settings.pomodoro;
        document.getElementById('short-break-duration').value = settings.shortBreak;
        document.getElementById('long-break-duration').value = settings.longBreak;
    }

    function loadCycleCount() {
        const savedCycles = JSON.parse(localStorage.getItem('pomodoroCycles'));
        if (savedCycles && savedCycles.date === new Date().toLocaleDateString()) {
            cycleCount = savedCycles.count;
        } else {
            cycleCount = 0;
        }
        pomodoroCyclesDisplay.textContent = cycleCount;
    }

    // --- Initialization and Event Listeners ---

    function init() {
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

        loadSettings();
        loadCycleCount();
        changeMode('pomodoro');

        startPauseBtn.addEventListener('click', () => {
            isRunning ? pauseTimer() : startTimer();
        });

        resetBtn.addEventListener('click', resetTimer);
        saveSettingsBtn.addEventListener('click', saveSettings);

        modeTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                changeMode(e.target.dataset.mode);
            });
        });
    }

    init();
});