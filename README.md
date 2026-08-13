# Schweizer Rechtstools | Outils juridiques suisses

🇩🇪 [Deutsch](#deutsch) | 🇫🇷 [Français](#français)

---

<a name="deutsch"></a>
## 🇩🇪 Deutsch

Suite von Schweizer Rechtsrechnern für Fristen, Verjährung und Kündigungen.

**[frist.ch](https://frist.ch)**

### Verfügbare Tools

| Tool | Beschreibung | Link |
|------|--------------|------|
| **Fristenrechner** | Prozessuale Fristen nach ZPO Art. 142-146 | [frist.ch/de/](https://frist.ch/de/) |
| **Verjährungsrechner** | Verjährungsfristen nach OR Art. 60, 127, 128, 210 | [frist.ch/de/verjaehrung.html](https://frist.ch/de/verjaehrung.html) |
| **Kündigungsfristenrechner** | Kündigungsfristen für Arbeits-, Miet-, Versicherungs- und Aboverträge | [frist.ch/de/kuendigung.html](https://frist.ch/de/kuendigung.html) |

### Berechnungsregeln

Dieser Rechner implementiert die Artikel 142-146 ZPO. Die Berechnungslogik ist vollständig Open Source.

#### Art. 142 ZPO – Beginn und Berechnung

**Abs. 1: Tagesfristen**
> Fristen, die durch eine Mitteilung oder den Eintritt eines Ereignisses ausgelöst werden, beginnen am folgenden Tag zu laufen.

```
Fristende = Zustelldatum + Anzahl Tage
```

**Abs. 2: Monatsfristen** (inkl. BGer 5A_691/2023)
> Berechnet sich eine Frist nach Monaten, so endet sie im letzten Monat an dem Tag, der dieselbe Zahl trägt wie der Tag, an dem die Frist zu laufen begann.

**Wichtig:** Gemäss Bundesgerichtsurteil 5A_691/2023 beginnt die Monatsfrist am **Tag der Zustellung**.

**Abs. 3: Fristende an Wochenende/Feiertag**
> Fällt der letzte Tag einer Frist auf einen Samstag, einen Sonntag oder einen [...] Feiertag, so endet sie am nächsten Werktag.

#### Art. 145 ZPO – Gerichtsferien (Fristenstillstand)

Gesetzliche und gerichtliche Fristen stehen still:
- **Ostern**: 7 Tage vor bis 7 Tage nach Ostersonntag
- **Sommer**: 15. Juli bis 15. August
- **Winter**: 18. Dezember bis 2. Januar

**Ausnahmen (Abs. 2):** Schlichtungsverfahren und summarisches Verfahren

#### Art. 146 ZPO – Zustellung während Gerichtsferien

Wird während Gerichtsferien zugestellt, beginnt die Frist am ersten Tag nach Ferienende.

### Feiertage

**Schweizweit übliche Feiertage** (nur der 1. August ist eidgenössisch):
- Neujahr (1. Januar)
- Auffahrt (Christi Himmelfahrt)
- Bundesfeiertag (1. August)
- Weihnachten (25. Dezember)

**Kantonale Feiertage** (je nach Kanton):
- Berchtoldstag (2. Januar)
- Heilige Drei Könige (6. Januar)
- Josephstag (19. März)
- Karfreitag
- Ostermontag
- Tag der Arbeit (1. Mai)
- Pfingstmontag
- Fronleichnam
- Mariä Himmelfahrt (15. August)
- Allerheiligen (1. November)
- Maria Empfängnis (8. Dezember)
- Stephanstag (26. Dezember)

### Kantonauswahl

Der Kanton wird für die Dokumentation erfasst. Die am konkreten Gerichtsort anerkannten Feiertage werden bewusst manuell gewählt, weil sie in einzelnen Kantonen nach Gemeinde, Bezirk oder Konfession abweichen können. Massgebend ist Art. 142 Abs. 3 ZPO.

---

<a name="français"></a>
## 🇫🇷 Français

Suite d'outils juridiques suisses pour les délais, la prescription et les résiliations.

**[frist.ch](https://frist.ch)**

### Outils disponibles

| Outil | Description | Lien |
|-------|-------------|------|
| **Calculateur de délais** | Délais procéduraux selon CPC art. 142-146 | [frist.ch/fr/](https://frist.ch/fr/) |
| **Calculateur de prescription** | Délais de prescription selon CO art. 60, 127, 128, 210 | [frist.ch/fr/verjaehrung.html](https://frist.ch/fr/verjaehrung.html) |
| **Calculateur de résiliation** | Délais de résiliation pour contrats de travail, bail, assurance et abonnements | [frist.ch/fr/kuendigung.html](https://frist.ch/fr/kuendigung.html) |

### Règles de calcul

Ce calculateur implémente les articles 142-146 CPC. La logique de calcul est entièrement open source.

#### Art. 142 CPC – Computation

**Al. 1 : Délais en jours**
> Les délais déclenchés par la communication ou la survenance d'un événement courent dès le lendemain de celles-ci.

```
Fin du délai = Date de notification + Nombre de jours
```

**Al. 2 : Délais en mois** (incl. TF 5A_691/2023)
> Lorsqu'un délai est fixé en mois, il expire le jour du dernier mois correspondant au jour où il a commencé à courir.

**Important :** Selon l'arrêt du Tribunal fédéral 5A_691/2023, le délai en mois commence le **jour de la notification**.

**Al. 3 : Fin du délai un week-end/jour férié**
> Si le dernier jour est un samedi, un dimanche ou un jour férié reconnu [...], le délai expire le premier jour ouvrable qui suit.

#### Art. 145 CPC – Suspension des délais (Féries judiciaires)

Les délais légaux et judiciaires ne courent pas :
- **Pâques** : Du 7e jour avant au 7e jour après Pâques inclus
- **Été** : Du 15 juillet au 15 août inclus
- **Hiver** : Du 18 décembre au 2 janvier inclus

**Exceptions (al. 2) :** Procédure de conciliation et procédure sommaire

#### Art. 146 CPC – Notification pendant les féries

Si la notification a lieu pendant les féries, le délai commence le premier jour après la fin des féries.

### Jours fériés

**Jours fériés usuels dans toute la Suisse** (seul le 1er août est fédéral) :
- Nouvel An (1er janvier)
- Ascension
- Fête nationale (1er août)
- Noël (25 décembre)

**Jours fériés cantonaux** (selon le canton) :
- Saint-Berchtold (2 janvier)
- Épiphanie (6 janvier)
- Saint-Joseph (19 mars)
- Vendredi saint
- Lundi de Pâques
- Fête du travail (1er mai)
- Lundi de Pentecôte
- Fête-Dieu
- Assomption (15 août)
- Toussaint (1er novembre)
- Immaculée Conception (8 décembre)
- Saint-Étienne (26 décembre)

### Sélection du canton

Le canton est conservé dans le document de calcul. Les jours fériés reconnus au siège concret du tribunal sont sélectionnés manuellement, car ils peuvent varier selon la commune, le district ou la confession. L’art. 142 al. 3 CPC est déterminant.

---

## Technologie | Technologie

```
frist/
├── index.html               # Spracherkennung / Détection de langue
├── de/
│   ├── index.html           # Fristenrechner
│   ├── verjaehrung.html     # Verjährungsrechner
│   └── kuendigung.html      # Kündigungsfristenrechner
├── fr/
│   ├── index.html           # Calculateur de délais
│   ├── verjaehrung.html     # Calculateur de prescription
│   └── kuendigung.html      # Délais de résiliation
├── css/styles.css           # Gemeinsame Styles / Styles partagés
├── scripts/
│   ├── calculations.js      # Berechnungslogik / Logique de calcul
│   ├── app.js               # UI-Logik / Logique UI
│   └── pdf-export.js        # PDF-Export (jsPDF)
├── images/                  # OG-Bilder / Images OG (1200x630)
└── test.js                  # Tests (node test.js)
```

- Vanilla HTML/CSS/JavaScript (kein Framework)
- Bilingue DE/FR avec détection automatique
- Aucun backend – calculs côté client
- Hébergé sur Cloudflare Pages
- Open Source

## Offline-Versionen | Versions hors ligne

Jedes Tool ist auch als Offline-Version verfügbar – eine einzelne HTML-Datei, die ohne Internetverbindung funktioniert.

Chaque outil est disponible en version hors ligne – un seul fichier HTML qui fonctionne sans connexion Internet.

| Tool | DE | FR |
|------|----|----|
| Fristenrechner | [Download](https://frist.ch/downloads/fristenrechner-offline-de.zip) | [Télécharger](https://frist.ch/downloads/fristenrechner-offline-fr.zip) |
| Verjährungsrechner | [Download](https://frist.ch/downloads/verjaehrungsrechner-offline-de.zip) | [Télécharger](https://frist.ch/downloads/verjaehrungsrechner-offline-fr.zip) |
| Kündigungsfristenrechner | [Download](https://frist.ch/downloads/kuendigungsrechner-offline-de.zip) | [Télécharger](https://frist.ch/downloads/kuendigungsrechner-offline-fr.zip) |

**Nutzung / Utilisation:**
1. ZIP herunterladen / Télécharger le ZIP
2. Entpacken / Dézipper
3. HTML-Datei im Browser öffnen / Ouvrir le fichier HTML dans le navigateur

## Testprotokoll | Protocole de test

Die Berechnungslogik wurde gegen alle gesetzlichen Vorgaben (Art. 142-146 ZPO) geprüft:
**[TESTPROTOKOLL.md](TESTPROTOKOLL.md)**

La logique de calcul a été vérifiée par rapport à toutes les exigences légales (art. 142-146 CPC) :
**[TESTPROTOKOLL.md](TESTPROTOKOLL.md)**

```bash
node test.js  # 16/16 Tests bestanden / tests réussis
```

## Avertissement | Avertissement

Ce calculateur sert uniquement d'orientation. Vous êtes seul responsable du respect des délais. En cas de doute, consultez un avocat.

Dieser Rechner dient nur zur Orientierung. Für die Wahrung von Fristen sind Sie selbst verantwortlich. Im Zweifelsfall konsultieren Sie einen Rechtsanwalt.

## Licence | Lizenz

MIT

---

[Durchblick Consultancy BV](https://durchblick.nl) • [Source Code](https://github.com/durchblick-nl/frist)
