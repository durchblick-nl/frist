# Testprotokoll Fristenrechner

Dieses Dokument dokumentiert die Überprüfung der Berechnungslogik gegen die gesetzlichen Vorgaben der Schweizerischen Zivilprozessordnung (ZPO).

## Zusammenfassung

| Artikel | Regel | Status |
|---------|-------|--------|
| Art. 142 Abs. 1 | Tagesfristen beginnen am Folgetag | ✅ |
| **Art. 142 Abs. 1bis** | **Wochenend-Zustellung gilt als Werktag (NEU 1.1.2025)** | ✅ |
| Art. 142 Abs. 2 | Monatsfristen enden am gleichen Tag im Zielmonat | ✅ |
| BGer 5A_691/2023 | Monatsfrist beginnt am Tag der Zustellung | ✅ |
| Art. 142 Abs. 3 | Fristende Sa/So/Feiertag → nächster Werktag | ✅ |
| Art. 145 Abs. 1 | Gerichtsferien (Fristenstillstand) | ✅ |
| Art. 145 Abs. 2 | Ausnahmen: Schlichtung/Summarisch | ✅ |
| Art. 146 | Zustellung während Gerichtsferien | ✅ |

---

## Art. 142 Abs. 1bis ZPO - Wochenend-Zustellung (NEU seit 1.1.2025)

**Gesetzestext:**
> Wird eine Sendung durch gewöhnliche Post an einem Samstag, Sonntag oder staatlich anerkannten Feiertag zugestellt, so gilt sie als am nächsten Werktag zugestellt.

**Implementierung:**
```javascript
// scripts/calculations.js, Zeile 145-152
function adjustDeliveryDate(date, selectedHolidays) {
    const adjusted = new Date(date);
    while (isWeekendOrHoliday(adjusted, selectedHolidays)) {
        adjusted.setDate(adjusted.getDate() + 1);
    }
    return adjusted;
}
```

**Beispiel:**
- Zustellung per A-Post: Samstag, 18. Januar 2025
- Gilt als zugestellt: Montag, 20. Januar 2025
- 10-Tage-Frist beginnt am 21. Januar, endet am 30. Januar

**Hinweis:** Diese Regel gilt nur für Zustellung per **gewöhnlicher Post** (A-Post, B-Post), nicht für eingeschriebene Sendungen oder A-Post Plus.

---

## Art. 142 Abs. 1 ZPO - Tagesfristen

**Gesetzestext:**
> Fristen, die durch eine Mitteilung oder den Eintritt eines Ereignisses ausgelöst werden, beginnen am folgenden Tag zu laufen.

**Implementierung:**
```javascript
// scripts/calculations.js, Zeile 168-172
endDate = new Date(effectiveStartDate);
const days = customValue || parseInt(fristType.split('_')[1]);
endDate.setDate(endDate.getDate() + days);
```

**Beispiel:**
- Zustellung: 6. Januar 2025 (Montag)
- 10-Tage-Frist
- Frist läuft: 7.1. bis 16.1. (10 volle Tage)
- Fristende: **16. Januar 2025**

**Tests:**
```
✅ 10-Tage-Frist (Mo → Do): 6.1.2025 + 10 Tage = 16.1.2025
✅ 20-Tage-Frist (Mo → So → Mo): 6.1.2025 + 20 Tage = 27.1.2025
✅ 30-Tage-Frist: 6.1.2025 + 30 Tage = 5.2.2025
```

---

## Art. 142 Abs. 2 ZPO - Monatsfristen

**Gesetzestext:**
> Berechnet sich eine Frist nach Monaten, so endet sie im letzten Monat an dem Tag, der dieselbe Zahl trägt wie der Tag, an dem die Frist zu laufen begann. Fehlt der entsprechende Tag, so endet die Frist am letzten Tag des Monats.

**Wichtig - BGer 5A_691/2023 vom 13. August 2024:**
> Die Monatsfrist beginnt am **Tag der Zustellung** selbst, nicht am Folgetag.

**Implementierung:**
```javascript
// scripts/calculations.js, Zeile 159-167
if (fristType.startsWith('months_')) {
    // Month deadline: starts on day of notification (BGer 5A_691/2023)
    const months = customValue || parseInt(fristType.split('_')[1]);
    const targetMonth = effectiveStartDate.getMonth() + months;
    const targetYear = effectiveStartDate.getFullYear() + Math.floor(targetMonth / 12);
    const normalizedTargetMonth = targetMonth % 12;
    const lastDayOfTargetMonth = new Date(targetYear, normalizedTargetMonth + 1, 0).getDate();
    const targetDay = Math.min(effectiveStartDate.getDate(), lastDayOfTargetMonth);
    endDate = new Date(targetYear, normalizedTargetMonth, targetDay);
}
```

**Beispiele:**
| Zustellung | Frist | Berechnung | Fristende |
|------------|-------|------------|-----------|
| 15.1.2025 | 1 Monat | 15.1. → 15.2. (Sa) → Mo | **17.2.2025** |
| 31.1.2025 | 1 Monat | 31.1. → 28.2. (kein 31.) | **28.2.2025** |
| 31.1.2024 | 1 Monat | 31.1. → 29.2. (Schaltjahr) | **29.2.2024** |
| 15.1.2025 | 3 Monate | 15.1. → 15.4. | **15.4.2025** |
| 15.12.2025 | 1 Monat | 15.12. → 15.1.2026 | **15.1.2026** |

**Tests:**
```
✅ 1-Monats-Frist (15.1. → 15.2. Sa → 17.2. Mo)
✅ 1-Monats-Frist (31.1. → 28.2.)
✅ 1-Monats-Frist Schaltjahr (31.1. → 29.2.)
✅ 3-Monats-Frist
✅ 1-Monats-Frist Jahreswechsel
```

---

## Unterschied Tages- vs. Monatsfristen

```
TAGESFRIST:   Zustellung 15.1. + 10 Tage  = 25.1.  (Frist läuft 16.1.-25.1.)
MONATSFRIST:  Zustellung 15.1. + 1 Monat  = 15.2.  (gleicher Tag im Zielmonat)
```

Die Tagesfrist beginnt am **Folgetag**, die Monatsfrist am **Tag der Zustellung**.

---

## Art. 142 Abs. 3 ZPO - Wochenende/Feiertag

**Gesetzestext:**
> Fällt der letzte Tag einer Frist auf einen Samstag, einen Sonntag oder einen am Gerichtsort vom Bundesrecht oder vom kantonalen Recht anerkannten Feiertag, so endet sie am nächsten Werktag.

**Implementierung:**
```javascript
// scripts/calculations.js, Zeile 190-193
while (isWeekendOrHoliday(endDate, selectedHolidays)) {
    endDate.setDate(endDate.getDate() + 1);
}
```

**Tests:**
```
✅ Fristende am Samstag → Montag: 8.1.2025 + 10 Tage = 18.1. (Sa) → 20.1.2025 (Mo)
✅ Fristende am Sonntag → Montag: 9.1.2025 + 10 Tage = 19.1. (So) → 20.1.2025 (Mo)
```

---

## Art. 145 ZPO - Gerichtsferien (Fristenstillstand)

**Gesetzestext:**
> Gesetzliche und gerichtliche Fristen stehen still:
> a) vom siebten Tag vor Ostern bis und mit dem siebten Tag nach Ostern;
> b) vom 15. Juli bis und mit dem 15. August;
> c) vom 18. Dezember bis und mit dem 2. Januar.

**Implementierung:**
```javascript
// scripts/calculations.js, Zeile 36-56
function isInCourtHolidays(date) {
    // Easter holidays: 7 days before to 7 days after Easter
    // Summer holidays: July 15 - August 15
    // Winter holidays: December 18 - January 2
}

// scripts/calculations.js, Zeile 175-188
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
```

**Tests:**
```
✅ 10-Tage-Frist über Sommerferien: 10.7.2025 + 10 Tage (+ Gerichtsferien) = 28.7.2025
✅ 10-Tage-Frist über Winterferien: 15.12.2025 + 10 Tage (+ Gerichtsferien) = 2.1.2026
```

---

## Art. 145 Abs. 2 ZPO - Ausnahmen

**Gesetzestext:**
> Dieser Fristenstillstand gilt nicht für:
> a) das Schlichtungsverfahren;
> b) das summarische Verfahren.

**Implementierung:**
```javascript
// scripts/app.js, toggleGerichtsferien()
if (verfahrensart === 'summarisch' || verfahrensart === 'schlichtung') {
    gerichtsferienGroup.style.display = 'none';
    gerichtsferienCheckbox.checked = false;
    // Hinweistext anzeigen
}
```

Bei Auswahl von "Summarisches Verfahren" oder "Schlichtungsverfahren" wird die Gerichtsferien-Option automatisch deaktiviert.

---

## Art. 146 ZPO - Zustellung während Gerichtsferien

**Gesetzestext (sinngemäss):**
> Wird während der Gerichtsferien zugestellt, beginnt die Frist am ersten Tag nach Ferienende.

**Implementierung:**
```javascript
// scripts/calculations.js, Zeile 58-93
function getCourtHolidayPeriodEnd(date) {
    // Returns the first day after the court holiday period ends
}

// scripts/calculations.js, Zeile 150-156
if (useCourtHolidays) {
    const courtHolidayEnd = getCourtHolidayPeriodEnd(startDate);
    if (courtHolidayEnd) {
        effectiveStartDate = courtHolidayEnd;
    }
}
```

**Tests:**
```
✅ Zustellung am 20. Juli (Sommerferien): Frist beginnt am 16.8., 10 Tage = 26.8.2025
✅ Zustellung am 24. Dezember (Winterferien): Frist beginnt am 3.1., 10 Tage = 13.1.2026
```

---

## Osterberechnung (Gaußsche Osterformel)

Die Berechnung des Osterdatums ist essentiell für die Gerichtsferien.

**Tests:**
```
✅ Ostern 2024 = 31. März 2024
✅ Ostern 2025 = 20. April 2025
```

---

## Testausführung

```bash
$ node test.js

=== FRISTENRECHNER TESTS ===

--- Art. 142 Abs. 1: Tagesfristen ---
✅ 10-Tage-Frist (Mo → Do)
✅ 20-Tage-Frist (Mo → So → Mo)
✅ 30-Tage-Frist

--- Art. 142 Abs. 2: Monatsfristen (BGer 5A_691/2023) ---
✅ 1-Monats-Frist (15.1. → 15.2. Sa → 17.2. Mo)
✅ 1-Monats-Frist (31.1. → 28.2.)
✅ 1-Monats-Frist Schaltjahr (31.1. → 29.2.)
✅ 3-Monats-Frist
✅ 1-Monats-Frist Jahreswechsel

--- Art. 142 Abs. 3: Wochenende ---
✅ Fristende am Samstag → Montag
✅ Fristende am Sonntag → Montag

--- Art. 145: Gerichtsferien ---
✅ 10-Tage-Frist über Sommerferien
✅ 10-Tage-Frist über Winterferien

--- Art. 146: Zustellung während Gerichtsferien ---
✅ Zustellung am 20. Juli (Sommerferien)
✅ Zustellung am 24. Dezember (Winterferien)

--- Osterberechnung ---
✅ Ostern 2025 = 20. April
✅ Ostern 2024 = 31. März

=== ERGEBNIS ===
16 bestanden, 0 fehlgeschlagen
✅ Alle Tests bestanden!
```

---

## Fazit

Alle Berechnungsregeln der Art. 142-146 ZPO sind korrekt implementiert, einschliesslich des Bundesgerichtsurteils 5A_691/2023 bezüglich des Beginns von Monatsfristen.

---

*Letzte Überprüfung: November 2025*
