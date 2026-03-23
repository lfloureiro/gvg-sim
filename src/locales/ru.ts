import type { AppText } from "./schema";

const ru: AppText = {
  common: {
    language: "Язык",
    version: "Версия",
    noTribe: "— нет племени —",
    back: "Назад",
    continue: "Продолжить",
    copyCurrentToSimulation: "Скопировать текущее в симуляцию",
    currentDay: "Текущий день",
    currentGmtTime: "Текущее время GMT",
    minutesRemainingToTheEnd: "Минут до конца",
    currentPoints: "Текущие очки",
    firstCapture: "Первый захват",
    pointsPerMinute: "Очки / мин",
    finalIfUnchanged: "Итог без изменений",
    finalSimulated: "Итог симуляции",
    difference: "Разница",
    tribe: "Племя",
    ruin: "Руина",
    currentOwner: "Текущий владелец",
    simulateIfChangedNow: "Симулировать, если изменить сейчас",
    day1: "День 1",
    day2: "День 2",
    day3: "День 3",
    colour: "Цвет",
    colours: {
      red: "Красный",
      blue: "Синий",
      green: "Зелёный",
      yellow: "Жёлтый",
      purple: "Фиолетовый",
      orange: "Оранжевый",
      pink: "Розовый",
      mint: "Мятный",
    },
  },
  setup: {
    title: "Симулятор очков GvG",
    subtitle:
      "Племя 1 всегда Phoenix Veritas. Выберите названия, цвета и текущие очки для остальных племён.",
    initialTribeData: "Начальные данные племён",
    tribeName: "Название племени",
  },
  simulation: {
    title: "Прогноз GvG до конца Дня 3",
    subtitle:
      "Текущее состояние против симуляции, если изменения произойдут сейчас.",
    eyebrow: "Руины и итоговый прогноз",
    day3Finish: "Конец Дня 3",
    howToRead: "Как читать итоговую таблицу:",
    noteLine1:
      "Очки первого захвата = бонус, выбранный в колонке первого захвата, который ещё не добавлен к текущим очкам.",
    noteLine2:
      "Очки / мин = сколько очков в минуту каждое племя получает сейчас на основе симулированного владения.",
    noteLine3:
      "Итог симуляции = текущие очки + бонус первого захвата + будущая выработка до конца Дня 3.",
    bastions: "Бастионы",
    valkyries: "Валькирии",
    temple: "Храм",
    finalSummary: "Итоговая сводка",
    simulatedScoreEvolution: "Симулированная динамика очков",
    simulatedScoreEvolutionSubtitle:
      "Рост очков с текущего момента до конца Дня 3 на основе симулированного владения.",
  },
  errors: {
    allTribesMustHaveAName: "У всех племён должно быть название.",
    tribeNamesMustBeUnique: "Названия племён должны быть уникальными.",
  },
};

export default ru;