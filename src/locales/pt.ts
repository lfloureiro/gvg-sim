import type { AppText } from "./schema";

const pt: AppText = {
  common: {
    language: "Idioma",
    version: "VersÃ£o",
    noTribe: "â€” sem tribo â€”",
    back: "Voltar",
    continue: "Continuar",
    copyCurrentToSimulation: "Copiar estado atual para a simulaÃ§Ã£o",
    currentDay: "Dia atual",
    currentGmtTime: "Hora GMT atual",
    minutesRemainingToTheEnd: "Minutos restantes atÃ© ao fim",
    currentPoints: "Pontos atuais",
    firstCapture: "Primeira conquista",
    pointsPerMinute: "Pontos / min",
    finalIfUnchanged: "Final se nÃ£o mudar",
    finalSimulated: "Final simulado",
    difference: "DiferenÃ§a",
    tribe: "Tribo",
    ruin: "RuÃ­na",
    currentOwner: "Dono atual",
    simulateIfChangedNow: "Simular se mudar agora",
    day1: "Dia 1",
    day2: "Dia 2",
    day3: "Dia 3",
    colour: "Cor",
    colours: {
      red: "Vermelho",
      blue: "Azul",
      green: "Verde",
      yellow: "Amarelo",
      purple: "Roxo",
      orange: "Laranja",
      pink: "Rosa",
      mint: "Menta",
    },
  },
  setup: {
    title: "Simulador de PontuaÃ§Ã£o GvG",
    subtitle:
      "A Tribo 1 Ã© sempre MF69. Escolhe os nomes, as cores e os pontos atuais das restantes tribos.",
    initialTribeData: "Dados iniciais das tribos",
    tribeName: "Nome da tribo",
  },
  simulation: {
    title: "ProjeÃ§Ã£o do fim do Dia 3 do GvG",
    subtitle: "Estado atual versus estado simulado se as mudanÃ§as acontecerem agora.",
    eyebrow: "RuÃ­nas e projeÃ§Ã£o final",
    day3Finish: "Fim do Dia 3",
    howToRead: "Como ler a tabela final:",
    noteLine1:
      "Pontos de primeira conquista = bÃ³nus selecionado na coluna de primeira conquista que ainda nÃ£o foi adicionado aos pontos atuais.",
    noteLine2:
      "Pontos / min = pontos por minuto que cada tribo estÃ¡ a receber neste momento com base na posse simulada.",
    noteLine3:
      "Final simulado = pontos atuais + bÃ³nus pendente de primeira conquista + produÃ§Ã£o futura atÃ© ao fim do Dia 3.",
    bastions: "BastiÃµes",
    valkyries: "ValquÃ­rias",
    temple: "Templo",
    finalSummary: "Resumo final",
    simulatedScoreEvolution: "EvoluÃ§Ã£o simulada da pontuaÃ§Ã£o",
    simulatedScoreEvolutionSubtitle:
      "Crescimento da pontuaÃ§Ã£o desde agora atÃ© ao fim do Dia 3, usando a posse simulada.",
  },
  home: {
    title: "MF69 Toolkit",
    subtitle: "Escolhe uma ferramenta e mantÃ©m o mesmo idioma em toda a app.",
    gvgEyebrow: "GvG",
    gvgTitle: "Simulador de pontuaÃ§Ã£o GvG",
    gvgDescription:
      "Configura as tribos, os pontos atuais e a posse das ruÃ­nas, depois projeta o resultado no fim do dia.",
    gvgButton: "Abrir GvG",
    enemyEyebrow: "AnÃ¡lise",
    enemyTitle: "AnÃ¡lise da tribo inimiga",
    enemyDescription:
      "Analisa screenshots, deteta o tipo principal de exÃ©rcito e ordena os chiefs por might.",
    enemyButton: "Abrir anÃ¡lise",
  },
  enemyAnalysis: {
    title: "Analisar uma pasta de screenshots do Fate War",
    subtitle:
      "O analisador lÃª o nome do chief, os dois valores de might e os slots decisivos dos artefactos.",
    inputEyebrow: "Input",
    inputTitle: "SeleÃ§Ã£o da pasta e modo de ordenaÃ§Ã£o",
    inputSubtitle:
      "Seleciona uma pasta com screenshots da mesma pÃ¡gina do jogo.",
    screenshotFolder: "Pasta das screenshots",
    chooseFolder: "Clica aqui para escolher a pasta das screenshots",
    chooseFolderHelp:
      "Seleciona a pasta que contÃ©m as screenshots do Fate War que queres analisar. A app apenas lÃª os ficheiros.",
    selectedFolder: "Pasta selecionada",
    noFolderSelected: "Ainda nÃ£o foi selecionada nenhuma pasta",
    orderBy: "Ordenar inimigos por",
    artifactNote:
      "Os nÃ­veis dos artefactos sÃ£o derivados apenas da cor: cinzento 0, verde 1, azul 2, pÃºrpura 3, dourado 4, vermelho 5. As cores das runas sÃ³ sÃ£o usadas como desempate.",
    analyzing: "A analisar",
    step: "Passo",
    screenshotsAnalyzed: "Screenshots analisadas",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalry",
    results: "Resultados",
    chiefsClassified: "chiefs classificados como",
    noChiefsClassified: "Nenhum chief classificado como",
    name: "Nome",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
    primaryBuild: "Build principal",
    confidence: "ConfianÃ§a",
    openFolderError: "NÃ£o foi possÃ­vel abrir a pasta selecionada.",
    high: "Alta",
    medium: "MÃ©dia",
    low: "Baixa",
  },
  errors: {
    allTribesMustHaveAName: "Todas as tribos tÃªm de ter um nome.",
    tribeNamesMustBeUnique: "Os nomes das tribos tÃªm de ser Ãºnicos.",
  },
  modeSelection: {
    eyebrow: "Simulador GvG",
    title: "Escolher modo",
    subtitle: "Escolhe se queres trabalhar em modo tabela ou em modo visual.",
    tableTitle: "Modo Tabela",
    tableDescription:
      "Fluxo atual com configuraÃ§Ã£o em lista e simulaÃ§Ã£o baseada em tabelas.",
    visualTitle: "Modo Visual",
    visualDescription:
      "Novo fluxo com seleÃ§Ã£o de posiÃ§Ãµes no mapa e simulaÃ§Ã£o visual.",
  },
  setupVisual: {
    title: "ConfiguraÃ§Ã£o Visual",
    subtitle:
      "Neste modo, a cor nÃ£o Ã© escolhida manualmente. Vai ser derivada da posiÃ§Ã£o selecionada no mapa.",
    nextStepTitle: "PrÃ³ximo passo:",
    nextStepBody:
      "Vamos substituir esta configuraÃ§Ã£o por uma versÃ£o baseada em mapa, onde atribuis cada tribo diretamente a um home spot.",
    backToModes: "Voltar aos modos",
  },
  simulationVisual: {
    eyebrow: "Modo Visual",
    title: "SimulaÃ§Ã£o Visual",
    subtitle:
      "Estrutura base pronta. A seguir vamos ligar a configuraÃ§Ã£o visual ao mapa e depois Ã  posse das ruÃ­nas e passes.",
    calibrationOn: "CalibraÃ§Ã£o",
    calibrationOff: "Sair da calibraÃ§Ã£o",
    nextStepTitle: "PrÃ³ximo passo",
    nextStepBodyLine1: "Vamos substituir este placeholder por:",
    nextStepBodyLine2:
      "1. configuraÃ§Ã£o visual com atribuiÃ§Ã£o de tribos aos home spots\n2. simulaÃ§Ã£o visual com ruÃ­nas, passes e donos em overlay",
  },
  mapCalibration: {
    pointLabel: "Ponto",
    copyCoordinates: "Copiar coordenadas",
    reset: "Repor",
    help:
      "Clica num ponto para o selecionar. Usa as setas para mover 0.2%. Usa Shift + setas para mover 1%.",
  },
};

export default pt;

