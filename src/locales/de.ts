import type { AppText } from "./schema";

const de: AppText = {
  common: {
    language: "Sprache",
    version: "Version",
    noTribe: "— kein Stamm —",
    back: "Zurück",
    continue: "Weiter",
    copyCurrentToSimulation: "Aktuellen Zustand in Simulation kopieren",
    currentDay: "Aktueller Tag",
    currentGmtTime: "Aktuelle GMT-Zeit",
    minutesRemainingToTheEnd: "Verbleibende Minuten bis zum Ende",
    currentPoints: "Aktuelle Punkte",
    firstCapture: "Erste Eroberung",
    pointsPerMinute: "Punkte / Min",
    finalIfUnchanged: "Final bei unverändertem Zustand",
    finalSimulated: "Simuliertes Finale",
    difference: "Differenz",
    tribe: "Stamm",
    ruin: "Ruine",
    currentOwner: "Aktueller Besitzer",
    simulateIfChangedNow: "Simulieren, wenn jetzt geändert",
    day1: "Tag 1",
    day2: "Tag 2",
    day3: "Tag 3",
    colour: "Farbe",
    colours: {
      red: "Rot",
      blue: "Blau",
      green: "Grün",
      yellow: "Gelb",
      purple: "Lila",
      orange: "Orange",
      pink: "Rosa",
      mint: "Mint",
    },
  },
  setup: {
    title: "GvG-Punktesimulator",
    subtitle:
      "Stamm 1 ist immer Phoenix Veritas. Wähle Namen, Farben und aktuelle Punkte für die übrigen Stämme.",
    initialTribeData: "Anfängliche Stammdaten",
    tribeName: "Stammesname",
  },
  simulation: {
    title: "GvG-Projektion für das Ende von Tag 3",
    subtitle: "Aktueller Zustand versus simulierter Zustand, falls Änderungen jetzt passieren.",
    eyebrow: "Ruinen und Endprojektion",
    day3Finish: "Ende von Tag 3",
    howToRead: "So liest du die Endtabelle:",
    noteLine1:
      "Punkte für die erste Eroberung = Bonus aus der Spalte für die erste Eroberung, der den aktuellen Punkten noch nicht hinzugefügt wurde.",
    noteLine2:
      "Punkte / Min = Punkte pro Minute, die jeder Stamm aktuell durch den simulierten Besitz erhält.",
    noteLine3:
      "Simuliertes Finale = aktuelle Punkte + ausstehender Bonus für die erste Eroberung + zukünftige Produktion bis zum Ende von Tag 3.",
    bastions: "Bastionen",
    valkyries: "Walküren",
    temple: "Tempel",
    finalSummary: "Endzusammenfassung",
    simulatedScoreEvolution: "Simulierte Punkteentwicklung",
    simulatedScoreEvolutionSubtitle:
      "Punktwachstum von jetzt bis zum Ende von Tag 3 unter Verwendung des simulierten Besitzes.",
  },
  home: {
    title: "Phoenix Veritas Toolkit",
    subtitle: "Wähle ein Werkzeug und behalte dieselbe Sprache in der ganzen App.",
    gvgEyebrow: "GvG",
    gvgTitle: "GvG-Punktesimulator",
    gvgDescription:
      "Konfiguriere die Stämme, aktuellen Punkte und den Besitz der Ruinen und projiziere dann das Ergebnis am Tagesende.",
    gvgButton: "GvG öffnen",
    enemyEyebrow: "Analyse",
    enemyTitle: "Analyse des gegnerischen Stammes",
    enemyDescription:
      "Scanne Screenshots, erkenne den Hauptarmee-Typ und sortiere gegnerische Chiefs nach Might.",
    enemyButton: "Analyse öffnen",
  },
  enemyAnalysis: {
    title: "Einen Ordner mit Fate-War-Screenshots scannen",
    subtitle:
      "Der Analysator liest den Namen des Chiefs, beide Might-Werte und die entscheidenden Artefakt-Slots.",
    inputEyebrow: "Eingabe",
    inputTitle: "Ordnerauswahl und Sortiermodus",
    inputSubtitle:
      "Wähle einen Ordner mit Screenshots von derselben Spielseite aus.",
    screenshotFolder: "Screenshot-Ordner",
    chooseFolder: "Hier klicken, um den Screenshot-Ordner auszuwählen",
    chooseFolderHelp:
      "Wähle den Ordner mit den Fate-War-Screenshots, die du analysieren möchtest. Die App liest die Dateien nur.",
    selectedFolder: "Ausgewählter Ordner",
    noFolderSelected: "Noch kein Ordner ausgewählt",
    orderBy: "Gegner sortieren nach",
    artifactNote:
      "Artefaktstufen werden nur aus der Farbe abgeleitet: grau 0, grün 1, blau 2, violett 3, gold 4, rot 5. Runenfarben werden nur als Tie-Breaker verwendet.",
    analyzing: "Analysiere",
    step: "Schritt",
    screenshotsAnalyzed: "Analysierte Screenshots",
    archers: "Bogenschützen",
    berserkers: "Berserker",
    cavalry: "Kavallerie",
    results: "Ergebnisse",
    chiefsClassified: "Chiefs klassifiziert als",
    noChiefsClassified: "Keine Chiefs klassifiziert als",
    name: "Name",
    individualMight: "Individuelle Might",
    heroMight: "Helden-Might",
    primaryBuild: "Haupt-Build",
    confidence: "Sicherheit",
    openFolderError: "Der ausgewählte Ordner konnte nicht geöffnet werden.",
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig",
  },
  errors: {
    allTribesMustHaveAName: "Alle Stämme müssen einen Namen haben.",
    tribeNamesMustBeUnique: "Stammesnamen müssen eindeutig sein.",
  },
  modeSelection: {
    eyebrow: "GvG-Simulator",
    title: "Modus wählen",
    subtitle: "Wähle, ob du im Tabellenmodus oder im visuellen Modus arbeiten möchtest.",
    tableTitle: "Tabellenmodus",
    tableDescription: "Aktueller Ablauf mit Listen-Setup und tabellenbasierter Simulation.",
    visualTitle: "Visueller Modus",
    visualDescription: "Neuer Ablauf mit positionsbasierter Kartenauswahl und visueller Simulation.",
  },
  setupVisual: {
    title: "Visuelles Setup",
    subtitle:
      "In diesem Modus wird die Farbe nicht manuell gewählt. Sie wird aus der auf der Karte gewählten Position abgeleitet.",
    nextStepTitle: "Nächster Schritt:",
    nextStepBody:
      "Wir werden dieses Setup durch eine kartenbasierte Version ersetzen, in der du jeden Stamm direkt einem Home-Spot zuweist.",
    backToModes: "Zurück zu den Modi",
  },
  simulationVisual: {
    eyebrow: "Visueller Modus",
    title: "Visuelle Simulation",
    subtitle:
      "Grundstruktur bereit. Als Nächstes verbinden wir das visuelle Setup mit der Karte und dann mit dem Besitz von Ruinen und Pässen.",
    calibrationOn: "Kalibrierung",
    calibrationOff: "Kalibrierung beenden",
    nextStepTitle: "Nächster Schritt",
    nextStepBodyLine1: "Wir werden diesen Platzhalter ersetzen durch:",
    nextStepBodyLine2:
      "1. visuelles Setup mit Stammzuweisung auf Home-Spots\n2. visuelle Simulation mit Ruinen, Pässen und Besitzern als Overlay",
  },
  mapCalibration: {
    pointLabel: "Punkt",
    copyCoordinates: "Koordinaten kopieren",
    reset: "Zurücksetzen",
    help:
      "Klicke auf einen Punkt, um ihn auszuwählen. Verwende die Pfeiltasten, um ihn um 0.2% zu verschieben. Verwende Umschalt + Pfeile für 1%.",
  },
};

export default de;