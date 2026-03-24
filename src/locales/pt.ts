import type { AppText } from "./schema";

const pt: AppText = {
  common: {
    language: "Idioma",
    version: "Versão",
    noTribe: "— sem tribo —",
    back: "Voltar",
    continue: "Continuar",
    copyCurrentToSimulation: "Copiar atual para simulação",
    currentDay: "Dia atual",
    currentGmtTime: "Hora GMT atual",
    minutesRemainingToTheEnd: "Minutos restantes até ao fim",
    currentPoints: "Pontos atuais",
    firstCapture: "Primeira captura",
    pointsPerMinute: "Pontos / min",
    finalIfUnchanged: "Final sem alterações",
    finalSimulated: "Final simulado",
    difference: "Diferença",
    tribe: "Tribo",
    ruin: "Ruína",
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
    title: "Simulador de Pontos GvG",
    subtitle:
      "A Tribo 1 é sempre Phoenix Veritas. Escolhe os nomes, cores e pontos atuais das restantes tribos.",
    initialTribeData: "Dados iniciais das tribos",
    tribeName: "Nome da tribo",
  },
  simulation: {
    title: "Projeção GvG até ao fim do Dia 3",
    subtitle:
      "Estado atual versus estado simulado se as mudanças acontecerem agora.",
    eyebrow: "Ruínas e projeção final",
    day3Finish: "Fim do Dia 3",
    howToRead: "Como ler a tabela final:",
    noteLine1:
      "Pontos de primeira captura = bónus selecionado na coluna de primeira captura que ainda não foi adicionado aos pontos atuais.",
    noteLine2:
      "Pontos / min = pontos por minuto que cada tribo está a receber neste momento com base na posse simulada.",
    noteLine3:
      "Final simulado = pontos atuais + bónus de primeira captura pendente + produção futura até ao fim do Dia 3.",
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
    subtitle: "Escolhe a ferramenta e mantém o mesmo idioma em toda a aplicação.",
    gvgEyebrow: "GvG",
    gvgTitle: "Simulador de pontuação GvG",
    gvgDescription:
      "Configura as tribos, os pontos atuais e a posse das ruínas, e projeta o resultado final do dia.",
    gvgButton: "Abrir GvG",
    enemyEyebrow: "Análise",
    enemyTitle: "Análise de tribo inimiga",
    enemyDescription:
      "Lê screenshots, deteta o tipo principal de exército e ordena os chefes inimigos por poder.",
    enemyButton: "Abrir análise",
  },
  enemyAnalysis: {
    title: "Analisar uma pasta de screenshots do Fate War",
    subtitle:
      "O analisador lê o nome do chefe, os dois valores de poder e os slots decisivos dos artefactos.",
    inputEyebrow: "Entrada",
    inputTitle: "Seleção da pasta e modo de ordenação",
    inputSubtitle:
      "Seleciona uma pasta com screenshots da mesma página do jogo.",
    screenshotFolder: "Pasta de screenshots",
    chooseFolder: "Clica aqui para escolher a pasta com as screenshots",
    chooseFolderHelp:
      "Seleciona a pasta que contém as screenshots do Fate War que queres analisar. A app apenas lê os ficheiros.",
    selectedFolder: "Pasta selecionada",
    noFolderSelected: "Ainda não foi selecionada nenhuma pasta",
    orderBy: "Ordenar inimigos por",
    artifactNote:
      "Os níveis dos artefactos são derivados apenas da cor: cinzento 0, verde 1, azul 2, púrpura 3, amarelo 4, vermelho 5. As cores das runas só servem para desempate.",
    analyzing: "A analisar",
    step: "Passo",
    screenshotsAnalyzed: "Screenshots analisadas",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalry",
    results: "Resultados",
    chiefsClassified: "chefes classificados como",
    noChiefsClassified: "Nenhum chefe classificado como",
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
};

export default pt;