# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Schweizer Fristenrechner** - Swiss legal deadline calculator based on the Swiss Civil Procedure Code (ZPO) Articles 142-145.

**Live Site**: https://frist.ch

## Deployment

Hosted via **Cloudflare Pages** with automatic deployment on push to main branch.

- Build command: (none)
- Build output: (none)
- Build system version: v3

## Tech Stack

- **Frontend**: Vanilla HTML5/CSS3/JavaScript (single-page app)
- **Styling**: CSS Variables, Font Awesome icons
- **No backend** - all calculation logic runs client-side

## Legal Calculation Rules

### Art. 142 ZPO - Fristbeginn
- Fristen durch Zustellung/Ereignis ausgelöst beginnen am **folgenden Tag**
- Monatsfristen enden am entsprechenden Tag im Zielmonat
- Falls Tag nicht existiert: letzter Tag des Monats

**Wichtig**: Gemäss Bundesgerichtsurteil 5A_691/2023 (13.08.2024) beginnt die Monatsfrist am Tag des auslösenden Ereignisses, nicht am Folgetag.

### Art. 143 ZPO - Fristeinhaltung
- Eingaben müssen bis zum letzten Tag der Frist erfolgen
- Bei elektronischer Übermittlung: Empfangszeitpunkt massgebend

### Art. 144 ZPO - Fristerstreckung
- Gesetzliche Fristen: nicht erstreckbar
- Gerichtliche Fristen: erstreckbar bei wichtigem Grund

### Art. 145 ZPO - Gerichtsferien
Fristen stehen still während:
- **Ostern**: 7 Tage vor bis 7 Tage nach Ostersonntag
- **Sommer**: 15. Juli bis 15. August
- **Winter**: 18. Dezember bis 2. Januar

## Architecture

Single HTML file (`index.html`) with embedded CSS and JavaScript:
- Modular design separating UI components from business logic
- Client-side date calculations
- Responsive design for all devices

## Project Documentation

The `/memory-bank/` directory contains additional context:
- `projectbrief.md` - Legal requirements and ZPO rules
- `productContext.md` - User experience goals
- `techContext.md` - Technical constraints
- `systemPatterns.md` - Architecture patterns
