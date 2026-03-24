import type { AppText } from "./schema";

const en: AppText = {
  common: {
    language: "Language",
    version: "Version",
    noTribe: "— no tribe —",
    back: "Back",
    continue: "Continue",
    copyCurrentToSimulation: "Copy current to simulation",
    currentDay: "Current day",
    currentGmtTime: "Current GMT time",
    minutesRemainingToTheEnd: "Minutes remaining to the end",
    currentPoints: "Current points",
    firstCapture: "First capture",
    pointsPerMinute: "Points / min",
    finalIfUnchanged: "Final if unchanged",
    finalSimulated: "Final simulated",
    difference: "Difference",
    tribe: "Tribe",
    ruin: "Ruin",
    currentOwner: "Current owner",
    simulateIfChangedNow: "Simulate if changed now",
    day1: "Day 1",
    day2: "Day 2",
    day3: "Day 3",
    colour: "Colour",
    colours: {
      red: "Red",
      blue: "Blue",
      green: "Green",
      yellow: "Yellow",
      purple: "Purple",
      orange: "Orange",
      pink: "Pink",
      mint: "Mint",
    },
  },
  setup: {
    title: "GvG Score Simulator",
    subtitle:
      "Tribe 1 is always Phoenix Veritas. Choose names, colours and current points for the remaining tribes.",
    initialTribeData: "Initial tribe data",
    tribeName: "Tribe name",
  },
  simulation: {
    title: "GvG End of Day 3 Projection",
    subtitle: "Current state versus simulated state if changes happen now.",
    eyebrow: "Ruins and final projection",
    day3Finish: "Day 3 finish",
    howToRead: "How to read the final table:",
    noteLine1:
      "First-capture points = bonus selected in the first-capture column that has not yet been added to the current points.",
    noteLine2:
      "Points / min = points per minute each tribe is receiving from the simulated ownership right now.",
    noteLine3:
      "Final simulated = current points + pending first-capture bonus + future production until the end of Day 3.",
    bastions: "Bastions",
    valkyries: "Valkyries",
    temple: "Temple",
    finalSummary: "Final summary",
    simulatedScoreEvolution: "Simulated score evolution",
    simulatedScoreEvolutionSubtitle:
      "Score growth from now until the end of Day 3, using the simulated ownership.",
  },
  home: {
    title: "Phoenix Veritas toolkit",
    subtitle: "Choose a tool and keep the same language across the whole app.",
    gvgEyebrow: "GvG",
    gvgTitle: "GvG score simulator",
    gvgDescription:
      "Configure the tribes, current points and ruin ownership, then project the end-of-day result.",
    gvgButton: "Open GvG",
    enemyEyebrow: "Analysis",
    enemyTitle: "Enemy tribe analysis",
    enemyDescription:
      "Scan screenshots, detect the main army type and sort enemy chiefs by might.",
    enemyButton: "Open analysis",
  },
  enemyAnalysis: {
    title: "Scan a folder of Fate War screenshots",
    subtitle:
      "The analyzer reads the chief name, both might values and the decisive artifact slots.",
    inputEyebrow: "Input",
    inputTitle: "Folder selection and sort mode",
    inputSubtitle:
      "Select a folder with screenshots from the same in-game page.",
    screenshotFolder: "Screenshot folder",
    chooseFolder: "Click here to choose the screenshots folder",
    chooseFolderHelp:
      "Select the folder that contains the Fate War screenshots you want to analyse. The app only reads the files.",
    selectedFolder: "Selected folder",
    noFolderSelected: "No folder selected yet",
    orderBy: "Order enemies by",
    artifactNote:
      "Artifact levels are derived from color only: grey 0, green 1, blue 2, purple 3, gold 4, red 5. Rune colors are only used as a tie breaker.",
    analyzing: "Analyzing",
    step: "Step",
    screenshotsAnalyzed: "Screenshots analyzed",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalry",
    results: "Results",
    chiefsClassified: "chiefs classified as",
    noChiefsClassified: "No chiefs classified as",
    name: "Name",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
    primaryBuild: "Primary build",
    confidence: "Confidence",
    openFolderError: "Could not open the selected folder.",
    high: "High",
    medium: "Medium",
    low: "Low",
  },
  errors: {
    allTribesMustHaveAName: "All tribes must have a name.",
    tribeNamesMustBeUnique: "Tribe names must be unique.",
  },
};

export default en;