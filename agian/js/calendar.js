document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const eventModal = new bootstrap.Modal(document.getElementById('event-modal'));
    const modalDateEl = document.getElementById('modal-date');
    const addEventForm = document.getElementById('add-event-form');
    const eventTextInput = document.getElementById('event-text-input');
    const eventList = document.getElementById('event-list');

    // --- State ---
    let userData = JSON.parse(localStorage.getItem('notionx_user'));
    let currentDate = new Date();
    let selectedDateStr = '';

    // --- Helper Functions ---
    const saveUserData = () => {
        localStorage.setItem('notionx_user', JSON.stringify(userData));
    };

    /**
     * Renders the calendar for the month of the `date`  parameter.
     * @param {Date} date - The date indicating which month to render.
     */
    const renderCalendar = (date) => {
        calendarGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();

        monthYearHeader.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon,...
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDateOfPrevMonth = new Date(year, month, 0).getDate();
        const todayStr = new Date().toLocaleDateString('en-CA');

        // Render previous month's days
        for (let i = firstDayOfMonth; i > 0; i--) {
            const day = lastDateOfPrevMonth - i + 1;
            calendarGrid.innerHTML += `<div class="calendar-day prev-month-day"><span class="day-number">${day}</span></div>` ;
        }

        // Render current month's days
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` ;
            let dayClasses = 'calendar-day';
            if (dateStr === todayStr) {
                dayClasses += ' current-day';
            }

            // Check for events
            const hasEvents = userData.calendar.events[dateStr]?.length > 0;
            const eventDot = hasEvents ? '<div class="event-dot"></div>' : '';

            calendarGrid.innerHTML += `
                <div class="${dayClasses}" data-date="${dateStr}">
                    <span class="day-number">${i}</span>
                    ${eventDot}
                </div>
            `;
        }

        // Render next month's days to fill the grid
        const remainingCells = 42 - (firstDayOfMonth + lastDateOfMonth); // 6 rows * 7 cols
        for (let i = 1; i <= remainingCells; i++) {
             calendarGrid.innerHTML += `<div class="calendar-day next-month-day"><span class="day-number">${i}</span></div>` ;
        }
    };

    /**
     * Renders the list of events for the selected date inside the modal.
     */
    const renderEventsInModal = () => {
        eventList.innerHTML = '';
        const events = userData.calendar.events[selectedDateStr] || [];

        if(events.length === 0) {
            eventList.innerHTML = `<li class="list-group-item text-secondary">No events for this day.</li>` ;
        } else {
            events.forEach((eventText, index) => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    <span>${eventText}</span>
                    <button class="btn btn-sm btn-outline-danger delete-event-btn" data-index="${index}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                `;
                eventList.appendChild(li);
            });
        }
    };


    // --- Event Handlers ---

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    calendarGrid.addEventListener('click', (e) => {
        const dayCell = e.target.closest('.calendar-day');
        if (dayCell && dayCell.dataset.date) {
            selectedDateStr = dayCell.dataset.date;
            modalDateEl.textContent = new Date(selectedDateStr).toDateString();
            renderEventsInModal();
            eventModal.show();
        }
    });

    addEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const eventText = eventTextInput.value.trim();
        if (eventText) {
            // Ensure array exists for the date
            if (!userData.calendar.events[selectedDateStr]) {
                userData.calendar.events[selectedDateStr] = [];
            }
            userData.calendar.events[selectedDateStr].push(eventText);
            saveUserData();
            renderEventsInModal();
            renderCalendar(currentDate); // Re-render to show event dot
            eventTextInput.value = '';
        }
    });

    eventList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-event-btn');
        if(deleteBtn) {
            const eventIndex = parseInt(deleteBtn.dataset.index);
            userData.calendar.events[selectedDateStr].splice(eventIndex, 1);
            saveUserData();
            renderEventsInModal();
            renderCalendar(currentDate); // Re-render to remove event dot if needed
        }
    });

    // --- Initial Setup ---
    if (userData) {
        if (!userData.calendar || typeof userData.calendar.events !== 'object') {
            userData.calendar = { events: {} };
            saveUserData();
        }
        renderCalendar(currentDate);
    }
});
