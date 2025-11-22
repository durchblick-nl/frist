/**
 * Fristenrechner - Calculation Functions
 * Swiss legal deadline calculations according to ZPO Art. 142-146
 */

// Gaußsche Osterformel
function calculateEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

// Calculate Easter-related holiday date
function calculateEasterRelatedDate(year, daysFromEaster) {
    const easter = calculateEasterDate(year);
    const result = new Date(easter);
    result.setDate(easter.getDate() + daysFromEaster);
    const month = String(result.getMonth() + 1).padStart(2, '0');
    const day = String(result.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Check if date is in court holidays (Art. 145 ZPO)
function isInCourtHolidays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Easter holidays: 7 days before to 7 days after Easter
    const easter = calculateEasterDate(year);
    const easterStart = new Date(easter);
    easterStart.setDate(easter.getDate() - 7);
    const easterEnd = new Date(easter);
    easterEnd.setDate(easter.getDate() + 7);
    if (date >= easterStart && date <= easterEnd) return true;

    // Summer holidays: July 15 - August 15
    if ((month === 6 && day >= 15) || (month === 7 && day <= 15)) return true;

    // Winter holidays: December 18 - January 2
    if ((month === 11 && day >= 18) || (month === 0 && day <= 2)) return true;

    return false;
}

// Get end of court holiday period (Art. 146 ZPO)
function getCourtHolidayPeriodEnd(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Easter
    const easter = calculateEasterDate(year);
    const easterStart = new Date(easter);
    easterStart.setDate(easter.getDate() - 7);
    const easterEnd = new Date(easter);
    easterEnd.setDate(easter.getDate() + 7);
    if (date >= easterStart && date <= easterEnd) {
        const nextDay = new Date(easterEnd);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay;
    }

    // Summer
    const summerStart = new Date(year, 6, 15);
    const summerEnd = new Date(year, 7, 15);
    if (date >= summerStart && date <= summerEnd) {
        return new Date(year, 7, 16);
    }

    // Winter
    const winterStart = new Date(year, 11, 18);
    if (date >= winterStart) {
        return new Date(year + 1, 0, 3);
    }
    if (month === 0 && day <= 2) {
        return new Date(year, 0, 3);
    }

    return null;
}

// Get holidays for a specific year
function getHolidaysForYear(year, selectedHolidays) {
    const holidays = [];

    // National holidays
    if (selectedHolidays.includes('all_national')) {
        holidays.push(
            `${year}-01-01`, // New Year
            calculateEasterRelatedDate(year, 39), // Ascension
            `${year}-08-01`, // National Day
            `${year}-12-25`  // Christmas
        );
    }

    // Cantonal holidays
    const cantonalHolidays = {
        'berchtoldstag': `${year}-01-02`,
        'dreikoenige': `${year}-01-06`,
        'josephstag': `${year}-03-19`,
        'karfreitag': calculateEasterRelatedDate(year, -2),
        'ostermontag': calculateEasterRelatedDate(year, 1),
        'tag_der_arbeit': `${year}-05-01`,
        'pfingstmontag': calculateEasterRelatedDate(year, 50),
        'fronleichnam': calculateEasterRelatedDate(year, 60),
        'maria_himmelfahrt': `${year}-08-15`,
        'allerheiligen': `${year}-11-01`,
        'maria_empfaengnis': `${year}-12-08`,
        'stephanstag': `${year}-12-26`
    };

    for (const [key, date] of Object.entries(cantonalHolidays)) {
        if (selectedHolidays.includes(key)) {
            holidays.push(date);
        }
    }

    return holidays;
}

// Check if date is weekend or holiday (Art. 142 Abs. 3 ZPO)
function isWeekendOrHoliday(date, selectedHolidays) {
    if (date.getDay() === 0 || date.getDay() === 6) return true;

    const year = date.getFullYear();
    const dateString = date.toISOString().split('T')[0];
    const holidays = getHolidaysForYear(year, selectedHolidays);

    return holidays.includes(dateString);
}

// Art. 142 Abs. 1bis ZPO: Shift weekend/holiday delivery to next business day
function adjustDeliveryDate(date, selectedHolidays) {
    const adjusted = new Date(date);
    while (isWeekendOrHoliday(adjusted, selectedHolidays)) {
        adjusted.setDate(adjusted.getDate() + 1);
    }
    return adjusted;
}

// Main deadline calculation function
function calculateDeadline(startDate, fristType, customValue, useCourtHolidays, selectedHolidays, useWeekendDeliveryRule = false) {
    let endDate;
    let effectiveStartDate = new Date(startDate);

    // Art. 142 Abs. 1bis ZPO: Weekend/holiday delivery by ordinary post
    // Delivery on Sa/So/holiday counts as delivered on next business day
    if (useWeekendDeliveryRule) {
        effectiveStartDate = adjustDeliveryDate(effectiveStartDate, selectedHolidays);
    }

    // Art. 146 ZPO: Notification during court holidays
    if (useCourtHolidays) {
        const courtHolidayEnd = getCourtHolidayPeriodEnd(startDate);
        if (courtHolidayEnd) {
            effectiveStartDate = courtHolidayEnd;
        }
    }

    // Calculate end date
    if (fristType.startsWith('months_')) {
        // Month deadline: starts on day of notification (BGer 5A_691/2023)
        const months = customValue || parseInt(fristType.split('_')[1]);
        const targetMonth = effectiveStartDate.getMonth() + months;
        const targetYear = effectiveStartDate.getFullYear() + Math.floor(targetMonth / 12);
        const normalizedTargetMonth = targetMonth % 12;
        const lastDayOfTargetMonth = new Date(targetYear, normalizedTargetMonth + 1, 0).getDate();
        const targetDay = Math.min(effectiveStartDate.getDate(), lastDayOfTargetMonth);
        endDate = new Date(targetYear, normalizedTargetMonth, targetDay);
    } else {
        // Day deadline: starts day AFTER notification (Art. 142 Abs. 1 ZPO)
        endDate = new Date(effectiveStartDate);
        const days = customValue || parseInt(fristType.split('_')[1]);
        endDate.setDate(endDate.getDate() + days);
    }

    // Art. 145 ZPO: Court holidays suspension
    if (useCourtHolidays) {
        let courtHolidayCount = 0;
        let currentDate = new Date(effectiveStartDate);
        while (currentDate <= endDate) {
            if (isInCourtHolidays(currentDate)) {
                courtHolidayCount++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        if (courtHolidayCount > 0) {
            endDate.setDate(endDate.getDate() + courtHolidayCount);
        }
    }

    // Art. 142 Abs. 3: Weekend/holiday adjustment
    while (isWeekendOrHoliday(endDate, selectedHolidays)) {
        endDate.setDate(endDate.getDate() + 1);
    }

    return endDate;
}

// Calculate court holidays for display
function calculateCourtHolidays(year) {
    const holidays = [];

    // Easter holidays
    const easter = calculateEasterDate(year);
    const easterStart = new Date(easter);
    easterStart.setDate(easter.getDate() - 7);
    const easterEnd = new Date(easter);
    easterEnd.setDate(easter.getDate() + 7);

    let currentDate = new Date(easterStart);
    while (currentDate <= easterEnd) {
        holidays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Summer holidays (July 15 - August 15)
    currentDate = new Date(year, 6, 15);
    const summerEnd = new Date(year, 7, 15);
    while (currentDate <= summerEnd) {
        holidays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Winter holidays (December 18 - January 2)
    currentDate = new Date(year, 11, 18);
    const winterEnd = new Date(year, 11, 31);
    while (currentDate <= winterEnd) {
        holidays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // January 1-2 of next year
    currentDate = new Date(year + 1, 0, 1);
    const nextYearEnd = new Date(year + 1, 0, 2);
    while (currentDate <= nextYearEnd) {
        holidays.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return holidays;
}
