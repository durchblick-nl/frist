# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Schweizer Rechtstools** - Suite of Swiss legal calculators:

1. **Fristenrechner** - Deadline calculator based on ZPO/CPC Articles 142-146
2. **Verjährungsrechner** - Statute of limitations calculator based on OR Articles 60, 127, 128, 210
3. **Kündigungsfristenrechner** - Notice period calculator for employment, rental, insurance, and subscription contracts

**Live Site**: https://frist.ch

## Deployment

Hosted via **Cloudflare Pages** with automatic deployment on push to main branch.

- Build command: (none)
- Build output: (none)
- Build system version: v3

## Project Structure

```
frist/
├── index.html              # Language redirect (auto-detects DE/FR)
├── de/
│   ├── index.html          # Fristenrechner (German)
│   ├── verjaehrung.html    # Verjährungsrechner (German)
│   └── kuendigung.html     # Kündigungsfristenrechner (German)
├── fr/
│   ├── index.html          # Calculateur de délais (French)
│   ├── verjaehrung.html    # Calculateur prescription (French)
│   └── kuendigung.html     # Délais de résiliation (French)
├── css/
│   └── styles.css          # Shared styles (Durchblick brand colors)
├── scripts/
│   ├── calculations.js     # Core calculation functions (Fristenrechner)
│   ├── app.js              # UI logic and form handling (Fristenrechner)
│   ├── verjaehrung.js      # Statute of limitations logic (bilingual)
│   ├── kuendigung.js       # Notice period logic (bilingual)
│   ├── utils.js            # Shared utilities (dark mode, etc.)
│   └── pdf-export.js       # PDF export functionality (jsPDF)
├── downloads/              # Offline bundles (ZIP files)
│   ├── fristenrechner-offline-de.zip
│   ├── fristenrechner-offline-fr.zip
│   ├── verjaehrungsrechner-offline-de.zip
│   ├── verjaehrungsrechner-offline-fr.zip
│   ├── kuendigungsrechner-offline-de.zip
│   └── kuendigungsrechner-offline-fr.zip
├── offline-bundle/         # Build tools for offline versions
│   ├── build-all-offline.js  # Build script
│   ├── economica-*.ttf     # Embedded fonts
│   ├── flatpickr.min.*     # Date picker library
│   └── jspdf.min.js        # PDF library
├── images/
│   ├── og-frist-de.png     # OG image for German (1200x630)
│   └── og-frist-fr.png     # OG image for French (1200x630)
├── test.js                 # CLI test suite (node test.js)
└── tests.html              # Browser-based visual tests
```

## Tech Stack

- **Frontend**: Vanilla HTML5/CSS3/JavaScript
- **Styling**: CSS Variables, Font Awesome icons, Flatpickr date picker
- **PDF Export**: jsPDF library for client-side PDF generation
- **Bilingual**: German (DE) and French (FR) versions
- **Brand**: Durchblick Consultancy BV colors (#3f606f, #cc5c53, #5a8a9d)
- **No backend** - all calculation logic runs client-side

## Commands

```bash
# Run tests
node test.js

# View visual tests
open tests.html

# Build offline bundles (all tools, DE + FR)
cd offline-bundle && node build-all-offline.js
```

## Offline Bundles

Each tool is available as a standalone HTML file that works without internet connection.

### Building Offline Versions

```bash
cd offline-bundle
node build-all-offline.js
```

This creates 6 ZIP files in `/downloads/`:
- `fristenrechner-offline-de.zip` / `fristenrechner-offline-fr.zip`
- `verjaehrungsrechner-offline-de.zip` / `verjaehrungsrechner-offline-fr.zip`
- `kuendigungsrechner-offline-de.zip` / `kuendigungsrechner-offline-fr.zip`

### What's Bundled

Each offline HTML file contains:
- All CSS (styles.css) inlined
- All JavaScript (calculations, app logic) inlined
- Economica font embedded as Base64
- Flatpickr date picker library
- jsPDF for PDF export
- Font Awesome icons as Unicode/emoji fallbacks

### Size

~210 KB per ZIP file (compressed from ~680 KB HTML)

### After Code Changes

Run the build script to regenerate offline bundles:
```bash
cd offline-bundle && node build-all-offline.js
```

## Legal Calculation Rules

### Fristenrechner (ZPO Art. 142-146)

#### Art. 142 ZPO - Fristbeginn
- **Tagesfristen**: Beginnen am **Folgetag** der Zustellung → `Fristende = Zustelldatum + Anzahl Tage`
- **Monatsfristen**: Beginnen am **Zustelltag** (BGer 5A_691/2023) → Enden am gleichen Tag im Zielmonat
- Falls Tag nicht existiert: letzter Tag des Monats
- Fristende Sa/So/Feiertag → nächster Werktag

#### Art. 145 ZPO - Gerichtsferien
Fristen stehen still während:
- **Ostern**: 7 Tage vor bis 7 Tage nach Ostersonntag
- **Sommer**: 15. Juli bis 15. August
- **Winter**: 18. Dezember bis 2. Januar

**Ausnahmen (Abs. 2)**: Keine Gerichtsferien bei Schlichtungs- und Summarverfahren

#### Art. 146 ZPO - Zustellung während Gerichtsferien
Wird während Gerichtsferien zugestellt → Frist beginnt am ersten Tag **nach** Ferienende

### Verjährungsrechner (OR)

| Frist | Anspruch | Rechtsgrundlage |
|-------|----------|-----------------|
| 10 Jahre | Allgemeine Forderungen | OR Art. 127 |
| 5 Jahre | Mietzinsen, Löhne, Alimente | OR Art. 128 |
| 3 Jahre | Schadenersatz (Delikt) | OR Art. 60 (relativ) |
| 3 Jahre | Ungerechtfertigte Bereicherung | OR Art. 67 |
| 2 Jahre | Kaufvertrag (Gewährleistung) | OR Art. 210 |
| 20 Jahre | Verlustscheine | OR Art. 149a |

**Relative vs. absolute Verjährung**: Bei Delikten gilt 3 Jahre relativ / 10 Jahre absolut; bei Personenschäden 3 Jahre relativ / 20 Jahre absolut (seit 2020).

### Kündigungsfristenrechner

#### Arbeitsvertrag (OR Art. 335)
| Phase | Frist | Termin |
|-------|-------|--------|
| Probezeit | 7 Tage | jederzeit |
| 1. Dienstjahr | 1 Monat | Monatsende |
| 2.-9. Dienstjahr | 2 Monate | Monatsende |
| Ab 10. Dienstjahr | 3 Monate | Monatsende |

#### Mietvertrag (OR Art. 266)
| Objekt | Frist | Termin |
|--------|-------|--------|
| Wohnung | 3 Monate | Quartalsende (ortsüblich) |
| Geschäftsräume | 6 Monate | Quartalsende |
| Möbliertes Zimmer | 2 Wochen | Monatsende |

#### Versicherungen (VVG/KVG)
| Versicherung | Frist | Termin |
|--------------|-------|--------|
| Krankenkasse Grund | bis 30. November | 31. Dezember |
| Zusatzversicherung | 3 Monate | Ende Jahr |
| Sachversicherung | 3 Monate | Ende Versicherungsjahr |

#### Abonnemente (Vertrag/AGB)
| Abo | Frist | Hinweis |
|-----|-------|---------|
| Fitness | 3 Monate | vor Vertragsablauf |
| Handy/Internet | 60 Tage | automatische Verlängerung |
| Streaming | 1 Monat | meist monatlich kündbar |

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
- **PDF export**: Results can be exported as professional PDF documents with calendar visualization

## Zusammengehörige Projekte

Dieses Projekt ist Teil einer Suite von Schweizer Rechtstools:

| Projekt | Beschreibung | URL |
|---------|--------------|-----|
| **gerichtskostenrechner** | Gerichtskosten für Zivilverfahren | [github.com/durchblick-nl/gerichtskostenrechner](https://github.com/durchblick-nl/gerichtskostenrechner) |
| **verzugszinsrechner** | Verzugszinsen nach OR 104 | [github.com/durchblick-nl/verzugszinsrechner](https://github.com/durchblick-nl/verzugszinsrechner) |
| **frist** | Fristenrechner (ZPO, OR, etc.) | [github.com/durchblick-nl/frist](https://github.com/durchblick-nl/frist) |

Alle drei Projekte:
- Bilingual (DE/FR)
- Vanilla HTML/CSS/JS (kein Framework)
- Client-side Berechnungen (kein Backend)
- Open Source

## Kontakt

[Durchblick Consultancy BV](https://durchblick.nl)
