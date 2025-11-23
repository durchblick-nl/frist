# Schweizer Fristenrechner | Calculateur de délais suisse

🇩🇪 [Deutsch](#deutsch) | 🇫🇷 [Français](#français)

---

<a name="deutsch"></a>
## 🇩🇪 Deutsch

Berechne juristische Fristen nach der Schweizerischen Zivilprozessordnung (ZPO).

**[frist.ch](https://frist.ch)**

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

**Nationale Feiertage** (in der ganzen Schweiz anerkannt):
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

Der Fristenrechner bietet eine Kantonauswahl, die automatisch die im jeweiligen Kanton geltenden Feiertage aktiviert.

**Datenquelle:** Die kantonalen Feiertagsregelungen basieren auf den offiziellen Angaben der Schweizerischen Bundeskanzlei und den kantonalen Gesetzgebungen:
- [Schweizerische Bundeskanzlei – Feiertage](https://www.bk.admin.ch/bk/de/home/politische-rechte/feiertage.html)
- [Wikipedia – Feiertage in der Schweiz](https://de.wikipedia.org/wiki/Feiertage_in_der_Schweiz)

---

<a name="français"></a>
## 🇫🇷 Français

Calculez les délais juridiques selon le Code de procédure civile suisse (CPC).

**[frist.ch](https://frist.ch)**

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

**Jours fériés nationaux** (reconnus dans toute la Suisse) :
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

Le calculateur propose une sélection de canton qui active automatiquement les jours fériés en vigueur dans le canton concerné.

**Source des données :** Les réglementations cantonales des jours fériés sont basées sur les informations officielles de la Chancellerie fédérale suisse et les législations cantonales :
- [Chancellerie fédérale suisse – Jours fériés](https://www.bk.admin.ch/bk/fr/home/droits-politiques/jours-feries.html)
- [Wikipedia – Jours fériés en Suisse](https://fr.wikipedia.org/wiki/Jours_f%C3%A9ri%C3%A9s_en_Suisse)

---

## Technologie | Technologie

```
frist/
├── index.html           # Spracherkennung / Détection de langue
├── de/index.html        # Deutsche Version
├── fr/index.html        # Version française
├── css/styles.css       # Gemeinsame Styles / Styles partagés
├── scripts/
│   ├── calculations.js  # Berechnungslogik / Logique de calcul
│   └── app.js           # UI-Logik / Logique UI
└── test.js              # Tests (node test.js)
```

- Vanilla HTML/CSS/JavaScript (kein Framework)
- Bilingue DE/FR avec détection automatique
- Aucun backend – calculs côté client
- Hébergé sur Cloudflare Pages
- Open Source

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
