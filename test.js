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

function loadBrowserScript(filename, lang = 'de') {
    const elements = new Map();
    const document = {
        documentElement: { lang },
        addEventListener() {},
        getElementById(id) {
            if (!elements.has(id)) {
                elements.set(id, {
                    value: '', checked: false, required: false, style: {},
                    addEventListener() {}, querySelector() { return null; },
                    scrollIntoView() {}
                });
            }
            return elements.get(id);
        },
        querySelector() { return { innerHTML: '' }; }
    };
    const sandbox = {
        console,
        document,
        window: { print() {} },
        localStorage: { getItem() { return 'true'; }, setItem() {} },
        alert() {}
    };
    sandbox.window.window = sandbox.window;
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(path.join(__dirname, filename), 'utf8'), sandbox);
    return expression => vm.runInContext(expression, sandbox);
}

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

console.log('\n--- Kalenderzaehler ---');
assertEqual(
    'Gerichtsferientag erhaelt keine laufende Tagesnummer',
    context.getDeadlineTimelineCount(date(2025, 7, 15), date(2025, 7, 11), 'days_10', null, true, []),
    null
);
assertEqual(
    'Erster Tag nach Zustellung in Gerichtsferien ist Tag 1',
    context.getDeadlineTimelineCount(date(2025, 8, 16), date(2025, 7, 20), 'days_10', null, true, []),
    1
);
assertEqual(
    'Verschobener Schluss-Werktag erzeugt keinen zusaetzlichen Fristtag',
    context.getDeadlineTimelineCount(date(2025, 1, 27), date(2025, 1, 6), 'days_20', null, false, []),
    null
);
assertEqual(
    'Monatsfristen zeigen keinen Tageszaehler',
    context.getDeadlineTimelineCount(date(2025, 2, 1), date(2025, 1, 1), 'months_1', null, false, []),
    null
);
const timedStart = new Date(2026, 7, 13, 8, 5);
assertDate(
    'Uhrzeit im Eingabedatum beeinflusst den Kalendertag nicht',
    calculate(timedStart, 'days_10', { courtHolidays: true }),
    date(2026, 8, 25)
);
assertEqual(
    'Fristende mit Uhrzeit wird im Kalender als Tag 10 markiert',
    context.getDeadlineTimelineCount(date(2026, 8, 25), timedStart, 'days_10', null, true, []),
    10
);

console.log('\n=== VERJAEHRUNGSRECHNER TESTS ===\n');
const prescription = loadBrowserScript('scripts/verjaehrung.js');
assertEqual('Ungueltiges Kalenderdatum wird abgewiesen', prescription("parseDate('31.02.2025')"), null);
assertEqual('Schalttag wird auf Monatsende geklemmt', formatDate(prescription("addYears(new Date(2024, 1, 29), 10)")), '2034-02-28');
assertEqual(
    'Ordentliche Unterbrechung startet relative und absolute Frist neu',
    formatDate(prescription("calculatePrescription(CLAIM_TYPES.tort_3, new Date(2020,0,1), new Date(2019,0,1), 'ordinary', new Date(2025,5,1)).absoluteExpiration")),
    '2035-06-01'
);
assertEqual(
    'Urkunde oder Urteil fuehrt zu neuer Zehnjahresfrist',
    formatDate(prescription("calculatePrescription(CLAIM_TYPES.tort_3, new Date(2020,0,1), new Date(2019,0,1), 'document_or_judgment', new Date(2025,5,1)).relevantExpiration")),
    '2035-06-01'
);

console.log('\n=== KUENDIGUNGSRECHNER TESTS ===\n');
const termination = loadBrowserScript('scripts/kuendigung.js');
assertEqual('Ungueltiges Kuendigungsdatum wird abgewiesen', termination("parseDate('31.02.2025')"), null);
assertEqual(
    'Arbeitskuendigung am 31. Januar endet nach einem Monat Ende Februar',
    formatDate(termination("calculateTermination(new Date(2025,0,31), CONTRACT_TYPES.work_year1).terminationDate")),
    '2025-02-28'
);
assertEqual(
    'Versicherungsende wird aus Eingabe geprueft und nicht erfunden',
    termination("calculateTermination(new Date(2026,10,13), CONTRACT_TYPES.insurance_property, {contractStartDate:new Date(2023,11,31), targetEndDate:new Date(2026,11,31)}).timely"),
    false
);
assertEqual(
    'Lebensversicherung ist nach einem Jahr kuendbar',
    termination("calculateTermination(new Date(2026,7,13), CONTRACT_TYPES.insurance_life, {contractStartDate:new Date(2025,7,13)}).timely"),
    true
);
assertEqual(
    'Grundversicherung nach Novemberfrist wechselt erst im Folgejahr',
    formatDate(termination("calculateTermination(new Date(2026,11,1), CONTRACT_TYPES.insurance_health_basic).terminationDate")),
    '2027-12-31'
);
assertEqual(
    'Individuelle Quartalsfrist weist den spaetesten Zugang rueckwaerts aus',
    formatDate(termination("calculateTermination(new Date(2026,0,15), CONTRACT_TYPES.custom, {customMonths:3, customTerm:'quarter_end'}).latestNoticeDate")),
    '2026-03-30'
);

console.log('\n=== ERGEBNIS ===');
console.log(`${passed} bestanden, ${failed} fehlgeschlagen`);
console.log(failed === 0 ? '✅ Alle Tests bestanden!' : '❌ Einige Tests fehlgeschlagen!');

process.exit(failed > 0 ? 1 : 0);
