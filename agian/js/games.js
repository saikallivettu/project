document.addEventListener('DOMContentLoaded', () => {
    // --- Modal and Game Selection ---
    const gameModalElement = document.getElementById('game-modal');
    const gameModal = new bootstrap.Modal(gameModalElement);
    const modalTitle = document.getElementById('game-modal-title');
    const modalBody = document.getElementById('game-modal-body');
    const modalFooter = document.getElementById('game-modal-footer');
    const gameSelectionGrid = document.getElementById('game-selection-grid');

    let gameTimer; // To hold setInterval for any game

    // --- Game Launcher ---
    gameSelectionGrid.addEventListener('click', (e) => {
        if (e.target.matches('[data-game]')) {
            const gameType = e.target.dataset.game;
            launchGame(gameType);
        }
    });

    function launchGame(type) {
        // Clear any previous game interval
        clearInterval(gameTimer);

        switch (type) {
            case 'target':
                launchTargetGame();
                break;
            case 'typing':
                launchTypingGame();
                break;
            case 'memory':
                launchMemoryGame();
                break;
        }
        gameModal.show();
    }

    // --- Target Practice Game ---
    function launchTargetGame() {
        modalTitle.textContent = 'Target Practice';
        modalBody.innerHTML = `
            <div class="game-stats text-white mb-3">
                <h5>Time: <span id="target-time">15</span></h5>
                <h5>Score: <span id="target-score">0</span></h5>
            </div>
            <div id="target-area" class="game-area">
                <p class="game-instructions text-white">Click the start button to begin!</p>
            </div>`;
        modalFooter.innerHTML = `<button id="start-target-btn" class="btn btn-primary btn-lg">Start Game</button>`;

        const startBtn = document.getElementById('start-target-btn');
        startBtn.addEventListener('click', runTargetGame);
    }

    function runTargetGame() {
        this.disabled = true; // 'this' is the start button
        let score = 0;
        let time = 15;
        const scoreDisplay = document.getElementById('target-score');
        const timeDisplay = document.getElementById('target-time');
        const gameArea = document.getElementById('target-area');
        gameArea.innerHTML = '';

        const createTarget = () => {
            const target = document.createElement('div');
            target.className = 'game-target';
            target.style.top = `${Math.random() * (gameArea.clientHeight - 60)}px`;
            target.style.left = `${Math.random() * (gameArea.clientWidth - 60)}px`;

            target.addEventListener('click', () => {
                score++;
                scoreDisplay.textContent = score;
                target.remove();
                createTarget();
            });
            gameArea.appendChild(target);
        };

        createTarget();

        gameTimer = setInterval(() => {
            time--;
            timeDisplay.textContent = time;
            if (time <= 0) {
                clearInterval(gameTimer);
                gameArea.innerHTML = `<h2 class="text-white">Game Over! Final Score: ${score}</h2>`;
                document.getElementById('start-target-btn').textContent = 'Play Again';
                document.getElementById('start-target-btn').disabled = false;
            }
        }, 1000);
    }

    // --- Typing Speed Test ---
    function launchTypingGame() {
        modalTitle.textContent = 'Typing Speed Test';
        modalBody.innerHTML = `
            <div class="game-stats text-white mb-3">
                <h5>Time: <span id="typing-time">30</span></h5>
                <h5>WPM: <span id="typing-wpm">0</span></h5>
            </div>
            <div class="game-area typing-area">
                <div id="words-display" class="words-display text-white">Your words will appear here...</div>
                <input type="text" id="typing-input" class="form-control typing-input text-white" disabled>
            </div>`;
        modalFooter.innerHTML = `<button id="start-typing-btn" class="btn btn-primary btn-lg">Start Test</button>`;

        const startBtn = document.getElementById('start-typing-btn');
        startBtn.addEventListener('click', runTypingGame);
    }

    function runTypingGame() {
        this.disabled = true;
        let time = 30;
        let score = 0;
        const words = ["code", "html", "javascript", "python", "react", "node", "agile", "data", "cloud", "server", "style", "function", "object", "array", "variable"];

        const timeDisplay = document.getElementById('typing-time');
        const wpmDisplay = document.getElementById('typing-wpm');
        const wordsDisplay = document.getElementById('words-display');
        const input = document.getElementById('typing-input');
        input.disabled = false;
        input.focus();

        let currentWord = '';

        const showNewWord = () => {
            currentWord = words[Math.floor(Math.random() * words.length)];
            wordsDisplay.textContent = currentWord;
            input.value = '';
        };

        input.addEventListener('input', () => {
            if (input.value === currentWord) {
                score++;
                showNewWord();
            }
        });

        showNewWord();

        gameTimer = setInterval(() => {
            time--;
            timeDisplay.textContent = time;
            const wpm = Math.round((score / (30 - time)) * 60) || 0;
            wpmDisplay.textContent = wpm;

            if (time <= 0) {
                clearInterval(gameTimer);
                input.disabled = true;
                wordsDisplay.innerHTML = `<h2 class="text-white">Test Over! Final WPM: ${wpm}</h2>`;
                document.getElementById('start-typing-btn').textContent = 'Play Again';
                document.getElementById('start-typing-btn').disabled = false;
            }
        }, 1000);
    }

    // --- Memory Match Game ---
    function launchMemoryGame() {
        modalTitle.textContent = 'Memory Match';
        modalBody.innerHTML = `<div class="game-area"><div id="memory-grid" class="memory-grid"></div></div>`;
        modalFooter.innerHTML = `<button id="restart-memory-btn" class="btn btn-primary">Restart</button>`;

        document.getElementById('restart-memory-btn').addEventListener('click', launchMemoryGame);
        runMemoryGame();
    }

    function runMemoryGame() {
        const grid = document.getElementById('memory-grid');
        grid.innerHTML = '';
        const icons = ['gem', 'anchor', 'bug', 'moon', 'star', 'sun', 'tree', 'trophy'];
        const cards = [...icons, ...icons];

        // Shuffle cards
        cards.sort(() => 0.5 - Math.random());

        let flippedCards = [];
        let matchedPairs = 0;
        let canFlip = true;

        cards.forEach(icon => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.icon = icon;
            card.innerHTML = `
                <div class="card-face card-front"></div>
                <div class="card-face card-back"><i class="bi bi-${icon}-fill text-white"></i></div>`;

            card.addEventListener('click', () => {
                if (!canFlip || card.classList.contains('flipped')) return;

                card.classList.add('flipped');
                flippedCards.push(card);

                if (flippedCards.length === 2) {
                    canFlip = false;
                    const [card1, card2] = flippedCards;
                    if (card1.dataset.icon === card2.dataset.icon) {
                        card1.classList.add('matched');
                        card2.classList.add('matched');
                        matchedPairs++;
                        flippedCards = [];
                        canFlip = true;
                        if (matchedPairs === icons.length) {
                            setTimeout(() => grid.innerHTML = `<h2 class="text-white">You Win!</h2>`, 500);
                        }
                    } else {
                        setTimeout(() => {
                            card1.classList.remove('flipped');
                            card2.classList.remove('flipped');
                            flippedCards = [];
                            canFlip = true;
                        }, 1000);
                    }
                }
            });
            grid.appendChild(card);
        });
    }
});