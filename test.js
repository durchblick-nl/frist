#!/usr/bin/env node
/**
 * Fristenrechner - Automated Test Suite
 * Run with: node test.js
 */

// ============================================
// CALCULATION FUNCTIONS (copied from index.html)
// ============================================

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

function isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 6;
}

function calculateEasterRelatedDate(year, daysFromEaster) {
    const easter = calculateEasterDate(year);
    const result = new Date(easter);
    result.setDate(easter.getDate() + daysFromEaster);
    const month = String(result.getMonth() + 1).padStart(2, '0');
    const day = String(result.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getHolidaysForYear(year, selectedHolidays) {
    const holidays = [];
    if (selectedHolidays.includes('all_national')) {
        holidays.push(
            `${year}-01-01`,
            calculateEasterRelatedDate(year, 39),
            `${year}-08-01`,
            `${year}-12-25`
        );
    }
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
        if (selectedHolidays.includes(key)) holidays.push(date);
    }
    return holidays;
}

function isWeekendOrHoliday(date, selectedHolidays) {
    if (date.getDay() === 0 || date.getDay() === 6) return true;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    const holidays = getHolidaysForYear(year, selectedHolidays);
    return holidays.includes(dateString);
}

function isInCourtHolidays(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Easter holidays
    const easter = calculateEasterDate(year);
    const easterStart = new Date(easter);
    easterStart.setDate(easter.getDate() - 7);
    const easterEnd = new Date(easter);
    easterEnd.setDate(easter.getDate() + 7);
    if (date >= easterStart && date <= easterEnd) return true;

    // Summer holidays (15 July - 15 August)
    if ((month === 6 && day >= 15) || (month === 7 && day <= 15)) return true;

    // Winter holidays (18 December - 2 January)
    if ((month === 11 && day >= 18) || (month === 0 && day <= 2)) return true;

    return false;
}

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

    // Summer (15 July - 15 August)
    const summerStart = new Date(year, 6, 15);
    const summerEnd = new Date(year, 7, 15);
    if (date >= summerStart && date <= summerEnd) {
        return new Date(year, 7, 16);
    }

    // Winter (18 December - 2 January)
    const winterStart = new Date(year, 11, 18);
    if (date >= winterStart) {
        return new Date(year + 1, 0, 3);
    }
    if (month === 0 && day <= 2) {
        return new Date(year, 0, 3);
    }

    return null;
}

function calculateDeadline(startDate, fristType, days, months, useCourtHolidays = false) {
    let endDate;
    let effectiveStartDate = new Date(startDate);

    // Art. 146: Notification during court holidays
    if (useCourtHolidays) {
        const courtHolidayEnd = getCourtHolidayPeriodEnd(startDate);
        if (courtHolidayEnd) {
            effectiveStartDate = courtHolidayEnd;
        }
    }

    if (fristType === 'months') {
        const targetMonth = effectiveStartDate.getMonth() + months;
        const targetYear = effectiveStartDate.getFullYear() + Math.floor(targetMonth / 12);
        const normalizedTargetMonth = targetMonth % 12;
        const lastDayOfTargetMonth = new Date(targetYear, normalizedTargetMonth + 1, 0).getDate();
        const targetDay = Math.min(effectiveStartDate.getDate(), lastDayOfTargetMonth);
        endDate = new Date(targetYear, normalizedTargetMonth, targetDay);
    } else {
        endDate = new Date(effectiveStartDate);
        endDate.setDate(endDate.getDate() + days);
    }

    // Art. 145: Court holidays suspension
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

    // Art. 142 Abs. 3: Weekend adjustment
    while (isWeekend(endDate)) {
        endDate.setDate(endDate.getDate() + 1);
    }

    return endDate;
}

function calculateDeadlineWithHolidays(startDate, fristType, days, months, useCourtHolidays, selectedHolidays) {
    let endDate;
    let effectiveStartDate = new Date(startDate);

    if (useCourtHolidays) {
        const courtHolidayEnd = getCourtHolidayPeriodEnd(startDate);
        if (courtHolidayEnd) effectiveStartDate = courtHolidayEnd;
    }

    if (fristType === 'months') {
        const targetMonth = effectiveStartDate.getMonth() + months;
        const targetYear = effectiveStartDate.getFullYear() + Math.floor(targetMonth / 12);
        const normalizedTargetMonth = targetMonth % 12;
        const lastDayOfTargetMonth = new Date(targetYear, normalizedTargetMonth + 1, 0).getDate();
        const targetDay = Math.min(effectiveStartDate.getDate(), lastDayOfTargetMonth);
        endDate = new Date(targetYear, normalizedTargetMonth, targetDay);
    } else {
        endDate = new Date(effectiveStartDate);
        endDate.setDate(endDate.getDate() + days);
    }

    if (useCourtHolidays) {
        let courtHolidayCount = 0;
        let currentDate = new Date(effectiveStartDate);
        while (currentDate <= endDate) {
            if (isInCourtHolidays(currentDate)) courtHolidayCount++;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        if (courtHolidayCount > 0) endDate.setDate(endDate.getDate() + courtHolidayCount);
    }

    while (isWeekendOrHoliday(endDate, selectedHolidays)) {
        endDate.setDate(endDate.getDate() + 1);
    }

    return endDate;
}

// ============================================
// TEST RUNNER
// ============================================

const tests = [];
let passed = 0;
let failed = 0;

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function test(name, inputDate, fristType, days, months, useCourtHolidays, expectedDate) {
    const startDate = new Date(inputDate);
    const expected = new Date(expectedDate);
    const actual = calculateDeadline(startDate, fristType, days, months, useCourtHolidays);

    const pass = actual.toDateString() === expected.toDateString();

    if (pass) {
        passed++;
        console.log(`✅ ${name}`);
    } else {
        failed++;
        console.log(`❌ ${name}`);
        console.log(`   Input: ${formatDate(startDate)}, ${fristType === 'months' ? months + ' Monat(e)' : days + ' Tage'}${useCourtHolidays ? ' (Gerichtsferien)' : ''}`);
        console.log(`   Expected: ${formatDate(expected)}`);
        console.log(`   Actual:   ${formatDate(actual)}`);
    }

    return pass;
}

// ============================================
// TEST CASES
// ============================================

console.log('\n=== FRISTENRECHNER TESTS ===\n');

// Art. 142 Abs. 1: Tagesfristen
console.log('\n--- Art. 142 Abs. 1: Tagesfristen ---');
test('10-Tage-Frist (Mo → Do)', '2025-01-06', 'days', 10, 0, false, '2025-01-16');
test('20-Tage-Frist (Mo → So → Mo)', '2025-01-06', 'days', 20, 0, false, '2025-01-27');
test('30-Tage-Frist', '2025-01-06', 'days', 30, 0, false, '2025-02-05');

// Art. 142 Abs. 2: Monatsfristen
console.log('\n--- Art. 142 Abs. 2: Monatsfristen (BGer 5A_691/2023) ---');
test('1-Monats-Frist (15.1. → 15.2. Sa → 17.2. Mo)', '2025-01-15', 'months', 0, 1, false, '2025-02-17');
test('1-Monats-Frist (31.1. → 28.2.)', '2025-01-31', 'months', 0, 1, false, '2025-02-28');
test('1-Monats-Frist Schaltjahr (31.1. → 29.2.)', '2024-01-31', 'months', 0, 1, false, '2024-02-29');
test('3-Monats-Frist', '2025-01-15', 'months', 0, 3, false, '2025-04-15');
test('1-Monats-Frist Jahreswechsel', '2025-12-15', 'months', 0, 1, false, '2026-01-15');

// Art. 142 Abs. 3: Wochenende
console.log('\n--- Art. 142 Abs. 3: Wochenende ---');
test('Fristende am Samstag → Montag', '2025-01-08', 'days', 10, 0, false, '2025-01-20');
test('Fristende am Sonntag → Montag', '2025-01-09', 'days', 10, 0, false, '2025-01-20');

// Art. 145: Gerichtsferien (Fristenstillstand)
console.log('\n--- Art. 145: Gerichtsferien ---');
// 10.7. + 10 Tage = 20.7., Gerichtsferien 15.7.-20.7. = 6 Tage, 20.7. + 6 = 26.7. (Sa) → 28.7. (Mo)
test('10-Tage-Frist über Sommerferien', '2025-07-10', 'days', 10, 0, true, '2025-07-28');
// 15.12. + 10 Tage = 25.12., Gerichtsferien 18.12.-25.12. = 8 Tage, 25.12. + 8 = 2.1. (Do)
test('10-Tage-Frist über Winterferien', '2025-12-15', 'days', 10, 0, true, '2026-01-02');

// Art. 146: Zustellung während Gerichtsferien
console.log('\n--- Art. 146: Zustellung während Gerichtsferien ---');
test('Zustellung am 20. Juli (Sommerferien)', '2025-07-20', 'days', 10, 0, true, '2025-08-26');
test('Zustellung am 24. Dezember (Winterferien)', '2025-12-24', 'days', 10, 0, true, '2026-01-13');

// Kantonale Feiertage (Art. 142 Abs. 3 + canton holidays)
console.log('\n--- Kantonale Feiertage ---');
// Regression: SG, 25.03.2026 + 10 Tage → Sa 04.04. → So 05.04. (Ostersonntag) → Mo 06.04. (Ostermontag SG) → Di 07.04.
// Bug: toISOString() UTC-Fehler liess Ostermontag unerkannt (Thurnherr-Fall)
const sgHolidays = ['karfreitag', 'ostermontag', 'pfingstmontag', 'allerheiligen', 'stephanstag'];
const sgResult = calculateDeadlineWithHolidays(new Date(2026, 2, 25), 'days', 10, 0, false, sgHolidays);
const sgExpected = new Date(2026, 3, 7);
const sgPass = sgResult.toDateString() === sgExpected.toDateString();
console.log(sgPass ? '✅ SG Ostermontag: 25.03.2026 + 10 Tage = 07.04.2026 (Di)' : `❌ SG Ostermontag: erwartet 07.04.2026, erhalten ${formatDate(sgResult)}`);
if (sgPass) passed++; else failed++;

// Osterberechnung
console.log('\n--- Osterberechnung ---');
const easter2025 = calculateEasterDate(2025);
const easterCorrect = easter2025.getDate() === 20 && easter2025.getMonth() === 3; // April 20, 2025
console.log(easterCorrect ? '✅ Ostern 2025 = 20. April' : `❌ Ostern 2025 erwartet: 20. April, erhalten: ${formatDate(easter2025)}`);
if (easterCorrect) passed++; else failed++;

const easter2024 = calculateEasterDate(2024);
const easter2024Correct = easter2024.getDate() === 31 && easter2024.getMonth() === 2; // March 31, 2024
console.log(easter2024Correct ? '✅ Ostern 2024 = 31. März' : `❌ Ostern 2024 erwartet: 31. März, erhalten: ${formatDate(easter2024)}`);
if (easter2024Correct) passed++; else failed++;

// ============================================
// SUMMARY
// ============================================

console.log('\n=== ERGEBNIS ===');
console.log(`${passed} bestanden, ${failed} fehlgeschlagen`);
console.log(failed === 0 ? '✅ Alle Tests bestanden!' : '❌ Einige Tests fehlgeschlagen!');

process.exit(failed > 0 ? 1 : 0);
