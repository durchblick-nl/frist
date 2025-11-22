# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Schweizer Fristenrechner** - Swiss legal deadline calculator based on the Swiss Civil Procedure Code (ZPO/CPC) Articles 142-146.

**Live Site**: https://frist.ch

## Deployment

Hosted via **Cloudflare Pages** with automatic deployment on push to main branch.

- Build command: (none)
- Build output: (none)
- Build system version: v3

## Project Structure

```
frist/
├── index.html          # Language redirect (auto-detects DE/FR)
├── de/
│   └── index.html      # German version
├── fr/
│   └── index.html      # French version
├── css/
│   └── styles.css      # Shared styles (Durchblick brand colors)
├── scripts/
│   ├── calculations.js # Core calculation functions
│   └── app.js          # UI logic and form handling
├── test.js             # CLI test suite (node test.js)
└── tests.html          # Browser-based visual tests
```

## Tech Stack

- **Frontend**: Vanilla HTML5/CSS3/JavaScript
- **Styling**: CSS Variables, Font Awesome icons, Flatpickr date picker
- **Bilingual**: German (DE) and French (FR) versions
- **Brand**: Durchblick Consultancy BV colors (#1375bc, #bc3c31, #3f6576)
- **No backend** - all calculation logic runs client-side

## Commands

```bash
# Run tests
node test.js

# View visual tests
open tests.html
```

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

## Key Functions

### scripts/calculations.js

| Function | Purpose |
|----------|---------|
| `calculateDeadline()` | Main deadline calculation |
| `getCourtHolidayPeriodEnd()` | Art. 146: Find end of court holiday period |
| `isInCourtHolidays()` | Art. 145: Check if date is in court holidays |
| `calculateEasterDate()` | Gaussian Easter formula |
| `isWeekendOrHoliday()` | Art. 142 Abs. 3: Check weekend/holiday |
| `getHolidaysForYear()` | Get holidays (national + cantonal) for year |

### scripts/app.js

| Function | Purpose |
|----------|---------|
| `toggleCustomFrist()` | Show/hide custom day/month inputs |
| `toggleGerichtsferien()` | Art. 145 Abs. 2: Handle procedure type |
| `displayResult()` | Render calculation results |
| `generateCalendar()` | Visual calendar of deadline period |
| `acceptDisclaimer()` | Handle disclaimer modal |

## Architecture

- **Language detection**: Root `index.html` detects browser language and redirects to `/de/` or `/fr/`
- **Shared code**: CSS and JS files are shared between language versions
- **Form handling**: Each language HTML has hardcoded labels, shared JS handles logic
- **Print support**: CSS print styles for documentation output

## Zusammengehörige Projekte

Dieses Projekt ist Teil einer Suite von Schweizer Rechtstools:

| Projekt | Beschreibung | URL |
|---------|--------------|-----|
| **gerichtskostenrechner** | Gerichtskosten für Zivilverfahren | [github.com/chosee/gerichtskostenrechner](https://github.com/chosee/gerichtskostenrechner) |
| **verzugszinsrechner** | Verzugszinsen nach OR 104 | [github.com/chosee/verzugszinsrechner](https://github.com/chosee/verzugszinsrechner) |
| **frist** | Fristenrechner (ZPO, OR, etc.) | [github.com/chosee/frist](https://github.com/chosee/frist) |

Alle drei Projekte:
- Bilingual (DE/FR)
- Vanilla HTML/CSS/JS (kein Framework)
- Client-side Berechnungen (kein Backend)
- Open Source

## Kontakt

[Durchblick Consultancy BV](https://durchblick.nl)
