import type { AppText } from "./schema";

const fr: AppText = {
  common: {
    language: "Langue",
    version: "Version",
    noTribe: "â€” aucune tribu â€”",
    back: "Retour",
    continue: "Continuer",
    copyCurrentToSimulation: "Copier l'Ã©tat actuel vers la simulation",
    currentDay: "Jour actuel",
    currentGmtTime: "Heure GMT actuelle",
    minutesRemainingToTheEnd: "Minutes restantes jusqu'Ã  la fin",
    currentPoints: "Points actuels",
    firstCapture: "PremiÃ¨re capture",
    pointsPerMinute: "Points / min",
    finalIfUnchanged: "Final si inchangÃ©",
    finalSimulated: "Final simulÃ©",
    difference: "DiffÃ©rence",
    tribe: "Tribu",
    ruin: "Ruine",
    currentOwner: "PropriÃ©taire actuel",
    simulateIfChangedNow: "Simuler si modifiÃ© maintenant",
    day1: "Jour 1",
    day2: "Jour 2",
    day3: "Jour 3",
    colour: "Couleur",
    colours: {
      red: "Rouge",
      blue: "Bleu",
      green: "Vert",
      yellow: "Jaune",
      purple: "Violet",
      orange: "Orange",
      pink: "Rose",
      mint: "Menthe",
    },
  },
  setup: {
    title: "Simulateur de score GvG",
    subtitle:
      "La Tribu 1 est toujours MF69. Choisissez les noms, les couleurs et les points actuels des autres tribus.",
    initialTribeData: "DonnÃ©es initiales des tribus",
    tribeName: "Nom de la tribu",
  },
  simulation: {
    title: "Projection GvG pour la fin du Jour 3",
    subtitle: "Ã‰tat actuel contre Ã©tat simulÃ© si les changements se produisent maintenant.",
    eyebrow: "Ruines et projection finale",
    day3Finish: "Fin du Jour 3",
    howToRead: "Comment lire le tableau final :",
    noteLine1:
      "Points de premiÃ¨re capture = bonus sÃ©lectionnÃ© dans la colonne de premiÃ¨re capture qui n'a pas encore Ã©tÃ© ajoutÃ© aux points actuels.",
    noteLine2:
      "Points / min = points par minute que chaque tribu reÃ§oit actuellement selon la possession simulÃ©e.",
    noteLine3:
      "Final simulÃ© = points actuels + bonus de premiÃ¨re capture en attente + production future jusqu'Ã  la fin du Jour 3.",
    bastions: "Bastions",
    valkyries: "Valkyries",
    temple: "Temple",
    finalSummary: "RÃ©sumÃ© final",
    simulatedScoreEvolution: "Ã‰volution simulÃ©e du score",
    simulatedScoreEvolutionSubtitle:
      "Croissance du score Ã  partir de maintenant jusqu'Ã  la fin du Jour 3, en utilisant la possession simulÃ©e.",
  },
  home: {
    title: "MF69 Toolkit",
    subtitle: "Choisissez un outil et gardez la mÃªme langue dans toute l'application.",
    gvgEyebrow: "GvG",
    gvgTitle: "Simulateur de score GvG",
    gvgDescription:
      "Configurez les tribus, les points actuels et la possession des ruines, puis projetez le rÃ©sultat de fin de journÃ©e.",
    gvgButton: "Ouvrir GvG",
    enemyEyebrow: "Analyse",
    enemyTitle: "Analyse de la tribu ennemie",
    enemyDescription:
      "Analysez des captures d'Ã©cran, dÃ©tectez le type principal d'armÃ©e et triez les chefs ennemis par might.",
    enemyButton: "Ouvrir l'analyse",
  },
  enemyAnalysis: {
    title: "Analyser un dossier de captures d'Ã©cran Fate War",
    subtitle:
      "L'analyseur lit le nom du chef, les deux valeurs de might et les emplacements d'artefacts dÃ©cisifs.",
    inputEyebrow: "EntrÃ©e",
    inputTitle: "SÃ©lection du dossier et mode de tri",
    inputSubtitle:
      "SÃ©lectionnez un dossier contenant des captures d'Ã©cran de la mÃªme page du jeu.",
    screenshotFolder: "Dossier des captures d'Ã©cran",
    chooseFolder: "Cliquez ici pour choisir le dossier des captures d'Ã©cran",
    chooseFolderHelp:
      "SÃ©lectionnez le dossier qui contient les captures d'Ã©cran Fate War que vous voulez analyser. L'application ne fait que lire les fichiers.",
    selectedFolder: "Dossier sÃ©lectionnÃ©",
    noFolderSelected: "Aucun dossier sÃ©lectionnÃ© pour le moment",
    orderBy: "Trier les ennemis par",
    artifactNote:
      "Les niveaux d'artefacts sont dÃ©rivÃ©s uniquement de la couleur : gris 0, vert 1, bleu 2, violet 3, or 4, rouge 5. Les couleurs des runes sont seulement utilisÃ©es comme critÃ¨re de dÃ©partage.",
    analyzing: "Analyse en cours",
    step: "Ã‰tape",
    screenshotsAnalyzed: "Captures d'Ã©cran analysÃ©es",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalerie",
    results: "RÃ©sultats",
    chiefsClassified: "chefs classÃ©s comme",
    noChiefsClassified: "Aucun chef classÃ© comme",
    name: "Nom",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
    primaryBuild: "Build principal",
    confidence: "Confiance",
    openFolderError: "Impossible d'ouvrir le dossier sÃ©lectionnÃ©.",
    high: "Ã‰levÃ©e",
    medium: "Moyenne",
    low: "Faible",
  },
  errors: {
    allTribesMustHaveAName: "Toutes les tribus doivent avoir un nom.",
    tribeNamesMustBeUnique: "Les noms des tribus doivent Ãªtre uniques.",
  },
  modeSelection: {
    eyebrow: "Simulateur GvG",
    title: "Choisir le mode",
    subtitle: "Choisissez si vous voulez travailler en mode tableau ou en mode visuel.",
    tableTitle: "Mode Tableau",
    tableDescription: "Flux actuel avec configuration en liste et simulation basÃ©e sur des tableaux.",
    visualTitle: "Mode Visuel",
    visualDescription: "Nouveau flux avec sÃ©lection des positions sur la carte et simulation visuelle.",
  },
  setupVisual: {
    title: "Configuration Visuelle",
    subtitle:
      "Dans ce mode, la couleur n'est pas choisie manuellement. Elle sera dÃ©rivÃ©e de la position sÃ©lectionnÃ©e sur la carte.",
    nextStepTitle: "Prochaine Ã©tape :",
    nextStepBody:
      "Nous allons remplacer cette configuration par une version basÃ©e sur la carte, oÃ¹ vous attribuez chaque tribu directement Ã  un home spot.",
    backToModes: "Retour aux modes",
  },
  simulationVisual: {
    eyebrow: "Mode Visuel",
    title: "Simulation Visuelle",
    subtitle:
      "Structure de base prÃªte. Ensuite, nous relierons la configuration visuelle Ã  la carte puis Ã  la possession des ruines et des passages.",
    calibrationOn: "Calibration",
    calibrationOff: "Quitter la calibration",
    nextStepTitle: "Prochaine Ã©tape",
    nextStepBodyLine1: "Nous allons remplacer ce placeholder par :",
    nextStepBodyLine2:
      "1. configuration visuelle avec attribution des tribus aux home spots\n2. simulation visuelle avec ruines, passages et propriÃ©taires en overlay",
  },
  mapCalibration: {
    pointLabel: "Point",
    copyCoordinates: "Copier les coordonnÃ©es",
    reset: "RÃ©initialiser",
    help:
      "Cliquez sur un point pour le sÃ©lectionner. Utilisez les flÃ¨ches pour le dÃ©placer de 0.2%. Utilisez Maj + flÃ¨ches pour le dÃ©placer de 1%.",
  },
};

export default fr;

