/**
 * Kündigungsfristenrechner / Calculateur de délais de résiliation
 * Notice period calculator for Swiss law (OR Art. 335, 266, VVG, KVG)
 */

// Detect language from HTML lang attribute
const LANG = document.documentElement.lang || 'de';

// Translations
const TRANSLATIONS = {
    de: {
        fillAllFields: 'Bitte füllen Sie alle Pflichtfelder aus.',
        invalidDate: 'Bitte geben Sie ein gültiges Datum ein.',
        calculateFirst: 'Bitte berechnen Sie zuerst den Kündigungstermin.',
        createdOn: 'Erstellt am',
        result: 'Ergebnis',
        contractType: 'Vertragsart',
        legalBasis: 'Rechtsgrundlage',
        noticePeriod: 'Kündigungsfrist',
        noticeDelivered: 'Kündigung zugestellt am',
        earliestEnd: 'Frühester Beendigungstermin',
        timeline: 'Zeitlicher Ablauf',
        notice: 'Kündigung',
        end: 'Ende',
        periodTypes: {
            fixedDate: 'Feste Frist (30. November)',
            days: 'Tage',
            weeks: 'Wochen',
            months: 'Monat(e)',
            custom: 'Individuell'
        },
        termTypes: {
            any: 'jederzeit',
            month_end: 'auf Monatsende',
            quarter_end: 'auf Quartalsende (ortsüblich)',
            year_end: 'auf Ende Jahr',
            policy_year: 'auf Ende Versicherungsjahr',
            contract_end: 'vor Vertragsablauf'
        },
        warnings: {
            rent: '<strong>Hinweis:</strong> Bei Wohnungsmiete muss die Kündigung auf dem amtlichen Formular erfolgen. Die Kündigung muss spätestens am letzten Tag vor Beginn der Kündigungsfrist beim Empfänger eingehen.',
            insurance: '<strong>Hinweis:</strong> Die Kündigung muss beim Versicherer eingehen (nicht Poststempel). Prüfen Sie Ihre Police für das genaue Versicherungsjahr. Nach Schadenfall: Sonderkündigungsrecht innert 14 Tagen.',
            subscription: '<strong>Hinweis:</strong> Die angegebenen Fristen sind branchenüblich. Prüfen Sie Ihre AGB für die genaue Frist! Ohne rechtzeitige Kündigung erfolgt meist automatische Verlängerung.'
        }
    },
    fr: {
        fillAllFields: 'Veuillez remplir tous les champs obligatoires.',
        invalidDate: 'Veuillez entrer une date valide.',
        calculateFirst: 'Veuillez d\'abord calculer le délai de résiliation.',
        createdOn: 'Créé le',
        result: 'Résultat',
        contractType: 'Type de contrat',
        legalBasis: 'Base légale',
        noticePeriod: 'Délai de résiliation',
        noticeDelivered: 'Résiliation notifiée le',
        earliestEnd: 'Fin au plus tôt',
        timeline: 'Chronologie',
        notice: 'Résiliation',
        end: 'Fin',
        periodTypes: {
            fixedDate: 'Délai fixe (30 novembre)',
            days: 'jours',
            weeks: 'semaines',
            months: 'mois',
            custom: 'Individuel'
        },
        termTypes: {
            any: 'n\'importe quand',
            month_end: 'pour fin de mois',
            quarter_end: 'pour fin de trimestre',
            year_end: 'pour fin d\'année',
            policy_year: 'pour fin d\'année d\'assurance',
            contract_end: 'avant échéance'
        },
        warnings: {
            rent: '<strong>Remarque:</strong> Pour les logements, la résiliation doit être faite sur formule officielle. Elle doit parvenir au destinataire au plus tard le dernier jour avant le début du délai.',
            insurance: '<strong>Remarque:</strong> La résiliation doit parvenir à l\'assureur (pas le cachet postal). Vérifiez votre police pour l\'année d\'assurance exacte. Après sinistre: droit de résiliation extraordinaire dans les 14 jours.',
            subscription: '<strong>Remarque:</strong> Les délais indiqués sont usuels dans la branche. Vérifiez vos CG pour le délai exact! Sans résiliation à temps, renouvellement automatique dans la plupart des cas.'
        }
    }
};

const T = TRANSLATIONS[LANG] || TRANSLATIONS.de;

// Contract type configurations (bilingual)
const CONTRACT_TYPES = {
    // Employment contracts (OR Art. 335)
    'work_probation': {
        name: { de: 'Probezeit', fr: 'Temps d\'essai' },
        article: 'OR Art. 335b',
        days: 7,
        term: 'any',
        info: {
            de: 'Während der Probezeit (max. 3 Monate) kann mit 7 Tagen Frist jederzeit gekündigt werden.',
            fr: 'Pendant le temps d\'essai (max. 3 mois), le contrat peut être résilié moyennant un délai de 7 jours.'
        }
    },
    'work_year1': {
        name: { de: '1. Dienstjahr', fr: '1ère année de service' },
        article: 'OR Art. 335c',
        months: 1,
        term: 'month_end',
        info: {
            de: 'Im ersten Dienstjahr beträgt die Kündigungsfrist 1 Monat auf Ende eines Monats.',
            fr: 'Pendant la première année, le délai de résiliation est d\'un mois pour la fin d\'un mois.'
        }
    },
    'work_year2_9': {
        name: { de: '2.-9. Dienstjahr', fr: '2e-9e année de service' },
        article: 'OR Art. 335c',
        months: 2,
        term: 'month_end',
        info: {
            de: 'Vom 2. bis 9. Dienstjahr beträgt die Kündigungsfrist 2 Monate auf Ende eines Monats.',
            fr: 'De la 2e à la 9e année, le délai est de 2 mois pour la fin d\'un mois.'
        }
    },
    'work_year10': {
        name: { de: 'Ab 10. Dienstjahr', fr: 'Dès la 10e année' },
        article: 'OR Art. 335c',
        months: 3,
        term: 'month_end',
        info: {
            de: 'Ab dem 10. Dienstjahr beträgt die Kündigungsfrist 3 Monate auf Ende eines Monats.',
            fr: 'Dès la 10e année de service, le délai est de 3 mois pour la fin d\'un mois.'
        }
    },
    // Rental contracts (OR Art. 266)
    'rent_apartment': {
        name: { de: 'Wohnung', fr: 'Logement' },
        article: 'OR Art. 266c',
        months: 3,
        term: 'quarter_end',
        info: {
            de: 'Wohnungsmiete: 3 Monate Kündigungsfrist auf ortsüblichen Termin (meist Quartalsende).',
            fr: 'Bail de logement: délai de 3 mois pour le terme usuel local (généralement fin de trimestre).'
        }
    },
    'rent_business': {
        name: { de: 'Geschäftsräume', fr: 'Locaux commerciaux' },
        article: 'OR Art. 266d',
        months: 6,
        term: 'quarter_end',
        info: {
            de: 'Geschäftsmiete: 6 Monate Kündigungsfrist auf ortsüblichen Termin (meist Quartalsende).',
            fr: 'Bail commercial: délai de 6 mois pour le terme usuel local (généralement fin de trimestre).'
        }
    },
    'rent_room': {
        name: { de: 'Möbliertes Zimmer', fr: 'Chambre meublée' },
        article: 'OR Art. 266e',
        weeks: 2,
        term: 'month_end',
        info: {
            de: 'Möblierte Zimmer und Einstellplätze: 2 Wochen Kündigungsfrist auf Monatsende.',
            fr: 'Chambres meublées: délai de 2 semaines pour la fin d\'un mois.'
        }
    },
    'rent_parking': {
        name: { de: 'Parkplatz', fr: 'Place de parc' },
        article: 'OR Art. 266e',
        weeks: 2,
        term: 'month_end',
        info: {
            de: 'Parkplätze und Einstellplätze: 2 Wochen Kündigungsfrist auf Monatsende.',
            fr: 'Places de parc: délai de 2 semaines pour la fin d\'un mois.'
        }
    },
    // Custom
    'custom': {
        name: { de: 'Individuelle Frist', fr: 'Délai individuel' },
        article: { de: 'Vertrag', fr: 'Contrat' },
        custom: true,
        info: {
            de: 'Geben Sie die vertraglich vereinbarte Kündigungsfrist ein.',
            fr: 'Entrez le délai de résiliation convenu contractuellement.'
        }
    },
    // Insurance contracts
    'insurance_health_basic': {
        name: { de: 'Krankenkasse Grundversicherung', fr: 'Assurance maladie de base' },
        article: { de: 'KVG Art. 7', fr: 'LAMal art. 7' },
        fixedDate: { month: 10, day: 30 },
        term: 'year_end',
        info: {
            de: 'Grundversicherung: Kündigung muss bis 30. November beim Versicherer eingehen. Wechsel per 1. Januar.',
            fr: 'Assurance de base: La résiliation doit parvenir à l\'assureur jusqu\'au 30 novembre. Changement au 1er janvier.'
        }
    },
    'insurance_health_extra': {
        name: { de: 'Krankenkasse Zusatzversicherung', fr: 'Assurance complémentaire' },
        article: 'VVG Art. 35 / LCA art. 35',
        months: 3,
        term: 'year_end',
        info: {
            de: 'Zusatzversicherung: Meist 3 Monate Kündigungsfrist auf Ende Jahr. Prüfen Sie Ihre Police!',
            fr: 'Assurance complémentaire: Généralement 3 mois de préavis pour fin d\'année. Vérifiez votre police!'
        }
    },
    'insurance_property': {
        name: { de: 'Sach-/Autoversicherung', fr: 'Assurance RC/auto' },
        article: 'VVG Art. 35 / LCA art. 35',
        months: 3,
        term: 'policy_year',
        info: {
            de: 'Sachversicherungen: 3 Monate Kündigungsfrist auf Ende des Versicherungsjahres. Seit VVG 2022: Alle Verträge kündbar nach 3 Jahren mit 3 Monaten Frist.',
            fr: 'Assurances choses: 3 mois de préavis pour fin d\'année d\'assurance. Depuis LCA 2022 toujours résiliable après 3 ans.'
        }
    },
    'insurance_life': {
        name: { de: 'Lebensversicherung', fr: 'Assurance vie' },
        article: 'VVG Art. 35 / LCA art. 35',
        months: 3,
        term: 'policy_year',
        info: {
            de: 'Lebensversicherung: 3 Monate Kündigungsfrist. Achtung: Rückkaufswert kann unter einbezahlten Prämien liegen.',
            fr: 'Assurance vie: 3 mois de préavis. Attention: La valeur de rachat peut être inférieure aux primes versées.'
        }
    },
    // Subscription contracts
    'subscription_fitness': {
        name: { de: 'Fitness-Abo', fr: 'Fitness' },
        article: { de: 'Vertrag/AGB', fr: 'Contrat/CG' },
        months: 3,
        term: 'contract_end',
        info: {
            de: 'Fitness-Abos: Meist 3 Monate vor Ablauf kündbar. Ohne Kündigung automatische Verlängerung. Ausserordentliche Kündigung bei Umzug >30km möglich.',
            fr: 'Abonnements fitness: Généralement résiliables 3 mois avant échéance. Sans résiliation, renouvellement automatique. Résiliation extraordinaire possible en cas de déménagement >30km.'
        }
    },
    'subscription_mobile': {
        name: { de: 'Handy-Abo', fr: 'Mobile' },
        article: { de: 'Vertrag/AGB', fr: 'Contrat/CG' },
        days: 60,
        term: 'contract_end',
        info: {
            de: 'Mobilfunk: Meist 60 Tage Kündigungsfrist. Ohne Kündigung automatische Verlängerung. Prüfen Sie Ihre AGB!',
            fr: 'Téléphonie mobile: Généralement 60 jours de préavis. Sans résiliation, renouvellement automatique. Vérifiez vos CG!'
        }
    },
    'subscription_internet': {
        name: { de: 'Internet/TV-Abo', fr: 'Internet/TV' },
        article: { de: 'Vertrag/AGB', fr: 'Contrat/CG' },
        days: 60,
        term: 'contract_end',
        info: {
            de: 'Internet/TV: Meist 60 Tage Kündigungsfrist vor Ablauf der Mindestvertragsdauer. Automatische Verlängerung üblich.',
            fr: 'Internet/TV: Généralement 60 jours de préavis avant fin de durée minimale. Renouvellement automatique courant.'
        }
    },
    'subscription_streaming': {
        name: { de: 'Streaming/Zeitschrift', fr: 'Streaming/Magazine' },
        article: { de: 'Vertrag/AGB', fr: 'Contrat/CG' },
        months: 1,
        term: 'month_end',
        info: {
            de: 'Streaming-Dienste: Meist monatlich kündbar. Zeitschriften: Oft 1 Monat auf Ende einer Aboperiode.',
            fr: 'Services de streaming: Généralement résiliables mensuellement. Magazines: Souvent 1 mois pour fin de période.'
        }
    }
};

// Helper function to get localized contract type data
function getContractType(key) {
    const type = CONTRACT_TYPES[key];
    if (!type) return null;

    const localizedType = { ...type };
    localizedType.name = typeof type.name === 'object' ? (type.name[LANG] || type.name.de) : type.name;
    localizedType.info = typeof type.info === 'object' ? (type.info[LANG] || type.info.de) : type.info;
    localizedType.article = typeof type.article === 'object' ? (type.article[LANG] || type.article.de) : type.article;

    return localizedType;
}

// Date utilities
function parseDate(dateStr) {
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function formatDate(date) {
    const locale = LANG === 'fr' ? 'fr-CH' : 'de-CH';
    return date.toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateShort(date) {
    const locale = LANG === 'fr' ? 'fr-CH' : 'de-CH';
    return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function addWeeks(date, weeks) {
    return addDays(date, weeks * 7);
}

function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

function getMonthEnd(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getNextQuarterEnd(date) {
    const month = date.getMonth();
    let targetMonth;
    if (month < 2) targetMonth = 2;
    else if (month < 5) targetMonth = 5;
    else if (month < 8) targetMonth = 8;
    else if (month < 11) targetMonth = 11;
    else targetMonth = 14;

    let year = date.getFullYear();
    if (targetMonth > 11) {
        targetMonth -= 12;
        year++;
    }

    return new Date(year, targetMonth + 1, 0);
}

function getYearEnd(date) {
    return new Date(date.getFullYear(), 11, 31);
}

function getNextYearEnd(date) {
    const yearEnd = getYearEnd(date);
    if (date <= yearEnd) return yearEnd;
    return new Date(date.getFullYear() + 1, 11, 31);
}

function getTerminationDate(noticeDate, type, customMonths, customTerm) {
    let minEndDate;

    // Special case: fixed deadline (e.g., Krankenkasse Nov 30)
    if (type.fixedDate) {
        const thisYear = new Date(noticeDate.getFullYear(), type.fixedDate.month, type.fixedDate.day);
        if (noticeDate > thisYear) {
            return new Date(noticeDate.getFullYear() + 1, 11, 31);
        }
        return new Date(noticeDate.getFullYear(), 11, 31);
    }

    // Calculate minimum end date based on notice period
    if (type.custom) {
        minEndDate = addMonths(noticeDate, parseInt(customMonths) || 1);
    } else if (type.days) {
        minEndDate = addDays(noticeDate, type.days);
    } else if (type.weeks) {
        minEndDate = addWeeks(noticeDate, type.weeks);
    } else if (type.months) {
        minEndDate = addMonths(noticeDate, type.months);
    }

    // Apply term
    let term = type.custom ? customTerm : type.term;

    if (term === 'month_end') {
        let endDate = getMonthEnd(minEndDate);
        if (endDate < minEndDate) {
            endDate = getMonthEnd(addMonths(minEndDate, 1));
        }
        return endDate;
    } else if (term === 'quarter_end') {
        let endDate = getNextQuarterEnd(minEndDate);
        while (endDate < minEndDate) {
            endDate = getNextQuarterEnd(addMonths(endDate, 1));
        }
        return endDate;
    } else if (term === 'year_end') {
        return getNextYearEnd(minEndDate);
    } else if (term === 'policy_year' || term === 'contract_end') {
        return minEndDate;
    } else {
        return minEndDate;
    }
}

// UI Functions
function updateContractInfo() {
    const select = document.getElementById('contractType');
    const infoDiv = document.getElementById('contractTypeInfo');
    const customPeriodGroup = document.getElementById('customPeriodGroup');
    const customTermGroup = document.getElementById('customTermGroup');
    const workStartGroup = document.getElementById('workStartGroup');
    const type = getContractType(select.value);

    if (type) {
        let periodText = '';
        if (type.fixedDate) periodText = T.periodTypes.fixedDate;
        else if (type.days) periodText = `${type.days} ${T.periodTypes.days}`;
        else if (type.weeks) periodText = `${type.weeks} ${T.periodTypes.weeks}`;
        else if (type.months) periodText = `${type.months} ${T.periodTypes.months}`;
        else if (type.custom) periodText = T.periodTypes.custom;

        let termText = T.termTypes[type.term] || T.termTypes.any;

        infoDiv.innerHTML = `
            <h4>${type.name} – ${type.article}</h4>
            <p><strong>${T.noticePeriod}:</strong> ${periodText} ${termText}</p>
            <p>${type.info}</p>
        `;
        infoDiv.style.display = 'block';

        // Show/hide custom fields
        if (customPeriodGroup) customPeriodGroup.style.display = type.custom ? 'block' : 'none';
        if (customTermGroup) customTermGroup.style.display = type.custom ? 'block' : 'none';

        // Show work start date for employment contracts
        const isWorkContract = select.value.startsWith('work_');
        if (workStartGroup) workStartGroup.style.display = isWorkContract ? 'block' : 'none';
    } else {
        infoDiv.style.display = 'none';
        if (customPeriodGroup) customPeriodGroup.style.display = 'none';
        if (customTermGroup) customTermGroup.style.display = 'none';
        if (workStartGroup) workStartGroup.style.display = 'none';
    }
}

// PDF Export data storage
let lastKuendigungData = null;

function saveKuendigungData(contractType, noticePeriod, plannedDate, latestNoticeDate, terminationDate) {
    lastKuendigungData = {
        contractType: contractType,
        noticePeriod: noticePeriod,
        plannedDate: plannedDate,
        latestNoticeDate: latestNoticeDate,
        terminationDate: terminationDate
    };
}

function exportPDF() {
    if (!lastKuendigungData) {
        alert(T.calculateFirst);
        return;
    }
    if (typeof KuendigungPdfExport !== 'undefined') {
        KuendigungPdfExport.generatePDF(lastKuendigungData, LANG);
    } else {
        printResult();
    }
}

function printResult() {
    const printDate = document.getElementById('printDate');
    if (printDate) {
        const locale = LANG === 'fr' ? 'fr-CH' : 'de-CH';
        printDate.textContent = T.createdOn + ': ' + new Date().toLocaleDateString(locale);
    }
    window.print();
}

// Disclaimer
function acceptDisclaimer() {
    document.getElementById('disclaimerModal').style.display = 'none';
    localStorage.setItem('kuendigung_disclaimer_accepted', 'true');
}

// Form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const contractTypeValue = document.getElementById('contractType').value;
    const noticeDateStr = document.getElementById('noticeDate').value;
    const customMonths = document.getElementById('customMonths')?.value || '';
    const customTerm = document.getElementById('customTerm')?.value || 'any';

    if (!contractTypeValue || !noticeDateStr) {
        alert(T.fillAllFields);
        return;
    }

    const type = getContractType(contractTypeValue);
    const noticeDate = parseDate(noticeDateStr);

    if (!noticeDate) {
        alert(T.invalidDate);
        return;
    }

    const terminationDate = getTerminationDate(noticeDate, type, customMonths, customTerm);

    // Build period description
    let periodDesc = '';
    if (type.fixedDate) {
        periodDesc = T.periodTypes.fixedDate;
    } else if (type.custom) {
        periodDesc = `${customMonths} ${T.periodTypes.months}`;
    } else if (type.days) {
        periodDesc = `${type.days} ${T.periodTypes.days}`;
    } else if (type.weeks) {
        periodDesc = `${type.weeks} ${T.periodTypes.weeks}`;
    } else if (type.months) {
        periodDesc = `${type.months} ${T.periodTypes.months}`;
    }

    let term = type.custom ? customTerm : type.term;
    let termDesc = T.termTypes[term] || T.termTypes.any;

    // Build result HTML
    let resultHTML = `
        <h3>${T.result}</h3>
        <table class="result-table">
            <tr>
                <td>${T.contractType}:</td>
                <td><strong>${type.name}</strong></td>
            </tr>
            <tr>
                <td>${T.legalBasis}:</td>
                <td>${type.article}</td>
            </tr>
            <tr>
                <td>${T.noticePeriod}:</td>
                <td>${periodDesc} ${termDesc}</td>
            </tr>
            <tr>
                <td>${T.noticeDelivered}:</td>
                <td>${formatDateShort(noticeDate)}</td>
            </tr>
            <tr class="result-total">
                <td><strong>${T.earliestEnd}:</strong></td>
                <td><strong>${formatDate(terminationDate)}</strong></td>
            </tr>
        </table>

        <div class="timeline-visual">
            <h4 style="margin: 0 0 10px 0; color: #3f606f;">${T.timeline}</h4>
            <div class="timeline-bar">
                <div class="timeline-point">
                    <div class="dot"></div>
                    <small>${T.notice}<br>${formatDateShort(noticeDate)}</small>
                </div>
                <div class="timeline-line"></div>
                <div class="timeline-point">
                    <div class="dot end"></div>
                    <small>${T.end}<br>${formatDateShort(terminationDate)}</small>
                </div>
            </div>
        </div>
    `;

    // Add warnings for specific cases
    if (contractTypeValue.startsWith('rent_')) {
        resultHTML += `
            <div class="warning" style="margin-top: 20px;">
                <i class="fas fa-info-circle"></i>
                ${T.warnings.rent}
            </div>
        `;
    }

    if (contractTypeValue.startsWith('insurance_')) {
        resultHTML += `
            <div class="warning" style="margin-top: 20px;">
                <i class="fas fa-info-circle"></i>
                ${T.warnings.insurance}
            </div>
        `;
    }

    if (contractTypeValue.startsWith('subscription_')) {
        resultHTML += `
            <div class="warning" style="margin-top: 20px;">
                <i class="fas fa-info-circle"></i>
                ${T.warnings.subscription}
            </div>
        `;
    }

    document.querySelector('.result-summary').innerHTML = resultHTML;
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });

    // Save data for PDF export
    saveKuendigungData(
        type.name,
        `${periodDesc} ${termDesc}`,
        noticeDate,
        noticeDate,
        terminationDate
    );
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date pickers
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#noticeDate", { dateFormat: "d.m.Y", allowInput: true, defaultDate: "today" });
        flatpickr("#workStartDate", { dateFormat: "d.m.Y", allowInput: true });
    }

    // Show disclaimer if not accepted
    if (!localStorage.getItem('kuendigung_disclaimer_accepted')) {
        const modal = document.getElementById('disclaimerModal');
        if (modal) modal.style.display = 'flex';
    }

    // Initialize dark mode
    if (typeof DarkMode !== 'undefined') {
        DarkMode.init();
    }

    // Attach form submit handler
    const form = document.getElementById('kuendigungForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Make functions globally available
window.updateContractInfo = updateContractInfo;
window.acceptDisclaimer = acceptDisclaimer;
window.exportPDF = exportPDF;
