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
            de: 'Allgemeine vertragliche Ansprüche wie Kaufpreis, Darlehen, Werklohn.',
            fr: 'Créances contractuelles générales comme prix d\'achat, prêt, prix de l\'ouvrage.'
        }
    },
    'judgment_10': {
        years: 10,
        name: { de: 'Gerichtsurteile', fr: 'Jugements' },
        article: 'OR Art. 137',
        info: {
            de: 'Rechtskräftige Urteile und gerichtliche Vergleiche verjähren nach 10 Jahren.',
            fr: 'Les jugements entrés en force et les transactions judiciaires se prescrivent par 10 ans.'
        }
    },
    // 5 years (OR Art. 128)
    'rent_5': {
        years: 5,
        name: { de: 'Miet- und Pachtzinsen', fr: 'Loyers et fermages' },
        article: 'OR Art. 128 Ziff. 1',
        info: {
            de: 'Gilt für Mietzinsforderungen, nicht für Nebenkosten-Nachzahlungen.',
            fr: 'S\'applique aux loyers, pas aux rappels de charges.'
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
        name: { de: 'Personenschäden', fr: 'Lésions corporelles' },
        article: 'OR Art. 60 (seit 2020)',
        info: {
            de: '3 Jahre ab Kenntnis, max. 20 Jahre ab schädigendem Ereignis. Gilt seit 1.1.2020.',
            fr: '3 ans dès la connaissance, max. 20 ans dès l\'événement dommageable. Applicable depuis le 1.1.2020.'
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
            de: 'Ansprüche aus Frachtvertrag.',
            fr: 'Actions dérivant du contrat de transport.'
        }
    },
    // Special cases
    'loss_certificate_20': {
        years: 20,
        name: { de: 'Verlustscheine', fr: 'Actes de défaut de biens' },
        article: 'OR Art. 149a',
        info: {
            de: 'Forderungen aus Verlustscheinen verjähren 20 Jahre nach Ausstellung.',
            fr: 'Les créances constatées par acte de défaut de biens se prescrivent par 20 ans.'
        }
    },
    'culture_30': {
        years: 1,
        absoluteYears: 30,
        hasAbsolute: true,
        name: { de: 'Kulturgüter', fr: 'Biens culturels' },
        article: 'OR Art. 210 Abs. 3',
        info: {
            de: '1 Jahr ab Kenntnis, max. 30 Jahre ab Erwerb. Für rechtswidrig entzogene Kulturgüter.',
            fr: '1 an dès connaissance, max. 30 ans dès acquisition. Pour biens culturels illicitement soustraits.'
        }
    },
    'regress_3': {
        years: 3,
        name: { de: 'Regress Solidarhaftung', fr: 'Recours solidarité' },
        article: 'OR Art. 139',
        info: {
            de: 'Regressansprüche unter Solidarschuldnern verjähren 3 Jahre ab Zahlung.',
            fr: 'Les actions récursoires entre débiteurs solidaires se prescrivent par 3 ans dès le paiement.'
        }
    },
    'insurance_5': {
        years: 5,
        name: { de: 'Versicherungsansprüche', fr: 'Créances d\'assurance' },
        article: 'VVG Art. 46 (seit 2022)',
        info: {
            de: 'Seit 2022 verjähren Versicherungsansprüche nach 5 Jahren (zuvor 2 Jahre).',
            fr: 'Depuis 2022, les créances d\'assurance se prescrivent par 5 ans (auparavant 2 ans).'
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
        info: type.info[LANG] || type.info.de
    };
}

// Date utilities
function parseDate(dateStr) {
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function formatDate(date) {
    const locale = LANG === 'fr' ? 'fr-CH' : 'de-CH';
    return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function addYears(date, years) {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
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
        } else {
            absoluteGroup.style.display = 'none';
        }
    } else {
        infoDiv.style.display = 'none';
        absoluteGroup.style.display = 'none';
    }
}

function toggleInterruptionDate() {
    const checkbox = document.getElementById('interrupted');
    const group = document.getElementById('interruptionDateGroup');
    group.style.display = checkbox.checked ? 'block' : 'none';
}

// PDF Export data storage
let lastVerjaehrungData = null;

function saveVerjaehrungData(claimType, startDate, periodYears, periodText, endDate, interrupted, interruptionDate, isExpired, statusText) {
    lastVerjaehrungData = {
        claimType: claimType,
        claimDate: startDate,
        periodYears: periodYears,
        periodText: periodText,
        endDate: endDate,
        interrupted: interrupted,
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

    if (!claimTypeValue || !startDateStr) {
        alert(T.fillAllFields);
        return;
    }

    const type = getClaimType(claimTypeValue);
    let startDate = parseDate(startDateStr);

    if (!startDate) {
        alert(T.invalidDate);
        return;
    }

    // If interrupted, use interruption date as new start
    if (interrupted && interruptionDateStr) {
        const interruptionDate = parseDate(interruptionDateStr);
        if (interruptionDate) {
            startDate = interruptionDate;
        }
    }

    // Calculate expiration date
    const expirationDate = addYears(startDate, type.years);

    // Calculate absolute expiration if applicable
    let absoluteExpiration = null;
    if (type.hasAbsolute && absoluteDateStr) {
        const absoluteDate = parseDate(absoluteDateStr);
        if (absoluteDate) {
            absoluteExpiration = addYears(absoluteDate, type.absoluteYears);
        }
    }

    // Determine which date is earlier (relevant expiration)
    let relevantExpiration = expirationDate;
    let isAbsoluteRelevant = false;
    if (absoluteExpiration && absoluteExpiration < expirationDate) {
        relevantExpiration = absoluteExpiration;
        isAbsoluteRelevant = true;
    }

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
    const periodText = type.absoluteYears
        ? `${type.years} ${T.yearsRelative} / ${type.absoluteYears} ${T.yearsAbsolute}`
        : `${type.years} ${T.years}`;

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
                <td>${T.interruptedOn}:</td>
                <td>${interruptionDateStr}</td>
            </tr>
            ` : ''}
            <tr>
                <td>${T.periodStart}:</td>
                <td>${formatDate(startDate)}</td>
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
        startDate,
        type.years,
        periodText,
        relevantExpiration,
        interrupted,
        interrupted ? parseDate(interruptionDateStr) : null,
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
