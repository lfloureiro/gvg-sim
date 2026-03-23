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
  errors: {
    allTribesMustHaveAName: "Todas as tribos têm de ter um nome.",
    tribeNamesMustBeUnique: "Os nomes das tribos têm de ser únicos.",
  },
};

export default pt;