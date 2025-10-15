document.addEventListener('DOMContentLoaded', () => {
    const notesGrid = document.getElementById('notes-grid');
    const addNoteBtn = document.getElementById('add-note-btn');
    const searchInput = document.getElementById('search-input');

    const colors = ['yellow', 'blue', 'green', 'pink', 'purple'];

    // Load notes from local storage on startup
    const notes = getNotes();
    notes.forEach(note => {
        const noteElement = createNoteElement(note.id, note.content, note.color, note.timestamp);
        notesGrid.appendChild(noteElement);
    });

    // Event Listeners
    addNoteBtn.addEventListener('click', () => addNote());
    searchInput.addEventListener('input', filterNotes);

    // --- Core Functions ---

    function getNotes() {
        return JSON.parse(localStorage.getItem('notes-app') || '[]');
    }

    function saveNotes(notes) {
        localStorage.setItem('notes-app', JSON.stringify(notes));
    }

    function createNoteElement(id, content, color, timestamp) {
        const element = document.createElement('div');
        element.classList.add('note', `color-${color}`);
        element.dataset.id = id;

        element.innerHTML = `
            <div class="note-toolbar">
                <div class="color-palette">
                    ${colors.map(c => `<span class="color-dot color-${c}" data-color="${c}"></span>`).join('')}
                </div>
                <button class="btn-delete"><i class="bi bi-trash-fill"></i></button>
            </div>
            <textarea class="note-content" placeholder="Empty sticky note...">${content}</textarea>
            <div class="note-footer">
                <span class="timestamp">${timestamp}</span>
            </div>
        `;

        // --- Element-specific Event Listeners ---

        const deleteBtn = element.querySelector('.btn-delete');
        const contentTextarea = element.querySelector('.note-content');
        const colorDots = element.querySelectorAll('.color-dot');

        deleteBtn.addEventListener('click', () => {
            deleteNote(id, element);
        });

        contentTextarea.addEventListener('input', () => {
            updateNote(id, contentTextarea.value);
            // Also update the timestamp on the element itself
            element.querySelector('.timestamp').innerText = new Date().toLocaleString();
        });

        colorDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const newColor = dot.dataset.color;
                changeNoteColor(id, newColor, element);
            });
        });

        return element;
    }

    function addNote() {
        const notes = getNotes();
        const noteObject = {
            id: Date.now(),
            content: '',
            color: 'yellow', // Default color
            timestamp: new Date().toLocaleString()
        };

        const noteElement = createNoteElement(noteObject.id, noteObject.content, noteObject.color, noteObject.timestamp);
        notesGrid.prepend(noteElement); // Add new notes to the top

        notes.push(noteObject);
        saveNotes(notes);
    }

    function updateNote(id, newContent) {
        const notes = getNotes();
        const targetNote = notes.find(note => note.id == id);

        if (targetNote) {
            targetNote.content = newContent;
            targetNote.timestamp = new Date().toLocaleString();
            saveNotes(notes);
        }
    }


    function changeNoteColor(id, newColor, element) {
        const notes = getNotes();
        const targetNote = notes.find(note => note.id == id);

        if (targetNote) {
            targetNote.color = newColor;
            saveNotes(notes);

            // Update the element's class
            element.className = 'note'; // Reset classes
            element.classList.add(`color-${newColor}`);
        }
    }

    function deleteNote(id, element) {
        // Show a confirmation dialog before deleting
        const confirmed = confirm("Are you sure you want to delete this note?");
        if (!confirmed) return;

        const notes = getNotes().filter(note => note.id != id);
        saveNotes(notes);
        notesGrid.removeChild(element);
    }

    function filterNotes() {
        const searchTerm = searchInput.value.toLowerCase();
        document.querySelectorAll('.note').forEach(noteElement => {
            const content = noteElement.querySelector('.note-content').value.toLowerCase();
            if (content.includes(searchTerm)) {
                noteElement.style.display = 'flex';
            } else {
                noteElement.style.display = 'none';
            }
        });
    }
});