import type { AppText } from "./schema";

const de: AppText = {
  common: {
    language: "Sprache",
    version: "Version",
    noTribe: "— kein Stamm —",
    back: "Zurück",
    continue: "Weiter",
    copyCurrentToSimulation: "Aktuellen Stand in Simulation kopieren",
    currentDay: "Aktueller Tag",
    currentGmtTime: "Aktuelle GMT-Zeit",
    minutesRemainingToTheEnd: "Verbleibende Minuten bis zum Ende",
    currentPoints: "Aktuelle Punkte",
    firstCapture: "Erste Eroberung",
    pointsPerMinute: "Punkte / Min",
    finalIfUnchanged: "Endstand ohne Änderungen",
    finalSimulated: "Simulierter Endstand",
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
    title: "GvG-Projektion bis zum Ende von Tag 3",
    subtitle:
      "Aktueller Zustand im Vergleich zum simulierten Zustand, falls Änderungen jetzt passieren.",
    eyebrow: "Ruinen und Endprojektion",
    day3Finish: "Ende von Tag 3",
    howToRead: "So liest du die Endtabelle:",
    noteLine1:
      "Punkte für erste Eroberung = Bonus, der in der Spalte für erste Eroberung ausgewählt wurde und noch nicht zu den aktuellen Punkten addiert wurde.",
    noteLine2:
      "Punkte / Min = Punkte pro Minute, die jeder Stamm aktuell auf Basis des simulierten Besitzes erhält.",
    noteLine3:
      "Simulierter Endstand = aktuelle Punkte + ausstehender Bonus für erste Eroberung + zukünftige Produktion bis zum Ende von Tag 3.",
    bastions: "Bastionen",
    valkyries: "Walküren",
    temple: "Tempel",
    finalSummary: "Endzusammenfassung",
    simulatedScoreEvolution: "Simulierte Punkteentwicklung",
    simulatedScoreEvolutionSubtitle:
      "Punktewachstum von jetzt bis zum Ende von Tag 3 unter Verwendung des simulierten Besitzes.",
  },
  home: {
    title: "Phoenix Veritas Toolkit",
    subtitle:
      "Wähle ein Werkzeug und behalte dieselbe Sprache in der ganzen Anwendung.",
    gvgEyebrow: "GvG",
    gvgTitle: "GvG-Punktesimulator",
    gvgDescription:
      "Konfiguriere Stämme, aktuelle Punkte und Ruinenbesitz und projiziere dann das Endergebnis des Tages.",
    gvgButton: "GvG öffnen",
    enemyEyebrow: "Analyse",
    enemyTitle: "Analyse feindlicher Stämme",
    enemyDescription:
      "Lies Screenshots, erkenne den Hauptarmee-Typ und sortiere feindliche Anführer nach Stärke.",
    enemyButton: "Analyse öffnen",
  },
  enemyAnalysis: {
    title: "Ordner mit Fate War-Screenshots analysieren",
    subtitle:
      "Der Analysator liest den Namen des Anführers, beide Machtwerte und die entscheidenden Artefakt-Slots.",
    inputEyebrow: "Eingabe",
    inputTitle: "Ordnerauswahl und Sortierung",
    inputSubtitle:
      "Wähle einen Ordner mit Screenshots derselben Spielseite aus.",
    screenshotFolder: "Screenshot-Ordner",
    chooseFolder: "Hier klicken, um den Screenshot-Ordner auszuwählen",
    chooseFolderHelp:
      "Wähle den Ordner mit den Fate War-Screenshots aus. Die App liest die Dateien nur.",
    selectedFolder: "Ausgewählter Ordner",
    noFolderSelected: "Noch kein Ordner ausgewählt",
    orderBy: "Gegner sortieren nach",
    artifactNote:
      "Artefaktstufen werden nur aus der Farbe abgeleitet: grau 0, grün 1, blau 2, lila 3, gold 4, rot 5. Runenfarben dienen nur als Tie-Breaker.",
    analyzing: "Analysiere",
    step: "Schritt",
    screenshotsAnalyzed: "Analysierte Screenshots",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalry",
    results: "Ergebnisse",
    chiefsClassified: "Anführer klassifiziert als",
    noChiefsClassified: "Keine Anführer klassifiziert als",
    name: "Name",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
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
};

export default de;