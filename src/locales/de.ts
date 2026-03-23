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
  errors: {
    allTribesMustHaveAName: "Alle Stämme müssen einen Namen haben.",
    tribeNamesMustBeUnique: "Stammesnamen müssen eindeutig sein.",
  },
};

export default de;