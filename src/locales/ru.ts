import type { AppText } from "./schema";

const ru: AppText = {
  common: {
    language: "Язык",
    version: "Версия",
    backToHome: "На главную",
    reset: "Сброс",
    switchToTableMode: "Перейти в табличный режим",
    switchToVisualMode: "Перейти в визуальный режим",
    tribes: "Племена",
    visualTribesHelp:
      "Дома без племени отображаются приглушённо. Выбор Order готов для следующего этапа.",
    noTribe: "- без племени -",
    back: "Назад",
    continue: "Продолжить",
    copyCurrentToSimulation: "Скопировать текущее состояние в симуляцию",
    currentDay: "Текущий день",
    currentGmtTime: "Текущее время GMT",
    minutesRemainingToTheEnd: "Минут до конца",
    currentPoints: "Текущие очки",
    firstCapture: "Первый захват",
    pointsPerMinute: "Очки / мин",
    finalIfUnchanged: "Финал без изменений",
    finalSimulated: "Смоделированный финал",
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
      "Племя 1 всегда MF69. Выберите названия, цвета и текущие очки остальных племён.",
    initialTribeData: "Начальные данные племён",
    tribeName: "Название племени",
  },
  simulation: {
    title: "Прогноз GvG на конец Дня 3",
    subtitle:
      "Текущее состояние по сравнению со смоделированным состоянием, если изменения произойдут сейчас.",
    eyebrow: "Руины и финальный прогноз",
    day3Finish: "Финиш Дня 3",
    howToRead: "Как читать финальную таблицу:",
    noteLine1:
      "Очки первого захвата = бонус, выбранный в колонке первого захвата, который ещё не был добавлен к текущим очкам.",
    noteLine2:
      "Очки / мин = очки в минуту, которые каждое племя получает сейчас на основе смоделированного владения.",
    noteLine3:
      "Смоделированный финал = текущие очки + ожидаемый бонус первого захвата + будущая выработка до конца Дня 3.",
    bastions: "Бастионы",
    valkyries: "Валькирии",
    temple: "Храм",
    finalSummary: "Финальная сводка",
    simulatedScoreEvolution: "Смоделированная динамика очков",
    simulatedScoreEvolutionSubtitle:
      "Рост очков с текущего момента до конца Дня 3 на основе смоделированного владения.",
  },
  home: {
    title: "MF69 toolkit",
    subtitle: "Выберите инструмент и используйте один язык во всём приложении.",
    gvgEyebrow: "GvG",
    gvgTitle: "Симулятор очков GvG",
    gvgDescription:
      "Настройте племена, текущие очки и владение руинами, затем спрогнозируйте результат к концу дня.",
    gvgButton: "Открыть GvG",
    enemyEyebrow: "Анализ",
    enemyTitle: "Анализ вражеского племени",
    enemyDescription:
      "Сканируйте скриншоты, определяйте основной тип армии и сортируйте вражеских chiefs по might.",
    enemyButton: "Открыть анализ",
  },
  enemyAnalysis: {
    title: "Сканировать папку со скриншотами Fate War",
    subtitle:
      "Анализатор считывает имя chief, оба значения might и ключевые слоты артефактов.",
    inputEyebrow: "Ввод",
    inputTitle: "Выбор папки и режим сортировки",
    inputSubtitle:
      "Выберите папку со скриншотами одной и той же страницы игры.",
    screenshotFolder: "Папка скриншотов",
    chooseFolder: "Нажмите здесь, чтобы выбрать папку со скриншотами",
    chooseFolderHelp:
      "Выберите папку со скриншотами Fate War, которые вы хотите проанализировать. Приложение только читает файлы.",
    selectedFolder: "Выбранная папка",
    noFolderSelected: "Папка ещё не выбрана",
    orderBy: "Сортировать врагов по",
    artifactNote:
      "Уровни артефактов определяются только по цвету: серый 0, зелёный 1, синий 2, фиолетовый 3, золотой 4, красный 5. Цвета рун используются только как дополнительный критерий.",
    analyzing: "Анализ",
    step: "Шаг",
    screenshotsAnalyzed: "Проанализировано скриншотов",
    archers: "Лучники",
    berserkers: "Берсерки",
    cavalry: "Кавалерия",
    results: "Результаты",
    chiefsClassified: "chiefs классифицированы как",
    noChiefsClassified: "Нет chiefs, классифицированных как",
    name: "Имя",
    individualMight: "Индивидуальный Might",
    heroMight: "Hero Might",
    primaryBuild: "Основной build",
    confidence: "Уверенность",
    openFolderError: "Не удалось открыть выбранную папку.",
    high: "Высокая",
    medium: "Средняя",
    low: "Низкая",
  },
  errors: {
    allTribesMustHaveAName: "У всех племён должно быть имя.",
    tribeNamesMustBeUnique: "Названия племён должны быть уникальными.",
  },
  modeSelection: {
    eyebrow: "Симулятор GvG",
    title: "Выбор режима",
    subtitle:
      "Выберите, хотите ли работать в табличном или визуальном режиме.",
    tableTitle: "Табличный режим",
    tableDescription:
      "Текущий поток с настройкой через список и симуляцией на основе таблиц.",
    visualTitle: "Визуальный режим",
    visualDescription:
      "Новый поток с выбором позиций на карте и визуальной симуляцией.",
  },

  setupVisual: {
    title: "Визуальная настройка",
    subtitle:
      "В этом режиме цвет не выбирается вручную. Он будет определён по выбранной позиции на карте.",
    nextStepTitle: "Следующий шаг:",
    nextStepBody:
      "Мы заменим эту настройку версией на основе карты, где каждое племя назначается прямо на home spot.",
    backToModes: "Назад к режимам",
  },

  simulationVisual: {
    eyebrow: "Визуальный режим",
    title: "Визуальная симуляция",
    subtitle:
      "Базовая структура готова. Далее мы свяжем визуальную настройку с картой, а затем с владением руинами и проходами.",
    calibrationOn: "Калибровка",
    calibrationOff: "Выйти из калибровки",
    nextStepTitle: "Следующий шаг",
    nextStepBodyLine1: "Мы заменим этот placeholder на:",
    nextStepBodyLine2:
      "1. визуальную настройку с назначением племён на home spots\n2. визуальную симуляцию с руинами, проходами и владельцами в overlay",
  },

  mapCalibration: {
    pointLabel: "Точка",
    copyCoordinates: "Копировать координаты",
    reset: "Сброс",
    help:
      "Нажмите на точку, чтобы выбрать её. Используйте стрелки для перемещения на 0.2%. Используйте Shift + стрелки для перемещения на 1%.",
  },
};

export default ru;