import type { AppText } from "./schema";

const it: AppText = {
  common: {
    language: "Lingua",
    version: "Versione",
    noTribe: "— nessuna tribù —",
    back: "Indietro",
    continue: "Continua",
    copyCurrentToSimulation: "Copia l'attuale nella simulazione",
    currentDay: "Giorno attuale",
    currentGmtTime: "Ora GMT attuale",
    minutesRemainingToTheEnd: "Minuti rimanenti fino alla fine",
    currentPoints: "Punti attuali",
    firstCapture: "Prima conquista",
    pointsPerMinute: "Punti / min",
    finalIfUnchanged: "Finale senza cambiamenti",
    finalSimulated: "Finale simulato",
    difference: "Differenza",
    tribe: "Tribù",
    ruin: "Rovina",
    currentOwner: "Proprietario attuale",
    simulateIfChangedNow: "Simula se cambia adesso",
    day1: "Giorno 1",
    day2: "Giorno 2",
    day3: "Giorno 3",
    colour: "Colore",
    colours: {
      red: "Rosso",
      blue: "Blu",
      green: "Verde",
      yellow: "Giallo",
      purple: "Viola",
      orange: "Arancione",
      pink: "Rosa",
      mint: "Menta",
    },
  },
  setup: {
    title: "Simulatore Punti GvG",
    subtitle:
      "La Tribù 1 è sempre Phoenix Veritas. Scegli nomi, colori e punti attuali per le altre tribù.",
    initialTribeData: "Dati iniziali delle tribù",
    tribeName: "Nome della tribù",
  },
  simulation: {
    title: "Proiezione GvG fino alla fine del Giorno 3",
    subtitle:
      "Stato attuale contro stato simulato se i cambiamenti avvengono ora.",
    eyebrow: "Rovine e proiezione finale",
    day3Finish: "Fine del Giorno 3",
    howToRead: "Come leggere la tabella finale:",
    noteLine1:
      "Punti prima conquista = bonus selezionato nella colonna della prima conquista che non è ancora stato aggiunto ai punti attuali.",
    noteLine2:
      "Punti / min = punti al minuto che ogni tribù sta ricevendo in questo momento in base al possesso simulato.",
    noteLine3:
      "Finale simulato = punti attuali + bonus di prima conquista in sospeso + produzione futura fino alla fine del Giorno 3.",
    bastions: "Bastioni",
    valkyries: "Valchirie",
    temple: "Tempio",
    finalSummary: "Riepilogo finale",
    simulatedScoreEvolution: "Evoluzione simulata del punteggio",
    simulatedScoreEvolutionSubtitle:
      "Crescita del punteggio da adesso fino alla fine del Giorno 3, usando il possesso simulato.",
  },
  errors: {
    allTribesMustHaveAName: "Tutte le tribù devono avere un nome.",
    tribeNamesMustBeUnique: "I nomi delle tribù devono essere unici.",
  },
};

export default it;