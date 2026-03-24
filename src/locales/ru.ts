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
  home: {
    title: "Инструменты Phoenix Veritas",
    subtitle: "Выберите инструмент и используйте один и тот же язык во всём приложении.",
    gvgEyebrow: "GvG",
    gvgTitle: "Симулятор очков GvG",
    gvgDescription:
      "Настройте племена, текущие очки и владение руинами, затем посмотрите итоговый прогноз дня.",
    gvgButton: "Открыть GvG",
    enemyEyebrow: "Анализ",
    enemyTitle: "Анализ вражеского племени",
    enemyDescription:
      "Считывайте скриншоты, определяйте основной тип армии и сортируйте вражеских вождей по силе.",
    enemyButton: "Открыть анализ",
  },
  enemyAnalysis: {
    title: "Анализ папки со скриншотами Fate War",
    subtitle:
      "Анализатор считывает имя вождя, оба значения силы и ключевые слоты артефактов.",
    inputEyebrow: "Ввод",
    inputTitle: "Выбор папки и режим сортировки",
    inputSubtitle:
      "Выберите папку со скриншотами одной и той же страницы игры.",
    screenshotFolder: "Папка со скриншотами",
    chooseFolder: "Нажмите здесь, чтобы выбрать папку со скриншотами",
    chooseFolderHelp:
      "Выберите папку со скриншотами Fate War для анализа. Приложение только читает файлы.",
    selectedFolder: "Выбранная папка",
    noFolderSelected: "Папка ещё не выбрана",
    orderBy: "Сортировать врагов по",
    artifactNote:
      "Уровни артефактов определяются только по цвету: серый 0, зелёный 1, синий 2, фиолетовый 3, золотой 4, красный 5. Цвета рун используются только при равенстве.",
    analyzing: "Анализ",
    step: "Шаг",
    screenshotsAnalyzed: "Скриншотов проанализировано",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalry",
    results: "Результаты",
    chiefsClassified: "вождей классифицировано как",
    noChiefsClassified: "Нет вождей, классифицированных как",
    name: "Имя",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
    primaryBuild: "Основной билд",
    confidence: "Уверенность",
    openFolderError: "Не удалось открыть выбранную папку.",
    high: "Высокая",
    medium: "Средняя",
    low: "Низкая",
  },
  errors: {
    allTribesMustHaveAName: "У всех племён должно быть название.",
    tribeNamesMustBeUnique: "Названия племён должны быть уникальными.",
  },
};

export default ru;