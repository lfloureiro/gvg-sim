import type { AppText } from "./schema";

const tr: AppText = {
  common: {
    language: "Dil",
    version: "Sürüm",
    noTribe: "— kabile yok —",
    back: "Geri",
    continue: "Devam",
    copyCurrentToSimulation: "Mevcut durumu simülasyona kopyala",
    currentDay: "Geçerli gün",
    currentGmtTime: "Geçerli GMT saati",
    minutesRemainingToTheEnd: "Bitişe kalan dakika",
    currentPoints: "Mevcut puan",
    firstCapture: "İlk ele geçirme",
    pointsPerMinute: "Puan / dk",
    finalIfUnchanged: "Değişmezse final",
    finalSimulated: "Simüle edilen final",
    difference: "Fark",
    tribe: "Kabile",
    ruin: "Harabe",
    currentOwner: "Mevcut sahip",
    simulateIfChangedNow: "Şimdi değişirse simüle et",
    day1: "1. Gün",
    day2: "2. Gün",
    day3: "3. Gün",
    colour: "Renk",
    colours: {
      red: "Kırmızı",
      blue: "Mavi",
      green: "Yeşil",
      yellow: "Sarı",
      purple: "Mor",
      orange: "Turuncu",
      pink: "Pembe",
      mint: "Nane",
    },
  },
  setup: {
    title: "GvG Puan Simülatörü",
    subtitle:
      "1. Kabile her zaman Phoenix Veritas'tır. Diğer kabileler için isimleri, renkleri ve mevcut puanları seçin.",
    initialTribeData: "Başlangıç kabile verileri",
    tribeName: "Kabile adı",
  },
  simulation: {
    title: "3. Gün sonuna kadar GvG projeksiyonu",
    subtitle:
      "Değişiklikler şimdi olursa mevcut durum ile simüle edilen durum karşılaştırılır.",
    eyebrow: "Harabeler ve final projeksiyonu",
    day3Finish: "3. Gün sonu",
    howToRead: "Final tablosu nasıl okunur:",
    noteLine1:
      "İlk ele geçirme puanları = ilk ele geçirme sütununda seçilen ve mevcut puanlara henüz eklenmemiş bonus.",
    noteLine2:
      "Puan / dk = simüle edilen sahipliğe göre her kabilenin şu anda dakikada aldığı puan.",
    noteLine3:
      "Simüle edilen final = mevcut puan + bekleyen ilk ele geçirme bonusu + 3. Gün sonuna kadar gelecek üretim.",
    bastions: "Kaleler",
    valkyries: "Valkyrie'ler",
    temple: "Tapınak",
    finalSummary: "Final özeti",
    simulatedScoreEvolution: "Simüle edilen puan gelişimi",
    simulatedScoreEvolutionSubtitle:
      "Simüle edilen sahipliğe göre şu andan 3. Gün sonuna kadar puan artışı.",
  },
  home: {
    title: "Phoenix Veritas araçları",
    subtitle: "Bir araç seç ve aynı dili tüm uygulamada koru.",
    gvgEyebrow: "GvG",
    gvgTitle: "GvG skor simülatörü",
    gvgDescription:
      "Kabileleri, mevcut puanları ve harabe sahipliğini ayarla, sonra gün sonu sonucunu tahmin et.",
    gvgButton: "GvG'yi aç",
    enemyEyebrow: "Analiz",
    enemyTitle: "Düşman kabile analizi",
    enemyDescription:
      "Ekran görüntülerini tara, ana ordu tipini tespit et ve düşman şefleri güçlerine göre sırala.",
    enemyButton: "Analizi aç",
  },
  enemyAnalysis: {
    title: "Fate War ekran görüntüsü klasörünü tara",
    subtitle:
      "Analiz aracı şef adını, iki güç değerini ve belirleyici artefakt yuvalarını okur.",
    inputEyebrow: "Giriş",
    inputTitle: "Klasör seçimi ve sıralama modu",
    inputSubtitle:
      "Oyundaki aynı sayfadan ekran görüntülerini içeren bir klasör seçin.",
    screenshotFolder: "Ekran görüntüsü klasörü",
    chooseFolder: "Ekran görüntüsü klasörünü seçmek için buraya tıkla",
    chooseFolderHelp:
      "Analiz etmek istediğin Fate War ekran görüntülerini içeren klasörü seç. Uygulama dosyaları sadece okur.",
    selectedFolder: "Seçilen klasör",
    noFolderSelected: "Henüz klasör seçilmedi",
    orderBy: "Düşmanları şuna göre sırala",
    artifactNote:
      "Artefakt seviyeleri sadece renkten türetilir: gri 0, yeşil 1, mavi 2, mor 3, altın 4, kırmızı 5. Rün renkleri sadece eşitlik bozucu olarak kullanılır.",
    analyzing: "Analiz ediliyor",
    step: "Adım",
    screenshotsAnalyzed: "Analiz edilen ekran görüntüsü",
    archers: "Archers",
    berserkers: "Berserkers",
    cavalry: "Cavalry",
    results: "Sonuçlar",
    chiefsClassified: "şef şu şekilde sınıflandırıldı",
    noChiefsClassified: "Şu şekilde sınıflandırılan şef yok",
    name: "İsim",
    individualMight: "Individual Might",
    heroMight: "Hero Might",
    primaryBuild: "Ana build",
    confidence: "Güven",
    openFolderError: "Seçilen klasör açılamadı.",
    high: "Yüksek",
    medium: "Orta",
    low: "Düşük",
  },
  errors: {
    allTribesMustHaveAName: "Tüm kabilelerin bir adı olmalı.",
    tribeNamesMustBeUnique: "Kabile adları benzersiz olmalı.",
  },
};

export default tr;