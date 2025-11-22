# Schweizer Fristenrechner

Berechne juristische Fristen nach der Schweizerischen Zivilprozessordnung (ZPO).

**[frist.ch](https://frist.ch)**

## Berechnungsregeln

Dieser Rechner implementiert die Artikel 142-146 ZPO. Die Berechnungslogik ist vollständig Open Source und kann hier überprüft werden.

### Art. 142 ZPO – Beginn und Berechnung

#### Abs. 1: Tagesfristen
> Fristen, die durch eine Mitteilung oder den Eintritt eines Ereignisses ausgelöst werden, beginnen am folgenden Tag zu laufen.

**Berechnung:**
```
Fristende = Zustelldatum + Anzahl Tage
```

**Beispiel:** 10-Tage-Frist, Zustellung am Montag, 1. Januar
- Tag 1 = 2. Januar (Dienstag)
- Tag 10 = 11. Januar (Donnerstag)
- **Fristende: 11. Januar**

#### Abs. 2: Monatsfristen (inkl. BGer 5A_691/2023)
> Berechnet sich eine Frist nach Monaten, so endet sie im letzten Monat an dem Tag, der dieselbe Zahl trägt wie der Tag, an dem die Frist zu laufen begann.

**Wichtig:** Gemäss Bundesgerichtsurteil 5A_691/2023 vom 13. August 2024 beginnt die Monatsfrist am **Tag der Zustellung** (nicht am Folgetag).

**Berechnung:**
```
Fristende = Gleicher Tag im Zielmonat
Falls Tag nicht existiert: Letzter Tag des Monats
```

**Beispiel:** 1-Monats-Frist, Zustellung am 31. Januar
- Fristbeginn: 31. Januar
- Zielmonat Februar hat keinen 31.
- **Fristende: 28. Februar (bzw. 29. im Schaltjahr)**

#### Abs. 3: Fristende an Wochenende/Feiertag
> Fällt der letzte Tag einer Frist auf einen Samstag, einen Sonntag oder einen [...] Feiertag, so endet sie am nächsten Werktag.

**Berechnung:**
```
while (Fristende ist Sa/So/Feiertag):
    Fristende = Fristende + 1 Tag
```

### Art. 145 ZPO – Gerichtsferien (Fristenstillstand)

#### Abs. 1: Stillstandsperioden
Gesetzliche und gerichtliche Fristen stehen still während:

| Periode | Dauer |
|---------|-------|
| **Ostern** | 7 Tage vor bis 7 Tage nach Ostersonntag |
| **Sommer** | 15. Juli bis 15. August |
| **Winter** | 18. Dezember bis 2. Januar |

**Berechnung:**
```
1. Berechne Fristende ohne Stillstand
2. Zähle Gerichtsferientage im Fristzeitraum
3. Fristende = Fristende + Anzahl Gerichtsferientage
4. Prüfe ob neues Fristende auf Sa/So/Feiertag fällt
```

#### Abs. 2: Ausnahmen
Der Fristenstillstand gilt **NICHT** für:
- Schlichtungsverfahren
- Summarisches Verfahren

### Art. 146 ZPO – Zustellung während Gerichtsferien

> Wird eine fristauslösende Mitteilung während der Gerichtsferien zugestellt, beginnt die Frist erst am ersten Tag nach Ende der Gerichtsferien zu laufen.

**Berechnung:**
```
if (Zustelldatum in Gerichtsferien):
    Effektiver Fristbeginn = Erster Tag nach Gerichtsferien
else:
    Effektiver Fristbeginn = Zustelldatum
```

**Beispiel:** Zustellung am 20. Dezember (Winterferien)
- Gerichtsferien: 18. Dezember – 2. Januar
- Erster Tag nach Ferien: 3. Januar
- **Frist beginnt am 3. Januar**

## Osterberechnung (Gaußsche Formel)

Die beweglichen Feiertage (Ostern, Auffahrt, Pfingsten, Fronleichnam) werden mit der Gaußschen Osterformel berechnet:

```javascript
function calculateEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}
```

**Bewegliche Feiertage relativ zu Ostern:**
| Feiertag | Tage ab Ostern |
|----------|----------------|
| Karfreitag | -2 |
| Ostermontag | +1 |
| Auffahrt | +39 |
| Pfingstmontag | +50 |
| Fronleichnam | +60 |

## Nationale und kantonale Feiertage

### Nationale Feiertage (schweizweit)
- 1. Januar – Neujahr
- Auffahrt (beweglich)
- 1. August – Nationalfeiertag
- 25. Dezember – Weihnachten

### Kantonale Feiertage (optional wählbar)
- 2. Januar – Berchtoldstag
- 6. Januar – Heilige Drei Könige
- 19. März – Josephstag
- Karfreitag (beweglich)
- Ostermontag (beweglich)
- 1. Mai – Tag der Arbeit
- Pfingstmontag (beweglich)
- Fronleichnam (beweglich)
- 15. August – Mariä Himmelfahrt
- 1. November – Allerheiligen
- 8. Dezember – Maria Empfängnis
- 26. Dezember – Stephanstag

## Technologie

- Statische Single-Page-App ohne Backend
- Alle Berechnungen erfolgen clientseitig im Browser
- Gehostet auf Cloudflare Pages
- Open Source – Code kann eingesehen und verifiziert werden

## Rechtliche Hinweise

Dieser Rechner dient nur zur Orientierung. Für die Wahrung von Fristen sind Sie selbst verantwortlich. Im Zweifelsfall konsultieren Sie eine Rechtsanwältin oder einen Rechtsanwalt.

## Lizenz

MIT
