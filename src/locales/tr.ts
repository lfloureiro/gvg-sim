import type { AppText } from "./schema";

const tr: AppText = {
  common: {
    language: "Dil",
    version: "SÃ¼rÃ¼m",
    noTribe: "â€” kabile yok â€”",
    back: "Geri",
    continue: "Devam et",
    copyCurrentToSimulation: "Mevcut durumu simÃ¼lasyona kopyala",
    currentDay: "GeÃ§erli gÃ¼n",
    currentGmtTime: "GeÃ§erli GMT saati",
    minutesRemainingToTheEnd: "BitiÅŸe kalan dakika",
    currentPoints: "GeÃ§erli puanlar",
    firstCapture: "Ä°lk ele geÃ§irme",
    pointsPerMinute: "Puan / dk",
    finalIfUnchanged: "DeÄŸiÅŸmezse final",
    finalSimulated: "SimÃ¼le edilmiÅŸ final",
    difference: "Fark",
    tribe: "Kabile",
    ruin: "Harabe",
    currentOwner: "Mevcut sahip",
    simulateIfChangedNow: "Åžimdi deÄŸiÅŸirse simÃ¼le et",
    day1: "GÃ¼n 1",
    day2: "GÃ¼n 2",
    day3: "GÃ¼n 3",
    colour: "Renk",
    colours: {
      red: "KÄ±rmÄ±zÄ±",
      blue: "Mavi",
      green: "YeÅŸil",
      yellow: "SarÄ±",
      purple: "Mor",
      orange: "Turuncu",
      pink: "Pembe",
      mint: "Nane",
    },
  },
  setup: {
    title: "GvG Puan SimÃ¼latÃ¶rÃ¼",
    subtitle:
      "Kabile 1 her zaman MF69'tÄ±r. Kalan kabileler iÃ§in isimleri, renkleri ve mevcut puanlarÄ± seÃ§in.",
    initialTribeData: "BaÅŸlangÄ±Ã§ kabile verileri",
    tribeName: "Kabile adÄ±",
  },
  simulation: {
    title: "GvG GÃ¼n 3 sonu projeksiyonu",
    subtitle: "DeÄŸiÅŸiklikler ÅŸimdi olursa mevcut durum ile simÃ¼le edilmiÅŸ durumun karÅŸÄ±laÅŸtÄ±rmasÄ±.",
    eyebrow: "Harabeler ve final projeksiyonu",
    day3Finish: "GÃ¼n 3 sonu",
    howToRead: "Final tablosu nasÄ±l okunur:",
    noteLine1:
      "Ä°lk ele geÃ§irme puanlarÄ± = ilk ele geÃ§irme sÃ¼tununda seÃ§ilen ve henÃ¼z mevcut puanlara eklenmemiÅŸ bonus.",
    noteLine2:
      "Puan / dk = her kabilenin ÅŸu anda simÃ¼le edilmiÅŸ sahipliÄŸe gÃ¶re aldÄ±ÄŸÄ± dakika baÅŸÄ±na puan.",
    noteLine3:
      "SimÃ¼le edilmiÅŸ final = mevcut puanlar + bekleyen ilk ele geÃ§irme bonusu + GÃ¼n 3 sonuna kadar gelecekteki Ã¼retim.",
    bastions: "Kaleler",
    valkyries: "Valkyrie'ler",
    temple: "TapÄ±nak",
    finalSummary: "Final Ã¶zeti",
    simulatedScoreEvolution: "SimÃ¼le edilmiÅŸ puan geliÅŸimi",
    simulatedScoreEvolutionSubtitle:
      "SimÃ¼le edilmiÅŸ sahiplik kullanÄ±larak ÅŸu andan GÃ¼n 3 sonuna kadar puan artÄ±ÅŸÄ±.",
  },
  home: {
    title: "MF69 araÃ§ seti",
    subtitle: "Bir araÃ§ seÃ§in ve tÃ¼m uygulamada aynÄ± dili kullanÄ±n.",
    gvgEyebrow: "GvG",
    gvgTitle: "GvG puan simÃ¼latÃ¶rÃ¼",
    gvgDescription:
      "Kabileleri, mevcut puanlarÄ± ve harabe sahipliÄŸini yapÄ±landÄ±rÄ±n, ardÄ±ndan gÃ¼n sonu sonucunu projekte edin.",
    gvgButton: "GvG'yi aÃ§",
    enemyEyebrow: "Analiz",
    enemyTitle: "DÃ¼ÅŸman kabile analizi",
    enemyDescription:
      "Ekran gÃ¶rÃ¼ntÃ¼lerini tara, ana ordu tÃ¼rÃ¼nÃ¼ tespit et ve dÃ¼ÅŸman chiefs'leri might'a gÃ¶re sÄ±rala.",
    enemyButton: "Analizi aÃ§",
  },
  enemyAnalysis: {
    title: "Bir Fate War ekran gÃ¶rÃ¼ntÃ¼sÃ¼ klasÃ¶rÃ¼nÃ¼ tara",
    subtitle:
      "Analiz aracÄ± chief adÄ±nÄ±, iki might deÄŸerini ve belirleyici artefakt slotlarÄ±nÄ± okur.",
    inputEyebrow: "Girdi",
    inputTitle: "KlasÃ¶r seÃ§imi ve sÄ±ralama modu",
    inputSubtitle:
      "Oyundaki aynÄ± sayfadan ekran gÃ¶rÃ¼ntÃ¼leri iÃ§eren bir klasÃ¶r seÃ§in.",
    screenshotFolder: "Ekran gÃ¶rÃ¼ntÃ¼sÃ¼ klasÃ¶rÃ¼",
    chooseFolder: "Ekran gÃ¶rÃ¼ntÃ¼sÃ¼ klasÃ¶rÃ¼nÃ¼ seÃ§mek iÃ§in buraya tÄ±klayÄ±n",
    chooseFolderHelp:
      "Analiz etmek istediÄŸiniz Fate War ekran gÃ¶rÃ¼ntÃ¼lerini iÃ§eren klasÃ¶rÃ¼ seÃ§in. Uygulama sadece dosyalarÄ± okur.",
    selectedFolder: "SeÃ§ilen klasÃ¶r",
    noFolderSelected: "HenÃ¼z klasÃ¶r seÃ§ilmedi",
    orderBy: "DÃ¼ÅŸmanlarÄ± sÄ±rala",
    artifactNote:
      "Artefakt seviyeleri yalnÄ±zca renkten tÃ¼retilir: gri 0, yeÅŸil 1, mavi 2, mor 3, altÄ±n 4, kÄ±rmÄ±zÄ± 5. RÃ¼n renkleri sadece eÅŸitlik bozucu olarak kullanÄ±lÄ±r.",
    analyzing: "Analiz ediliyor",
    step: "AdÄ±m",
    screenshotsAnalyzed: "Analiz edilen ekran gÃ¶rÃ¼ntÃ¼sÃ¼",
    archers: "OkÃ§ular",
    berserkers: "Berserkerler",
    cavalry: "SÃ¼vari",
    results: "SonuÃ§lar",
    chiefsClassified: "chief ÅŸu ÅŸekilde sÄ±nÄ±flandÄ±rÄ±ldÄ±",
    noChiefsClassified: "Åžu ÅŸekilde sÄ±nÄ±flandÄ±rÄ±lmÄ±ÅŸ chief yok",
    name: "Ad",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
    primaryBuild: "Ana build",
    confidence: "GÃ¼ven",
    openFolderError: "SeÃ§ilen klasÃ¶r aÃ§Ä±lamadÄ±.",
    high: "YÃ¼ksek",
    medium: "Orta",
    low: "DÃ¼ÅŸÃ¼k",
  },
  errors: {
    allTribesMustHaveAName: "TÃ¼m kabilelerin bir adÄ± olmalÄ±dÄ±r.",
    tribeNamesMustBeUnique: "Kabile adlarÄ± benzersiz olmalÄ±dÄ±r.",
  },
  modeSelection: {
    eyebrow: "GvG SimÃ¼latÃ¶rÃ¼",
    title: "Mod seÃ§",
    subtitle: "Tablo modunda mÄ± yoksa gÃ¶rsel modda mÄ± Ã§alÄ±ÅŸmak istediÄŸinizi seÃ§in.",
    tableTitle: "Tablo Modu",
    tableDescription: "Liste tabanlÄ± kurulum ve tablo tabanlÄ± simÃ¼lasyon ile mevcut akÄ±ÅŸ.",
    visualTitle: "GÃ¶rsel Mod",
    visualDescription: "Harita tabanlÄ± konum seÃ§imi ve gÃ¶rsel simÃ¼lasyon ile yeni akÄ±ÅŸ.",
  },
  setupVisual: {
    title: "GÃ¶rsel Kurulum",
    subtitle:
      "Bu modda renk manuel olarak seÃ§ilmez. Haritada seÃ§ilen konumdan tÃ¼retilir.",
    nextStepTitle: "Sonraki adÄ±m:",
    nextStepBody:
      "Bu kurulumu, her kabileyi doÄŸrudan bir home spot'a atadÄ±ÄŸÄ±nÄ±z harita tabanlÄ± bir sÃ¼rÃ¼mle deÄŸiÅŸtireceÄŸiz.",
    backToModes: "Modlara geri dÃ¶n",
  },
  simulationVisual: {
    eyebrow: "GÃ¶rsel Mod",
    title: "GÃ¶rsel SimÃ¼lasyon",
    subtitle:
      "Temel yapÄ± hazÄ±r. Sonraki adÄ±mda gÃ¶rsel kurulumu haritaya, sonra da harabe ve geÃ§it sahipliÄŸine baÄŸlayacaÄŸÄ±z.",
    calibrationOn: "Kalibrasyon",
    calibrationOff: "Kalibrasyondan Ã§Ä±k",
    nextStepTitle: "Sonraki adÄ±m",
    nextStepBodyLine1: "Bu placeholder'Ä± ÅŸununla deÄŸiÅŸtireceÄŸiz:",
    nextStepBodyLine2:
      "1. kabilelerin home spot'lara atanmasÄ±yla gÃ¶rsel kurulum\n2. overlay Ã¼zerinde harabeler, geÃ§itler ve sahiplerle gÃ¶rsel simÃ¼lasyon",
  },
  mapCalibration: {
    pointLabel: "Nokta",
    copyCoordinates: "KoordinatlarÄ± kopyala",
    reset: "SÄ±fÄ±rla",
    help:
      "SeÃ§mek iÃ§in bir noktaya tÄ±klayÄ±n. 0.2% hareket ettirmek iÃ§in ok tuÅŸlarÄ±nÄ± kullanÄ±n. 1% hareket ettirmek iÃ§in Shift + ok tuÅŸlarÄ±nÄ± kullanÄ±n.",
  },
};

export default tr;

