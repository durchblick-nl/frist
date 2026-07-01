# Testprotokoll Fristenrechner

Dieses Dokument beschreibt die geprüften Berechnungsregeln des Fristenrechners nach der Schweizerischen Zivilprozessordnung (ZPO). Die automatisierten Tests in `test.js` laden direkt `scripts/calculations.js`; es gibt keine separate Testkopie der Berechnungslogik mehr.

## Zusammenfassung

| Artikel | Regel | Status |
|---------|-------|--------|
| Art. 142 Abs. 1 | Tagesfristen beginnen am Folgetag | Geprüft |
| Art. 142 Abs. 1bis | Gewöhnliche Post an Samstag/Sonntag/Feiertag gilt am nächsten Werktag als zugestellt | Geprüft |
| Art. 142 Abs. 2 | Monatsfristen enden am gleichen Tag im Zielmonat | Geprüft |
| BGer 5A_691/2023 | Monatsfrist berechnet sich ab dem fristauslösenden Tag | Geprüft |
| Art. 142 Abs. 3 | Fristende an Samstag/Sonntag/Feiertag verschiebt auf den nächsten Werktag | Geprüft |
| Art. 145 Abs. 1 | Gerichtsferien unterbrechen den Fristenlauf | Geprüft |
| Art. 145 Abs. 2 | Kein Fristenstillstand im Schlichtungs- und summarischen Verfahren | Geprüft in der UI-Logik |
| Art. 146 | Zustellung während Gerichtsferien: Fristlauf beginnt am ersten Tag nach Ferienende | Geprüft |

## Art. 142 Abs. 1 ZPO - Tagesfristen

Tagesfristen beginnen am Tag nach der Zustellung zu laufen.

Beispiel:

| Zustellung | Frist | Berechnung | Fristende |
|------------|-------|------------|-----------|
| 06.01.2025 | 10 Tage | 07.01.-16.01. | 16.01.2025 |
| 06.01.2025 | 20 Tage | 07.01.-26.01., Sonntag -> Montag | 27.01.2025 |

## Art. 142 Abs. 1bis ZPO - Gewöhnliche Post

Bei gewöhnlicher Post gilt eine Zustellung an einem Samstag, Sonntag oder anerkannten Feiertag als am nächsten Werktag erfolgt. Die Berechnung wendet diese Zustellfiktion vor der Prüfung der Gerichtsferien an.

Geprüfte Fälle:

| Zustellung | Option | Frist | Erwartetes Fristende |
|------------|--------|-------|----------------------|
| Sa, 18.01.2025 | gewöhnliche Post | 10 Tage | 30.01.2025 |
| Sa, 13.12.2025 | gewöhnliche Post + Gerichtsferien | 10 Tage | 12.01.2026 |

Der zweite Fall stellt sicher, dass die Zustellfiktion die effektive Zustellung in die Winter-Gerichtsferien verschieben kann und Art. 146 danach korrekt greift.

## Art. 142 Abs. 2 ZPO - Monatsfristen

Monatsfristen enden im letzten Monat an dem Tag, der dieselbe Zahl trägt wie der fristauslösende Tag. Fehlt dieser Tag, endet die Frist am letzten Tag des Monats. Nach BGer 5A_691/2023 wird für Monatsfristen nicht auf den Folgetag abgestellt.

Geprüfte Fälle:

| Zustellung | Frist | Berechnung | Fristende |
|------------|-------|------------|-----------|
| 15.01.2025 | 1 Monat | 15.02. ist Samstag -> Montag | 17.02.2025 |
| 31.01.2025 | 1 Monat | Februar ohne 31. | 28.02.2025 |
| 31.01.2024 | 1 Monat | Schaltjahr | 29.02.2024 |

## Art. 142 Abs. 3 ZPO - Fristende an Wochenende/Feiertag

Fällt der letzte Tag auf Samstag, Sonntag oder einen am Gerichtsort anerkannten Feiertag, endet die Frist am nächsten Werktag.

Geprüfter Feiertagsfall:

| Zustellung | Frist | Feiertage | Erwartetes Fristende |
|------------|-------|-----------|----------------------|
| 25.03.2026 | 10 Tage | SG inkl. Ostermontag | 07.04.2026 |

## Art. 145 ZPO - Gerichtsferien

Gerichtsferien:

- Ostern: vom siebten Tag vor Ostern bis und mit dem siebten Tag nach Ostern
- Sommer: 15. Juli bis und mit 15. August
- Winter: 18. Dezember bis und mit 2. Januar

Die Implementierung unterscheidet bewusst zwischen Tages- und Monatsfristen:

- Tagesfristen zählen nur an Tagen, an denen der Fristenlauf nicht stillsteht. Wochenenden zählen während des laufenden Fristenlaufs mit; erst der letzte Tag wird nach Art. 142 Abs. 3 verschoben.
- Monatsfristen werden zuerst nach Art. 142 Abs. 2 berechnet. Danach werden alle Stillstandstage addiert. Die Addition erfolgt iterativ, damit neu erreichte Gerichtsferientage ebenfalls berücksichtigt werden.

Geprüfte Fälle:

| Zustellung | Frist | Berechnung | Fristende |
|------------|-------|------------|-----------|
| 11.07.2025 | 10 Tage | 3 Tage vor Sommerferien, 7 Tage ab 16.08. | 22.08.2025 |
| 14.07.2025 | 1 Tag | 15.08. stillstehend, 16.08. Samstag -> Montag | 18.08.2025 |
| 15.12.2025 | 10 Tage | Winterstillstand, danach weiterzählen | 12.01.2026 |
| 26.01.2022 | 3 Monate | Osterstillstand + 15 Tage | 11.05.2022 |
| 14.07.2025 | 1 Monat | Sommerstillstand vollständig berücksichtigt | 15.09.2025 |

## Art. 145 Abs. 2 ZPO - Ausnahmen

Der Fristenstillstand gilt nicht für das Schlichtungsverfahren und das summarische Verfahren. Die UI setzt deshalb bei diesen Verfahrensarten die Option "Gerichtsferien berücksichtigen" automatisch aus.

## Art. 146 ZPO - Zustellung während Gerichtsferien

Wird während des Stillstandes zugestellt, beginnt der Fristenlauf am ersten Tag nach Ende des Stillstandes. Bei Tagesfristen zählt dieser erste Tag als erster laufender Fristtag. Bei Monatsfristen ist dieser erste Tag der massgebende Kalendertag für Art. 142 Abs. 2.

Geprüfte Fälle:

| Zustellung | Frist | Fristlauf ab | Fristende |
|------------|-------|--------------|-----------|
| 20.07.2025 | 10 Tage | 16.08.2025 | 25.08.2025 |
| 24.12.2025 | 10 Tage | 03.01.2026 | 12.01.2026 |
| 20.07.2025 | 1 Monat | 16.08.2025 | 16.09.2025 |

## Osterberechnung

Die Osterdaten werden dynamisch berechnet. Geprüfte Referenzwerte:

| Jahr | Ostersonntag |
|------|--------------|
| 2024 | 31.03.2024 |
| 2025 | 20.04.2025 |

## Testausführung

```bash
$ node test.js

=== ERGEBNIS ===
18 bestanden, 0 fehlgeschlagen
Alle Tests bestanden!
```

## Stand

Letzte Überprüfung: Juli 2026
