import type { Language } from "../types";

export type AppText = {
  common: {
    language: string;
    version: string;
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
  errors: {
    allTribesMustHaveAName: string;
    tribeNamesMustBeUnique: string;
  };
};

export type TranslationMap = Record<Language, AppText>;