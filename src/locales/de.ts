import type { AppText } from "./schema";

const de: AppText = {
  common: {
    language: "Sprache",
    version: "Version",
    noTribe: "â€” kein Stamm â€”",
    back: "ZurÃ¼ck",
    continue: "Weiter",
    copyCurrentToSimulation: "Aktuellen Zustand in Simulation kopieren",
    currentDay: "Aktueller Tag",
    currentGmtTime: "Aktuelle GMT-Zeit",
    minutesRemainingToTheEnd: "Verbleibende Minuten bis zum Ende",
    currentPoints: "Aktuelle Punkte",
    firstCapture: "Erste Eroberung",
    pointsPerMinute: "Punkte / Min",
    finalIfUnchanged: "Final bei unverÃ¤ndertem Zustand",
    finalSimulated: "Simuliertes Finale",
    difference: "Differenz",
    tribe: "Stamm",
    ruin: "Ruine",
    currentOwner: "Aktueller Besitzer",
    simulateIfChangedNow: "Simulieren, wenn jetzt geÃ¤ndert",
    day1: "Tag 1",
    day2: "Tag 2",
    day3: "Tag 3",
    colour: "Farbe",
    colours: {
      red: "Rot",
      blue: "Blau",
      green: "GrÃ¼n",
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
      "Stamm 1 ist immer MF69. WÃ¤hle Namen, Farben und aktuelle Punkte fÃ¼r die Ã¼brigen StÃ¤mme.",
    initialTribeData: "AnfÃ¤ngliche Stammdaten",
    tribeName: "Stammesname",
  },
  simulation: {
    title: "GvG-Projektion fÃ¼r das Ende von Tag 3",
    subtitle: "Aktueller Zustand versus simulierter Zustand, falls Ã„nderungen jetzt passieren.",
    eyebrow: "Ruinen und Endprojektion",
    day3Finish: "Ende von Tag 3",
    howToRead: "So liest du die Endtabelle:",
    noteLine1:
      "Punkte fÃ¼r die erste Eroberung = Bonus aus der Spalte fÃ¼r die erste Eroberung, der den aktuellen Punkten noch nicht hinzugefÃ¼gt wurde.",
    noteLine2:
      "Punkte / Min = Punkte pro Minute, die jeder Stamm aktuell durch den simulierten Besitz erhÃ¤lt.",
    noteLine3:
      "Simuliertes Finale = aktuelle Punkte + ausstehender Bonus fÃ¼r die erste Eroberung + zukÃ¼nftige Produktion bis zum Ende von Tag 3.",
    bastions: "Bastionen",
    valkyries: "WalkÃ¼ren",
    temple: "Tempel",
    finalSummary: "Endzusammenfassung",
    simulatedScoreEvolution: "Simulierte Punkteentwicklung",
    simulatedScoreEvolutionSubtitle:
      "Punktwachstum von jetzt bis zum Ende von Tag 3 unter Verwendung des simulierten Besitzes.",
  },
  home: {
    title: "MF69 Toolkit",
    subtitle: "WÃ¤hle ein Werkzeug und behalte dieselbe Sprache in der ganzen App.",
    gvgEyebrow: "GvG",
    gvgTitle: "GvG-Punktesimulator",
    gvgDescription:
      "Konfiguriere die StÃ¤mme, aktuellen Punkte und den Besitz der Ruinen und projiziere dann das Ergebnis am Tagesende.",
    gvgButton: "GvG Ã¶ffnen",
    enemyEyebrow: "Analyse",
    enemyTitle: "Analyse des gegnerischen Stammes",
    enemyDescription:
      "Scanne Screenshots, erkenne den Hauptarmee-Typ und sortiere gegnerische Chiefs nach Might.",
    enemyButton: "Analyse Ã¶ffnen",
  },
  enemyAnalysis: {
    title: "Einen Ordner mit Fate-War-Screenshots scannen",
    subtitle:
      "Der Analysator liest den Namen des Chiefs, beide Might-Werte und die entscheidenden Artefakt-Slots.",
    inputEyebrow: "Eingabe",
    inputTitle: "Ordnerauswahl und Sortiermodus",
    inputSubtitle:
      "WÃ¤hle einen Ordner mit Screenshots von derselben Spielseite aus.",
    screenshotFolder: "Screenshot-Ordner",
    chooseFolder: "Hier klicken, um den Screenshot-Ordner auszuwÃ¤hlen",
    chooseFolderHelp:
      "WÃ¤hle den Ordner mit den Fate-War-Screenshots, die du analysieren mÃ¶chtest. Die App liest die Dateien nur.",
    selectedFolder: "AusgewÃ¤hlter Ordner",
    noFolderSelected: "Noch kein Ordner ausgewÃ¤hlt",
    orderBy: "Gegner sortieren nach",
    artifactNote:
      "Artefaktstufen werden nur aus der Farbe abgeleitet: grau 0, grÃ¼n 1, blau 2, violett 3, gold 4, rot 5. Runenfarben werden nur als Tie-Breaker verwendet.",
    analyzing: "Analysiere",
    step: "Schritt",
    screenshotsAnalyzed: "Analysierte Screenshots",
    archers: "BogenschÃ¼tzen",
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
    openFolderError: "Der ausgewÃ¤hlte Ordner konnte nicht geÃ¶ffnet werden.",
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig",
  },
  errors: {
    allTribesMustHaveAName: "Alle StÃ¤mme mÃ¼ssen einen Namen haben.",
    tribeNamesMustBeUnique: "Stammesnamen mÃ¼ssen eindeutig sein.",
  },
  modeSelection: {
    eyebrow: "GvG-Simulator",
    title: "Modus wÃ¤hlen",
    subtitle: "WÃ¤hle, ob du im Tabellenmodus oder im visuellen Modus arbeiten mÃ¶chtest.",
    tableTitle: "Tabellenmodus",
    tableDescription: "Aktueller Ablauf mit Listen-Setup und tabellenbasierter Simulation.",
    visualTitle: "Visueller Modus",
    visualDescription: "Neuer Ablauf mit positionsbasierter Kartenauswahl und visueller Simulation.",
  },
  setupVisual: {
    title: "Visuelles Setup",
    subtitle:
      "In diesem Modus wird die Farbe nicht manuell gewÃ¤hlt. Sie wird aus der auf der Karte gewÃ¤hlten Position abgeleitet.",
    nextStepTitle: "NÃ¤chster Schritt:",
    nextStepBody:
      "Wir werden dieses Setup durch eine kartenbasierte Version ersetzen, in der du jeden Stamm direkt einem Home-Spot zuweist.",
    backToModes: "ZurÃ¼ck zu den Modi",
  },
  simulationVisual: {
    eyebrow: "Visueller Modus",
    title: "Visuelle Simulation",
    subtitle:
      "Grundstruktur bereit. Als NÃ¤chstes verbinden wir das visuelle Setup mit der Karte und dann mit dem Besitz von Ruinen und PÃ¤ssen.",
    calibrationOn: "Kalibrierung",
    calibrationOff: "Kalibrierung beenden",
    nextStepTitle: "NÃ¤chster Schritt",
    nextStepBodyLine1: "Wir werden diesen Platzhalter ersetzen durch:",
    nextStepBodyLine2:
      "1. visuelles Setup mit Stammzuweisung auf Home-Spots\n2. visuelle Simulation mit Ruinen, PÃ¤ssen und Besitzern als Overlay",
  },
  mapCalibration: {
    pointLabel: "Punkt",
    copyCoordinates: "Koordinaten kopieren",
    reset: "ZurÃ¼cksetzen",
    help:
      "Klicke auf einen Punkt, um ihn auszuwÃ¤hlen. Verwende die Pfeiltasten, um ihn um 0.2% zu verschieben. Verwende Umschalt + Pfeile fÃ¼r 1%.",
  },
};

export default de;

