import type { AppText } from "./schema";

const uk: AppText = {
  common: {
    language: "Мова",
    version: "Версія",
    backToHome: "На головну",
    reset: "Скинути",
    switchToTableMode: "Перейти в табличний режим",
    switchToVisualMode: "Перейти у візуальний режим",
    tribes: "Племена",
    visualTribesHelp:
      "Доми без племені відображаються приглушено. Вибір Order готовий для наступного етапу.",
    noTribe: "- без племені -",
    back: "Назад",
    continue: "Продовжити",
    copyCurrentToSimulation: "Скопіювати поточний стан у симуляцію",
    currentDay: "Поточний день",
    currentGmtTime: "Поточний час GMT",
    minutesRemainingToTheEnd: "Хвилин до кінця",
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
      "Плем'я 1 завжди MF69. Виберіть назви, кольори та поточні очки решти племен.",
    initialTribeData: "Початкові дані племен",
    tribeName: "Назва племені",
  },
  simulation: {
    title: "Прогноз GvG на кінець Дня 3",
    subtitle:
      "Поточний стан порівняно із симульованим станом, якщо зміни відбудуться зараз.",
    eyebrow: "Руїни та фінальний прогноз",
    day3Finish: "Кінець Дня 3",
    howToRead: "Як читати фінальну таблицю:",
    noteLine1:
      "Очки першого захоплення = бонус, вибраний у колонці першого захоплення, який ще не було додано до поточних очок.",
    noteLine2:
      "Очки / хв = очки за хвилину, які кожне плем'я зараз отримує на основі симульованого володіння.",
    noteLine3:
      "Симульований фінал = поточні очки + очікуваний бонус першого захоплення + майбутнє виробництво до кінця Дня 3.",
    bastions: "Бастіони",
    valkyries: "Валькірії",
    temple: "Храм",
    finalSummary: "Фінальний підсумок",
    simulatedScoreEvolution: "Симульована динаміка очок",
    simulatedScoreEvolutionSubtitle:
      "Зростання очок від поточного моменту до кінця Дня 3 на основі симульованого володіння.",
  },
  home: {
    title: "MF69 toolkit",
    subtitle:
      "Виберіть інструмент і використовуйте одну мову в усьому застосунку.",
    gvgEyebrow: "GvG",
    gvgTitle: "Симулятор очок GvG",
    gvgDescription:
      "Налаштуйте племена, поточні очки та володіння руїнами, а потім спрогнозуйте результат на кінець дня.",
    gvgButton: "Відкрити GvG",
    enemyEyebrow: "Аналіз",
    enemyTitle: "Аналіз ворожого племені",
    enemyDescription:
      "Скануйте скриншоти, визначайте основний тип армії та сортуйте ворожих chiefs за might.",
    enemyButton: "Відкрити аналіз",
  },
  enemyAnalysis: {
    title: "Сканувати папку зі скриншотами Fate War",
    subtitle:
      "Аналізатор читає ім'я chief, обидва значення might і ключові слоти артефактів.",
    inputEyebrow: "Вхідні дані",
    inputTitle: "Вибір папки та режим сортування",
    inputSubtitle:
      "Виберіть папку зі скриншотами однієї й тієї самої сторінки гри.",
    screenshotFolder: "Папка скриншотів",
    chooseFolder: "Натисніть тут, щоб вибрати папку зі скриншотами",
    chooseFolderHelp:
      "Виберіть папку зі скриншотами Fate War, які хочете проаналізувати. Застосунок лише читає файли.",
    selectedFolder: "Вибрана папка",
    noFolderSelected: "Папку ще не вибрано",
    orderBy: "Сортувати ворогів за",
    artifactNote:
      "Рівні артефактів визначаються лише за кольором: сірий 0, зелений 1, синій 2, фіолетовий 3, золотий 4, червоний 5. Кольори рун використовуються лише як додатковий критерій.",
    analyzing: "Аналіз",
    step: "Крок",
    screenshotsAnalyzed: "Проаналізовано скриншотів",
    archers: "Лучники",
    berserkers: "Берсерки",
    cavalry: "Кавалерія",
    results: "Результати",
    chiefsClassified: "chiefs класифіковано як",
    noChiefsClassified: "Немає chiefs, класифікованих як",
    name: "Ім'я",
    individualMight: "Індивідуальний Might",
    heroMight: "Hero Might",
    primaryBuild: "Основний build",
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
  modeSelection: {
    eyebrow: "Симулятор GvG",
    title: "Вибір режиму",
    subtitle:
      "Виберіть, чи хочете працювати в табличному або візуальному режимі.",
    tableTitle: "Табличний режим",
    tableDescription:
      "Поточний потік із налаштуванням через список і симуляцією на основі таблиць.",
    visualTitle: "Візуальний режим",
    visualDescription:
      "Новий потік із вибором позицій на карті та візуальною симуляцією.",
  },

  setupVisual: {
    title: "Візуальне налаштування",
    subtitle:
      "У цьому режимі колір не вибирається вручну. Він буде визначений за вибраною позицією на карті.",
    nextStepTitle: "Наступний крок:",
    nextStepBody:
      "Ми замінимо це налаштування версією на основі карти, де кожне плем'я призначається безпосередньо на home spot.",
    backToModes: "Назад до режимів",
  },

  simulationVisual: {
    eyebrow: "Візуальний режим",
    title: "Візуальна симуляція",
    subtitle:
      "Базова структура готова. Далі ми зв'яжемо візуальне налаштування з картою, а потім із володінням руїнами та проходами.",
    calibrationOn: "Калібрування",
    calibrationOff: "Вийти з калібрування",
    nextStepTitle: "Наступний крок",
    nextStepBodyLine1: "Ми замінимо цей placeholder на:",
    nextStepBodyLine2:
      "1. візуальне налаштування з призначенням племен на home spots\n2. візуальну симуляцію з руїнами, проходами та власниками в overlay",
  },

  mapCalibration: {
    pointLabel: "Точка",
    copyCoordinates: "Копіювати координати",
    reset: "Скинути",
    help:
      "Натисніть на точку, щоб вибрати її. Використовуйте стрілки для переміщення на 0.2%. Використовуйте Shift + стрілки для переміщення на 1%.",
  },
};

export default uk;