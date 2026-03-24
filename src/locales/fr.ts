import type { AppText } from "./schema";

const fr: AppText = {
  common: {
    language: "Langue",
    version: "Version",
    noTribe: "— aucune tribu —",
    back: "Retour",
    continue: "Continuer",
    copyCurrentToSimulation: "Copier l'état actuel dans la simulation",
    currentDay: "Jour actuel",
    currentGmtTime: "Heure GMT actuelle",
    minutesRemainingToTheEnd: "Minutes restantes jusqu'à la fin",
    currentPoints: "Points actuels",
    firstCapture: "Première capture",
    pointsPerMinute: "Points / min",
    finalIfUnchanged: "Final sans changement",
    finalSimulated: "Final simulé",
    difference: "Différence",
    tribe: "Tribu",
    ruin: "Ruine",
    currentOwner: "Propriétaire actuel",
    simulateIfChangedNow: "Simuler si cela change maintenant",
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
    title: "Simulateur de points GvG",
    subtitle:
      "La tribu 1 est toujours Phoenix Veritas. Choisissez les noms, les couleurs et les points actuels des autres tribus.",
    initialTribeData: "Données initiales des tribus",
    tribeName: "Nom de la tribu",
  },
  simulation: {
    title: "Projection GvG jusqu'à la fin du Jour 3",
    subtitle:
      "État actuel versus état simulé si les changements se produisent maintenant.",
    eyebrow: "Ruines et projection finale",
    day3Finish: "Fin du Jour 3",
    howToRead: "Comment lire le tableau final :",
    noteLine1:
      "Points de première capture = bonus sélectionné dans la colonne de première capture et pas encore ajouté aux points actuels.",
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
    title: "Outils Phoenix Veritas",
    subtitle: "Choisissez un outil et gardez la même langue dans toute l'application.",
    gvgEyebrow: "GvG",
    gvgTitle: "Simulateur de score GvG",
    gvgDescription:
      "Configurez les tribus, les points actuels et la possession des ruines, puis projetez le résultat final de la journée.",
    gvgButton: "Ouvrir GvG",
    enemyEyebrow: "Analyse",
    enemyTitle: "Analyse de tribu ennemie",
    enemyDescription:
      "Lisez les captures, détectez le type principal d'armée et triez les chefs ennemis par puissance.",
    enemyButton: "Ouvrir l'analyse",
  },
  enemyAnalysis: {
    title: "Analyser un dossier de captures Fate War",
    subtitle:
      "L'analyseur lit le nom du chef, les deux valeurs de puissance et les emplacements décisifs des artefacts.",
    inputEyebrow: "Entrée",
    inputTitle: "Sélection du dossier et tri",
    inputSubtitle:
      "Sélectionnez un dossier contenant des captures de la même page du jeu.",
    screenshotFolder: "Dossier des captures",
    chooseFolder: "Cliquez ici pour choisir le dossier des captures",
    chooseFolderHelp:
      "Sélectionnez le dossier contenant les captures Fate War à analyser. L'application lit seulement les fichiers.",
    selectedFolder: "Dossier sélectionné",
    noFolderSelected: "Aucun dossier sélectionné",
    orderBy: "Trier les ennemis par",
    artifactNote:
      "Les niveaux des artefacts sont déduits uniquement de la couleur : gris 0, vert 1, bleu 2, violet 3, or 4, rouge 5. Les couleurs des runes ne servent qu'en cas d'égalité.",
    analyzing: "Analyse en cours",
    step: "Étape",
    screenshotsAnalyzed: "Captures analysées",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalry",
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
};

export default fr;