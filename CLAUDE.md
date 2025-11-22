# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Schweizer Fristenrechner** - Swiss legal deadline calculator based on the Swiss Civil Procedure Code (ZPO) Articles 142-146.

**Live Site**: https://frist.ch

## Deployment

Hosted via **Cloudflare Pages** with automatic deployment on push to main branch.

- Build command: (none)
- Build output: (none)
- Build system version: v3

## Tech Stack

- **Frontend**: Vanilla HTML5/CSS3/JavaScript (single-page app)
- **Styling**: CSS Variables, Font Awesome icons, Flatpickr date picker
- **No backend** - all calculation logic runs client-side

## Legal Calculation Rules

### Art. 142 ZPO - Fristbeginn
- **Tagesfristen**: Beginnen am **Folgetag** der Zustellung → `Fristende = Zustelldatum + Anzahl Tage`
- **Monatsfristen**: Beginnen am **Zustelltag** (BGer 5A_691/2023) → Enden am gleichen Tag im Zielmonat
- Falls Tag nicht existiert: letzter Tag des Monats
- Fristende Sa/So/Feiertag → nächster Werktag

### Art. 145 ZPO - Gerichtsferien
Fristen stehen still während:
- **Ostern**: 7 Tage vor bis 7 Tage nach Ostersonntag
- **Sommer**: 15. Juli bis 15. August
- **Winter**: 18. Dezember bis 2. Januar

**Ausnahmen (Abs. 2)**: Keine Gerichtsferien bei Schlichtungs- und Summarverfahren

### Art. 146 ZPO - Zustellung während Gerichtsferien
Wird während Gerichtsferien zugestellt → Frist beginnt am ersten Tag **nach** Ferienende

## Key Functions in index.html

| Funktion | Zweck |
|----------|-------|
| `calculateDeadline()` | Hauptberechnung der Frist |
| `getCourtHolidayPeriodEnd()` | Art. 146: Ferienende ermitteln |
| `calculateCourtHolidays()` | Art. 145: Gerichtsferientage berechnen |
| `calculateEasterDate()` | Gaußsche Osterformel |
| `isWeekendOrHoliday()` | Art. 142 Abs. 3: Wochenende/Feiertag prüfen |
| `toggleGerichtsferien()` | Art. 145 Abs. 2: Verfahrensart-Ausnahmen |

## Architecture

Single HTML file (`index.html`) with embedded CSS and JavaScript:
- All calculation logic in `<script>` tags
- Form handles user input (date, deadline type, procedure type)
- Visual calendar display of deadline period
- Print functionality for documentation
