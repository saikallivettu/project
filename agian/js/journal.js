document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const journalForm = document.getElementById('journal-form');
    const entryTextarea = document.getElementById('journal-entry-text');
    const tagsInput = document.getElementById('journal-tags');
    const formTitle = document.getElementById('form-title');
    const wordCountDisplay = document.querySelector('.word-count');
    const promptText = document.getElementById('prompt-text');
    const newPromptBtn = document.getElementById('new-prompt-btn');
    const searchInput = document.getElementById('search-input');
    const accordionContainer = document.getElementById('past-entries-accordion');
    const moodChartCanvas = document.getElementById('mood-chart');
    const streakCountDisplay = document.getElementById('streak-count');

    // --- State & Config ---
    let entries = [];
    let moodChart = null;
    const markdownConverter = new showdown.Converter();
    const JOURNAL_PROMPTS = [
        "What was the best part of your day?", "What is something that challenged you today?", "What are you grateful for right now?",
        "Describe a recent accomplishment you're proud of.", "If you could do one thing differently today, what would it be?",
        "What is on your mind right now?", "How are you feeling physically and emotionally?", "What is one goal you want to focus on tomorrow?"
    ];

    // --- Core Functions ---
    const getTodayDateString = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

    const loadEntries = () => {
        try {
            const savedEntries = localStorage.getItem('journalEntries');
            entries = savedEntries ? JSON.parse(savedEntries) : [];
        } catch (error) {
            console.error("Error parsing journal entries from localStorage:", error);
            entries = [];
        }
    };

    const saveEntries = () => {
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('journalEntries', JSON.stringify(entries));
    };

    // --- Rendering Functions ---
    const renderAll = () => {
        renderEntries();
        renderMoodChart();
        renderJournalStreak();
    };

    const renderEntries = () => {
        accordionContainer.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();

        const filteredEntries = entries.filter(entry => {
            const entryTags = entry.tags || [];
            const tagsMatch = entryTags.some(tag => `#${tag.toLowerCase()}`.includes(searchTerm));
            const textMatch = entry.text.toLowerCase().includes(searchTerm);
            return searchTerm === '' || textMatch || tagsMatch;
        });

        if (filteredEntries.length === 0) {
            accordionContainer.innerHTML = '<p class="text-secondary text-center">No entries found.</p>';
            return;
        }

        filteredEntries.forEach((entry, index) => {
            const entryDate = new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
            const isCollapsed = index !== 0; // Keep first entry open

            const tagsHtml = (entry.tags || []).map(tag => `<span class="badge bg-secondary me-1">#${tag}</span>`).join('');
            const contentHtml = markdownConverter.makeHtml(entry.text);

            const accordionItem = `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading-${entry.date}">
                        <button class="accordion-button ${isCollapsed ? 'collapsed' : ''} mood-${entry.mood}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${entry.date}">
                            ${entryDate}
                        </button>
                    </h2>
                    <div id="collapse-${entry.date}" class="accordion-collapse collapse ${isCollapsed ? '' : 'show'}" data-bs-parent="#past-entries-accordion">
                        <div class="accordion-body">
                            <div class="journal-tags mb-3">${tagsHtml}</div>
                            <div class="journal-content">${contentHtml}</div>
                            <div class="journal-actions">
                                <button class="btn btn-sm btn-outline-secondary btn-edit" data-date="${entry.date}">Edit</button>
                                <button class="btn btn-sm btn-outline-danger btn-delete" data-date="${entry.date}">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            accordionContainer.innerHTML += accordionItem;
        });
        addEntryActionListeners();
    };

    const renderMoodChart = () => {
        const moodCounts = entries.reduce((acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            return acc;
        }, {});

        if (moodChart) moodChart.destroy();
        moodChart = new Chart(moodChartCanvas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(moodCounts),
                datasets: [{
                    data: Object.values(moodCounts),
                    backgroundColor: ['#ffc107', '#adb5bd', '#0d6efd', '#fd7e14', '#6f42c1'],
                    borderColor: '#1e293b',
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    };

    const renderJournalStreak = () => {
        if (entries.length === 0) {
            streakCountDisplay.textContent = 0;
            return;
        }

        const sortedDates = [...new Set(entries.map(e => e.date))].sort((a, b) => new Date(a) - new Date(b));
        let streak = 0;

        const today = new Date(getTodayDateString());
        const latestEntryDate = new Date(sortedDates[sortedDates.length - 1]);
        const diffDays = (d1, d2) => Math.round((d1 - d2) / (1000 * 60 * 60 * 24));

        if (diffDays(today, latestEntryDate) <= 1) {
            streak = 1;
            for (let i = sortedDates.length - 1; i > 0; i--) {
                const current = new Date(sortedDates[i]);
                const previous = new Date(sortedDates[i - 1]);
                if (diffDays(current, previous) === 1) { streak++; }
                else { break; }
            }
        }
        streakCountDisplay.textContent = streak;
    };

    // --- Event Handlers ---
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const entryText = entryTextarea.value.trim();
        if (!entryText) return alert('Entry cannot be empty.');

        const entryDate = getTodayDateString();
        const selectedMood = document.querySelector('input[name="mood"]:checked').value;
        const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean);

        const existingIndex = entries.findIndex(entry => entry.date === entryDate);
        const newEntry = { date: entryDate, text: entryText, mood: selectedMood, tags };

        if (existingIndex > -1) {
            entries[existingIndex] = newEntry;
        } else {
            entries.push(newEntry);
        }

        saveEntries();
        renderAll();
        resetForm(false); // don't clear form on save
    };

    const handleEdit = (e) => {
        const entryDate = e.target.dataset.date;
        const entryToEdit = entries.find(entry => entry.date === entryDate);
        if (entryToEdit) {
            entryTextarea.value = entryToEdit.text;
            tagsInput.value = (entryToEdit.tags || []).join(', ');
            document.querySelector(`input[name="mood"][value="${entryToEdit.mood}"]`).checked = true;
            formTitle.textContent = "Edit Entry";
            window.scrollTo({ top: 0, behavior: 'smooth' });
            entryTextarea.focus();
        }
    };

    const handleDelete = (e) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;
        const entryDate = e.target.dataset.date;
        entries = entries.filter(entry => entry.date !== entryDate);
        saveEntries();
        renderAll();
        if (entryDate === getTodayDateString()) resetForm(true); // clear form if deleting today's entry
    };

    const displayNewPrompt = () => {
        const randomIndex = Math.floor(Math.random() * JOURNAL_PROMPTS.length);
        promptText.textContent = JOURNAL_PROMPTS[randomIndex];
    };

    const updateWordCount = () => {
        const words = entryTextarea.value.trim().split(/\s+/).filter(Boolean);
        wordCountDisplay.textContent = `Word Count: ${words.length}`;
    };

    const checkForTodaysEntry = () => {
        const todaysEntry = entries.find(entry => entry.date === getTodayDateString());
        if (todaysEntry) {
            entryTextarea.value = todaysEntry.text;
            tagsInput.value = (todaysEntry.tags || []).join(', ');
            document.querySelector(`input[name="mood"][value="${todaysEntry.mood}"]`).checked = true;
            formTitle.textContent = "Edit Today's Entry";
        } else {
            resetForm(true);
        }
        updateWordCount();
    };


    const resetForm = (clear) => {
        if (clear) {
            journalForm.reset();
            document.querySelector('input[name="mood"][value="happy"]').checked = true;
        }
        formTitle.textContent = "Today's Entry";
        updateWordCount();
    };

    const addEntryActionListeners = () => {
        document.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', handleEdit));
        document.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', handleDelete));
    };

    // --- Initialization ---
    const init = () => {
        loadEntries();
        checkForTodaysEntry();
        renderAll();
        displayNewPrompt();

        journalForm.addEventListener('submit', handleFormSubmit);
        newPromptBtn.addEventListener('click', displayNewPrompt);
        entryTextarea.addEventListener('input', updateWordCount);
        searchInput.addEventListener('input', renderEntries);
    };

    init();
});