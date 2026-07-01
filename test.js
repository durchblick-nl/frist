#!/usr/bin/env node
/**
 * Fristenrechner - Automated Test Suite
 * Run with: node test.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const context = { console };
vm.createContext(context);
vm.runInContext(
    fs.readFileSync(path.join(__dirname, 'scripts/calculations.js'), 'utf8'),
    context
);

let passed = 0;
let failed = 0;

function date(year, month, day) {
    return new Date(year, month - 1, day);
}

function formatDate(value) {
    return [
        value.getFullYear(),
        String(value.getMonth() + 1).padStart(2, '0'),
        String(value.getDate()).padStart(2, '0')
    ].join('-');
}

function assertDate(name, actual, expected) {
    const pass = actual.toDateString() === expected.toDateString();

    if (pass) {
        passed++;
        console.log(`✅ ${name}`);
    } else {
        failed++;
        console.log(`❌ ${name}`);
        console.log(`   Expected: ${formatDate(expected)}`);
        console.log(`   Actual:   ${formatDate(actual)}`);
    }
}

function assertEqual(name, actual, expected) {
    if (actual === expected) {
        passed++;
        console.log(`✅ ${name}`);
    } else {
        failed++;
        console.log(`❌ ${name}`);
        console.log(`   Expected: ${expected}`);
        console.log(`   Actual:   ${actual}`);
    }
}

function calculate(startDate, fristType, options = {}) {
    return context.calculateDeadline(
        startDate,
        fristType,
        options.customValue || null,
        Boolean(options.courtHolidays),
        options.holidays || [],
        Boolean(options.weekendDelivery)
    );
}

console.log('\n=== FRISTENRECHNER TESTS ===\n');

console.log('\n--- Art. 142 Abs. 1: Tagesfristen ---');
assertDate(
    '10-Tage-Frist beginnt am Folgetag',
    calculate(date(2025, 1, 6), 'days_10'),
    date(2025, 1, 16)
);
assertDate(
    '20-Tage-Frist mit Fristende Sonntag verschiebt auf Montag',
    calculate(date(2025, 1, 6), 'days_20'),
    date(2025, 1, 27)
);

console.log('\n--- Art. 142 Abs. 1bis: Gewoehnliche Post an Wochenende/Feiertag ---');
assertDate(
    'Samstagszustellung per gewoehnlicher Post gilt am Montag als erfolgt',
    calculate(date(2025, 1, 18), 'days_10', { weekendDelivery: true }),
    date(2025, 1, 30)
);
assertDate(
    'Art. 142 Abs. 1bis kann die effektive Zustellung in Gerichtsferien verschieben',
    calculate(date(2025, 12, 13), 'days_10', { courtHolidays: true, weekendDelivery: true }),
    date(2026, 1, 12)
);

console.log('\n--- Art. 142 Abs. 2: Monatsfristen (BGer 5A_691/2023) ---');
assertDate(
    '1-Monats-Frist: gleicher Tag im Zielmonat, Samstag auf Montag',
    calculate(date(2025, 1, 15), 'months_1'),
    date(2025, 2, 17)
);
assertDate(
    '1-Monats-Frist: fehlender Zieltag faellt auf Monatsende',
    calculate(date(2025, 1, 31), 'months_1'),
    date(2025, 2, 28)
);
assertDate(
    '1-Monats-Frist im Schaltjahr',
    calculate(date(2024, 1, 31), 'months_1'),
    date(2024, 2, 29)
);

console.log('\n--- Art. 142 Abs. 3: Feiertage am Fristende ---');
assertDate(
    'Kantonaler Feiertag am Fristende verschiebt auf naechsten Werktag',
    calculate(date(2026, 3, 25), 'days_10', {
        holidays: ['karfreitag', 'ostermontag', 'pfingstmontag', 'allerheiligen', 'stephanstag']
    }),
    date(2026, 4, 7)
);

console.log('\n--- Art. 145: Gerichtsferien / Fristenstillstand ---');
assertDate(
    'Tagesfrist zaehlt vor Sommerferien und nach Ferienende weiter',
    calculate(date(2025, 7, 11), 'days_10', { courtHolidays: true }),
    date(2025, 8, 22)
);
assertDate(
    'Kurze Tagesfrist unmittelbar vor Sommerferien endet erst nach Ferienende',
    calculate(date(2025, 7, 14), 'days_1', { courtHolidays: true }),
    date(2025, 8, 18)
);
assertDate(
    'Tagesfrist ueber Winterferien endet ausserhalb des Stillstands',
    calculate(date(2025, 12, 15), 'days_10', { courtHolidays: true }),
    date(2026, 1, 12)
);
assertDate(
    'Monatsfrist wird um die Oster-Gerichtsferien verlaengert',
    calculate(date(2022, 1, 26), 'months_3', { courtHolidays: true }),
    date(2022, 5, 11)
);
assertDate(
    'Monatsfrist wird um vollstaendig ueberlappende Sommerferien verlaengert',
    calculate(date(2025, 7, 14), 'months_1', { courtHolidays: true }),
    date(2025, 9, 15)
);

console.log('\n--- Art. 146: Zustellung waehrend Gerichtsferien ---');
assertDate(
    'Zustellung waehrend Sommerferien: Tagesfrist laeuft ab 16. August',
    calculate(date(2025, 7, 20), 'days_10', { courtHolidays: true }),
    date(2025, 8, 25)
);
assertDate(
    'Zustellung waehrend Winterferien: Tagesfrist laeuft ab 3. Januar',
    calculate(date(2025, 12, 24), 'days_10', { courtHolidays: true }),
    date(2026, 1, 12)
);
assertDate(
    'Zustellung waehrend Sommerferien: Monatsfrist endet am gleichen Tag des Folgemonats',
    calculate(date(2025, 7, 20), 'months_1', { courtHolidays: true }),
    date(2025, 9, 16)
);

console.log('\n--- Osterberechnung ---');
assertEqual('Ostern 2025 = 20. April', formatDate(context.calculateEasterDate(2025)), '2025-04-20');
assertEqual('Ostern 2024 = 31. Maerz', formatDate(context.calculateEasterDate(2024)), '2024-03-31');

console.log('\n=== ERGEBNIS ===');
console.log(`${passed} bestanden, ${failed} fehlgeschlagen`);
console.log(failed === 0 ? '✅ Alle Tests bestanden!' : '❌ Einige Tests fehlgeschlagen!');

process.exit(failed > 0 ? 1 : 0);
