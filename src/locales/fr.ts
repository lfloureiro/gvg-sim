import type { AppText } from "./schema";

const fr: AppText = {
  common: {
    language: "Langue",
    version: "Version",
    noTribe: "— aucune tribu —",
    back: "Retour",
    continue: "Continuer",
    copyCurrentToSimulation: "Copier l'état actuel vers la simulation",
    currentDay: "Jour actuel",
    currentGmtTime: "Heure GMT actuelle",
    minutesRemainingToTheEnd: "Minutes restantes jusqu'à la fin",
    currentPoints: "Points actuels",
    firstCapture: "Première capture",
    pointsPerMinute: "Points / min",
    finalIfUnchanged: "Final si inchangé",
    finalSimulated: "Final simulé",
    difference: "Différence",
    tribe: "Tribu",
    ruin: "Ruine",
    currentOwner: "Propriétaire actuel",
    simulateIfChangedNow: "Simuler si modifié maintenant",
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
      "La Tribu 1 est toujours Phoenix Veritas. Choisissez les noms, les couleurs et les points actuels des autres tribus.",
    initialTribeData: "Données initiales des tribus",
    tribeName: "Nom de la tribu",
  },
  simulation: {
    title: "Projection GvG pour la fin du Jour 3",
    subtitle: "État actuel contre état simulé si les changements se produisent maintenant.",
    eyebrow: "Ruines et projection finale",
    day3Finish: "Fin du Jour 3",
    howToRead: "Comment lire le tableau final :",
    noteLine1:
      "Points de première capture = bonus sélectionné dans la colonne de première capture qui n'a pas encore été ajouté aux points actuels.",
    noteLine2:
      "Points / min = points par minute que chaque tribu reçoit actuellement selon la possession simulée.",
    noteLine3:
      "Final simulé = points actuels + bonus de première capture en attente + production future jusqu'à la fin du Jour 3.",
    bastions: "Bastions",
    valkyries: "Valkyries",
    temple: "Temple",
    finalSummary: "Résumé final",
    simulatedScoreEvolution: "Évolution simulée du score",
    simulatedScoreEvolutionSubtitle:
      "Croissance du score à partir de maintenant jusqu'à la fin du Jour 3, en utilisant la possession simulée.",
  },
  home: {
    title: "Toolkit Phoenix Veritas",
    subtitle: "Choisissez un outil et gardez la même langue dans toute l'application.",
    gvgEyebrow: "GvG",
    gvgTitle: "Simulateur de score GvG",
    gvgDescription:
      "Configurez les tribus, les points actuels et la possession des ruines, puis projetez le résultat de fin de journée.",
    gvgButton: "Ouvrir GvG",
    enemyEyebrow: "Analyse",
    enemyTitle: "Analyse de la tribu ennemie",
    enemyDescription:
      "Analysez des captures d'écran, détectez le type principal d'armée et triez les chefs ennemis par might.",
    enemyButton: "Ouvrir l'analyse",
  },
  enemyAnalysis: {
    title: "Analyser un dossier de captures d'écran Fate War",
    subtitle:
      "L'analyseur lit le nom du chef, les deux valeurs de might et les emplacements d'artefacts décisifs.",
    inputEyebrow: "Entrée",
    inputTitle: "Sélection du dossier et mode de tri",
    inputSubtitle:
      "Sélectionnez un dossier contenant des captures d'écran de la même page du jeu.",
    screenshotFolder: "Dossier des captures d'écran",
    chooseFolder: "Cliquez ici pour choisir le dossier des captures d'écran",
    chooseFolderHelp:
      "Sélectionnez le dossier qui contient les captures d'écran Fate War que vous voulez analyser. L'application ne fait que lire les fichiers.",
    selectedFolder: "Dossier sélectionné",
    noFolderSelected: "Aucun dossier sélectionné pour le moment",
    orderBy: "Trier les ennemis par",
    artifactNote:
      "Les niveaux d'artefacts sont dérivés uniquement de la couleur : gris 0, vert 1, bleu 2, violet 3, or 4, rouge 5. Les couleurs des runes sont seulement utilisées comme critère de départage.",
    analyzing: "Analyse en cours",
    step: "Étape",
    screenshotsAnalyzed: "Captures d'écran analysées",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalerie",
    results: "Résultats",
    chiefsClassified: "chefs classés comme",
    noChiefsClassified: "Aucun chef classé comme",
    name: "Nom",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
    primaryBuild: "Build principal",
    confidence: "Confiance",
    openFolderError: "Impossible d'ouvrir le dossier sélectionné.",
    high: "Élevée",
    medium: "Moyenne",
    low: "Faible",
  },
  errors: {
    allTribesMustHaveAName: "Toutes les tribus doivent avoir un nom.",
    tribeNamesMustBeUnique: "Les noms des tribus doivent être uniques.",
  },
  modeSelection: {
    eyebrow: "Simulateur GvG",
    title: "Choisir le mode",
    subtitle: "Choisissez si vous voulez travailler en mode tableau ou en mode visuel.",
    tableTitle: "Mode Tableau",
    tableDescription: "Flux actuel avec configuration en liste et simulation basée sur des tableaux.",
    visualTitle: "Mode Visuel",
    visualDescription: "Nouveau flux avec sélection des positions sur la carte et simulation visuelle.",
  },
  setupVisual: {
    title: "Configuration Visuelle",
    subtitle:
      "Dans ce mode, la couleur n'est pas choisie manuellement. Elle sera dérivée de la position sélectionnée sur la carte.",
    nextStepTitle: "Prochaine étape :",
    nextStepBody:
      "Nous allons remplacer cette configuration par une version basée sur la carte, où vous attribuez chaque tribu directement à un home spot.",
    backToModes: "Retour aux modes",
  },
  simulationVisual: {
    eyebrow: "Mode Visuel",
    title: "Simulation Visuelle",
    subtitle:
      "Structure de base prête. Ensuite, nous relierons la configuration visuelle à la carte puis à la possession des ruines et des passages.",
    calibrationOn: "Calibration",
    calibrationOff: "Quitter la calibration",
    nextStepTitle: "Prochaine étape",
    nextStepBodyLine1: "Nous allons remplacer ce placeholder par :",
    nextStepBodyLine2:
      "1. configuration visuelle avec attribution des tribus aux home spots\n2. simulation visuelle avec ruines, passages et propriétaires en overlay",
  },
  mapCalibration: {
    pointLabel: "Point",
    copyCoordinates: "Copier les coordonnées",
    reset: "Réinitialiser",
    help:
      "Cliquez sur un point pour le sélectionner. Utilisez les flèches pour le déplacer de 0.2%. Utilisez Maj + flèches pour le déplacer de 1%.",
  },
};

export default fr;