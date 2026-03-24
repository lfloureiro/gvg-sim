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
  home: {
    title: "Інструменти Phoenix Veritas",
    subtitle: "Оберіть інструмент і збережіть одну мову в усьому застосунку.",
    gvgEyebrow: "GvG",
    gvgTitle: "Симулятор очок GvG",
    gvgDescription:
      "Налаштуйте племена, поточні очки та володіння руїнами, а потім перегляньте підсумковий прогноз дня.",
    gvgButton: "Відкрити GvG",
    enemyEyebrow: "Аналіз",
    enemyTitle: "Аналіз ворожого племені",
    enemyDescription:
      "Зчитуйте скріншоти, визначайте основний тип армії та сортуйте ворожих вождів за силою.",
    enemyButton: "Відкрити аналіз",
  },
  enemyAnalysis: {
    title: "Аналіз папки зі скріншотами Fate War",
    subtitle:
      "Аналізатор зчитує ім'я вождя, обидва значення сили та ключові слоти артефактів.",
    inputEyebrow: "Ввід",
    inputTitle: "Вибір папки та режим сортування",
    inputSubtitle:
      "Виберіть папку зі скріншотами однієї й тієї самої сторінки гри.",
    screenshotFolder: "Папка зі скріншотами",
    chooseFolder: "Натисніть тут, щоб вибрати папку зі скріншотами",
    chooseFolderHelp:
      "Виберіть папку зі скріншотами Fate War для аналізу. Застосунок лише читає файли.",
    selectedFolder: "Вибрана папка",
    noFolderSelected: "Папку ще не вибрано",
    orderBy: "Сортувати ворогів за",
    artifactNote:
      "Рівні артефактів визначаються лише за кольором: сірий 0, зелений 1, синій 2, фіолетовий 3, золотий 4, червоний 5. Кольори рун використовуються лише для розв'язання нічиєї.",
    analyzing: "Аналіз",
    step: "Крок",
    screenshotsAnalyzed: "Скріншотів проаналізовано",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalry",
    results: "Результати",
    chiefsClassified: "вождів класифіковано як",
    noChiefsClassified: "Немає вождів, класифікованих як",
    name: "Ім'я",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
    primaryBuild: "Основний білд",
    confidence: "Впевненість",
    openFolderError: "Не вдалося відкрити вибрану папку.",
    high: "Висока",
    medium: "Середня",
    low: "Низька",
  },
  errors: {
    allTribesMustHaveAName: "Усі племена повинні мати назву.",
    tribeNamesMustBeUnique: "Назви племен повинні бути унікальними.",
  },
};

export default uk;