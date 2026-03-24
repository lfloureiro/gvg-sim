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
  home: {
    title: "Toolkit Phoenix Veritas",
    subtitle: "Scegli uno strumento e mantieni la stessa lingua in tutta l'applicazione.",
    gvgEyebrow: "GvG",
    gvgTitle: "Simulatore punteggio GvG",
    gvgDescription:
      "Configura le tribù, i punti correnti e il possesso delle rovine, poi proietta il risultato finale della giornata.",
    gvgButton: "Apri GvG",
    enemyEyebrow: "Analisi",
    enemyTitle: "Analisi tribù nemica",
    enemyDescription:
      "Leggi gli screenshot, rileva il tipo principale di esercito e ordina i capi nemici per potenza.",
    enemyButton: "Apri analisi",
  },
  enemyAnalysis: {
    title: "Analizza una cartella di screenshot di Fate War",
    subtitle:
      "L'analizzatore legge il nome del capo, i due valori di potenza e gli slot decisivi degli artefatti.",
    inputEyebrow: "Input",
    inputTitle: "Selezione cartella e modalità di ordinamento",
    inputSubtitle:
      "Seleziona una cartella con screenshot della stessa schermata di gioco.",
    screenshotFolder: "Cartella screenshot",
    chooseFolder: "Clicca qui per scegliere la cartella degli screenshot",
    chooseFolderHelp:
      "Seleziona la cartella che contiene gli screenshot di Fate War da analizzare. L'app legge solo i file.",
    selectedFolder: "Cartella selezionata",
    noFolderSelected: "Nessuna cartella selezionata",
    orderBy: "Ordina i nemici per",
    artifactNote:
      "I livelli degli artefatti derivano solo dal colore: grigio 0, verde 1, blu 2, viola 3, oro 4, rosso 5. I colori delle rune sono usati solo come spareggio.",
    analyzing: "Analisi in corso",
    step: "Passo",
    screenshotsAnalyzed: "Screenshot analizzati",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalry",
    results: "Risultati",
    chiefsClassified: "capi classificati come",
    noChiefsClassified: "Nessun capo classificato come",
    name: "Nome",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
    primaryBuild: "Build principale",
    confidence: "Affidabilità",
    openFolderError: "Impossibile aprire la cartella selezionata.",
    high: "Alta",
    medium: "Media",
    low: "Bassa",
  },
  errors: {
    allTribesMustHaveAName: "Tutte le tribù devono avere un nome.",
    tribeNamesMustBeUnique: "I nomi delle tribù devono essere unici.",
  },
};

export default it;