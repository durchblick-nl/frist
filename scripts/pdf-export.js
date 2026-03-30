/**
 * Frist.ch - PDF Export
 * Generiert professionelle PDF-Dokumente mit jsPDF
 */

const FristPdfExport = {
    /**
     * Generiert ein PDF mit der Fristberechnung und Kalender
     */
    generatePDF(data, lang = 'de') {
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            console.error('jsPDF nicht geladen');
            window.print();
            return;
        }

        const { jsPDF } = window.jspdf || window;
        const doc = new jsPDF();
        const texts = this.getTexts(lang);

        // Farben (Durchblick Brand)
        const primaryColor = [63, 96, 111];
        const accentColor = [204, 92, 83];
        const weekendColor = [245, 245, 245];
        const holidayColor = [255, 230, 230];
        const lastDayColor = [63, 96, 111];
        const courtHolidayColor = [230, 240, 255];

        let y = 20;

        // === HEADER ===
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(texts.title, 15, 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(texts.subtitle, 15, 22);

        // Datum rechts
        doc.text(`${texts.date}: ${this.formatDate(new Date(), lang)}`, 195, 15, { align: 'right' });

        y = 40;

        // === EINGABEDATEN ===
        doc.setTextColor(0, 0, 0);
        y = this.addSectionHeader(doc, texts.inputData, y, primaryColor);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const inputLines = [
            [texts.notificationDate, this.formatDate(data.startDate, lang)],
            [texts.deadlineType, data.fristText],
            [texts.procedureType, data.verfahrensart],
            [texts.courtHolidays, data.useCourtHolidays ? texts.yes : texts.no],
            [texts.canton, data.canton || '-']
        ];

        y = this.addTable(doc, inputLines, 15, y);
        y += 10;

        // === ERGEBNIS ===
        y = this.addSectionHeader(doc, texts.result, y, primaryColor);

        // Grosses Fristende
        doc.setFillColor(240, 248, 255);
        doc.roundedRect(15, y, 180, 25, 3, 3, 'F');

        doc.setTextColor(...primaryColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(texts.deadlineEnd, 25, y + 10);

        doc.setFontSize(14);
        doc.setTextColor(...accentColor);
        doc.text(this.formatDateFull(data.endDate, lang), 25, y + 20);

        y += 35;

        // === KALENDER (kompakt) ===
        if (data.calendarData && data.calendarData.length > 0) {
            y = this.checkPageBreak(doc, y, 60);
            y = this.addSectionHeader(doc, texts.calendar, y, primaryColor);

            // Website-Farben
            const colors = {
                normal: [72, 187, 120],      // #48bb78 - grün
                weekend: [237, 137, 54],     // #ed8936 - orange
                holiday: [229, 62, 62],      // #e53e3e - rot
                courtHoliday: [66, 153, 225], // #4299e1 - blau
                lastDay: [63, 96, 111]       // #3f606f - Durchblick dunkelblau
            };

            // Kompakte Legende
            doc.setFontSize(6);
            const legendItems = [
                { color: colors.normal, text: texts.normalDay },
                { color: colors.weekend, text: texts.weekend },
                { color: colors.holiday, text: texts.holiday },
                { color: colors.courtHoliday, text: texts.courtHoliday },
                { color: colors.lastDay, text: texts.lastDay }
            ];

            let legendX = 15;
            legendItems.forEach(item => {
                doc.setFillColor(...item.color);
                doc.circle(legendX + 1.5, y - 1, 1.5, 'F');
                doc.setTextColor(60, 60, 60);
                doc.text(item.text, legendX + 5, y);
                legendX += doc.getTextWidth(item.text) + 10;
            });

            y += 5;

            // Wochentage Header
            const weekdays = lang === 'fr'
                ? ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']
                : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

            const cellWidth = 18;
            const cellHeight = 7;
            const startX = 15;
            const gridWidth = cellWidth * 7;

            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);

            weekdays.forEach((day, i) => {
                doc.text(day, startX + i * cellWidth + cellWidth / 2, y, { align: 'center' });
            });

            y += 3;

            // Kalender Grid - kompakt
            doc.setFont('helvetica', 'normal');
            let row = 0;
            let col = 0;

            data.calendarData.forEach((dayInfo, index) => {
                if (index > 0 && index % 7 === 0) {
                    row++;
                    col = 0;
                }

                const x = startX + col * cellWidth;
                const cellY = y + row * cellHeight;

                // Zellen-Hintergrund basierend auf Typ
                if (dayInfo.type !== 'empty') {
                    let bgColor = colors.normal;
                    if (dayInfo.type === 'last-day') bgColor = colors.lastDay;
                    else if (dayInfo.type === 'court-holiday') bgColor = colors.courtHoliday;
                    else if (dayInfo.type === 'holiday') bgColor = colors.holiday;
                    else if (dayInfo.type === 'weekend') bgColor = colors.weekend;

                    doc.setFillColor(...bgColor);
                    doc.roundedRect(x + 0.5, cellY, cellWidth - 1, cellHeight - 0.5, 0.5, 0.5, 'F');

                    // Datum (weiss auf farbigem Hintergrund)
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(6);
                    const dateText = dayInfo.date.getDate() + '.' + (dayInfo.date.getMonth() + 1) + '.';
                    doc.text(dateText, x + cellWidth / 2, cellY + 3, { align: 'center' });

                    // Tag-Zähler klein
                    if (dayInfo.count) {
                        doc.setFontSize(5);
                        doc.setTextColor(255, 255, 255, 0.7);
                        doc.text(String(dayInfo.count), x + cellWidth / 2, cellY + 5.5, { align: 'center' });
                    }
                }

                col++;
            });

            y += (row + 1) * cellHeight + 5;
        }

        // === RECHTLICHE GRUNDLAGEN ===
        y = this.checkPageBreak(doc, y, 40);
        y = this.addSectionHeader(doc, texts.legalBasis, y, primaryColor);

        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);

        const legalLines = lang === 'fr' ? [
            'Art. 142 CPC: Calcul des délais',
            'Art. 145 CPC: Suspension des délais (féries judiciaires)',
            'Art. 146 CPC: Notification pendant les féries'
        ] : [
            'Art. 142 ZPO: Fristberechnung',
            'Art. 145 ZPO: Fristenstillstand (Gerichtsferien)',
            'Art. 146 ZPO: Zustellung während Gerichtsferien'
        ];

        legalLines.forEach(line => {
            doc.text(line, 15, y);
            y += 5;
        });

        y += 5;

        // === FOOTER ===
        y = this.checkPageBreak(doc, y, 20);

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text(texts.disclaimer, 15, y);
        doc.text('frist.ch - ' + texts.footerInfo, 15, y + 4);

        // Dateiname
        const filename = `Fristberechnung_${this.formatDateFile(data.endDate)}.pdf`;
        doc.save(filename);
    },

    /**
     * Sammelt die Kalenderdaten aus dem DOM
     */
    collectCalendarData(startDate, endDate, useCourtHolidays, selectedHolidays) {
        const calendarData = [];

        // Ersten Montag vor oder am Startdatum finden
        let currentDate = new Date(startDate);
        while (currentDate.getDay() !== 1) {
            currentDate.setDate(currentDate.getDate() - 1);
        }

        const isMonthFrist = document.getElementById('fristType')?.value?.startsWith('months_') || false;
        let dayCount = 0;

        while (currentDate <= endDate || currentDate.getDay() !== 1) {
            const isBeforeStart = currentDate < startDate;
            const isAfterEnd = currentDate > endDate;
            const isEndDate = currentDate.toDateString() === endDate.toDateString();
            const isStartDate = currentDate.toDateString() === startDate.toDateString();

            let type = 'normal';
            if (isBeforeStart || isAfterEnd) {
                type = 'empty';
            } else if (isEndDate) {
                type = 'last-day';
            } else if (useCourtHolidays && typeof isInCourtHolidays === 'function' && isInCourtHolidays(currentDate)) {
                type = 'court-holiday';
            } else if (typeof isWeekendOrHoliday === 'function' && isWeekendOrHoliday(currentDate, selectedHolidays)) {
                type = currentDate.getDay() === 0 || currentDate.getDay() === 6 ? 'weekend' : 'holiday';
            }

            // Tag zählen
            if (!isBeforeStart && !isAfterEnd && type !== 'empty') {
                if (!isMonthFrist && !isStartDate) {
                    dayCount++;
                } else if (isMonthFrist) {
                    dayCount++;
                }
            }

            calendarData.push({
                date: new Date(currentDate),
                dateStr: `${currentDate.getDate()}.${currentDate.getMonth() + 1}.`,
                type: type,
                count: type !== 'empty' ? dayCount : null
            });

            currentDate.setDate(currentDate.getDate() + 1);

            // Sicherheitsabbruch
            if (calendarData.length > 400) break;
        }

        return calendarData;
    },

    addSectionHeader(doc, title, y, color) {
        doc.setFillColor(...color);
        doc.rect(15, y, 3, 7, 'F');

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 22, y + 5);

        return y + 12;
    },

    addTable(doc, rows, x, y) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        rows.forEach(row => {
            doc.text(row[0], x, y);
            doc.setFont('helvetica', 'bold');
            doc.text(row[1], 190, y, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            y += 6;
        });

        return y;
    },

    checkPageBreak(doc, y, requiredSpace) {
        if (y + requiredSpace > 280) {
            doc.addPage();
            return 20;
        }
        return y;
    },

    formatDate(date, lang) {
        if (!date) date = new Date();
        if (typeof date === 'string') date = new Date(date);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH', options);
    },

    formatDateFull(date, lang) {
        if (!date) date = new Date();
        if (typeof date === 'string') date = new Date(date);
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH', options);
    },

    formatDateFile(date) {
        if (!date) date = new Date();
        if (typeof date === 'string') date = new Date(date);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    getTexts(lang) {
        if (lang === 'fr') {
            return {
                title: 'Calcul de délai',
                subtitle: 'Calculateur de délais selon le CPC suisse',
                date: 'Date',
                inputData: 'Données saisies',
                notificationDate: 'Date de notification',
                deadlineType: 'Type de délai',
                procedureType: 'Type de procédure',
                courtHolidays: 'Féries judiciaires',
                canton: 'Canton',
                yes: 'Oui',
                no: 'Non',
                result: 'Résultat',
                deadlineEnd: 'Fin du délai:',
                calendar: 'Calendrier',
                normalDay: 'Jour normal',
                weekend: 'Week-end',
                holiday: 'Jour férié',
                courtHoliday: 'Féries jud.',
                lastDay: 'Fin délai',
                legalBasis: 'Base légale',
                disclaimer: 'Ce document sert uniquement d\'orientation. Pas de conseil juridique.',
                footerInfo: 'Calculateur de délais selon le Code de procédure civile suisse'
            };
        }

        return {
            title: 'Fristberechnung',
            subtitle: 'Fristenrechner nach Schweizer ZPO',
            date: 'Datum',
            inputData: 'Eingabedaten',
            notificationDate: 'Zustellungsdatum',
            deadlineType: 'Art der Frist',
            procedureType: 'Verfahrensart',
            courtHolidays: 'Gerichtsferien',
            canton: 'Kanton',
            yes: 'Ja',
            no: 'Nein',
            result: 'Ergebnis',
            deadlineEnd: 'Fristende:',
            calendar: 'Kalender',
            normalDay: 'Normal',
            weekend: 'Wochenende',
            holiday: 'Feiertag',
            courtHoliday: 'Gerichtsferien',
            lastDay: 'Fristende',
            legalBasis: 'Rechtliche Grundlagen',
            disclaimer: 'Dieses Dokument dient nur zur Orientierung. Keine Rechtsberatung.',
            footerInfo: 'Fristenrechner nach Schweizer Zivilprozessordnung'
        };
    }
};

/**
 * Verjährungsrechner PDF Export
 */
const VerjaehrungPdfExport = {
    generatePDF(data, lang = 'de') {
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            console.error('jsPDF nicht geladen');
            window.print();
            return;
        }

        const { jsPDF } = window.jspdf || window;
        const doc = new jsPDF();
        const texts = this.getTexts(lang);

        const primaryColor = [63, 96, 111];
        const accentColor = [204, 92, 83];

        let y = 20;

        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(texts.title, 15, 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(texts.subtitle, 15, 22);

        doc.text(`${texts.date}: ${this.formatDate(new Date(), lang)}`, 195, 15, { align: 'right' });

        y = 40;

        // Eingabedaten
        doc.setTextColor(0, 0, 0);
        y = this.addSectionHeader(doc, texts.inputData, y, primaryColor);

        const inputLines = [
            [texts.claimType, data.claimType],
            [texts.claimDate, this.formatDate(data.claimDate, lang)],
            [texts.limitationPeriod, data.periodText]
        ];

        if (data.interrupted) {
            inputLines.push([texts.interrupted, texts.yes]);
            inputLines.push([texts.interruptionDate, this.formatDate(data.interruptionDate, lang)]);
        }

        y = this.addTable(doc, inputLines, 15, y);
        y += 10;

        // Ergebnis
        y = this.addSectionHeader(doc, texts.result, y, primaryColor);

        doc.setFillColor(240, 248, 255);
        doc.roundedRect(15, y, 180, 25, 3, 3, 'F');

        doc.setTextColor(...primaryColor);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(texts.limitationEnd, 25, y + 10);

        doc.setFontSize(14);
        doc.setTextColor(...(data.isExpired ? accentColor : [0, 128, 0]));
        doc.text(this.formatDateFull(data.endDate, lang), 25, y + 20);

        y += 35;

        // Status
        doc.setFontSize(10);
        doc.setTextColor(data.isExpired ? accentColor[0] : 0, data.isExpired ? accentColor[1] : 128, data.isExpired ? accentColor[2] : 0);
        doc.setFont('helvetica', 'bold');
        doc.text(data.statusText, 15, y);

        y += 15;

        // Rechtliche Grundlagen
        y = this.addSectionHeader(doc, texts.legalBasis, y, primaryColor);

        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');

        const legalLines = lang === 'fr' ? [
            'CO Art. 127: Prescription décennale',
            'CO Art. 128: Prescription quinquennale',
            'CO Art. 60: Actions en dommages-intérêts',
            'CO Art. 135: Interruption de la prescription'
        ] : [
            'OR Art. 127: Zehnjährige Verjährung',
            'OR Art. 128: Fünfjährige Verjährung',
            'OR Art. 60: Schadenersatzansprüche',
            'OR Art. 135: Unterbrechung der Verjährung'
        ];

        legalLines.forEach(line => {
            doc.text(line, 15, y);
            y += 5;
        });

        y += 10;

        // Footer
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text(texts.disclaimer, 15, y);
        doc.text('frist.ch - ' + texts.footerInfo, 15, y + 4);

        const filename = `Verjaehrung_${this.formatDateFile(data.endDate)}.pdf`;
        doc.save(filename);
    },

    addSectionHeader(doc, title, y, color) {
        doc.setFillColor(...color);
        doc.rect(15, y, 3, 7, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 22, y + 5);
        return y + 12;
    },

    addTable(doc, rows, x, y) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        rows.forEach(row => {
            doc.text(row[0], x, y);
            doc.setFont('helvetica', 'bold');
            doc.text(row[1], 190, y, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            y += 6;
        });
        return y;
    },

    formatDate(date, lang) {
        if (!date) return '-';
        if (typeof date === 'string') date = new Date(date);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH', options);
    },

    formatDateFull(date, lang) {
        if (!date) return '-';
        if (typeof date === 'string') date = new Date(date);
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH', options);
    },

    formatDateFile(date) {
        if (!date) date = new Date();
        if (typeof date === 'string') date = new Date(date);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    getTexts(lang) {
        if (lang === 'fr') {
            return {
                title: 'Calcul de prescription',
                subtitle: 'Calculateur de prescription selon le CO suisse',
                date: 'Date',
                inputData: 'Données saisies',
                claimType: 'Type de créance',
                claimDate: 'Date de naissance',
                limitationPeriod: 'Délai de prescription',
                interrupted: 'Interruption',
                interruptionDate: 'Date d\'interruption',
                yes: 'Oui',
                result: 'Résultat',
                limitationEnd: 'Prescription au:',
                legalBasis: 'Base légale',
                disclaimer: 'Ce document sert uniquement d\'orientation. Pas de conseil juridique.',
                footerInfo: 'Calculateur de prescription selon le Code des obligations suisse'
            };
        }
        return {
            title: 'Verjährungsberechnung',
            subtitle: 'Verjährungsrechner nach Schweizer OR',
            date: 'Datum',
            inputData: 'Eingabedaten',
            claimType: 'Art der Forderung',
            claimDate: 'Entstehungsdatum',
            limitationPeriod: 'Verjährungsfrist',
            interrupted: 'Unterbrechung',
            interruptionDate: 'Unterbrechungsdatum',
            yes: 'Ja',
            result: 'Ergebnis',
            limitationEnd: 'Verjährung am:',
            legalBasis: 'Rechtliche Grundlagen',
            disclaimer: 'Dieses Dokument dient nur zur Orientierung. Keine Rechtsberatung.',
            footerInfo: 'Verjährungsrechner nach Schweizer Obligationenrecht'
        };
    }
};

/**
 * Kündigungsfristenrechner PDF Export
 */
const KuendigungPdfExport = {
    generatePDF(data, lang = 'de') {
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            console.error('jsPDF nicht geladen');
            window.print();
            return;
        }

        const { jsPDF } = window.jspdf || window;
        const doc = new jsPDF();
        const texts = this.getTexts(lang);

        const primaryColor = [63, 96, 111];
        const accentColor = [204, 92, 83];

        let y = 20;

        // Header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(texts.title, 15, 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(texts.subtitle, 15, 22);

        doc.text(`${texts.date}: ${this.formatDate(new Date(), lang)}`, 195, 15, { align: 'right' });

        y = 40;

        // Eingabedaten
        doc.setTextColor(0, 0, 0);
        y = this.addSectionHeader(doc, texts.inputData, y, primaryColor);

        const inputLines = [
            [texts.contractType, data.contractType],
            [texts.noticePeriod, data.noticePeriod],
            [texts.plannedDate, this.formatDate(data.plannedDate, lang)]
        ];

        if (data.additionalInfo) {
            inputLines.push([texts.additionalInfo, data.additionalInfo]);
        }

        y = this.addTable(doc, inputLines, 15, y);
        y += 10;

        // Ergebnis
        y = this.addSectionHeader(doc, texts.result, y, primaryColor);

        doc.setFillColor(240, 248, 255);
        doc.roundedRect(15, y, 180, 35, 3, 3, 'F');

        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(texts.latestNotice, 25, y + 8);

        doc.setFontSize(12);
        doc.setTextColor(...accentColor);
        doc.text(this.formatDateFull(data.latestNoticeDate, lang), 25, y + 16);

        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.text(texts.terminationDate, 25, y + 25);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(this.formatDateFull(data.terminationDate, lang), 25, y + 33);

        y += 45;

        // Hinweise falls vorhanden
        if (data.notes && data.notes.length > 0) {
            y = this.addSectionHeader(doc, texts.notes, y, primaryColor);
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            data.notes.forEach(note => {
                const lines = doc.splitTextToSize(note, 170);
                doc.text(lines, 15, y);
                y += lines.length * 5 + 3;
            });
            y += 5;
        }

        // Footer
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text(texts.disclaimer, 15, y);
        doc.text('frist.ch - ' + texts.footerInfo, 15, y + 4);

        const filename = `Kuendigung_${this.formatDateFile(data.terminationDate)}.pdf`;
        doc.save(filename);
    },

    addSectionHeader(doc, title, y, color) {
        doc.setFillColor(...color);
        doc.rect(15, y, 3, 7, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 22, y + 5);
        return y + 12;
    },

    addTable(doc, rows, x, y) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        rows.forEach(row => {
            doc.text(row[0], x, y);
            doc.setFont('helvetica', 'bold');
            doc.text(row[1], 190, y, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            y += 6;
        });
        return y;
    },

    formatDate(date, lang) {
        if (!date) return '-';
        if (typeof date === 'string') date = new Date(date);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH', options);
    },

    formatDateFull(date, lang) {
        if (!date) return '-';
        if (typeof date === 'string') date = new Date(date);
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'de-CH', options);
    },

    formatDateFile(date) {
        if (!date) date = new Date();
        if (typeof date === 'string') date = new Date(date);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    getTexts(lang) {
        if (lang === 'fr') {
            return {
                title: 'Calcul du délai de résiliation',
                subtitle: 'Calculateur de délais de résiliation',
                date: 'Date',
                inputData: 'Données saisies',
                contractType: 'Type de contrat',
                noticePeriod: 'Délai de préavis',
                plannedDate: 'Date souhaitée',
                additionalInfo: 'Informations',
                result: 'Résultat',
                latestNotice: 'Résiliation au plus tard le:',
                terminationDate: 'Fin du contrat le:',
                notes: 'Remarques',
                legalBasis: 'Base légale',
                disclaimer: 'Ce document sert uniquement d\'orientation. Pas de conseil juridique.',
                footerInfo: 'Calculateur de délais de résiliation'
            };
        }
        return {
            title: 'Kündigungsfristberechnung',
            subtitle: 'Kündigungsfristenrechner',
            date: 'Datum',
            inputData: 'Eingabedaten',
            contractType: 'Vertragsart',
            noticePeriod: 'Kündigungsfrist',
            plannedDate: 'Gewünschtes Datum',
            additionalInfo: 'Zusatzinfo',
            result: 'Ergebnis',
            latestNotice: 'Kündigung spätestens am:',
            terminationDate: 'Vertragsende am:',
            notes: 'Hinweise',
            legalBasis: 'Rechtliche Grundlagen',
            disclaimer: 'Dieses Dokument dient nur zur Orientierung. Keine Rechtsberatung.',
            footerInfo: 'Kündigungsfristenrechner'
        };
    }
};

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FristPdfExport, VerjaehrungPdfExport, KuendigungPdfExport };
}
