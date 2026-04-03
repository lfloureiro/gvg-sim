import type { AppText } from "./schema";

const pt: AppText = {
  common: {
    language: "Idioma",
    version: "Versão",
    noTribe: "— sem tribo —",
    back: "Voltar",
    continue: "Continuar",
    copyCurrentToSimulation: "Copiar current para simulation",
    currentDay: "Dia atual",
    currentGmtTime: "Hora GMT atual",
    minutesRemainingToTheEnd: "Minutos restantes até ao fim",
    currentPoints: "Pontos atuais",
    firstCapture: "Primeira conquista",
    pointsPerMinute: "Pontos / min",
    finalIfUnchanged: "Final se não mudar",
    finalSimulated: "Final simulado",
    difference: "Diferença",
    tribe: "Tribo",
    ruin: "Ruína",
    currentOwner: "Owner atual",
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
    title: "Simulador de Pontuação GvG",
    subtitle:
      "A Tribo 1 é sempre Phoenix Veritas. Escolhe os nomes, as cores e os pontos atuais das restantes tribos.",
    initialTribeData: "Dados iniciais das tribos",
    tribeName: "Nome da tribo",
  },
  simulation: {
    title: "Projeção do fim do Dia 3 do GvG",
    subtitle: "Estado atual versus estado simulado se as mudanças acontecerem agora.",
    eyebrow: "Ruínas e projeção final",
    day3Finish: "Fim do Dia 3",
    howToRead: "Como ler a tabela final:",
    noteLine1:
      "Pontos de primeira conquista = bónus selecionado na coluna de primeira conquista que ainda não foi adicionado aos pontos atuais.",
    noteLine2:
      "Pontos / min = pontos por minuto que cada tribo está a receber neste momento com base na posse simulada.",
    noteLine3:
      "Final simulado = pontos atuais + bónus pendente de primeira conquista + produção futura até ao fim do Dia 3.",
    bastions: "Bastiões",
    valkyries: "Valquírias",
    temple: "Templo",
    finalSummary: "Resumo final",
    simulatedScoreEvolution: "Evolução simulada da pontuação",
    simulatedScoreEvolutionSubtitle:
      "Crescimento da pontuação desde agora até ao fim do Dia 3, usando a posse simulada.",
  },
  home: {
    title: "Toolkit Phoenix Veritas",
    subtitle: "Escolhe uma ferramenta e mantém o mesmo idioma em toda a app.",
    gvgEyebrow: "GvG",
    gvgTitle: "Simulador de pontuação GvG",
    gvgDescription:
      "Configura as tribos, os pontos atuais e a posse das ruínas, depois projeta o resultado no fim do dia.",
    gvgButton: "Abrir GvG",
    enemyEyebrow: "Análise",
    enemyTitle: "Análise da tribo inimiga",
    enemyDescription:
      "Analisa screenshots, deteta o tipo principal de exército e ordena os chiefs por might.",
    enemyButton: "Abrir análise",
  },
  enemyAnalysis: {
    title: "Analisar uma pasta de screenshots do Fate War",
    subtitle:
      "O analisador lê o nome do chief, os dois valores de might e os slots decisivos dos artefactos.",
    inputEyebrow: "Input",
    inputTitle: "Seleção da pasta e modo de ordenação",
    inputSubtitle:
      "Seleciona uma pasta com screenshots da mesma página do jogo.",
    screenshotFolder: "Pasta das screenshots",
    chooseFolder: "Clica aqui para escolher a pasta das screenshots",
    chooseFolderHelp:
      "Seleciona a pasta que contém as screenshots do Fate War que queres analisar. A app apenas lê os ficheiros.",
    selectedFolder: "Pasta selecionada",
    noFolderSelected: "Ainda não foi selecionada nenhuma pasta",
    orderBy: "Ordenar inimigos por",
    artifactNote:
      "Os níveis dos artefactos são derivados apenas da cor: cinzento 0, verde 1, azul 2, púrpura 3, dourado 4, vermelho 5. As cores das runas só são usadas como desempate.",
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
    confidence: "Confiança",
    openFolderError: "Não foi possível abrir a pasta selecionada.",
    high: "Alta",
    medium: "Média",
    low: "Baixa",
  },
  errors: {
    allTribesMustHaveAName: "Todas as tribos têm de ter um nome.",
    tribeNamesMustBeUnique: "Os nomes das tribos têm de ser únicos.",
  },
  modeSelection: {
    eyebrow: "Simulador GvG",
    title: "Escolher modo",
    subtitle: "Escolhe se queres trabalhar em modo tabela ou em modo visual.",
    tableTitle: "Modo Tabela",
    tableDescription:
      "Fluxo atual com configuração em lista e simulação baseada em tabelas.",
    visualTitle: "Modo Visual",
    visualDescription:
      "Novo fluxo com seleção de posições no mapa e simulação visual.",
  },
  setupVisual: {
    title: "Configuração Visual",
    subtitle:
      "Neste modo, a cor não é escolhida manualmente. Vai ser derivada da posição selecionada no mapa.",
    nextStepTitle: "Próximo passo:",
    nextStepBody:
      "Vamos substituir esta configuração por uma versão baseada em mapa, onde atribuis cada tribo diretamente a um home spot.",
    backToModes: "Voltar aos modos",
  },
  simulationVisual: {
    eyebrow: "Modo Visual",
    title: "Simulação Visual",
    subtitle:
      "Estrutura base pronta. A seguir vamos ligar a configuração visual ao mapa e depois à posse das ruínas e passes.",
    calibrationOn: "Calibração",
    calibrationOff: "Sair da calibração",
    nextStepTitle: "Próximo passo",
    nextStepBodyLine1: "Vamos substituir este placeholder por:",
    nextStepBodyLine2:
      "1. configuração visual com atribuição de tribos aos home spots\n2. simulação visual com ruínas, passes e owners em overlay",
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