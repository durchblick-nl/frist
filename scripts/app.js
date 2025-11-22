/**
 * Fristenrechner - Application Logic
 */

let datePicker;

// Kantonale Feiertage - Zuordnung nach Kanton
// Quellen:
// - Schweizerische Bundeskanzlei: https://www.bk.admin.ch/bk/de/home/politische-rechte/feiertage.html
// - Wikipedia: https://de.wikipedia.org/wiki/Feiertage_in_der_Schweiz
const cantonHolidays = {
    'AG': ['berchtoldstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'stephanstag'],
    'AI': ['karfreitag', 'ostermontag', 'pfingstmontag', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen', 'maria_empfaengnis', 'stephanstag'],
    'AR': ['karfreitag', 'ostermontag', 'pfingstmontag', 'stephanstag'],
    'BE': ['berchtoldstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'stephanstag'],
    'BL': ['karfreitag', 'ostermontag', 'tag_der_arbeit', 'pfingstmontag', 'stephanstag'],
    'BS': ['karfreitag', 'ostermontag', 'tag_der_arbeit', 'pfingstmontag', 'stephanstag'],
    'FR': ['berchtoldstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'stephanstag'],
    'GE': ['karfreitag', 'ostermontag', 'pfingstmontag'],
    'GL': ['berchtoldstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'allerheiligen', 'stephanstag'],
    'GR': ['berchtoldstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'stephanstag'],
    'JU': ['berchtoldstag', 'karfreitag', 'ostermontag', 'tag_der_arbeit', 'pfingstmontag', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen'],
    'LU': ['berchtoldstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen', 'maria_empfaengnis', 'stephanstag'],
    'NE': ['berchtoldstag', 'karfreitag', 'ostermontag', 'tag_der_arbeit', 'pfingstmontag'],
    'NW': ['karfreitag', 'ostermontag', 'pfingstmontag', 'josephstag', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen', 'maria_empfaengnis', 'stephanstag'],
    'OW': ['berchtoldstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen', 'maria_empfaengnis', 'stephanstag'],
    'SG': ['karfreitag', 'ostermontag', 'pfingstmontag', 'allerheiligen', 'stephanstag'],
    'SH': ['berchtoldstag', 'karfreitag', 'ostermontag', 'tag_der_arbeit', 'pfingstmontag', 'stephanstag'],
    'SO': ['berchtoldstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen', 'stephanstag'],
    'SZ': ['berchtoldstag', 'dreikoenige', 'josephstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen', 'maria_empfaengnis', 'stephanstag'],
    'TG': ['berchtoldstag', 'karfreitag', 'ostermontag', 'tag_der_arbeit', 'pfingstmontag', 'stephanstag'],
    'TI': ['dreikoenige', 'josephstag', 'ostermontag', 'tag_der_arbeit', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen', 'maria_empfaengnis', 'stephanstag'],
    'UR': ['berchtoldstag', 'dreikoenige', 'josephstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen', 'maria_empfaengnis', 'stephanstag'],
    'VD': ['berchtoldstag', 'karfreitag', 'ostermontag', 'pfingstmontag'],
    'VS': ['josephstag', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen', 'maria_empfaengnis'],
    'ZG': ['berchtoldstag', 'karfreitag', 'ostermontag', 'pfingstmontag', 'fronleichnam', 'maria_himmelfahrt', 'allerheiligen', 'maria_empfaengnis', 'stephanstag'],
    'ZH': ['berchtoldstag', 'karfreitag', 'ostermontag', 'tag_der_arbeit', 'pfingstmontag', 'stephanstag']
};

// Kanton aus URL oder localStorage laden
function getSelectedCanton() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('canton') || localStorage.getItem('frist-canton') || '';
}

// Kantonauswahl ändern
function selectCanton() {
    const canton = document.getElementById('canton').value;
    localStorage.setItem('frist-canton', canton);

    // Alle kantonalen Feiertage deselektieren
    document.querySelectorAll('input[name="holidays"]').forEach(cb => {
        if (cb.value !== 'all_national') {
            cb.checked = false;
        }
    });

    // Feiertage des gewählten Kantons selektieren
    if (canton && cantonHolidays[canton]) {
        cantonHolidays[canton].forEach(holiday => {
            const checkbox = document.querySelector(`input[name="holidays"][value="${holiday}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}

// Save current language to localStorage for redirect
(function() {
    const lang = document.documentElement.lang || 'de';
    localStorage.setItem('frist-lang', lang);
})();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Flatpickr
    const lang = document.documentElement.lang || 'de';
    const locale = lang === 'fr' ? {
        firstDayOfWeek: 1,
        weekdays: {
            shorthand: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
            longhand: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        },
        months: {
            shorthand: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
            longhand: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        },
    } : {
        firstDayOfWeek: 1,
        weekdays: {
            shorthand: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
            longhand: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
        },
        months: {
            shorthand: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            longhand: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        },
    };

    datePicker = flatpickr("#startDate", {
        dateFormat: "d.m.Y",
        defaultDate: new Date(),
        locale: locale
    });

    // Show disclaimer
    document.getElementById('disclaimerModal').style.display = 'block';
    document.querySelector('.container').style.pointerEvents = 'none';
    document.querySelector('.container').style.opacity = '0.5';

    // Restore saved canton selection
    const savedCanton = getSelectedCanton();
    const cantonSelect = document.getElementById('canton');
    if (cantonSelect && savedCanton) {
        cantonSelect.value = savedCanton;
        selectCanton();
    }

    // Update court holidays display with actual dates
    updateCourtHolidaysDisplay();
});

// Calculate and display actual court holiday dates
function updateCourtHolidaysDisplay() {
    const container = document.getElementById('courtHolidaysDates');
    if (!container) return;

    const lang = document.documentElement.lang || 'de';
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;

    // Calculate Easter dates
    const easter = calculateEasterDate(currentYear);
    const easterStart = new Date(easter);
    easterStart.setDate(easter.getDate() - 7);
    const easterEnd = new Date(easter);
    easterEnd.setDate(easter.getDate() + 7);

    // Check if Easter has passed this year
    let easterYear = currentYear;
    if (now > easterEnd) {
        easterYear = nextYear;
        const nextEaster = calculateEasterDate(nextYear);
        easterStart.setTime(nextEaster.getTime());
        easterStart.setDate(nextEaster.getDate() - 7);
        easterEnd.setTime(nextEaster.getTime());
        easterEnd.setDate(nextEaster.getDate() + 7);
    }

    const dateOptions = { day: 'numeric', month: 'long' };
    const locale = lang === 'fr' ? 'fr-CH' : 'de-CH';

    const formatDate = (date) => date.toLocaleDateString(locale, dateOptions);

    if (lang === 'fr') {
        container.innerHTML = `
            <li><strong>Pâques ${easterYear}:</strong> ${formatDate(easterStart)} – ${formatDate(easterEnd)}</li>
            <li><strong>Été:</strong> 15 juillet – 15 août</li>
            <li><strong>Hiver:</strong> 18 décembre – 2 janvier</li>
        `;
    } else {
        container.innerHTML = `
            <li><strong>Ostern ${easterYear}:</strong> ${formatDate(easterStart)} – ${formatDate(easterEnd)}</li>
            <li><strong>Sommer:</strong> 15. Juli – 15. August</li>
            <li><strong>Winter:</strong> 18. Dezember – 2. Januar</li>
        `;
    }
}

function acceptDisclaimer() {
    document.getElementById('disclaimerModal').style.display = 'none';
    document.querySelector('.container').style.pointerEvents = 'auto';
    document.querySelector('.container').style.opacity = '1';
}

function toggleCustomFrist() {
    const fristType = document.getElementById('fristType').value;
    const customDaysGroup = document.getElementById('customDaysGroup');
    const customMonthsGroup = document.getElementById('customMonthsGroup');

    customDaysGroup.style.display = 'none';
    customMonthsGroup.style.display = 'none';
    document.getElementById('customDays').required = false;
    document.getElementById('customMonths').required = false;

    if (fristType === 'days_custom') {
        customDaysGroup.style.display = 'block';
        document.getElementById('customDays').required = true;
    } else if (fristType === 'months_custom') {
        customMonthsGroup.style.display = 'block';
        document.getElementById('customMonths').required = true;
    }
}

function toggleGerichtsferien() {
    const verfahrensart = document.getElementById('verfahrensart').value;
    const gerichtsferienGroup = document.getElementById('gerichtsferienGroup');
    const gerichtsferienCheckbox = document.getElementById('gerichtsferien');
    const hint = document.getElementById('verfahrensartHint');
    const lang = document.documentElement.lang || 'de';

    if (verfahrensart === 'summarisch' || verfahrensart === 'schlichtung') {
        gerichtsferienGroup.style.display = 'none';
        gerichtsferienCheckbox.checked = false;
        hint.textContent = lang === 'fr'
            ? 'Les féries judiciaires ne s\'appliquent pas à cette procédure (art. 145 al. 2 CPC)'
            : 'Gerichtsferien gelten nicht für dieses Verfahren (Art. 145 Abs. 2 ZPO)';
        hint.style.color = 'var(--accent-color)';
    } else {
        gerichtsferienGroup.style.display = 'block';
        gerichtsferienCheckbox.checked = true;
        hint.textContent = lang === 'fr'
            ? 'Les féries judiciaires s\'appliquent aux procédures ordinaires et simplifiées'
            : 'Bei ordentlichen und vereinfachten Verfahren gelten Gerichtsferien';
        hint.style.color = '#666';
    }
}

function getSelectedHolidays() {
    const selected = [];
    document.querySelectorAll('input[name="holidays"]:checked').forEach(cb => {
        selected.push(cb.value);
    });
    return selected;
}

// Form submission
document.getElementById('fristForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const startDate = datePicker.selectedDates[0];
    if (!startDate) {
        alert('Bitte wählen Sie ein Datum');
        return;
    }

    const fristType = document.getElementById('fristType').value;
    let customValue = null;

    if (fristType === 'days_custom') {
        customValue = parseInt(document.getElementById('customDays').value);
    } else if (fristType === 'months_custom') {
        customValue = parseInt(document.getElementById('customMonths').value);
    }

    if (!fristType) {
        alert('Bitte wählen Sie eine Frist');
        return;
    }

    const useCourtHolidays = document.getElementById('gerichtsferien').checked;
    const selectedHolidays = getSelectedHolidays();
    const useWeekendDelivery = document.getElementById('weekendDelivery').checked;

    const endDate = calculateDeadline(startDate, fristType, customValue, useCourtHolidays, selectedHolidays, useWeekendDelivery);
    displayResult(startDate, endDate, fristType, customValue, useCourtHolidays, selectedHolidays, useWeekendDelivery);
});

function displayResult(startDate, endDate, fristType, customValue, useCourtHolidays, selectedHolidays, useWeekendDelivery = false) {
    const result = document.getElementById('result');
    const resultSummary = result.querySelector('.result-summary');
    const lang = document.documentElement.lang || 'de';

    // Format deadline text
    let fristText = '';
    if (fristType.startsWith('months_')) {
        const months = customValue || parseInt(fristType.split('_')[1]);
        fristText = lang === 'fr'
            ? `${months} mois`
            : `${months} ${months === 1 ? 'Monat' : 'Monate'}`;
    } else {
        const days = customValue || parseInt(fristType.split('_')[1]);
        fristText = lang === 'fr'
            ? `${days} ${days === 1 ? 'jour' : 'jours'}`
            : `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
    }

    const labels = lang === 'fr' ? {
        notification: 'Notification',
        deadline: 'Délai choisi',
        type: 'Type de délai',
        monthType: 'Délai en mois : commence le jour de la notification',
        dayType: 'Délai en jours : commence le lendemain de la notification',
        endDate: 'Fin du délai'
    } : {
        notification: 'Zustellung',
        deadline: 'Gewählte Frist',
        type: 'Fristtyp',
        monthType: 'Monatsfrist: Frist beginnt am Tag der Zustellung',
        dayType: 'Tagesfrist: Frist beginnt am Tag nach der Zustellung',
        endDate: 'Fristende'
    };

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const locale = lang === 'fr' ? 'fr-CH' : 'de-CH';

    resultSummary.innerHTML = `
        <h3>${labels.endDate}:</h3>
        <p><strong>${labels.notification}:</strong> ${startDate.toLocaleDateString(locale, dateOptions)}</p>
        <p><strong>${labels.deadline}:</strong> ${fristText}</p>
        <p><strong>${labels.type}:</strong> ${fristType.startsWith('months_') ? labels.monthType : labels.dayType}</p>
        <p style="font-size: 1.5rem; margin-top: 1rem;"><strong>${labels.endDate}:</strong> ${endDate.toLocaleDateString(locale, dateOptions)}</p>
    `;

    // Generate calendar
    generateCalendar(startDate, endDate, useCourtHolidays, selectedHolidays);

    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth' });
}

function generateCalendar(startDate, endDate, useCourtHolidays, selectedHolidays) {
    const timeline = document.querySelector('.timeline');
    timeline.innerHTML = '';

    const lang = document.documentElement.lang || 'de';
    const weekdays = lang === 'fr'
        ? ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
        : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    // Add weekday headers
    const calendarGrid = document.querySelector('.calendar-grid');
    calendarGrid.innerHTML = weekdays.map(d => `<div class="weekday-header">${d}</div>`).join('');

    // Find first Monday before or on start date
    let currentDate = new Date(startDate);
    while (currentDate.getDay() !== 1) {
        currentDate.setDate(currentDate.getDate() - 1);
    }

    let dayCount = 0;
    const isMonthFrist = document.getElementById('fristType').value.startsWith('months_');

    while (currentDate <= endDate || currentDate.getDay() !== 1) {
        const isBeforeStart = currentDate < startDate;
        const isAfterEnd = currentDate > endDate;
        const isStartDate = currentDate.toDateString() === startDate.toDateString();
        const isEndDate = currentDate.toDateString() === endDate.toDateString();

        let dateClass = 'normal';
        if (isBeforeStart || isAfterEnd) {
            dateClass = 'empty-day';
        } else if (isEndDate) {
            dateClass = 'last-day';
        } else if (useCourtHolidays && isInCourtHolidays(currentDate)) {
            dateClass = 'court-holiday';
        } else if (isWeekendOrHoliday(currentDate, selectedHolidays)) {
            dateClass = currentDate.getDay() === 0 || currentDate.getDay() === 6 ? 'weekend' : 'holiday';
        }

        // Count days for day deadlines
        if (!isBeforeStart && !isAfterEnd && dateClass !== 'empty-day') {
            if (!isMonthFrist && !isStartDate) {
                dayCount++;
            } else if (isMonthFrist) {
                dayCount++;
            }
        }

        const dayBox = document.createElement('div');
        dayBox.className = `date-box ${dateClass}`;

        if (dateClass !== 'empty-day') {
            dayBox.innerHTML = `
                <div class="date">${currentDate.getDate()}.${currentDate.getMonth() + 1}.</div>
                ${dayCount > 0 ? `<div class="count">${dayCount}</div>` : ''}
            `;
        }

        timeline.appendChild(dayBox);
        currentDate.setDate(currentDate.getDate() + 1);

        // Safety break
        if (dayCount > 365) break;
    }
}

function printResult() {
    const lang = document.documentElement.lang || 'de';
    const locale = lang === 'fr' ? 'fr-CH' : 'de-CH';
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const printDateEl = document.getElementById('printDate');
    if (printDateEl) {
        const prefix = lang === 'fr' ? 'Calculé le ' : 'Berechnet am ';
        printDateEl.textContent = prefix + new Date().toLocaleDateString(locale, dateOptions);
    }
    window.print();
}
