import type { AppText } from "./schema";

const uk: AppText = {
  common: {
    language: "Мова",
    version: "Версія",
    noTribe: "— немає племені —",
    back: "Назад",
    continue: "Продовжити",
    copyCurrentToSimulation: "Скопіювати поточний стан у симуляцію",
    currentDay: "Поточний день",
    currentGmtTime: "Поточний час GMT",
    minutesRemainingToTheEnd: "Хвилин до завершення",
    currentPoints: "Поточні очки",
    firstCapture: "Перше захоплення",
    pointsPerMinute: "Очки / хв",
    finalIfUnchanged: "Фінал без змін",
    finalSimulated: "Симульований фінал",
    difference: "Різниця",
    tribe: "Плем'я",
    ruin: "Руїна",
    currentOwner: "Поточний власник",
    simulateIfChangedNow: "Симулювати, якщо змінити зараз",
    day1: "День 1",
    day2: "День 2",
    day3: "День 3",
    colour: "Колір",
    colours: {
      red: "Червоний",
      blue: "Синій",
      green: "Зелений",
      yellow: "Жовтий",
      purple: "Фіолетовий",
      orange: "Помаранчевий",
      pink: "Рожевий",
      mint: "М'ятний",
    },
  },
  setup: {
    title: "Симулятор очок GvG",
    subtitle:
      "Плем'я 1 завжди Phoenix Veritas. Виберіть назви, кольори та поточні очки для інших племен.",
    initialTribeData: "Початкові дані племен",
    tribeName: "Назва племені",
  },
  simulation: {
    title: "Прогноз GvG до кінця Дня 3",
    subtitle:
      "Поточний стан проти симульованого стану, якщо зміни відбудуться зараз.",
    eyebrow: "Руїни та фінальний прогноз",
    day3Finish: "Кінець Дня 3",
    howToRead: "Як читати фінальну таблицю:",
    noteLine1:
      "Очки першого захоплення = бонус, вибраний у колонці першого захоплення, який ще не додано до поточних очок.",
    noteLine2:
      "Очки / хв = скільки очок за хвилину кожне плем'я зараз отримує на основі симульованого володіння.",
    noteLine3:
      "Симульований фінал = поточні очки + бонус за перше захоплення + майбутнє виробництво до кінця Дня 3.",
    bastions: "Бастіони",
    valkyries: "Валькірії",
    temple: "Храм",
    finalSummary: "Підсумок",
    simulatedScoreEvolution: "Симульована динаміка очок",
    simulatedScoreEvolutionSubtitle:
      "Зростання очок від цього моменту до кінця Дня 3 на основі симульованого володіння.",
  },
  errors: {
    allTribesMustHaveAName: "Усі племена повинні мати назву.",
    tribeNamesMustBeUnique: "Назви племен повинні бути унікальними.",
  },
};

export default uk;