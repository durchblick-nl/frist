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
        targetEnd: 'Gewünschtes Vertragsende',
        latestNotice: 'Spätester Zugang für diesen Termin',
        earliestEnd: 'Frühester Beendigungstermin',
        timely: 'Die Kündigung ist für den gewählten Termin rechtzeitig zugegangen.',
        late: 'Die Kündigung ist für den gewählten Termin verspätet. Der nächste mögliche Termin hängt vom Vertrag oder vom ortsüblichen Termin ab.',
        invalidOrder: 'Das Vertragsende muss nach dem Vertragsbeginn liegen; das Datum des Neubeginns beziehungsweise der Kündigung muss zeitlich plausibel sein.',
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
            rent: '<strong>Hinweis:</strong> Der Vermieter muss Wohn- und Geschäftsräume auf dem kantonal genehmigten Formular kündigen (OR Art. 266l). Für Mieter gelten Vertrag und gesetzliche Formvorschriften.',
            insurance: '<strong>Hinweis:</strong> Die Kündigung muss beim Versicherer eingehen; der Poststempel genügt nicht. Prüfen Sie Police, Versicherungsjahr und allfällige besondere Kündigungsrechte.',
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
        targetEnd: 'Fin de contrat souhaitée',
        latestNotice: 'Dernière réception pour ce terme',
        earliestEnd: 'Fin au plus tôt',
        timely: 'La résiliation est parvenue à temps pour le terme choisi.',
        late: 'La résiliation est tardive pour le terme choisi. Le prochain terme dépend du contrat ou de l’usage local.',
        invalidOrder: 'La fin du contrat doit être postérieure à son début et les dates doivent être chronologiquement plausibles.',
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
            rent: '<strong>Remarque:</strong> Le bailleur doit résilier un logement ou un local commercial au moyen de la formule agréée par le canton (CO art. 266l). Pour le locataire, vérifiez le bail et les règles de forme.',
            insurance: '<strong>Remarque:</strong> La résiliation doit parvenir à l\'assureur; le cachet postal ne suffit pas. Vérifiez la police, l\'année d\'assurance et les éventuels droits spéciaux.',
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
        term: 'target_date',
        info: {
            de: 'Wohnungsmiete: 3 Monate auf den ortsüblichen Termin; fehlt ein Ortsgebrauch, auf Ende einer dreimonatigen Mietdauer. Vertrag und örtlichen Termin prüfen.',
            fr: 'Bail de logement: 3 mois pour le terme usuel local; à défaut d’usage, pour la fin d’une période de location de trois mois. Vérifiez le bail et l’usage local.'
        }
    },
    'rent_business': {
        name: { de: 'Geschäftsräume', fr: 'Locaux commerciaux' },
        article: 'OR Art. 266d',
        months: 6,
        term: 'target_date',
        info: {
            de: 'Geschäftsmiete: 6 Monate auf den ortsüblichen Termin; fehlt ein Ortsgebrauch, auf Ende einer dreimonatigen Mietdauer.',
            fr: 'Bail commercial: 6 mois pour le terme usuel local; à défaut d’usage, pour la fin d’une période de location de trois mois.'
        }
    },
    'rent_room': {
        name: { de: 'Möbliertes Zimmer', fr: 'Chambre meublée' },
        article: 'OR Art. 266e',
        weeks: 2,
        term: 'target_date',
        info: {
            de: 'Separat vermietete möblierte Zimmer: 2 Wochen auf Ende einer einmonatigen Mietdauer.',
            fr: 'Chambres meublées louées séparément: 2 semaines pour la fin d’une période de location d’un mois.'
        }
    },
    'rent_parking': {
        name: { de: 'Parkplatz', fr: 'Place de parc' },
        article: 'OR Art. 266e',
        weeks: 2,
        term: 'target_date',
        info: {
            de: 'Separat vermietete Einstellplätze: 2 Wochen auf Ende einer einmonatigen Mietdauer.',
            fr: 'Places de parc louées séparément: 2 semaines pour la fin d’une période de location d’un mois.'
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
            de: 'Grundversicherung: Zugang bis 30. November, Wechsel per 1. Januar. Der Rechner zieht Wochenenden automatisch vor; fällt der Stichtag am Sitz der Kasse auf einen Feiertag, den vorherigen Werktag manuell beachten.',
            fr: 'Assurance de base: réception jusqu’au 30 novembre, changement au 1er janvier. Le calculateur avance automatiquement les week-ends; si l’échéance est fériée au siège de la caisse, tenez compte manuellement du jour ouvrable précédent.'
        }
    },
    'insurance_health_basic_midyear': {
        name: { de: 'Grundversicherung: Wechsel per 1. Juli', fr: 'Assurance de base: changement au 1er juillet' },
        article: { de: 'KVG Art. 7 Abs. 1', fr: 'LAMal art. 7 al. 1' },
        fixedDate: { month: 2, day: 31, endMonth: 5, endDay: 30 },
        term: 'fixed_end',
        info: {
            de: 'Nur im Standardmodell mit freier Arztwahl und ordentlicher Franchise von CHF 300: Zugang bis 31. März, Wechsel per 1. Juli. Wochenenden werden automatisch vorgezogen; lokale Feiertage müssen manuell geprüft werden.',
            fr: 'Uniquement avec le modèle standard, libre choix du médecin et franchise ordinaire de CHF 300: réception jusqu’au 31 mars, changement au 1er juillet. Les week-ends sont avancés automatiquement; les jours fériés locaux doivent être vérifiés manuellement.'
        }
    },
    'insurance_health_extra': {
        name: { de: 'Krankenkasse Zusatzversicherung', fr: 'Assurance complémentaire' },
        article: { de: 'VVG Art. 35a', fr: 'LCA art. 35a' },
        months: 3,
        term: 'target_date',
        requiresContractStart: true,
        minimumContractYears: 3,
        info: {
            de: 'Ordentliche Kündigung auf Ende des dritten oder jedes folgenden Versicherungsjahres mit 3 Monaten Frist; die Police kann eine frühere Kündigung erlauben. Dieses Recht steht bei Krankenzusatzversicherungen nur dem Versicherungsnehmer zu.',
            fr: 'Résiliation ordinaire pour la fin de la troisième année d’assurance ou d’une année suivante avec un préavis de 3 mois; la police peut autoriser une résiliation plus tôt. En assurance complémentaire, ce droit n’appartient qu’au preneur.'
        }
    },
    'insurance_property': {
        name: { de: 'Sach-/Autoversicherung', fr: 'Assurance RC/auto' },
        article: { de: 'VVG Art. 35a', fr: 'LCA art. 35a' },
        months: 3,
        term: 'target_date',
        requiresContractStart: true,
        minimumContractYears: 3,
        info: {
            de: 'Ordentliche Kündigung auf Ende des dritten oder jedes folgenden Versicherungsjahres mit 3 Monaten Frist; die Police kann eine frühere Kündigung erlauben.',
            fr: 'Résiliation ordinaire pour la fin de la troisième année d’assurance ou d’une année suivante avec un préavis de 3 mois; la police peut autoriser une résiliation plus tôt.'
        }
    },
    'insurance_life': {
        name: { de: 'Lebensversicherung', fr: 'Assurance vie' },
        article: { de: 'VVG Art. 89', fr: 'LCA art. 89' },
        term: 'life',
        requiresContractStart: true,
        info: {
            de: 'Der Versicherungsnehmer kann nach Ablauf eines Jahres in Textform kündigen. Der Rückkaufswert kann unter den einbezahlten Prämien liegen.',
            fr: 'Le preneur peut résilier sous une forme permettant d’en établir la preuve par un texte après une année. La valeur de rachat peut être inférieure aux primes versées.'
        }
    },
    // Subscription contracts
    'subscription_fitness': {
        name: { de: 'Fitness-Abo', fr: 'Fitness' },
        article: { de: 'Vertrag/AGB', fr: 'Contrat/CG' },
        months: 3,
        term: 'target_date',
        info: {
            de: 'Fitness-Abos: Die Frist ergibt sich aus Vertrag/AGB; 3 Monate sind nur ein häufiges Beispiel. Verlängerung und Sonderrechte ebenfalls in den AGB prüfen.',
            fr: 'Fitness: le délai découle du contrat ou des CG; 3 mois ne sont qu’un exemple fréquent. Vérifiez aussi le renouvellement et les droits spéciaux.'
        }
    },
    'subscription_mobile': {
        name: { de: 'Handy-Abo', fr: 'Mobile' },
        article: { de: 'Vertrag/AGB', fr: 'Contrat/CG' },
        days: 60,
        term: 'target_date',
        info: {
            de: 'Mobilfunk: Meist 60 Tage Kündigungsfrist. Ohne Kündigung automatische Verlängerung. Prüfen Sie Ihre AGB!',
            fr: 'Téléphonie mobile: Généralement 60 jours de préavis. Sans résiliation, renouvellement automatique. Vérifiez vos CG!'
        }
    },
    'subscription_internet': {
        name: { de: 'Internet/TV-Abo', fr: 'Internet/TV' },
        article: { de: 'Vertrag/AGB', fr: 'Contrat/CG' },
        days: 60,
        term: 'target_date',
        info: {
            de: 'Internet/TV: Meist 60 Tage Kündigungsfrist vor Ablauf der Mindestvertragsdauer. Automatische Verlängerung üblich.',
            fr: 'Internet/TV: Généralement 60 jours de préavis avant fin de durée minimale. Renouvellement automatique courant.'
        }
    },
    'subscription_streaming': {
        name: { de: 'Streaming/Zeitschrift', fr: 'Streaming/Magazine' },
        article: { de: 'Vertrag/AGB', fr: 'Contrat/CG' },
        months: 1,
        term: 'target_date',
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

function fixedDateDescription(type) {
    if (!type.fixedDate) return '';
    const date = new Date(2024, type.fixedDate.month, type.fixedDate.day);
    return (LANG === 'fr' ? 'Réception au plus tard le ' : 'Zugang spätestens am ') +
        date.toLocaleDateString(LANG === 'fr' ? 'fr-CH' : 'de-CH', { day: 'numeric', month: 'long' });
}

// Date utilities
function parseDate(dateStr) {
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dateStr.trim());
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const parsed = new Date(year, month - 1, day);
    return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
        ? parsed
        : null;
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
    const targetMonthIndex = date.getMonth() + months;
    const targetYear = date.getFullYear() + Math.floor(targetMonthIndex / 12);
    const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
    const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
    return new Date(targetYear, targetMonth, Math.min(date.getDate(), lastDay));
}

function addYears(date, years) {
    const targetYear = date.getFullYear() + years;
    const lastDay = new Date(targetYear, date.getMonth() + 1, 0).getDate();
    return new Date(targetYear, date.getMonth(), Math.min(date.getDate(), lastDay));
}

function previousWeekday(date) {
    const result = new Date(date);
    while (result.getDay() === 0 || result.getDay() === 6) result.setDate(result.getDate() - 1);
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

function subtractNoticePeriod(targetDate, type, customMonths) {
    if (type.custom || type.months) return addMonths(targetDate, -(type.custom ? Number(customMonths) : type.months));
    if (type.weeks) return addWeeks(targetDate, -type.weeks);
    if (type.days) return addDays(targetDate, -type.days);
    return new Date(targetDate);
}

/**
 * VVG art. 35a permits termination only at the end of the third or a later
 * insurance year. An insurance year beginning on 1 June therefore ends on
 * 31 May, not on the anniversary itself.
 */
function isPermittedInsuranceYearEnd(contractStartDate, targetEndDate, minimumYears) {
    if (!contractStartDate || !targetEndDate) return false;

    for (let year = minimumYears; year <= minimumYears + 200; year++) {
        const yearEnd = addDays(addYears(contractStartDate, year), -1);
        if (yearEnd.getTime() === targetEndDate.getTime()) return true;
        if (yearEnd > targetEndDate) return false;
    }
    return false;
}

/**
 * Pure termination calculation. Contractual and locally customary end dates
 * are explicit inputs because they cannot be derived safely from a notice date.
 */
function calculateTermination(noticeDate, type, options = {}) {
    const customMonths = Number(options.customMonths) || 1;
    const customTerm = options.customTerm || 'any';
    const targetEndDate = options.targetEndDate || null;
    const contractStartDate = options.contractStartDate || null;

    if (type.fixedDate) {
        let year = noticeDate.getFullYear();
        let cutoff = previousWeekday(new Date(year, type.fixedDate.month, type.fixedDate.day));
        if (noticeDate > cutoff) {
            year++;
            cutoff = previousWeekday(new Date(year, type.fixedDate.month, type.fixedDate.day));
        }
        const terminationDate = new Date(
            year,
            type.fixedDate.endMonth === undefined ? 11 : type.fixedDate.endMonth,
            type.fixedDate.endDay === undefined ? 31 : type.fixedDate.endDay
        );
        return { terminationDate, latestNoticeDate: cutoff, targetEndDate: terminationDate, timely: true };
    }

    if (type.term === 'life') {
        if (!contractStartDate) return null;
        const eligibleFrom = addYears(contractStartDate, 1);
        return {
            terminationDate: noticeDate >= eligibleFrom ? noticeDate : eligibleFrom,
            latestNoticeDate: null,
            targetEndDate: null,
            timely: noticeDate >= eligibleFrom,
            eligibleFrom
        };
    }

    const term = type.custom ? customTerm : type.term;
    if (term === 'target_date') {
        if (!targetEndDate) return null;
        if (type.minimumContractYears && !isPermittedInsuranceYearEnd(contractStartDate, targetEndDate, type.minimumContractYears)) {
            return { invalidContractYear: true };
        }
        const latestNoticeDate = subtractNoticePeriod(targetEndDate, type, customMonths);
        return { terminationDate: targetEndDate, latestNoticeDate, targetEndDate, timely: noticeDate <= latestNoticeDate };
    }

    let minEndDate;
    if (type.custom) minEndDate = addMonths(noticeDate, customMonths);
    else if (type.days) minEndDate = addDays(noticeDate, type.days);
    else if (type.weeks) minEndDate = addWeeks(noticeDate, type.weeks);
    else if (type.months) minEndDate = addMonths(noticeDate, type.months);

    if (term === 'month_end') {
        const terminationDate = getMonthEnd(minEndDate);
        return { terminationDate, latestNoticeDate: getMonthEnd(noticeDate), targetEndDate: terminationDate, timely: true };
    } else if (term === 'quarter_end') {
        let endDate = getNextQuarterEnd(minEndDate);
        while (endDate < minEndDate) {
            endDate = getNextQuarterEnd(addMonths(endDate, 1));
        }
        return {
            terminationDate: endDate,
            latestNoticeDate: subtractNoticePeriod(endDate, type, customMonths),
            targetEndDate: endDate,
            timely: true
        };
    } else if (term === 'year_end') {
        const terminationDate = getNextYearEnd(minEndDate);
        return {
            terminationDate,
            latestNoticeDate: subtractNoticePeriod(terminationDate, type, customMonths),
            targetEndDate: terminationDate,
            timely: true
        };
    }
    return { terminationDate: minEndDate, latestNoticeDate: noticeDate, targetEndDate: minEndDate, timely: true };
}

function getTerminationDate(noticeDate, type, customMonths, customTerm) {
    return calculateTermination(noticeDate, type, { customMonths, customTerm })?.terminationDate || null;
}

// UI Functions
function updateContractInfo() {
    const select = document.getElementById('contractType');
    const infoDiv = document.getElementById('contractTypeInfo');
    const customPeriodGroup = document.getElementById('customPeriodGroup');
    const customTermGroup = document.getElementById('customTermGroup');
    const contractStartGroup = document.getElementById('contractStartGroup');
    const targetEndGroup = document.getElementById('targetEndGroup');
    const type = getContractType(select.value);

    if (type) {
        let periodText = '';
        if (type.fixedDate) periodText = fixedDateDescription(type);
        else if (type.days) periodText = `${type.days} ${T.periodTypes.days}`;
        else if (type.weeks) periodText = `${type.weeks} ${T.periodTypes.weeks}`;
        else if (type.months) periodText = `${type.months} ${T.periodTypes.months}`;
        else if (type.custom) periodText = T.periodTypes.custom;

        let termText = (type.term === 'target_date' || type.term === 'life' || type.fixedDate)
            ? ''
            : (T.termTypes[type.term] || T.termTypes.any);

        infoDiv.innerHTML = `
            <h4>${type.name} – ${type.article}</h4>
            <p><strong>${T.noticePeriod}:</strong> ${periodText} ${termText}</p>
            <p>${type.info}</p>
        `;
        infoDiv.style.display = 'block';

        // Show/hide custom fields
        if (customPeriodGroup) customPeriodGroup.style.display = type.custom ? 'block' : 'none';
        if (customTermGroup) customTermGroup.style.display = type.custom ? 'block' : 'none';

        if (contractStartGroup) contractStartGroup.style.display = type.requiresContractStart ? 'block' : 'none';
        if (targetEndGroup) targetEndGroup.style.display = type.term === 'target_date' ? 'block' : 'none';
        document.getElementById('contractStartDate').required = Boolean(type.requiresContractStart);
        document.getElementById('targetEndDate').required = type.term === 'target_date';
    } else {
        infoDiv.style.display = 'none';
        if (customPeriodGroup) customPeriodGroup.style.display = 'none';
        if (customTermGroup) customTermGroup.style.display = 'none';
        if (contractStartGroup) contractStartGroup.style.display = 'none';
        if (targetEndGroup) targetEndGroup.style.display = 'none';
    }
}

// PDF Export data storage
let lastKuendigungData = null;

function saveKuendigungData(contractType, noticePeriod, noticeDate, plannedDate, latestNoticeDate, terminationDate) {
    lastKuendigungData = {
        contractType: contractType,
        noticePeriod: noticePeriod,
        noticeDate: noticeDate,
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
    const targetEndDateStr = document.getElementById('targetEndDate')?.value || '';
    const contractStartDateStr = document.getElementById('contractStartDate')?.value || '';

    if (!contractTypeValue || !noticeDateStr) {
        alert(T.fillAllFields);
        return;
    }

    const type = getContractType(contractTypeValue);
    const noticeDate = parseDate(noticeDateStr);
    const targetEndDate = targetEndDateStr ? parseDate(targetEndDateStr) : null;
    const contractStartDate = contractStartDateStr ? parseDate(contractStartDateStr) : null;

    if (!noticeDate || (targetEndDateStr && !targetEndDate) || (contractStartDateStr && !contractStartDate)) {
        alert(T.invalidDate);
        return;
    }
    if ((type.term === 'target_date' && !targetEndDate) || (type.requiresContractStart && !contractStartDate)) {
        alert(T.fillAllFields);
        return;
    }
    if ((targetEndDate && targetEndDate <= noticeDate) || (contractStartDate && contractStartDate > noticeDate)) {
        alert(T.invalidOrder);
        return;
    }

    const calculation = calculateTermination(noticeDate, type, { customMonths, customTerm, targetEndDate, contractStartDate });
    if (!calculation || calculation.invalidContractYear) {
        alert(calculation?.invalidContractYear
            ? (LANG === 'fr' ? 'Le terme choisi doit être la fin de la troisième année d’assurance ou d’une année suivante.' : 'Der gewählte Termin muss das Ende des dritten oder eines späteren Versicherungsjahres sein.')
            : T.fillAllFields);
        return;
    }
    const terminationDate = calculation.terminationDate;

    // Build period description
    let periodDesc = '';
    if (type.fixedDate) {
        periodDesc = fixedDateDescription(type);
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
    if (term === 'target_date' || term === 'life' || type.fixedDate) termDesc = '';

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
            ${calculation.targetEndDate && (type.term === 'target_date' || type.fixedDate) ? `
            <tr>
                <td>${T.targetEnd}:</td>
                <td>${formatDateShort(calculation.targetEndDate)}</td>
            </tr>
            <tr>
                <td>${T.latestNotice}:</td>
                <td><strong>${formatDateShort(calculation.latestNoticeDate)}</strong></td>
            </tr>` : ''}
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

    if (type.term === 'target_date' || type.term === 'life') {
        const statusText = type.term === 'life'
            ? (calculation.timely
                ? (LANG === 'fr' ? 'Le droit de résiliation selon l’art. 89 LCA est disponible.' : 'Das Kündigungsrecht nach Art. 89 VVG ist verfügbar.')
                : (LANG === 'fr' ? 'L’année minimale n’est pas encore écoulée; une résiliation anticipée ne doit pas être considérée comme valable sans vérification.' : 'Das Mindestjahr ist noch nicht abgelaufen; eine vorzeitige Kündigung darf ohne Prüfung nicht als wirksam betrachtet werden.'))
            : (calculation.timely ? T.timely : T.late);
        resultHTML += `
            <div class="warning" style="margin-top: 20px;">
                <i class="fas ${calculation.timely ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                ${statusText}
            </div>
        `;
    }

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
        calculation.targetEndDate || terminationDate,
        calculation.latestNoticeDate,
        terminationDate
    );
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date pickers
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#noticeDate", { dateFormat: "d.m.Y", allowInput: true, defaultDate: "today" });
        flatpickr("#contractStartDate", { dateFormat: "d.m.Y", allowInput: true });
        flatpickr("#targetEndDate", { dateFormat: "d.m.Y", allowInput: true });
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
