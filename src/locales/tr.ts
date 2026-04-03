import type { AppText } from "./schema";

const tr: AppText = {
  common: {
    language: "Dil",
    version: "Sürüm",
    noTribe: "— kabile yok —",
    back: "Geri",
    continue: "Devam et",
    copyCurrentToSimulation: "Mevcut durumu simülasyona kopyala",
    currentDay: "Geçerli gün",
    currentGmtTime: "Geçerli GMT saati",
    minutesRemainingToTheEnd: "Bitişe kalan dakika",
    currentPoints: "Geçerli puanlar",
    firstCapture: "İlk ele geçirme",
    pointsPerMinute: "Puan / dk",
    finalIfUnchanged: "Değişmezse final",
    finalSimulated: "Simüle edilmiş final",
    difference: "Fark",
    tribe: "Kabile",
    ruin: "Harabe",
    currentOwner: "Mevcut sahip",
    simulateIfChangedNow: "Şimdi değişirse simüle et",
    day1: "Gün 1",
    day2: "Gün 2",
    day3: "Gün 3",
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
      "Kabile 1 her zaman Phoenix Veritas'tır. Kalan kabileler için isimleri, renkleri ve mevcut puanları seçin.",
    initialTribeData: "Başlangıç kabile verileri",
    tribeName: "Kabile adı",
  },
  simulation: {
    title: "GvG Gün 3 sonu projeksiyonu",
    subtitle: "Değişiklikler şimdi olursa mevcut durum ile simüle edilmiş durumun karşılaştırması.",
    eyebrow: "Harabeler ve final projeksiyonu",
    day3Finish: "Gün 3 sonu",
    howToRead: "Final tablosu nasıl okunur:",
    noteLine1:
      "İlk ele geçirme puanları = ilk ele geçirme sütununda seçilen ve henüz mevcut puanlara eklenmemiş bonus.",
    noteLine2:
      "Puan / dk = her kabilenin şu anda simüle edilmiş sahipliğe göre aldığı dakika başına puan.",
    noteLine3:
      "Simüle edilmiş final = mevcut puanlar + bekleyen ilk ele geçirme bonusu + Gün 3 sonuna kadar gelecekteki üretim.",
    bastions: "Kaleler",
    valkyries: "Valkyrie'ler",
    temple: "Tapınak",
    finalSummary: "Final özeti",
    simulatedScoreEvolution: "Simüle edilmiş puan gelişimi",
    simulatedScoreEvolutionSubtitle:
      "Simüle edilmiş sahiplik kullanılarak şu andan Gün 3 sonuna kadar puan artışı.",
  },
  home: {
    title: "Phoenix Veritas araç seti",
    subtitle: "Bir araç seçin ve tüm uygulamada aynı dili kullanın.",
    gvgEyebrow: "GvG",
    gvgTitle: "GvG puan simülatörü",
    gvgDescription:
      "Kabileleri, mevcut puanları ve harabe sahipliğini yapılandırın, ardından gün sonu sonucunu projekte edin.",
    gvgButton: "GvG'yi aç",
    enemyEyebrow: "Analiz",
    enemyTitle: "Düşman kabile analizi",
    enemyDescription:
      "Ekran görüntülerini tara, ana ordu türünü tespit et ve düşman chiefs'leri might'a göre sırala.",
    enemyButton: "Analizi aç",
  },
  enemyAnalysis: {
    title: "Bir Fate War ekran görüntüsü klasörünü tara",
    subtitle:
      "Analiz aracı chief adını, iki might değerini ve belirleyici artefakt slotlarını okur.",
    inputEyebrow: "Girdi",
    inputTitle: "Klasör seçimi ve sıralama modu",
    inputSubtitle:
      "Oyundaki aynı sayfadan ekran görüntüleri içeren bir klasör seçin.",
    screenshotFolder: "Ekran görüntüsü klasörü",
    chooseFolder: "Ekran görüntüsü klasörünü seçmek için buraya tıklayın",
    chooseFolderHelp:
      "Analiz etmek istediğiniz Fate War ekran görüntülerini içeren klasörü seçin. Uygulama sadece dosyaları okur.",
    selectedFolder: "Seçilen klasör",
    noFolderSelected: "Henüz klasör seçilmedi",
    orderBy: "Düşmanları sırala",
    artifactNote:
      "Artefakt seviyeleri yalnızca renkten türetilir: gri 0, yeşil 1, mavi 2, mor 3, altın 4, kırmızı 5. Rün renkleri sadece eşitlik bozucu olarak kullanılır.",
    analyzing: "Analiz ediliyor",
    step: "Adım",
    screenshotsAnalyzed: "Analiz edilen ekran görüntüsü",
    archers: "Okçular",
    berserkers: "Berserkerler",
    cavalry: "Süvari",
    results: "Sonuçlar",
    chiefsClassified: "chief şu şekilde sınıflandırıldı",
    noChiefsClassified: "Şu şekilde sınıflandırılmış chief yok",
    name: "Ad",
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
    allTribesMustHaveAName: "Tüm kabilelerin bir adı olmalıdır.",
    tribeNamesMustBeUnique: "Kabile adları benzersiz olmalıdır.",
  },
  modeSelection: {
    eyebrow: "GvG Simülatörü",
    title: "Mod seç",
    subtitle: "Tablo modunda mı yoksa görsel modda mı çalışmak istediğinizi seçin.",
    tableTitle: "Tablo Modu",
    tableDescription: "Liste tabanlı kurulum ve tablo tabanlı simülasyon ile mevcut akış.",
    visualTitle: "Görsel Mod",
    visualDescription: "Harita tabanlı konum seçimi ve görsel simülasyon ile yeni akış.",
  },
  setupVisual: {
    title: "Görsel Kurulum",
    subtitle:
      "Bu modda renk manuel olarak seçilmez. Haritada seçilen konumdan türetilir.",
    nextStepTitle: "Sonraki adım:",
    nextStepBody:
      "Bu kurulumu, her kabileyi doğrudan bir home spot'a atadığınız harita tabanlı bir sürümle değiştireceğiz.",
    backToModes: "Modlara geri dön",
  },
  simulationVisual: {
    eyebrow: "Görsel Mod",
    title: "Görsel Simülasyon",
    subtitle:
      "Temel yapı hazır. Sonraki adımda görsel kurulumu haritaya, sonra da harabe ve geçit sahipliğine bağlayacağız.",
    calibrationOn: "Kalibrasyon",
    calibrationOff: "Kalibrasyondan çık",
    nextStepTitle: "Sonraki adım",
    nextStepBodyLine1: "Bu placeholder'ı şununla değiştireceğiz:",
    nextStepBodyLine2:
      "1. kabilelerin home spot'lara atanmasıyla görsel kurulum\n2. overlay üzerinde harabeler, geçitler ve sahiplerle görsel simülasyon",
  },
  mapCalibration: {
    pointLabel: "Nokta",
    copyCoordinates: "Koordinatları kopyala",
    reset: "Sıfırla",
    help:
      "Seçmek için bir noktaya tıklayın. 0.2% hareket ettirmek için ok tuşlarını kullanın. 1% hareket ettirmek için Shift + ok tuşlarını kullanın.",
  },
};

export default tr;