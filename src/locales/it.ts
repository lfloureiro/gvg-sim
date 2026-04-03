import type { AppText } from "./schema";

const it: AppText = {
  common: {
    language: "Lingua",
    version: "Versione",
    noTribe: "— nessuna tribù —",
    back: "Indietro",
    continue: "Continua",
    copyCurrentToSimulation: "Copia lo stato attuale nella simulazione",
    currentDay: "Giorno attuale",
    currentGmtTime: "Ora GMT attuale",
    minutesRemainingToTheEnd: "Minuti rimanenti alla fine",
    currentPoints: "Punti attuali",
    firstCapture: "Prima conquista",
    pointsPerMinute: "Punti / min",
    finalIfUnchanged: "Finale se invariato",
    finalSimulated: "Finale simulato",
    difference: "Differenza",
    tribe: "Tribù",
    ruin: "Rovina",
    currentOwner: "Proprietario attuale",
    simulateIfChangedNow: "Simula se cambiato ora",
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
    title: "Simulatore punteggio GvG",
    subtitle:
      "La Tribù 1 è sempre Phoenix Veritas. Scegli nomi, colori e punti attuali per le altre tribù.",
    initialTribeData: "Dati iniziali delle tribù",
    tribeName: "Nome della tribù",
  },
  simulation: {
    title: "Proiezione GvG fine Giorno 3",
    subtitle: "Stato attuale contro stato simulato se i cambiamenti avvengono ora.",
    eyebrow: "Rovine e proiezione finale",
    day3Finish: "Fine Giorno 3",
    howToRead: "Come leggere la tabella finale:",
    noteLine1:
      "Punti di prima conquista = bonus selezionato nella colonna della prima conquista che non è ancora stato aggiunto ai punti attuali.",
    noteLine2:
      "Punti / min = punti al minuto che ogni tribù sta ricevendo in questo momento in base alla proprietà simulata.",
    noteLine3:
      "Finale simulato = punti attuali + bonus di prima conquista in sospeso + produzione futura fino alla fine del Giorno 3.",
    bastions: "Bastioni",
    valkyries: "Valchirie",
    temple: "Tempio",
    finalSummary: "Riepilogo finale",
    simulatedScoreEvolution: "Evoluzione simulata del punteggio",
    simulatedScoreEvolutionSubtitle:
      "Crescita del punteggio da ora fino alla fine del Giorno 3, usando la proprietà simulata.",
  },
  home: {
    title: "Toolkit Phoenix Veritas",
    subtitle: "Scegli uno strumento e mantieni la stessa lingua in tutta l'app.",
    gvgEyebrow: "GvG",
    gvgTitle: "Simulatore punteggio GvG",
    gvgDescription:
      "Configura le tribù, i punti attuali e la proprietà delle rovine, poi proietta il risultato di fine giornata.",
    gvgButton: "Apri GvG",
    enemyEyebrow: "Analisi",
    enemyTitle: "Analisi della tribù nemica",
    enemyDescription:
      "Scansiona screenshot, rileva il tipo principale di esercito e ordina i capi nemici per might.",
    enemyButton: "Apri analisi",
  },
  enemyAnalysis: {
    title: "Analizza una cartella di screenshot di Fate War",
    subtitle:
      "L'analizzatore legge il nome del capo, entrambi i valori di might e gli slot decisivi degli artefatti.",
    inputEyebrow: "Input",
    inputTitle: "Selezione cartella e modalità di ordinamento",
    inputSubtitle:
      "Seleziona una cartella con screenshot della stessa pagina del gioco.",
    screenshotFolder: "Cartella screenshot",
    chooseFolder: "Clicca qui per scegliere la cartella degli screenshot",
    chooseFolderHelp:
      "Seleziona la cartella che contiene gli screenshot di Fate War che vuoi analizzare. L'app legge soltanto i file.",
    selectedFolder: "Cartella selezionata",
    noFolderSelected: "Nessuna cartella selezionata",
    orderBy: "Ordina i nemici per",
    artifactNote:
      "I livelli degli artefatti sono derivati solo dal colore: grigio 0, verde 1, blu 2, viola 3, oro 4, rosso 5. I colori delle rune sono usati solo come spareggio.",
    analyzing: "Analisi in corso",
    step: "Passo",
    screenshotsAnalyzed: "Screenshot analizzati",
    archers: "Arcieri",
    berserkers: "Berserker",
    cavalry: "Cavalleria",
    results: "Risultati",
    chiefsClassified: "capi classificati come",
    noChiefsClassified: "Nessun capo classificato come",
    name: "Nome",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
    primaryBuild: "Build principale",
    confidence: "Confidenza",
    openFolderError: "Impossibile aprire la cartella selezionata.",
    high: "Alta",
    medium: "Media",
    low: "Bassa",
  },
  errors: {
    allTribesMustHaveAName: "Tutte le tribù devono avere un nome.",
    tribeNamesMustBeUnique: "I nomi delle tribù devono essere unici.",
  },
  modeSelection: {
    eyebrow: "Simulatore GvG",
    title: "Scegli modalità",
    subtitle: "Scegli se vuoi lavorare in modalità tabella o in modalità visuale.",
    tableTitle: "Modalità Tabella",
    tableDescription: "Flusso attuale con configurazione in elenco e simulazione basata su tabelle.",
    visualTitle: "Modalità Visuale",
    visualDescription: "Nuovo flusso con selezione delle posizioni sulla mappa e simulazione visuale.",
  },
  setupVisual: {
    title: "Configurazione Visuale",
    subtitle:
      "In questa modalità, il colore non viene scelto manualmente. Sarà derivato dalla posizione selezionata sulla mappa.",
    nextStepTitle: "Prossimo passo:",
    nextStepBody:
      "Sostituiremo questa configurazione con una versione basata sulla mappa, in cui assegni ogni tribù direttamente a un home spot.",
    backToModes: "Torna alle modalità",
  },
  simulationVisual: {
    eyebrow: "Modalità Visuale",
    title: "Simulazione Visuale",
    subtitle:
      "Struttura di base pronta. Successivamente collegheremo la configurazione visuale alla mappa e poi alla proprietà di rovine e passaggi.",
    calibrationOn: "Calibrazione",
    calibrationOff: "Esci dalla calibrazione",
    nextStepTitle: "Prossimo passo",
    nextStepBodyLine1: "Sostituiremo questo placeholder con:",
    nextStepBodyLine2:
      "1. configurazione visuale con assegnazione delle tribù agli home spot\n2. simulazione visuale con rovine, passaggi e proprietari in overlay",
  },
  mapCalibration: {
    pointLabel: "Punto",
    copyCoordinates: "Copia coordinate",
    reset: "Reset",
    help:
      "Clicca su un punto per selezionarlo. Usa le frecce per spostarlo dello 0.2%. Usa Maiusc + frecce per spostarlo dell'1%.",
  },
};

export default it;