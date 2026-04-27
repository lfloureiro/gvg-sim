import type { Language } from "../types";

export type AppText = {
  common: {
    language: string;
    version: string;
    backToHome: string;
    reset: string;
    switchToTableMode: string;
    switchToVisualMode: string;
    tribes: string;
    visualTribesHelp: string;
    noTribe: string;
    back: string;
    continue: string;
    copyCurrentToSimulation: string;
    currentDay: string;
    currentGmtTime: string;
    minutesRemainingToTheEnd: string;
    currentPoints: string;
    firstCapture: string;
    pointsPerMinute: string;
    finalIfUnchanged: string;
    finalSimulated: string;
    difference: string;
    tribe: string;
    ruin: string;
    currentOwner: string;
    simulateIfChangedNow: string;
    day1: string;
    day2: string;
    day3: string;
    colour: string;
    colours: {
      red: string;
      blue: string;
      green: string;
      yellow: string;
      purple: string;
      orange: string;
      pink: string;
      mint: string;
    };
  };
  home: {
    title: string;
    subtitle: string;
    gvgEyebrow: string;
    gvgTitle: string;
    gvgDescription: string;
    gvgButton: string;
    enemyEyebrow: string;
    enemyTitle: string;
    enemyDescription: string;
    enemyButton: string;
  };
  setup: {
    title: string;
    subtitle: string;
    initialTribeData: string;
    tribeName: string;
  };
  simulation: {
    title: string;
    subtitle: string;
    eyebrow: string;
    day3Finish: string;
    howToRead: string;
    noteLine1: string;
    noteLine2: string;
    noteLine3: string;
    bastions: string;
    valkyries: string;
    temple: string;
    finalSummary: string;
    simulatedScoreEvolution: string;
    simulatedScoreEvolutionSubtitle: string;
  };
  enemyAnalysis: {
    title: string;
    subtitle: string;
    inputEyebrow: string;
    inputTitle: string;
    inputSubtitle: string;
    screenshotFolder: string;
    chooseFolder: string;
    chooseFolderHelp: string;
    selectedFolder: string;
    noFolderSelected: string;
    orderBy: string;
    artifactNote: string;
    analyzing: string;
    step: string;
    screenshotsAnalyzed: string;
    archers: string;
    berserkers: string;
    cavalry: string;
    results: string;
    chiefsClassified: string;
    noChiefsClassified: string;
    name: string;
    individualMight: string;
    heroMight: string;
    primaryBuild: string;
    confidence: string;
    openFolderError: string;
    high: string;
    medium: string;
    low: string;
  };
  errors: {
    allTribesMustHaveAName: string;
    tribeNamesMustBeUnique: string;
  };
  modeSelection: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tableTitle: string;
    tableDescription: string;
    visualTitle: string;
    visualDescription: string;
  };

  setupVisual: {
    title: string;
    subtitle: string;
    nextStepTitle: string;
    nextStepBody: string;
    backToModes: string;
  };

  simulationVisual: {
    eyebrow: string;
    title: string;
    subtitle: string;
    calibrationOn: string;
    calibrationOff: string;
    nextStepTitle: string;
    nextStepBodyLine1: string;
    nextStepBodyLine2: string;
  };

  mapCalibration: {
    pointLabel: string;
    copyCoordinates: string;
    reset: string;
    help: string;
  };
};

export type TranslationMap = Record<Language, AppText>;