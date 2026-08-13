/**
 * Verjährungsrechner / Calculateur de prescription
 * Statute of limitations calculator for Swiss law (OR Art. 60, 127, 128, etc.)
 */

// Detect language from HTML lang attribute
const LANG = document.documentElement.lang || 'de';

// Translations
const TRANSLATIONS = {
    de: {
        fillAllFields: 'Bitte füllen Sie alle Pflichtfelder aus.',
        invalidDate: 'Bitte geben Sie ein gültiges Datum ein.',
        calculateFirst: 'Bitte berechnen Sie zuerst die Verjährung.',
        createdOn: 'Erstellt am',
        result: 'Ergebnis',
        claimType: 'Anspruchsart',
        legalBasis: 'Rechtsgrundlage',
        prescriptionPeriod: 'Verjährungsfrist',
        interruptedOn: 'Unterbrochen am',
        interruptionKind: 'Neubeginn',
        periodStart: 'Fristbeginn',
        relativePrescription: 'Relative Verjährung',
        absolutePrescription: 'Absolute Verjährung',
        prescriptionOn: 'Verjährung am',
        absoluteNote: '(absolute Frist)',
        remaining: 'Verbleibend',
        days: 'Tage',
        expiredSince: 'Verjährt seit',
        years: 'Jahre',
        yearsRelative: 'Jahre (relativ)',
        yearsAbsolute: 'Jahre (absolut)',
        recommendation: 'Empfehlung',
        expiresoon: 'Die Verjährung läuft bald ab. Erwägen Sie eine Unterbrechung durch:',
        interruptOptions: [
            'Betreibung einleiten',
            'Schlichtungsgesuch einreichen',
            'Schuldanerkennung erwirken'
        ],
        status: {
            expired: 'Verjährt',
            danger: 'Kritisch',
            warning: 'Achtung',
            ok: 'Aktiv'
        }
    },
    fr: {
        fillAllFields: 'Veuillez remplir tous les champs obligatoires.',
        invalidDate: 'Veuillez entrer une date valide.',
        calculateFirst: 'Veuillez d\'abord calculer la prescription.',
        createdOn: 'Créé le',
        result: 'Résultat',
        claimType: 'Type de créance',
        legalBasis: 'Base légale',
        prescriptionPeriod: 'Délai de prescription',
        interruptedOn: 'Interrompu le',
        interruptionKind: 'Nouveau départ',
        periodStart: 'Début du délai',
        relativePrescription: 'Prescription relative',
        absolutePrescription: 'Prescription absolue',
        prescriptionOn: 'Prescription le',
        absoluteNote: '(délai absolu)',
        remaining: 'Restant',
        days: 'jours',
        expiredSince: 'Prescrit depuis',
        years: 'ans',
        yearsRelative: 'ans (relatif)',
        yearsAbsolute: 'ans (absolu)',
        recommendation: 'Recommandation',
        expiresoon: 'La prescription expire bientôt. Envisagez une interruption par:',
        interruptOptions: [
            'Introduction d\'une poursuite',
            'Dépôt d\'une requête de conciliation',
            'Obtention d\'une reconnaissance de dette'
        ],
        status: {
            expired: 'Prescrit',
            danger: 'Critique',
            warning: 'Attention',
            ok: 'Actif'
        }
    }
};

const T = TRANSLATIONS[LANG] || TRANSLATIONS.de;

// Claim type configurations (bilingual)
const CLAIM_TYPES = {
    // 10 years (OR Art. 127)
    'general_10': {
        years: 10,
        name: { de: 'Allgemeine Forderungen', fr: 'Créances générales' },
        article: 'OR Art. 127',
        info: {
            de: 'Gilt für alle Forderungen, die nicht unter eine spezielle Verjährungsfrist fallen.',
            fr: 'S\'applique à toutes les créances qui ne sont pas soumises à un délai spécial.'
        }
    },
    'contract_10': {
        years: 10,
        name: { de: 'Vertragliche Ansprüche', fr: 'Créances contractuelles' },
        article: 'OR Art. 127',
        info: {
            de: 'Vertragliche Ansprüche ohne besondere kürzere Frist, etwa Kaufpreis- oder Darlehensforderungen. Für viele Werklohnforderungen gilt Art. 128 OR.',
            fr: 'Créances contractuelles sans délai spécial plus court, par exemple prix de vente ou prêt. De nombreuses créances d’artisans relèvent de l’art. 128 CO.'
        }
    },
    'judgment_10': {
        years: 10,
        name: { de: 'Durch Urkunde oder Urteil festgestellte Forderung', fr: 'Créance constatée par titre ou jugement' },
        article: 'OR Art. 137 Abs. 2',
        info: {
            de: 'Nach einer Unterbrechung beträgt die neue Frist 10 Jahre, wenn die Forderung durch Ausstellung einer Urkunde anerkannt oder durch Urteil festgestellt wurde. Als Beginn ist der gesetzliche Neubeginn einzugeben.',
            fr: 'Après une interruption, le nouveau délai est de 10 ans si la créance est reconnue par l’établissement d’un titre ou constatée par jugement. Indiquez comme début la date légale du nouveau départ.'
        }
    },
    // 5 years (OR Art. 128)
    'rent_5': {
        years: 5,
        name: { de: 'Miet- und Pachtzinsen', fr: 'Loyers et fermages' },
        article: 'OR Art. 128 Ziff. 1',
        info: {
            de: 'Gilt für Miet- und Pachtzinse sowie andere periodische Leistungen. Die Einordnung einzelner Nebenkostenforderungen ist gesondert zu prüfen.',
            fr: 'S’applique aux loyers, fermages et autres prestations périodiques. La qualification de certaines charges doit être examinée séparément.'
        }
    },
    'salary_5': {
        years: 5,
        name: { de: 'Lohn und Gehalt', fr: 'Salaires' },
        article: 'OR Art. 128 Ziff. 3',
        info: {
            de: 'Lohnforderungen aus Arbeitsvertrag. Bonusansprüche können unter Umständen anders verjähren.',
            fr: 'Créances salariales du contrat de travail. Les bonus peuvent parfois avoir un délai différent.'
        }
    },
    'interest_5': {
        years: 5,
        name: { de: 'Zinsen und Renten', fr: 'Intérêts et rentes' },
        article: 'OR Art. 128 Ziff. 1',
        info: {
            de: 'Periodisch geschuldete Zinsen und Renten.',
            fr: 'Intérêts et rentes dus périodiquement.'
        }
    },
    'alimony_5': {
        years: 5,
        name: { de: 'Unterhaltsbeiträge', fr: 'Contributions d\'entretien' },
        article: 'OR Art. 128 Ziff. 1',
        info: {
            de: 'Periodische Unterhaltsforderungen aus Familienrecht.',
            fr: 'Contributions d\'entretien périodiques du droit de la famille.'
        }
    },
    'board_5': {
        years: 5,
        name: { de: 'Verpflegung, Pension', fr: 'Pension, hébergement' },
        article: 'OR Art. 128 Ziff. 2',
        info: {
            de: 'Forderungen aus Beköstigung, Verpflegung und Wirtsschulden.',
            fr: 'Créances de pension, hébergement et auberge.'
        }
    },
    'craft_5': {
        years: 5,
        name: { de: 'Handwerkerarbeiten', fr: 'Travaux d\'artisans' },
        article: 'OR Art. 128 Ziff. 3',
        info: {
            de: 'Handwerkerforderungen, Reparaturen, kleinere Aufträge.',
            fr: 'Créances d\'artisans, réparations, petits mandats.'
        }
    },
    'retail_5': {
        years: 5,
        name: { de: 'Detailhandel', fr: 'Commerce de détail' },
        article: 'OR Art. 128 Ziff. 3',
        info: {
            de: 'Kleinverkauf von Waren an Endverbraucher.',
            fr: 'Vente au détail de marchandises aux consommateurs.'
        }
    },
    'medical_5': {
        years: 5,
        name: { de: 'Arzt- und Anwaltsrechnungen', fr: 'Honoraires de médecins et avocats' },
        article: 'OR Art. 128 Ziff. 3',
        info: {
            de: 'Honorarforderungen von Ärzten, Anwälten, Notaren.',
            fr: 'Honoraires de médecins, avocats, notaires.'
        }
    },
    'building_5': {
        years: 5,
        name: { de: 'Werkmängel an Bauwerken', fr: 'Défauts d\'ouvrages immobiliers' },
        article: 'OR Art. 371',
        info: {
            de: 'Mängelansprüche bei unbeweglichen Bauwerken. Bei beweglichen Werken: 2 Jahre.',
            fr: 'Actions en garantie pour ouvrages immobiliers. Pour ouvrages mobiliers: 2 ans.'
        }
    },
    // 3 years (OR Art. 60/67)
    'tort_3': {
        years: 3,
        absoluteYears: 10,
        hasAbsolute: true,
        name: { de: 'Schadenersatz (Delikt)', fr: 'Dommages-intérêts (délit)' },
        article: 'OR Art. 60',
        info: {
            de: '3 Jahre ab Kenntnis von Schaden und Schädiger, max. 10 Jahre ab schädigendem Ereignis.',
            fr: '3 ans dès la connaissance du dommage et du responsable, max. 10 ans dès l\'événement dommageable.'
        }
    },
    'enrichment_3': {
        years: 3,
        absoluteYears: 10,
        hasAbsolute: true,
        name: { de: 'Ungerechtfertigte Bereicherung', fr: 'Enrichissement illégitime' },
        article: 'OR Art. 67',
        info: {
            de: '3 Jahre ab Kenntnis des Anspruchs, max. 10 Jahre ab Entstehung.',
            fr: '3 ans dès la connaissance de la créance, max. 10 ans dès sa naissance.'
        }
    },
    'injury_3': {
        years: 3,
        absoluteYears: 20,
        hasAbsolute: true,
        name: { de: 'Personenschäden aus unerlaubter Handlung', fr: 'Lésions corporelles résultant d’un acte illicite' },
        article: 'OR Art. 60 Abs. 1bis',
        info: {
            de: 'Bei Körperverletzung oder Tötung: 3 Jahre ab Kenntnis von Schaden und Ersatzpflichtigem, höchstens 20 Jahre ab dem schädigenden Verhalten oder dessen Ende.',
            fr: 'En cas de lésions corporelles ou de décès: 3 ans dès la connaissance du dommage et du responsable, au plus 20 ans dès le comportement dommageable ou sa cessation.'
        }
    },
    'contract_injury_3': {
        years: 3,
        absoluteYears: 20,
        hasAbsolute: true,
        name: { de: 'Vertragliche Personenschäden', fr: 'Lésions corporelles résultant d’un contrat' },
        article: 'OR Art. 128a',
        info: {
            de: 'Schadenersatz oder Genugtuung wegen vertragswidriger Körperverletzung oder Tötung: 3 Jahre ab Kenntnis des Schadens, höchstens 20 Jahre ab dem schädigenden Verhalten oder dessen Ende.',
            fr: 'Dommages-intérêts ou tort moral pour lésions corporelles ou décès en violation du contrat: 3 ans dès la connaissance du dommage, au plus 20 ans dès le comportement dommageable ou sa cessation.'
        }
    },
    // 2 years (OR Art. 210/371)
    'sale_2': {
        years: 2,
        name: { de: 'Kaufvertrag Mängel', fr: 'Défauts de la chose vendue' },
        article: 'OR Art. 210',
        info: {
            de: 'Mängelansprüche bei Kaufverträgen über bewegliche Sachen. Frist beginnt mit Ablieferung.',
            fr: 'Actions en garantie pour défauts dans les contrats de vente de choses mobilières. Délai dès la livraison.'
        }
    },
    'work_defect_2': {
        years: 2,
        name: { de: 'Werkvertrag Mängel (beweglich)', fr: 'Contrat d\'entreprise (mobilier)' },
        article: 'OR Art. 371',
        info: {
            de: 'Mängelansprüche bei beweglichen Werken. Bei unbeweglichen Werken: 5 Jahre.',
            fr: 'Actions pour défauts d\'ouvrages mobiliers. Pour ouvrages immobiliers: 5 ans.'
        }
    },
    // 1 year
    'transport_1': {
        years: 1,
        name: { de: 'Transportschäden', fr: 'Dommages de transport' },
        article: 'OR Art. 454',
        info: {
            de: 'Ersatzklagen gegen den Frachtführer: bei Untergang, Verlust oder Verspätung ab dem vorgesehenen Ablieferungstag; bei Beschädigung ab Übergabe an den Adressaten. Arglist und grobe Fahrlässigkeit bleiben vorbehalten.',
            fr: 'Actions en dommages-intérêts contre le voiturier: dès le jour prévu pour la livraison en cas de destruction, perte ou retard; dès la remise au destinataire en cas d’avarie. Les cas de dol et de faute grave sont réservés.'
        }
    },
    // Special cases
    'loss_certificate_20': {
        years: 20,
        name: { de: 'Verlustschein gegen den Schuldner', fr: 'Acte de défaut de biens contre le débiteur' },
        article: { de: 'SchKG Art. 149a', fr: 'LP art. 149a' },
        info: {
            de: 'Gegenüber dem Schuldner verjährt die Verlustscheinforderung 20 Jahre nach Ausstellung des Verlustscheins.',
            fr: 'Contre le débiteur, la créance constatée par l’acte de défaut de biens se prescrit 20 ans après la délivrance de l’acte.'
        }
    },
    'loss_certificate_heirs_1': {
        years: 1,
        absoluteYears: 20,
        hasAbsolute: true,
        name: { de: 'Verlustschein gegen Erben', fr: 'Acte de défaut de biens contre les héritiers' },
        article: { de: 'SchKG Art. 149a Abs. 1', fr: 'LP art. 149a al. 1' },
        info: {
            de: 'Gegenüber den Erben verjährt die Forderung spätestens ein Jahr nach Eröffnung des Erbgangs und spätestens 20 Jahre nach Ausstellung des Verlustscheins. Als relativen Beginn den Erbgang, als absoluten Ausgangspunkt die Ausstellung eingeben.',
            fr: 'Contre les héritiers, la créance se prescrit au plus tard un an après l’ouverture de la succession et au plus tard 20 ans après la délivrance de l’acte. Indiquez la succession comme début relatif et la délivrance comme point de départ absolu.'
        }
    },
    'culture_30': {
        years: 1,
        absoluteYears: 30,
        hasAbsolute: true,
        name: { de: 'Kulturgüter', fr: 'Biens culturels' },
        article: 'OR Art. 210 Abs. 3',
        info: {
            de: 'Gewährleistung wegen Mängeln eines Kulturguts: 1 Jahr ab Entdeckung des Mangels, höchstens 30 Jahre ab Vertragsabschluss.',
            fr: 'Garantie pour les défauts d’un bien culturel: 1 an dès la découverte du défaut, au plus 30 ans dès la conclusion du contrat.'
        }
    },
    'regress_3': {
        years: 3,
        name: { de: 'Regress Solidarhaftung', fr: 'Recours solidarité' },
        article: 'OR Art. 139',
        info: {
            de: 'Regressansprüche unter Solidarschuldnern verjähren 3 Jahre ab Zahlung und Kenntnis des Mitschuldners.',
            fr: 'Les recours entre codébiteurs solidaires se prescrivent par 3 ans dès le paiement et la connaissance du codébiteur.'
        }
    },
    'insurance_5': {
        years: 5,
        name: { de: 'Versicherungsansprüche', fr: 'Créances d\'assurance' },
        article: 'VVG Art. 46 (seit 2022)',
        info: {
            de: 'Seit 2022 verjähren Versicherungsansprüche 5 Jahre nach Eintritt der Tatsache, welche die Leistungspflicht begründet (zuvor 2 Jahre).',
            fr: 'Depuis 2022, les créances d’assurance se prescrivent 5 ans après le fait d’où naît l’obligation de l’assureur (auparavant 2 ans).'
        }
    }
};

// Helper function to get localized claim type data
function getClaimType(key) {
    const type = CLAIM_TYPES[key];
    if (!type) return null;
    return {
        ...type,
        name: type.name[LANG] || type.name.de,
        info: type.info[LANG] || type.info.de,
        article: typeof type.article === 'object' ? (type.article[LANG] || type.article.de) : localizeLegalReference(type.article)
    };
}

function localizeLegalReference(reference) {
    if (LANG !== 'fr') return reference;
    return reference.replace(/^OR\b/, 'CO').replace(/^VVG\b/, 'LCA').replace(/^SchKG\b/, 'LP');
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
    return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function addYears(date, years) {
    const targetYear = date.getFullYear() + years;
    const lastDay = new Date(targetYear, date.getMonth() + 1, 0).getDate();
    return new Date(targetYear, date.getMonth(), Math.min(date.getDate(), lastDay));
}

/**
 * Calculates the periods after an interruption under OR arts. 137-138.
 * `restartDate` is the legally relevant restart date, not necessarily the date
 * on which a procedural act was filed: court proceedings restart the period
 * only when the instance ends; enforcement restarts it with each act.
 */
function calculatePrescription(type, relativeStartDate, absoluteStartDate = null, interruptionType = 'none', restartDate = null) {
    let relativeYears = type.years;
    let absoluteYears = type.hasAbsolute ? type.absoluteYears : null;
    let effectiveRelativeStart = relativeStartDate;
    let effectiveAbsoluteStart = absoluteStartDate;

    if (interruptionType !== 'none') {
        if (!restartDate) return null;
        effectiveRelativeStart = restartDate;
        effectiveAbsoluteStart = restartDate;

        // OR art. 137 para. 2 replaces the new period with ten years when the
        // claim is acknowledged in a document or established by judgment.
        if (interruptionType === 'document_or_judgment') {
            relativeYears = 10;
            absoluteYears = null;
        }
    }

    const relativeExpiration = addYears(effectiveRelativeStart, relativeYears);
    const absoluteExpiration = absoluteYears && effectiveAbsoluteStart
        ? addYears(effectiveAbsoluteStart, absoluteYears)
        : null;
    const relevantExpiration = absoluteExpiration && absoluteExpiration < relativeExpiration
        ? absoluteExpiration
        : relativeExpiration;

    return {
        relativeYears,
        absoluteYears,
        effectiveRelativeStart,
        effectiveAbsoluteStart,
        relativeExpiration,
        absoluteExpiration,
        relevantExpiration,
        isAbsoluteRelevant: Boolean(absoluteExpiration && absoluteExpiration < relativeExpiration)
    };
}

function daysBetween(date1, date2) {
    const diffTime = date2 - date1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// UI Functions
function updateClaimInfo() {
    const select = document.getElementById('claimType');
    const infoDiv = document.getElementById('claimTypeInfo');
    const absoluteGroup = document.getElementById('absoluteDateGroup');
    const type = getClaimType(select.value);

    if (type) {
        const periodText = type.absoluteYears
            ? `${type.years} ${T.yearsRelative} / ${type.absoluteYears} ${T.yearsAbsolute}`
            : `${type.years} ${T.years}`;

        infoDiv.innerHTML = `
            <h4>${type.name} – ${type.article}</h4>
            <p><strong>${T.prescriptionPeriod}:</strong> ${periodText}</p>
            <p>${type.info}</p>
        `;
        infoDiv.style.display = 'block';

        if (type.hasAbsolute) {
            absoluteGroup.style.display = 'block';
            document.getElementById('absoluteDate').required = true;
        } else {
            absoluteGroup.style.display = 'none';
            document.getElementById('absoluteDate').required = false;
        }
    } else {
        infoDiv.style.display = 'none';
        absoluteGroup.style.display = 'none';
        document.getElementById('absoluteDate').required = false;
    }
}

function toggleInterruptionDate() {
    const checkbox = document.getElementById('interrupted');
    const group = document.getElementById('interruptionDateGroup');
    group.style.display = checkbox.checked ? 'block' : 'none';
    const type = document.getElementById('interruptionType');
    const date = document.getElementById('interruptionDate');
    if (type) type.required = checkbox.checked;
    if (date) date.required = checkbox.checked;
}

// PDF Export data storage
let lastVerjaehrungData = null;

function saveVerjaehrungData(claimType, legalBasis, startDate, periodYears, periodText, endDate, interrupted, interruptionKind, interruptionDate, isExpired, statusText) {
    lastVerjaehrungData = {
        claimType: claimType,
        legalBasis: legalBasis,
        claimDate: startDate,
        periodYears: periodYears,
        periodText: periodText,
        endDate: endDate,
        interrupted: interrupted,
        interruptionKind: interruptionKind,
        interruptionDate: interruptionDate,
        isExpired: isExpired,
        statusText: statusText
    };
}

function exportPDF() {
    if (!lastVerjaehrungData) {
        alert(T.calculateFirst);
        return;
    }
    if (typeof VerjaehrungPdfExport !== 'undefined') {
        VerjaehrungPdfExport.generatePDF(lastVerjaehrungData, LANG);
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
    localStorage.setItem('verjaehrung_disclaimer_accepted', 'true');
}

// Form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const claimTypeValue = document.getElementById('claimType').value;
    const startDateStr = document.getElementById('startDate').value;
    const absoluteDateStr = document.getElementById('absoluteDate')?.value || '';
    const interrupted = document.getElementById('interrupted').checked;
    const interruptionDateStr = document.getElementById('interruptionDate')?.value || '';
    const interruptionType = interrupted ? (document.getElementById('interruptionType')?.value || '') : 'none';

    if (!claimTypeValue || !startDateStr) {
        alert(T.fillAllFields);
        return;
    }

    const type = getClaimType(claimTypeValue);
    const startDate = parseDate(startDateStr);
    const absoluteDate = absoluteDateStr ? parseDate(absoluteDateStr) : null;
    const restartDate = interruptionDateStr ? parseDate(interruptionDateStr) : null;

    if (!startDate || (absoluteDateStr && !absoluteDate) || (interrupted && (!interruptionType || !restartDate))) {
        alert(T.invalidDate);
        return;
    }
    if ((absoluteDate && absoluteDate > startDate) || (restartDate && restartDate < startDate)) {
        alert(T.invalidDate);
        return;
    }

    const calculation = calculatePrescription(type, startDate, absoluteDate, interruptionType || 'none', restartDate);
    const expirationDate = calculation.relativeExpiration;
    const absoluteExpiration = calculation.absoluteExpiration;
    const relevantExpiration = calculation.relevantExpiration;
    const isAbsoluteRelevant = calculation.isAbsoluteRelevant;

    // Calculate days remaining
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysRemaining = daysBetween(today, relevantExpiration);

    // Determine status
    let status, statusClass, statusText;
    if (daysRemaining < 0) {
        status = 'expired';
        statusClass = 'status-expired';
        statusText = T.status.expired;
    } else if (daysRemaining <= 30) {
        status = 'danger';
        statusClass = 'status-danger';
        statusText = T.status.danger;
    } else if (daysRemaining <= 180) {
        status = 'warning';
        statusClass = 'status-warning';
        statusText = T.status.warning;
    } else {
        status = 'ok';
        statusClass = 'status-ok';
        statusText = T.status.ok;
    }

    // Build period text
    const periodText = calculation.absoluteYears
        ? `${calculation.relativeYears} ${T.yearsRelative} / ${calculation.absoluteYears} ${T.yearsAbsolute}`
        : `${calculation.relativeYears} ${T.years}`;
    const interruptionKindText = interruptionType === 'document_or_judgment'
        ? (LANG === 'fr' ? 'Titre ou jugement: 10 ans' : 'Urkunde oder Urteil: 10 Jahre')
        : (LANG === 'fr' ? 'Nouveau départ ordinaire' : 'Ordentlicher Neubeginn');

    // Build result HTML
    let resultHTML = `
        <h3>${T.result} <span class="status-badge ${statusClass}">${statusText}</span></h3>
        <table class="result-table">
            <tr>
                <td>${T.claimType}:</td>
                <td><strong>${type.name}</strong></td>
            </tr>
            <tr>
                <td>${T.legalBasis}:</td>
                <td>${type.article}</td>
            </tr>
            <tr>
                <td>${T.prescriptionPeriod}:</td>
                <td>${periodText}</td>
            </tr>
            ${interrupted ? `
            <tr>
                <td>${T.interruptionKind}:</td>
                <td>${interruptionKindText}</td>
            </tr>
            <tr>
                <td>${T.interruptedOn}:</td>
                <td>${interruptionDateStr}</td>
            </tr>
            ` : ''}
            <tr>
                <td>${T.periodStart}:</td>
                <td>${formatDate(calculation.effectiveRelativeStart)}</td>
            </tr>
    `;

    if (type.hasAbsolute && absoluteExpiration) {
        resultHTML += `
            <tr>
                <td>${T.relativePrescription}:</td>
                <td>${formatDate(expirationDate)}</td>
            </tr>
            <tr>
                <td>${T.absolutePrescription}:</td>
                <td>${formatDate(absoluteExpiration)}</td>
            </tr>
        `;
    }

    resultHTML += `
            <tr class="result-total">
                <td><strong>${T.prescriptionOn}:</strong></td>
                <td><strong>${formatDate(relevantExpiration)}</strong>${isAbsoluteRelevant ? ` ${T.absoluteNote}` : ''}</td>
            </tr>
        </table>
    `;

    if (daysRemaining >= 0) {
        resultHTML += `<div class="countdown">${T.remaining}: ${daysRemaining} ${T.days}</div>`;
    } else {
        resultHTML += `<div class="countdown" style="color: #721c24;">${T.expiredSince} ${Math.abs(daysRemaining)} ${T.days}</div>`;
    }

    // Add recommendations
    if (status === 'danger' || status === 'warning') {
        resultHTML += `
            <div class="warning" style="margin-top: 20px;">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>${T.recommendation}:</strong> ${T.expiresoon}
                <ul style="margin-top: 10px; margin-left: 20px;">
                    ${T.interruptOptions.map(opt => `<li>${opt}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    document.querySelector('.result-summary').innerHTML = resultHTML;
    document.getElementById('result').style.display = 'block';
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });

    // Save data for PDF export
    const countdownText = daysRemaining < 0
        ? `${T.expiredSince} ${Math.abs(daysRemaining)} ${T.days}`
        : `${T.remaining}: ${daysRemaining} ${T.days}`;

    saveVerjaehrungData(
        type.name,
        type.article,
        calculation.effectiveRelativeStart,
        calculation.relativeYears,
        periodText,
        relevantExpiration,
        interrupted,
        interrupted ? interruptionKindText : '',
        interrupted ? restartDate : null,
        daysRemaining < 0,
        countdownText
    );
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date pickers
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#startDate", { dateFormat: "d.m.Y", allowInput: true });
        flatpickr("#absoluteDate", { dateFormat: "d.m.Y", allowInput: true });
        flatpickr("#interruptionDate", { dateFormat: "d.m.Y", allowInput: true });
    }

    // Show disclaimer if not accepted
    if (!localStorage.getItem('verjaehrung_disclaimer_accepted')) {
        const modal = document.getElementById('disclaimerModal');
        if (modal) modal.style.display = 'flex';
    }

    // Initialize dark mode
    if (typeof DarkMode !== 'undefined') {
        DarkMode.init();
    }

    // Attach form submit handler
    const form = document.getElementById('verjaehrungForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Make functions globally available
window.updateClaimInfo = updateClaimInfo;
window.toggleInterruptionDate = toggleInterruptionDate;
window.acceptDisclaimer = acceptDisclaimer;
window.exportPDF = exportPDF;
