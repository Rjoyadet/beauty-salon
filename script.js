(function () {
    'use strict';

    // Demo data: which slots are available (true) or taken (false)
    // In production, load this from your backend/API
    const OPEN_HOUR = 9;
    const CLOSE_HOUR = 19;
    const SLOT_MINUTES = 60;
    const DAYS_IN_VIEW = 7;

    function getTimeLabels() {
        const labels = [];
        for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
            labels.push(hour + ':00 ' + ampm);
        }
        return labels;
    }

    function getWeekDates(startDate) {
        const dates = [];
        const d = new Date(startDate);
        for (let i = 0; i < DAYS_IN_VIEW; i++) {
            const day = new Date(d);
            day.setDate(d.getDate() + i);
            dates.push(day);
        }
        return dates;
    }

    function formatDateLabel(date) {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function formatRangeLabel(dates) {
        if (dates.length === 0) return '';
        const first = dates[0];
        const last = dates[dates.length - 1];
        return first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' – ' +
            last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Build a deterministic but varied availability for demo (same per day/week)
    function isSlotAvailable(date, hour) {
        const day = date.getDay();
        const key = (date.getTime() % (7 * 24)) + hour;
        return (key + day * 3) % 5 !== 0 && (key + hour) % 4 !== 0;
    }

    function renderCalendar(startDate) {
        const grid = document.getElementById('calendarGrid');
        const rangeEl = document.getElementById('calendarRange');
        if (!grid || !rangeEl) return;

        const dates = getWeekDates(startDate);
        const timeLabels = getTimeLabels();
        rangeEl.textContent = formatRangeLabel(dates);

        grid.innerHTML = '';

        // Top-left corner
        const corner = document.createElement('div');
        corner.className = 'calendar-cell header';
        corner.setAttribute('aria-hidden', 'true');
        grid.appendChild(corner);

        // Day headers
        dates.forEach(function (date) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell header';
            cell.textContent = formatDateLabel(date);
            grid.appendChild(cell);
        });

        // Rows: time + slots per day
        for (let t = 0; t < timeLabels.length; t++) {
            const hour = OPEN_HOUR + t;

            const timeCell = document.createElement('div');
            timeCell.className = 'calendar-cell time-header';
            timeCell.textContent = timeLabels[t];
            grid.appendChild(timeCell);

            dates.forEach(function (date) {
                const available = isSlotAvailable(date, hour);
                const cell = document.createElement('div');
                cell.className = 'calendar-cell ' + (available ? 'slot-available' : 'slot-taken');
                cell.textContent = available ? 'Open' : '—';
                cell.setAttribute('role', 'button');
                cell.setAttribute('aria-label', formatDateLabel(date) + ' ' + timeLabels[t] + (available ? ' available' : ' taken'));
                if (available) {
                    cell.tabIndex = 0;
                    cell.addEventListener('click', function () {
                        alert('Book: ' + formatDateLabel(date) + ' at ' + timeLabels[t]);
                    });
                }
                grid.appendChild(cell);
            });
        }
    }

    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function init() {
        let currentStart = getStartOfWeek(new Date());

        renderCalendar(currentStart);

        document.getElementById('prevWeek')?.addEventListener('click', function () {
            const next = new Date(currentStart);
            next.setDate(next.getDate() - 7);
            currentStart = next;
            renderCalendar(currentStart);
        });

        document.getElementById('nextWeek')?.addEventListener('click', function () {
            const next = new Date(currentStart);
            next.setDate(next.getDate() + 7);
            currentStart = next;
            renderCalendar(currentStart);
        });

        // Mobile nav toggle
        document.querySelector('.nav-toggle')?.addEventListener('click', function () {
            document.querySelector('.nav-links')?.classList.toggle('open');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
