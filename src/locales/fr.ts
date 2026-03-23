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
  errors: {
    allTribesMustHaveAName: "Toutes les tribus doivent avoir un nom.",
    tribeNamesMustBeUnique: "Les noms des tribus doivent être uniques.",
  },
};

export default fr;