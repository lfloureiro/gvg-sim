import Tesseract from "tesseract.js";

export type ArmyType = "archer" | "berserker" | "cavalry";
export type Confidence = "high" | "medium" | "low";
export type SortField = "individualMight" | "heroMight";
export type ArtifactColor =
  | "grey"
  | "green"
  | "blue"
  | "purple"
  | "gold"
  | "red";
export type ArtifactSlotKey =
  | "sword"
  | "shield"
  | "boots"
  | "chest"
  | "helmet"
  | "pants";

export type AnalysisProgress = {
  current: number;
  total: number;
  fileName: string;
  step: string;
};

export type AnalysisMode = "fast" | "balanced" | "accurate";

export type AnalyzeEnemyImagesOptions = {
  mode?: AnalysisMode;
  onProgress?: (progress: AnalysisProgress) => void;
};

export type ArtifactSlotAnalysis = {
  slot: ArtifactSlotKey;
  color: ArtifactColor;
  level: number;
  runeColor: ArtifactColor;
  score: number;
  runeScore: number;
};

export type EnemyAnalysisRow = {
  fileName: string;
  chiefName: string;
  individualMight: number;
  heroMight: number;
  armyType: ArmyType;
  confidence: Confidence;
  slots: Record<ArtifactSlotKey, ArtifactSlotAnalysis>;
  armyScores: Record<ArmyType, number>;
};

export type ArtifactSlotOverride = {
  color?: ArtifactColor;
  level?: number;
  runeColor?: ArtifactColor;
};

export type EnemyAnalysisRowOverride = {
  chiefName?: string;
  individualMight?: number;
  heroMight?: number;
  armyType?: ArmyType;
  ignored?: boolean;
  notes?: string;
  slots?: Partial<Record<ArtifactSlotKey, ArtifactSlotOverride>>;
};

export type EnemyAnalysisEffectiveRow = EnemyAnalysisRow & {
  ignored: boolean;
  notes: string;
  hasManualChanges: boolean;
  sourceRow: EnemyAnalysisRow;
};

type GroupedRows = {
  armyType: ArmyType;
  label: string;
  rows: EnemyAnalysisRow[];
};

type OCRWord = {
  text: string;
  confidence: number;
};

type OCRWordBox = {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
};

type OCRResultWithBoxesLite = {
  text: string;
  words: OCRWordBox[];
};

type OCRResultLite = {
  text: string;
  words: OCRWord[];
};

type NameCandidate = {
  value: string;
  weight: number;
};

type NumericCandidate = {
  value: string;
  weight: number;
  masked: boolean;
  trimLeft: number;
  pageSegMode: "6" | "7";
};

type NumericCandidateGroup = {
  value: string;
  totalWeight: number;
  hits: number;
  maskedHits: number;
  trimTotal: number;
  psm6Hits: number;
  psm7Hits: number;
  sources: string[];
  score: number;
};

type NumericReadDebug = {
  value: number;
  candidateLines: string[];
};

type MightPairDebug = {
  individualMight: number;
  heroMight: number;
  candidateLines: string[];
};

export type PixelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PixelCircle = {
  cx: number;
  cy: number;
  r: number;
  score: number;
};

type NormalizedRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LayoutModel = {
  topInfoRect: PixelRect;
  artifactTitleRect: PixelRect;
  artifactGridRect: PixelRect;
  slotRects: Record<ArtifactSlotKey, PixelRect>;
  artifactCircles: Partial<Record<ArtifactSlotKey, PixelCircle>>;
  nameRect: PixelRect | null;
};

export type DebugCropResult = {
  id: string;
  label: string;
  imageUrl: string;
  meta?: string;
};

export type DebugTimings = {
  totalMs: number;
  loadMs: number;
  layoutMs: number;
  nameMs: number;
  mightMs: number;
  artifactsMs: number;
  cropsMs: number;
};

export type DebugAnalysisResult = {
  fileName: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  layout: LayoutModel;
  chiefName: string;
  individualMight: number;
  heroMight: number;
  armyType: ArmyType;
  confidence: Confidence;
  slots: Record<ArtifactSlotKey, ArtifactSlotAnalysis>;
  crops: DebugCropResult[];
  mightDebugLines?: string[];
  timings?: DebugTimings;
};

const OCR_LANGUAGE = "eng";
const OCR_BACKEND_FULL_SCREENSHOT_URL =
  "http://127.0.0.1:8090/ocr/might/full-screenshot";
const OCR_BACKEND_TIMEOUT_MS = 120000;

type BackendFullScreenshotOcr = {
  chiefName: string | null;
  individualMight: number;
  kills: number;
};

void [
  shouldRetryChiefNameBatch,
  extractChiefName,
  extractMightPair,
  extractMightPairDebug,
];

function parseBackendNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const normalized = value.replace(/\D/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function parseBackendName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized || normalized.toLowerCase() === "unknown") {
    return null;
  }

  return normalized;
}

async function canvasToPngFile(
  canvas: HTMLCanvasElement,
  fileName: string
): Promise<File> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (!value) {
        reject(new Error("Could not convert canvas to PNG."));
        return;
      }

      resolve(value);
    }, "image/png");
  });

  const safeName = fileName.replace(/\.[^.]+$/, "");

  return new File([blob], `${safeName}.ocr-panel.png`, {
    type: "image/png",
  });
}

async function readFullScreenshotMightFromBackend(
  file: File
): Promise<BackendFullScreenshotOcr | null> {
  if (typeof fetch !== "function") {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, OCR_BACKEND_TIMEOUT_MS);

  try {
    const body = new FormData();
    body.append("file", file, file.name);

    const response = await fetch(OCR_BACKEND_FULL_SCREENSHOT_URL, {
      method: "POST",
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Record<string, unknown>;

    return {
      chiefName:
        parseBackendName(payload.chiefName) ??
        parseBackendName(payload.name) ??
        parseBackendName(payload.chief_name),
      individualMight:
        parseBackendNumber(payload.individualMight) ||
        parseBackendNumber(payload.individual_might) ||
        parseBackendNumber(payload.might) ||
        parseBackendNumber(payload.value),
      kills:
        parseBackendNumber(payload.kills) ||
        parseBackendNumber(payload.killCount) ||
        parseBackendNumber(payload.kill_count),
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getBackendDebugLines(backendOcr: BackendFullScreenshotOcr | null): string[] {
  if (!backendOcr) {
    return ["Backend OCR: unavailable"];
  }

  return [
    `Backend OCR name: ${backendOcr.chiefName ?? "not found"}`,
    `Backend OCR individual might: ${formatNumber(backendOcr.individualMight)}`,
    `Backend OCR kills: ${formatNumber(backendOcr.kills)}`,
  ];
}


function nowMs() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

type OcrWorker = Awaited<ReturnType<typeof Tesseract.createWorker>>;

let ocrWorkerPromise: Promise<OcrWorker> | null = null;
let ocrQueue: Promise<unknown> = Promise.resolve();

function runOcrTask<T>(task: () => Promise<T>): Promise<T> {
  const next = ocrQueue.then(task, task);
  ocrQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

async function getOcrWorker(): Promise<OcrWorker> {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = Tesseract.createWorker(OCR_LANGUAGE);
  }

  return await ocrWorkerPromise;
}

async function disposeOcrWorker(): Promise<void> {
  await ocrQueue.catch(() => undefined);

  if (!ocrWorkerPromise) {
    return;
  }

  const currentWorkerPromise = ocrWorkerPromise;
  ocrWorkerPromise = null;

  try {
    const worker = await currentWorkerPromise;
    await worker.terminate();
  } catch {
    // ignora erros de cleanup
  }
}

const COLOR_WEIGHTS: Record<ArtifactColor, number> = {
  grey: 0,
  green: 10,
  blue: 20,
  purple: 30,
  gold: 40,
  red: 50,
};

const LEVEL_BY_ARTIFACT_COLOR: Record<ArtifactColor, number> = {
  grey: 0,
  green: 1,
  blue: 2,
  purple: 3,
  gold: 4,
  red: 5,
};

const ARMY_ORDER: ArmyType[] = ["archer", "berserker", "cavalry"];

const ARMY_LABELS: Record<ArmyType, string> = {
  archer: "Archers",
  berserker: "Berserkers",
  cavalry: "Cavalry",
};

const PRIMARY_SLOTS: Record<ArmyType, [ArtifactSlotKey, ArtifactSlotKey]> = {
  archer: ["sword", "helmet"],
  berserker: ["shield", "chest"],
  cavalry: ["boots", "pants"],
};

const SLOT_ORDER: ArtifactSlotKey[] = [
  "sword",
  "shield",
  "boots",
  "chest",
  "helmet",
  "pants",
];

const ARTIFACT_TITLE_SEARCH_REGIONS: NormalizedRegion[] = [
  { x: 0.62, y: 0.32, width: 0.36, height: 0.20 },
  { x: 0.52, y: 0.30, width: 0.46, height: 0.24 },
  { x: 0.42, y: 0.30, width: 0.56, height: 0.26 },
  { x: 0.30, y: 0.28, width: 0.68, height: 0.30 },
];

type ArtifactSearchTarget = {
  slot: ArtifactSlotKey | "ignore";
  row: number;
  col: number;
};

const ARTIFACT_SEARCH_TARGETS: ArtifactSearchTarget[] = [
  { slot: "sword", row: 0, col: 0 },
  { slot: "shield", row: 0, col: 1 },
  { slot: "boots", row: 0, col: 2 },

  { slot: "chest", row: 1, col: 0 },
  { slot: "helmet", row: 1, col: 1 },
  { slot: "ignore", row: 1, col: 2 },

  { slot: "pants", row: 2, col: 0 },
  { slot: "ignore", row: 2, col: 1 },
];

function buildAnalysisCanvas(rootCanvas: HTMLCanvasElement): HTMLCanvasElement {
  if (rootCanvas.width <= rootCanvas.height * 1.12) {
    return rootCanvas;
  }

  const panelStartX = findRightPanelStartX(rootCanvas);

  return cropPixels(
    rootCanvas,
    panelStartX,
    0,
    rootCanvas.width - panelStartX,
    rootCanvas.height
  );
}

function findRightPanelStartX(rootCanvas: HTMLCanvasElement): number {
  const context = rootCanvas.getContext("2d");

  if (!context) {
    return Math.floor(rootCanvas.width * 0.58);
  }

  const { width, height } = rootCanvas;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  const xStart = Math.floor(width * 0.42);
  const xEnd = Math.floor(width * 0.82);
  const yStart = Math.floor(height * 0.04);
  const yEnd = Math.floor(height * 0.96);

  const darknessScores: number[] = new Array(width).fill(0);

  for (let x = xStart; x < xEnd; x += 1) {
    let score = 0;
    let samples = 0;

    for (let y = yStart; y < yEnd; y += 3) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (a < 20) {
        continue;
      }

      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const { value } = rgbToHsv(r, g, b);

      const darkness =
        Math.max(0, 150 - luminance) / 150 +
        Math.max(0, 0.52 - value) * 1.6;

      score += darkness;
      samples += 1;
    }

    darknessScores[x] = samples > 0 ? score / samples : 0;
  }

  const smoothed: number[] = new Array(width).fill(0);

  for (let x = xStart; x < xEnd; x += 1) {
    let total = 0;
    let count = 0;

    for (let offset = -8; offset <= 8; offset += 1) {
      const px = x + offset;
      if (px < xStart || px >= xEnd) {
        continue;
      }

      total += darknessScores[px];
      count += 1;
    }

    smoothed[x] = count > 0 ? total / count : darknessScores[x];
  }

  let bestX = Math.floor(width * 0.58);
  let bestGain = Number.NEGATIVE_INFINITY;

  for (let x = xStart + 24; x < xEnd - 40; x += 1) {
    const left = meanArrayRange(smoothed, x - 20, x - 4);
    const right = meanArrayRange(smoothed, x + 4, x + 36);
    const gain = right - left;

    if (gain > bestGain) {
      bestGain = gain;
      bestX = x;
    }
  }

  return clamp(
    Math.floor(bestX - width * 0.012),
    Math.floor(width * 0.48),
    Math.floor(width * 0.74)
  );
}

function meanArrayRange(values: number[], start: number, end: number) {
  let total = 0;
  let count = 0;

  for (let index = start; index <= end; index += 1) {
    if (index < 0 || index >= values.length) {
      continue;
    }

    total += values[index];
    count += 1;
  }

  return count > 0 ? total / count : 0;
}

function normalizeOcrToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function isArtifactTitleToken(value: string) {
  const token = normalizeOcrToken(value);

  return (
    token.includes("artifact") ||
    token.includes("artefact") ||
    token.includes("artefatto") ||
    token.includes("artefato")
  );
}

function isYellowNamePixel(
  r: number,
  g: number,
  b: number,
  a: number,
  mode: "soft" | "strict" = "soft"
) {
  if (a < 20) {
    return false;
  }

  const { hue, saturation, value } = rgbToHsv(r, g, b);
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  const blueGap = Math.min(r, g) - b;
  const rgGap = Math.abs(r - g);

  if (mode === "strict") {
    return (
      hue >= 34 &&
      hue <= 62 &&
      saturation >= 0.46 &&
      value >= 0.58 &&
      chroma >= 28 &&
      blueGap >= 28 &&
      rgGap <= 92 &&
      r >= 110 &&
      g >= 110
    );
  }

  return (
    hue >= 30 &&
    hue <= 66 &&
    saturation >= 0.32 &&
    value >= 0.44 &&
    chroma >= 20 &&
    blueGap >= 16 &&
    rgGap <= 116 &&
    r >= 90 &&
    g >= 90
  );
}

function shouldRetryChiefNameBatch(name: string) {
  if (name === "Unknown") {
    return true;
  }

  if (/[._-]$/.test(name)) {
    return true;
  }

  if (/^[A-Za-z0-9]{1,2}[._-][A-Za-z0-9].{4,}$/u.test(name)) {
    return true;
  }

  if (/^[A-Za-z]{1,2}[A-Z][A-Za-z0-9]{5,}$/u.test(name)) {
    return true;
  }

  return false;
}

function resolveAnalyzeEnemyImagesOptions(
  options?: AnalyzeEnemyImagesOptions | ((progress: AnalysisProgress) => void)
): {
  mode: AnalysisMode;
  onProgress?: (progress: AnalysisProgress) => void;
} {
  if (typeof options === "function") {
    return {
      mode: "accurate",
      onProgress: options,
    };
  }

  return {
    mode: options?.mode ?? "fast",
    onProgress: options?.onProgress,
  };
}

export async function analyzeEnemyImages(
  files: File[],
  options?: AnalyzeEnemyImagesOptions | ((progress: AnalysisProgress) => void)
): Promise<EnemyAnalysisRow[]> {
  const { mode, onProgress } = resolveAnalyzeEnemyImagesOptions(options);
  const rows: EnemyAnalysisRow[] = [];

  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];

      try {
        onProgress?.({
          current: index + 1,
          total: files.length,
          fileName: file.name,
          step: `Loading screenshot (${mode})`,
        });

        const rootCanvas = await fileToCanvas(file);
        const analysisCanvas = buildAnalysisCanvas(rootCanvas);

        onProgress?.({
          current: index + 1,
          total: files.length,
          fileName: file.name,
          step: "Detecting layout",
        });

        const layout = await detectLayout(analysisCanvas, {
          allowNameOcrFallback: false,
        });

        onProgress?.({
          current: index + 1,
          total: files.length,
          fileName: file.name,
          step: "Reading backend OCR",
        });

        const backendFile = await canvasToPngFile(analysisCanvas, file.name);
        const backendOcr = await readFullScreenshotMightFromBackend(backendFile);

        const chiefName = backendOcr?.chiefName ?? "Unknown";
        const individualMight = backendOcr?.individualMight ?? 0;
        const heroMight = backendOcr?.kills ?? 0;

        onProgress?.({
          current: index + 1,
          total: files.length,
          fileName: file.name,
          step: "Analyzing artifacts",
        });

        const slots = analyzeSlots(analysisCanvas, layout);

        const armyScores = buildArmyScores(slots);
        const armyType = decideArmyType(armyScores, slots);
        const confidence = getConfidenceLabel(armyScores, armyType, chiefName);

        rows.push({
          fileName: file.name,
          chiefName,
          individualMight,
          heroMight,
          armyType,
          confidence,
          slots,
          armyScores,
        });
      } catch {
        // ignora screenshots problemáticos e continua
      }
    }

    return rows;
  } finally {
    await disposeOcrWorker();
  }
}

export async function analyzeEnemyImageDebug(
  file: File
): Promise<DebugAnalysisResult> {
  try {
    const totalStart = nowMs();

    const loadStart = nowMs();
    const rootCanvas = await fileToCanvas(file);
    const analysisCanvas = buildAnalysisCanvas(rootCanvas);
    const loadMs = nowMs() - loadStart;

    const layoutStart = nowMs();
    const layout = await detectLayout(analysisCanvas);
    const layoutMs = nowMs() - layoutStart;

    const nameStart = nowMs();
    const backendFile = await canvasToPngFile(analysisCanvas, file.name);
    const backendOcr = await readFullScreenshotMightFromBackend(backendFile);
    const nameMs = nowMs() - nameStart;

    const chiefName = backendOcr?.chiefName ?? "Unknown";
    const individualMight = backendOcr?.individualMight ?? 0;
    const heroMight = backendOcr?.kills ?? 0;

    const mightStart = nowMs();
    const mightMs = nowMs() - mightStart;
    const backendDebugLines = getBackendDebugLines(backendOcr);

    const artifactsStart = nowMs();
    const slots = analyzeSlots(analysisCanvas, layout);
    const armyScores = buildArmyScores(slots);
    const armyType = decideArmyType(armyScores, slots);
    const confidence = getConfidenceLabel(armyScores, armyType, chiefName);
    const artifactsMs = nowMs() - artifactsStart;

    const cropsStart = nowMs();
    const crops = buildDebugCrops(
      analysisCanvas,
      layout,
      chiefName,
      individualMight,
      slots,
      backendDebugLines
    );
    const cropsMs = nowMs() - cropsStart;

    const totalMs = nowMs() - totalStart;

    return {
      fileName: file.name,
      imageUrl: canvasToDataUrl(analysisCanvas),
      imageWidth: analysisCanvas.width,
      imageHeight: analysisCanvas.height,
      layout,
      chiefName,
      individualMight,
      heroMight,
      armyType,
      confidence,
      slots,
      mightDebugLines: backendDebugLines,
      crops,
      timings: {
        totalMs,
        loadMs,
        layoutMs,
        nameMs,
        mightMs,
        artifactsMs,
        cropsMs,
      },
    };
  } finally {
    await disposeOcrWorker();
  }
}

export function groupRowsByArmy(
  rows: EnemyAnalysisRow[],
  sortField: SortField
): GroupedRows[] {
  return ARMY_ORDER.map((armyType) => {
    const filtered = rows
      .filter((row) => row.armyType === armyType)
      .sort((left, right) => compareRows(right, left, sortField));

    return {
      armyType,
      label: ARMY_LABELS[armyType],
      rows: filtered,
    };
  });
}

export function countByArmyType(rows: EnemyAnalysisRow[]) {
  return rows.reduce(
    (accumulator, row) => {
      accumulator[row.armyType] += 1;
      return accumulator;
    },
    {
      archer: 0,
      berserker: 0,
      cavalry: 0,
    } as Record<ArmyType, number>
  );
}

export function formatConfidence(confidence: Confidence) {
  if (confidence === "high") return "High";
  if (confidence === "medium") return "Medium";
  return "Low";
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function getPrimarySlotSummary(row: EnemyAnalysisRow) {
  const [firstKey, secondKey] = PRIMARY_SLOTS[row.armyType];
  const first = row.slots[firstKey];
  const second = row.slots[secondKey];

  return `${getSlotLabel(first.slot)} ${capitalize(first.color)} Lv.${first.level} · ${getSlotLabel(second.slot)} ${capitalize(second.color)} Lv.${second.level}`;
}

export function applyEnemyAnalysisOverride(
  row: EnemyAnalysisRow,
  override?: EnemyAnalysisRowOverride
): EnemyAnalysisEffectiveRow {
  const mergedSlots = Object.fromEntries(
    SLOT_ORDER.map((slotKey) => {
      const baseSlot = row.slots[slotKey];
      const slotOverride = override?.slots?.[slotKey];

      const color = slotOverride?.color ?? baseSlot.color;
      const level = slotOverride?.level ?? baseSlot.level;
      const runeColor = slotOverride?.runeColor ?? baseSlot.runeColor;

      return [
        slotKey,
        {
          ...baseSlot,
          color,
          level,
          runeColor,
          score: COLOR_WEIGHTS[color] * 100 + level,
          runeScore: COLOR_WEIGHTS[runeColor],
        },
      ];
    })
  ) as Record<ArtifactSlotKey, ArtifactSlotAnalysis>;

  const chiefName = override?.chiefName ?? row.chiefName;
  const individualMight = override?.individualMight ?? row.individualMight;
  const heroMight = override?.heroMight ?? row.heroMight;
  const armyScores = buildArmyScores(mergedSlots);
  const armyType = override?.armyType ?? decideArmyType(armyScores, mergedSlots);
  const confidence = getConfidenceLabel(armyScores, armyType, chiefName);

  return {
    ...row,
    chiefName,
    individualMight,
    heroMight,
    armyType,
    confidence,
    slots: mergedSlots,
    armyScores,
    ignored: override?.ignored ?? false,
    notes: override?.notes?.trim() ?? "",
    hasManualChanges: hasRowOverrideChanges(override),
    sourceRow: row,
  };
}

export function getEnemyAnalysisWarnings(row: EnemyAnalysisRow): string[] {
  const warnings: string[] = [];

  if (row.chiefName === "Unknown") {
    warnings.push("Name OCR failed");
  } else {
    if (row.chiefName.length < 4) {
      warnings.push("Name looks too short");
    }

    if (/[._-]$/.test(row.chiefName)) {
      warnings.push("Name ends with trailing symbol");
    }
  }

  if (row.individualMight <= 0) {
    warnings.push("Individual Might is missing or invalid");
  }

  if (row.confidence === "low") {
    warnings.push("Army type confidence is low");
  }

  return warnings;
}

function hasRowOverrideChanges(override?: EnemyAnalysisRowOverride) {
  if (!override) {
    return false;
  }

  if (
    override.chiefName !== undefined ||
    override.individualMight !== undefined ||
    override.heroMight !== undefined ||
    override.armyType !== undefined ||
    override.ignored !== undefined ||
    (override.notes?.trim() ?? "") !== ""
  ) {
    return true;
  }

  if (!override.slots) {
    return false;
  }

  return Object.values(override.slots).some(
    (slotOverride) =>
      slotOverride?.color !== undefined ||
      slotOverride?.level !== undefined ||
      slotOverride?.runeColor !== undefined
  );
}

function compareRows(
  left: EnemyAnalysisRow,
  right: EnemyAnalysisRow,
  sortField: SortField
) {
  const primary = left[sortField] - right[sortField];
  if (primary !== 0) {
    return primary;
  }

  const secondaryField: SortField =
    sortField === "individualMight" ? "heroMight" : "individualMight";

  const secondary = left[secondaryField] - right[secondaryField];
  if (secondary !== 0) {
    return secondary;
  }

  return left.chiefName.localeCompare(right.chiefName);
}

async function detectChiefNameRect(
  rootCanvas: HTMLCanvasElement,
  infoRect: PixelRect,
  allowOcrFallback = true
): Promise<PixelRect | null> {
  const yellowRect = findYellowNameRect(rootCanvas);
  if (yellowRect) {
    return yellowRect;
  }

  if (!allowOcrFallback) {
    return null;
  }

  return await findNameRectByOCRFallback(rootCanvas, infoRect);
}

async function findNameRectByOCRFallback(
  rootCanvas: HTMLCanvasElement,
  infoRect: PixelRect
): Promise<PixelRect | null> {
  const searchCrop = cropRelativeToRect(rootCanvas, infoRect, {
    x: 0.08,
    y: 0.02,
    width: 0.80,
    height: 0.24,
  });

  const variants = [
    upscaleCanvas(buildYellowTextCanvas(searchCrop, "strict"), 6),
    upscaleCanvas(buildYellowTextCanvas(searchCrop, "soft"), 5),
  ];

  let best:
    | {
        text: string;
        confidence: number;
        rect: PixelRect;
        score: number;
      }
    | null = null;

  for (const variant of variants) {
    const ocr = await recognizeDetailed(variant, {
      whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.@€",
      pageSegMode: "7",
    });

    const words = (ocr.words ?? []) as OCRWord[];

    for (const word of words) {
      const cleaned = cleanLeadingNoise(word.text ?? "");

      if (!isLikelyChiefNameToken(cleaned)) {
        continue;
      }

      const confidence = Number.isFinite(word.confidence) ? word.confidence : 0;
      const score = scoreNameCandidate(cleaned) + confidence * 0.7;

      const approxRect: PixelRect = {
        x: infoRect.x + infoRect.width * 0.12,
        y: infoRect.y + infoRect.height * 0.03,
        width: infoRect.width * 0.60,
        height: infoRect.height * 0.18,
      };

      if (!best || score > best.score) {
        best = {
          text: cleaned,
          confidence,
          rect: approxRect,
          score,
        };
      }
    }
  }

  if (!best) {
    return null;
  }

  return expandPixelRect(rootCanvas, best.rect, 8, 8, 10);
}

function isLikelyChiefNameToken(value: string) {
  if (value === "Unknown") {
    return false;
  }

  if (!/[A-Za-z]/.test(value)) {
    return false;
  }

  if (value.length < 3 || value.length > 22) {
    return false;
  }

  if (
    /kingdom|regno|reino|artifact|artefact|artefatto|artefato|chief|capo|info|go|vai/i.test(
      value
    )
  ) {
    return false;
  }

  return true;
}

async function detectLayout(
  rootCanvas: HTMLCanvasElement,
  options?: {
    allowNameOcrFallback?: boolean;
  }
): Promise<LayoutModel> {
  const artifactTitleRect = await findArtifactTitleRect(rootCanvas);
  let topInfoRect = buildTopInfoRect(rootCanvas, artifactTitleRect);
  const nameRect = await detectChiefNameRect(
    rootCanvas,
    topInfoRect,
    options?.allowNameOcrFallback ?? true
  );

  if (nameRect) {
    topInfoRect = buildTopInfoRectFromName(rootCanvas, nameRect);
  }

  const artifactGridRect = buildArtifactGridRect(rootCanvas, artifactTitleRect);
  const artifactCircles = detectArtifactCircles(rootCanvas, artifactGridRect);
  const slotRects = buildSlotRects(rootCanvas, artifactGridRect, artifactCircles);

  return {
    topInfoRect,
    artifactTitleRect,
    artifactGridRect,
    slotRects,
    artifactCircles,
    nameRect,
  };
}

async function findArtifactTitleRect(
  rootCanvas: HTMLCanvasElement
): Promise<PixelRect> {
  const rootWidth = rootCanvas.width;
  const rootHeight = rootCanvas.height;

  const portraitRegions: NormalizedRegion[] = [
    { x: 0.00, y: 0.26, width: 0.98, height: 0.18 },
    { x: 0.00, y: 0.22, width: 0.98, height: 0.24 },
    { x: 0.00, y: 0.30, width: 0.98, height: 0.16 },
  ];

  const searchRegions =
    rootWidth < rootHeight
      ? portraitRegions
      : ARTIFACT_TITLE_SEARCH_REGIONS;

  for (const region of searchRegions) {
    const crop = cropNormalized(rootCanvas, region);
    const prepared = upscaleCanvas(buildWhiteTextCanvas(crop), 3);

    try {
      const result = await recognizeDetailedWithBoxes(prepared, {
        whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' ",
        pageSegMode: "6",
      });

      const titleWord = result.words.find((word) =>
        isArtifactTitleToken(word.text ?? "")
      );

      if (titleWord) {
        const cropX = region.x * rootWidth;
        const cropY = region.y * rootHeight;
        const scale = 3;

        const x = cropX + titleWord.bbox.x0 / scale;
        const y = cropY + titleWord.bbox.y0 / scale;
        const width = (titleWord.bbox.x1 - titleWord.bbox.x0) / scale;
        const height = (titleWord.bbox.y1 - titleWord.bbox.y0) / scale;

        return {
          x: Math.max(x - rootWidth * 0.06, 0),
          y: Math.max(y - rootHeight * 0.01, 0),
          width: Math.min(width + rootWidth * 0.18, rootWidth * 0.52),
          height: Math.max(height + rootHeight * 0.02, rootHeight * 0.05),
        };
      }
    } catch {
      // tenta a região seguinte
    }
  }

  return rootWidth < rootHeight
    ? {
        x: rootWidth * 0.02,
        y: rootHeight * 0.34,
        width: rootWidth * 0.92,
        height: rootHeight * 0.06,
      }
    : {
        x: rootWidth * 0.58,
        y: rootHeight * 0.39,
        width: rootWidth * 0.33,
        height: rootHeight * 0.07,
      };
}

function buildArtifactGridRect(
  rootCanvas: HTMLCanvasElement,
  titleRect: PixelRect
): PixelRect {
  const rootWidth = rootCanvas.width;
  const rootHeight = rootCanvas.height;

  const x = clamp(
    Math.min(titleRect.x - rootWidth * 0.01, rootWidth * 0.05),
    rootWidth * 0.02,
    rootWidth * 0.08
  );

  const y = clamp(
    titleRect.y + titleRect.height + rootHeight * 0.008,
    0,
    rootHeight * 0.90
  );

  const right = clamp(
    rootWidth - rootWidth * 0.035,
    x + rootWidth * 0.78,
    rootWidth
  );

  const bottom = clamp(
    rootHeight - rootHeight * 0.02,
    y + rootHeight * 0.24,
    rootHeight
  );

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  };
}

function buildSlotRects(
  rootCanvas: HTMLCanvasElement,
  gridRect: PixelRect,
  artifactCircles: Partial<Record<ArtifactSlotKey, PixelCircle>> = {}
): Record<ArtifactSlotKey, PixelRect> {
  void rootCanvas;

  const cellWidth = gridRect.width / 3;
  const cellHeight = gridRect.height / 3;

  function fixedSlotRect(col: number, row: number): PixelRect {
    return {
      x: gridRect.x + col * cellWidth + cellWidth * 0.10,
      y: gridRect.y + row * cellHeight + cellHeight * 0.08,
      width: cellWidth * 0.80,
      height: cellHeight * 0.82,
    };
  }

  const fallback: Record<ArtifactSlotKey, PixelRect> = {
    sword: fixedSlotRect(0, 0),
    shield: fixedSlotRect(1, 0),
    boots: fixedSlotRect(2, 0),
    chest: fixedSlotRect(0, 1),
    helmet: fixedSlotRect(1, 1),
    pants: fixedSlotRect(0, 2),
  };

  for (const slot of SLOT_ORDER) {
    const circle = artifactCircles[slot];
    if (!circle) {
      continue;
    }

    const pad = circle.r * 0.18;

    fallback[slot] = {
      x: clamp(circle.cx - circle.r - pad, 0, rootCanvas.width - 1),
      y: clamp(circle.cy - circle.r - pad, 0, rootCanvas.height - 1),
      width: clamp(
        circle.r * 2 + pad * 2,
        1,
        rootCanvas.width - clamp(circle.cx - circle.r - pad, 0, rootCanvas.width - 1)
      ),
      height: clamp(
        circle.r * 2 + pad * 2,
        1,
        rootCanvas.height - clamp(circle.cy - circle.r - pad, 0, rootCanvas.height - 1)
      ),
    };
  }

  return fallback;
}

function buildTopInfoRect(
  rootCanvas: HTMLCanvasElement,
  titleRect: PixelRect
): PixelRect {
  const nameRect = findYellowNameRect(rootCanvas);

  if (nameRect) {
    return buildTopInfoRectFromName(rootCanvas, nameRect);
  }

  const rootWidth = rootCanvas.width;
  const x = clamp(titleRect.x - rootWidth * 0.02, 0, rootWidth * 0.98);
  const y = 0;
  const width = rootWidth - x - rootWidth * 0.02;
  const height = Math.max(
    titleRect.y - rootCanvas.height * 0.02,
    rootCanvas.height * 0.18
  );

  return { x, y, width, height };
}

function findYellowNameRect(rootCanvas: HTMLCanvasElement): PixelRect | null {
  const searchRegion: NormalizedRegion = {
    x: 0.08,
    y: 0.05,
    width: 0.84,
    height: 0.22,
  };

  const search = cropNormalized(rootCanvas, searchRegion);
  const context = search.getContext("2d");

  if (!context) {
    return null;
  }

  const { width, height } = search;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  const rowCounts = new Array<number>(height).fill(0);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (isYellowNamePixel(r, g, b, a)) {
        rowCounts[y] += 1;
      }
    }
  }

  let bestStart = -1;
  let bestEnd = -1;
  let bestScore = 0;

  for (let start = 0; start < height; start += 1) {
    let score = 0;

    for (let end = start; end < Math.min(height, start + 28); end += 1) {
      score += rowCounts[end];

      const bandHeight = end - start + 1;
      if (bandHeight < 6) {
        continue;
      }

      if (score > bestScore) {
        bestScore = score;
        bestStart = start;
        bestEnd = end;
      }
    }
  }

  if (bestStart < 0 || bestEnd < 0 || bestScore < width * 2.8) {
    return null;
  }

  const bandTop = Math.max(0, bestStart - 8);
  const bandBottom = Math.min(height - 1, bestEnd + 8);

  let minX = width;
  let maxX = -1;

  for (let y = bandTop; y <= bandBottom; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (isYellowNamePixel(r, g, b, a)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  if (maxX < minX) {
    return null;
  }

  const searchX = searchRegion.x * rootCanvas.width;
  const searchY = searchRegion.y * rootCanvas.height;

  const rect = {
    x: Math.max(searchX + minX - 8, 0),
    y: Math.max(searchY + bandTop - 6, 0),
    width: Math.min(maxX - minX + 17, rootCanvas.width),
    height: Math.min(bandBottom - bandTop + 13, rootCanvas.height),
  };

  return expandPixelRect(rootCanvas, rect, 4, 4, 6);
}

function findMightLineRects(
  rootCanvas: HTMLCanvasElement,
  infoRect: PixelRect
): { individualRect: PixelRect | null; heroRect: PixelRect | null } {
  const nameRect = findYellowNameRect(rootCanvas);

  const searchX = nameRect
    ? clamp(nameRect.x - 12, infoRect.x, rootCanvas.width - 1)
    : clamp(infoRect.x + infoRect.width * 0.22, 0, rootCanvas.width - 1);

  const searchY = nameRect
    ? clamp(nameRect.y + nameRect.height + 6, infoRect.y, rootCanvas.height - 1)
    : clamp(infoRect.y + infoRect.height * 0.26, 0, rootCanvas.height - 1);

  const searchRight = clamp(
    infoRect.x + infoRect.width * 0.88,
    searchX + 80,
    rootCanvas.width
  );

  const searchBottom = clamp(
    infoRect.y + infoRect.height * 0.70,
    searchY + 60,
    rootCanvas.height
  );

  const searchRect: PixelRect = {
    x: searchX,
    y: searchY,
    width: searchRight - searchX,
    height: searchBottom - searchY,
  };

  const searchCrop = cropPixelRect(rootCanvas, searchRect);
  const mask = buildWhiteTextCanvas(searchCrop);
  const context = mask.getContext("2d");

  if (!context) {
    return { individualRect: null, heroRect: null };
  }

  const { width, height } = mask;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  const rowCounts = new Array<number>(height).fill(0);

  for (let y = 0; y < height; y += 1) {
    let count = 0;

    for (let x = Math.floor(width * 0.10); x < width; x += 1) {
      const index = (y * width + x) * 4;
      const r = data[index];

      if (r < 80) {
        count += 1;
      }
    }

    rowCounts[y] = count;
  }

  const smoothed = rowCounts.map((_, index) => {
    let total = 0;
    let samples = 0;

    for (let offset = -2; offset <= 2; offset += 1) {
      const row = index + offset;
      if (row < 0 || row >= height) {
        continue;
      }

      total += rowCounts[row];
      samples += 1;
    }

    return samples > 0 ? total / samples : rowCounts[index];
  });

  const threshold = Math.max(10, Math.floor(width * 0.045));
  const bands: Array<{ start: number; end: number; score: number }> = [];

  let currentStart = -1;
  let currentScore = 0;

  for (let y = 0; y < height; y += 1) {
    const active = smoothed[y] >= threshold;

    if (active && currentStart < 0) {
      currentStart = y;
      currentScore = smoothed[y];
      continue;
    }

    if (active && currentStart >= 0) {
      currentScore += smoothed[y];
      continue;
    }

    if (!active && currentStart >= 0) {
      const end = y - 1;
      if (end - currentStart + 1 >= 8) {
        bands.push({
          start: currentStart,
          end,
          score: currentScore,
        });
      }
      currentStart = -1;
      currentScore = 0;
    }
  }

  if (currentStart >= 0) {
    const end = height - 1;
    if (end - currentStart + 1 >= 8) {
      bands.push({
        start: currentStart,
        end,
        score: currentScore,
      });
    }
  }

  if (!bands.length) {
    return { individualRect: null, heroRect: null };
  }

  const bestBandScore = Math.max(...bands.map((band) => band.score));
  const orderedStrongBands = bands
    .filter((band) => band.score >= bestBandScore * 0.42)
    .sort((a, b) => a.start - b.start);

  const orderedAllBands = [...bands].sort((a, b) => a.start - b.start);

  const firstBand = orderedStrongBands[0] ?? orderedAllBands[0];
  const secondBand = orderedStrongBands[1] ?? orderedAllBands[1];

  function bandToRect(
    band: { start: number; end: number } | undefined,
    nextBand?: { start: number; end: number }
  ): PixelRect | null {
    if (!band) {
      return null;
    }

    const cappedEnd = nextBand
      ? Math.min(band.end, nextBand.start - 4)
      : band.end;

    if (cappedEnd < band.start) {
      return null;
    }

    const localY = Math.max(band.start - 2, 0);
    const localEnd = Math.min(cappedEnd + 2, searchRect.height - 1);
    const localHeight = Math.max(localEnd - localY + 1, 1);

    const leftPad = Math.floor(searchRect.width * 0.16);
    const rightPad = Math.floor(searchRect.width * 0.03);

    return {
      x: searchRect.x + leftPad,
      y: searchRect.y + localY,
      width: Math.max(searchRect.width - leftPad - rightPad, 1),
      height: localHeight,
    };
  }

  return {
    individualRect: bandToRect(firstBand, secondBand),
    heroRect: bandToRect(secondBand),
  };
}

function buildTopInfoRectFromName(
  rootCanvas: HTMLCanvasElement,
  nameRect: PixelRect
): PixelRect {
  const x = clamp(
    nameRect.x - Math.max(90, nameRect.width * 1.10),
    0,
    rootCanvas.width - 1
  );

  const y = clamp(
    nameRect.y - Math.max(18, nameRect.height * 0.90),
    0,
    rootCanvas.height - 1
  );

  const right = clamp(
    nameRect.x + Math.max(nameRect.width * 1.50, 360),
    1,
    rootCanvas.width
  );

  const bottom = clamp(
    nameRect.y + Math.max(nameRect.height * 4.80, 170),
    1,
    rootCanvas.height
  );

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  };
}

async function extractChiefName(
  rootCanvas: HTMLCanvasElement,
  infoRect: PixelRect,
  providedNameRect?: PixelRect | null,
  fast = false
) {
  const nameRect =
    providedNameRect ??
    (fast
      ? findYellowNameRect(rootCanvas)
      : await detectChiefNameRect(rootCanvas, infoRect));

  const candidates: NameCandidate[] = [];

  if (nameRect) {
    const exactCrop = cropPixelRect(
      rootCanvas,
      expandPixelRect(rootCanvas, nameRect, 8, 8, 10)
    );

    const paddedCrop = cropPixelRect(
      rootCanvas,
      expandPixelRect(rootCanvas, nameRect, 16, 12, 14)
    );

    const tallCrop = cropPixelRect(
      rootCanvas,
      expandPixelRect(rootCanvas, nameRect, 10, 14, 18)
    );

    const leftBias = Math.max(34, Math.floor(nameRect.width * 0.55));
    const leftBiasedX = Math.max(nameRect.x - leftBias, 0);
    const leftBiasedY = Math.max(nameRect.y - 10, 0);

    const leftBiasedCrop = cropPixelRect(rootCanvas, {
      x: leftBiasedX,
      y: leftBiasedY,
      width: Math.min(
        nameRect.width + leftBias + 14,
        rootCanvas.width - leftBiasedX
      ),
      height: Math.min(
        nameRect.height + 20,
        rootCanvas.height - leftBiasedY
      ),
    });

    const crops = fast
      ? [exactCrop, leftBiasedCrop]
      : [exactCrop, paddedCrop, tallCrop, leftBiasedCrop];

    for (const crop of crops) {
      const strictPrepared = upscaleCanvas(
        buildYellowTextCanvas(crop, "strict"),
        6
      );

      const softPrepared = upscaleCanvas(
        buildYellowTextCanvas(crop, "soft"),
        5
      );

      const [strictOcr, softOcr] = await Promise.all([
        recognizeDetailed(strictPrepared, {
          whitelist:
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.@€",
          pageSegMode: "7",
        }),
        recognizeDetailed(softPrepared, {
          whitelist:
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.@€",
          pageSegMode: "7",
        }),
      ]);

      candidates.push(...extractNameCandidatesFromOCR(strictOcr, 1.35));
      candidates.push(...extractNameCandidatesFromOCR(softOcr, 1.10));
    }
  }

  if (!candidates.length && !fast) {
    const fallbackCrop = cropRelativeToRect(rootCanvas, infoRect, {
      x: 0.16,
      y: 0.05,
      width: 0.66,
      height: 0.18,
    });

    const strictPrepared = upscaleCanvas(
      buildYellowTextCanvas(fallbackCrop, "strict"),
      6
    );

    const softPrepared = upscaleCanvas(
      buildYellowTextCanvas(fallbackCrop, "soft"),
      5
    );

    const [strictOcr, softOcr] = await Promise.all([
      recognizeDetailed(strictPrepared, {
        whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.@€",
        pageSegMode: "7",
      }),
      recognizeDetailed(softPrepared, {
        whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.@€",
        pageSegMode: "7",
      }),
    ]);

    candidates.push(...extractNameCandidatesFromOCR(strictOcr, 1.2));
    candidates.push(...extractNameCandidatesFromOCR(softOcr, 1.0));
  }

  return chooseBestChiefName(candidates);
}

function isLikelyShortNoiseChunk(chunk: string) {
  return (
    (
      /^[A-Za-z0-9]{1,2}$/.test(chunk) ||
      /^[A-Za-z0-9]{1,2}[._-]$/.test(chunk) ||
      /^[._-][A-Za-z0-9]{1,2}$/.test(chunk)
    ) &&
    chunk.length <= 3
  );
}

function buildNameVariants(raw: string) {
  const first = cleanLeadingNoise(raw);
  if (first === "Unknown") {
    return [];
  }

  const variants = new Set<string>([first]);
  const queue = [first];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const nextValues: string[] = [];

    const prefixedWithSep = current.match(/^[A-Za-z0-9]{1,2}[._-](.+)$/u);
    if (prefixedWithSep && /^[A-Za-z\p{L}]/u.test(prefixedWithSep[1])) {
      nextValues.push(prefixedWithSep[1]);
    }

    const prefixedCapsDigits = current.match(
      /^[A-Z0-9]{1,2}([A-Za-z\p{L}][A-Za-z0-9_.@€-]{2,})$/u
    );
    if (prefixedCapsDigits) {
      nextValues.push(prefixedCapsDigits[1]);
    }

    const suffixedSingle = current.match(/^(.+?[A-Za-z\p{L}])[A-Za-z]$/u);
    if (suffixedSingle && suffixedSingle[1].length >= 4) {
      nextValues.push(suffixedSingle[1]);
    }

    const suffixedWithSep = current.match(
      /^(.+?)[._-][A-Za-z0-9]{1,2}$/u
    );
    if (suffixedWithSep && suffixedWithSep[1].length >= 4) {
      nextValues.push(suffixedWithSep[1]);
    }

    for (const candidate of nextValues) {
      const normalized = cleanLeadingNoise(candidate);

      if (normalized === "Unknown" || variants.has(normalized)) {
        continue;
      }

      variants.add(normalized);

      if (normalized.length >= 4) {
        queue.push(normalized);
      }
    }
  }

  return [...variants];
}

function pushNameVariants(
  results: NameCandidate[],
  raw: string,
  baseWeight: number
) {
  const variants = buildNameVariants(raw);

  for (let index = 0; index < variants.length; index += 1) {
    results.push({
      value: variants[index],
      weight: baseWeight * (index === 0 ? 1 : 0.82),
    });
  }
}

function extractNameCandidatesFromOCR(
  ocr: OCRResultLite,
  sourceWeight: number
): NameCandidate[] {
  const results: NameCandidate[] = [];

  const wordTokens = ocr.words
    .map((word) => ({
      value: cleanLeadingNoise(word.text),
      confidence: word.confidence,
    }))
    .filter((entry) => entry.value !== "Unknown")
    .filter((entry) => /[\p{L}A-Za-z]/u.test(entry.value))
    .filter((entry) => entry.value.length >= 2);

  for (let index = 0; index < wordTokens.length; index += 1) {
    const one = wordTokens[index];
    pushNameVariants(
      results,
      one.value,
      sourceWeight * Math.max(0.4, one.confidence / 100)
    );

    if (index + 1 < wordTokens.length) {
      const two = cleanLeadingNoise(
        `${wordTokens[index].value}${wordTokens[index + 1].value}`
      );

      if (two !== "Unknown") {
        pushNameVariants(
          results,
          two,
          sourceWeight *
            Math.max(
              0.45,
              Math.min(
                wordTokens[index].confidence,
                wordTokens[index + 1].confidence
              ) / 100
            )
        );
      }
    }
  }

  const rawTokens = (ocr.text ?? "")
    .replace(/[·•]/g, " ")
    .split(/\s+/)
    .map((token) => cleanLeadingNoise(token))
    .filter((token) => token !== "Unknown")
    .filter((token) => /[\p{L}A-Za-z]/u.test(token));

  for (const token of rawTokens) {
    pushNameVariants(results, token, sourceWeight * 0.75);
  }

  return results;
}

function chooseBestChiefName(candidates: NameCandidate[]): string {
  const normalized = candidates
    .map((candidate) => ({
      value: cleanLeadingNoise(candidate.value),
      weight: candidate.weight,
    }))
    .filter((candidate) => candidate.value !== "Unknown");

  if (!normalized.length) {
    return "Unknown";
  }

  const aggregated = new Map<
    string,
    {
      totalWeight: number;
      hits: number;
    }
  >();

  for (const candidate of normalized) {
    const current = aggregated.get(candidate.value) ?? {
      totalWeight: 0,
      hits: 0,
    };

    current.totalWeight += candidate.weight;
    current.hits += 1;
    aggregated.set(candidate.value, current);
  }

  const values = [...aggregated.keys()];

  let best = "Unknown";
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    const entry = aggregated.get(value)!;
    const lower = value.toLowerCase();

    let score =
      entry.totalWeight * 100 +
      entry.hits * 14 +
      scoreNameCandidate(value);

    for (const other of values) {
      if (other === value) {
        continue;
      }

      const otherLower = other.toLowerCase();
      const prefix = commonPrefixLength(lower, otherLower);
      const minLen = Math.min(value.length, other.length);

      if (prefix >= Math.max(3, Math.floor(minLen * 0.6))) {
        if (value.length < other.length) {
          score -= 14 + (other.length - value.length) * 2.2;
        } else {
          score += 10;
        }
      }

      const otherPrefixNoise =
        otherLower.endsWith(lower) &&
        isLikelyShortNoiseChunk(other.slice(0, other.length - value.length));

      const otherSuffixNoise =
        otherLower.startsWith(lower) &&
        isLikelyShortNoiseChunk(other.slice(value.length));

      if (
        other.length >= value.length + 2 &&
        (otherLower.startsWith(lower) || otherLower.endsWith(lower))
      ) {
        if (otherPrefixNoise || otherSuffixNoise) {
          score += 22;
        } else {
          score -= 24;
        }
      }

      const valuePrefixNoise =
        lower.endsWith(otherLower) &&
        isLikelyShortNoiseChunk(value.slice(0, value.length - other.length));

      const valueSuffixNoise =
        lower.startsWith(otherLower) &&
        isLikelyShortNoiseChunk(value.slice(other.length));

      if (
        value.length >= other.length + 2 &&
        (lower.startsWith(otherLower) || lower.endsWith(otherLower))
      ) {
        if (valuePrefixNoise || valueSuffixNoise) {
          score -= 34;
        } else {
          score += 16;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = value;
    }
  }

  return best;
}

function commonPrefixLength(left: string, right: string) {
  const max = Math.min(left.length, right.length);
  let count = 0;

  for (let index = 0; index < max; index += 1) {
    if (left[index] !== right[index]) {
      break;
    }
    count += 1;
  }

  return count;
}

async function extractMightPair(
  rootCanvas: HTMLCanvasElement,
  infoRect: PixelRect,
  mode: NumberReadMode = "full"
): Promise<{ individualMight: number; heroMight: number }> {
  const { individualRect } = findMightLineRects(rootCanvas, infoRect);

  const individualMight = individualRect
    ? await readBestNumberFromRow(cropPixelRect(rootCanvas, individualRect), mode)
    : 0;

  return {
    individualMight,
    heroMight: 0,
  };
}

async function extractMightPairDebug(
  rootCanvas: HTMLCanvasElement,
  infoRect: PixelRect
): Promise<MightPairDebug> {
  const { individualRect } = findMightLineRects(rootCanvas, infoRect);

  if (!individualRect) {
    return {
      individualMight: 0,
      heroMight: 0,
      candidateLines: ["No individual might line detected"],
    };
  }

  const result = await readBestNumberFromRowDebug(
    cropPixelRect(rootCanvas, individualRect)
  );

  return {
    individualMight: result.value,
    heroMight: 0,
    candidateLines: result.candidateLines,
  };
}

function normalizeNumericToken(value: string) {
  return value
    .replace(/[OoQ]/g, "0")
    .replace(/[Il|!]/g, "1")
    .replace(/[Ss]/g, "5")
    .replace(/[Bb]/g, "8")
    .replace(/[Zz]/g, "2")
    .replace(/[^\d]/g, "");
}

const NUMBER_READ_STAGES = [
  { label: "top-58%", height: 0.58 },
  { label: "top-72%", height: 0.72 },
  { label: "top-86%", height: 0.86 },
  { label: "full", height: 1.0 },
] as const;

type NumberReadMode = "fast" | "full" | "full_with_psm6";

const FAST_NUMBER_READ_STAGES = [
  { label: "top-72%", height: 0.72 },
  { label: "top-86%", height: 0.86 },
  { label: "full", height: 1.0 },
] as const;

function getNumberReadStages(mode: NumberReadMode) {
  return mode === "fast" ? FAST_NUMBER_READ_STAGES : NUMBER_READ_STAGES;
}

function cropTopPortion(
  crop: HTMLCanvasElement,
  height: number
): HTMLCanvasElement {
  if (height >= 0.999) {
    return crop;
  }

  return cropNormalized(crop, {
    x: 0,
    y: 0,
    width: 1,
    height,
  });
}

type NumericStagePick = {
  label: string;
  value: number;
  score: number;
  hits: number;
};

function buildNumericCandidateLines(groups: NumericCandidateGroup[]): string[] {
  if (!groups.length) {
    return ["No valid numeric candidates"];
  }

  return groups.slice(0, 8).map((group, index) => {
    const sourceList = group.sources.slice(0, 6).join(", ");

    return [
      `#${index + 1}`,
      group.value,
      `score=${group.score.toFixed(1)}`,
      `hits=${group.hits}`,
      `w=${group.totalWeight.toFixed(2)}`,
      `masked=${group.maskedHits}`,
      `trim=${(group.trimTotal / Math.max(group.hits, 1)).toFixed(2)}`,
      `psm7=${group.psm7Hits}`,
      `psm6=${group.psm6Hits}`,
      sourceList ? `src=${sourceList}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
  });
}

function getStageBias(label: string): number {
  switch (label) {
    case "top-58%":
      return 60;
    case "top-72%":
      return 40;
    case "top-86%":
      return 20;
    case "full":
    default:
      return 0;
  }
}

function chooseBestStagePick(picks: NumericStagePick[]): NumericStagePick | null {
  if (!picks.length) {
    return null;
  }

  const byValue = new Map<number, NumericStagePick[]>();

  for (const pick of picks) {
    const current = byValue.get(pick.value) ?? [];
    current.push(pick);
    byValue.set(pick.value, current);
  }

  let bestConsensus: NumericStagePick[] | null = null;

  for (const group of byValue.values()) {
    if (group.length < 2) {
      continue;
    }

    const sorted = [...group].sort((a, b) => b.score - a.score);

    if (!bestConsensus) {
      bestConsensus = sorted;
      continue;
    }

    if (sorted.length > bestConsensus.length) {
      bestConsensus = sorted;
      continue;
    }

    if (
      sorted.length === bestConsensus.length &&
      sorted[0].score > bestConsensus[0].score
    ) {
      bestConsensus = sorted;
    }
  }

  if (bestConsensus) {
    const consensusBest = bestConsensus[0];
    const consensusValue = String(consensusBest.value);

    if (consensusValue.length === 8) {
      const nineDigitParent = picks
        .filter((pick) => String(pick.value).length === 9)
        .filter((pick) => {
          const nine = String(pick.value);
          const isParent =
            nine.slice(1) === consensusValue || nine.slice(0, 8) === consensusValue;

          if (!isParent) {
            return false;
          }

          if (pick.label !== "top-58%") {
            return true;
          }

          return nine.startsWith(consensusValue);
        })
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score;
          }

          if (right.hits !== left.hits) {
            return right.hits - left.hits;
          }

          return getStageBias(right.label) - getStageBias(left.label);
        })[0];

      if (nineDigitParent) {
        const parentValue = String(nineDigitParent.value);
        const isPrefixParent = parentValue.startsWith(consensusValue);

        const comparableScore = nineDigitParent.score >= consensusBest.score * (isPrefixParent ? 0.86 : 0.97);
        const comparableHits = nineDigitParent.hits >= Math.max(1, consensusBest.hits - (isPrefixParent ? 3 : 1));

        if (comparableScore && comparableHits) {
          return nineDigitParent;
        }
      }
    }

    return consensusBest;
  }

  let best = picks[0];
  let bestComposite = best.score + getStageBias(best.label);

  for (const pick of picks.slice(1)) {
    const composite = pick.score + getStageBias(pick.label);

    if (composite > bestComposite) {
      best = pick;
      bestComposite = composite;
      continue;
    }

    if (composite === bestComposite) {
      if (pick.hits > best.hits) {
        best = pick;
        bestComposite = composite;
        continue;
      }

      if (pick.hits === best.hits && pick.score > best.score) {
        best = pick;
        bestComposite = composite;
      }
    }
  }

  return best;
}

async function evaluateNumberStage(
  crop: HTMLCanvasElement,
  stage: { label: string; height: number },
  mode: NumberReadMode = "full"
): Promise<{
  pick: NumericStagePick | null;
  candidateLines: string[];
}> {
  const stageCrop = cropTopPortion(crop, stage.height);

  const primaryMode: NumberReadMode =
    mode === "full" ? "full" : mode;

  let candidates = await collectNumericCandidatesFromRow(stageCrop, primaryMode);
  let groups = scoreNumericCandidateGroups(candidates);

  const bestPrimary = groups[0];

const needsPsm6Rescue =
  mode === "full" &&
  stage.label === "full" &&
  (
    !bestPrimary ||
    bestPrimary.hits < 3 ||
    bestPrimary.score < 700
  );

  if (needsPsm6Rescue) {
    const rescueCandidates = await collectNumericCandidatesFromRow(
      stageCrop,
      "full_with_psm6"
    );

    const mergedGroups = scoreNumericCandidateGroups([
      ...candidates,
      ...rescueCandidates,
    ]);

    if (mergedGroups.length) {
      groups = mergedGroups;
    }
  }

  if (!groups.length) {
    return {
      pick: null,
      candidateLines: [`[${stage.label}] picked=0`, "  No valid numeric candidates"],
    };
  }

  const best = groups[0];

  return {
    pick: {
      label: stage.label,
      value: Number(best.value),
      score: best.score,
      hits: best.hits,
    },
    candidateLines: [
      `[${stage.label}] picked=${best.value}`,
      ...buildNumericCandidateLines(groups).map((line) => `  ${line}`),
    ],
  };
}

async function readBestNumberFromRow(
  crop: HTMLCanvasElement,
  mode: NumberReadMode = "full"
): Promise<number> {
  const picks: NumericStagePick[] = [];

  for (const stage of getNumberReadStages(mode)) {
    const result = await evaluateNumberStage(crop, stage, mode);

    if (result.pick) {
      picks.push(result.pick);
    }
  }

  const best = chooseBestStagePick(picks);
  return best?.value ?? 0;
}

async function readBestNumberFromRowDebug(
  crop: HTMLCanvasElement
): Promise<NumericReadDebug> {
  const debugLines: string[] = [];
  const picks: NumericStagePick[] = [];

  for (const stage of NUMBER_READ_STAGES) {
    const result = await evaluateNumberStage(crop, stage, "full");
    debugLines.push(...result.candidateLines);

    if (result.pick) {
      picks.push(result.pick);
    }
  }

  const best = chooseBestStagePick(picks);
  debugLines.push(`FINAL=${best?.value ?? 0}`);

  return {
    value: best?.value ?? 0,
    candidateLines: debugLines.length
      ? debugLines
      : ["No valid numeric candidates"],
  };
}

async function collectNumericCandidatesFromRow(
  crop: HTMLCanvasElement,
  mode: NumberReadMode = "full"
): Promise<NumericCandidate[]> {
  if (mode === "fast") {
    const variants: Array<{
      canvas: HTMLCanvasElement;
      masked: boolean;
      trimLeft: number;
      focused: boolean;
    }> = [
      {
        canvas: cropNormalized(crop, {
          x: 0.00,
          y: 0.02,
          width: 1.00,
          height: 0.96,
        }),
        masked: false,
        trimLeft: 0.00,
        focused: false,
      },
      {
        canvas: cropNormalized(crop, {
          x: 0.08,
          y: 0.02,
          width: 0.92,
          height: 0.96,
        }),
        masked: false,
        trimLeft: 0.08,
        focused: false,
      },
      {
        canvas: cropNormalized(crop, {
          x: 0.16,
          y: 0.02,
          width: 0.84,
          height: 0.96,
        }),
        masked: false,
        trimLeft: 0.16,
        focused: false,
      },
      {
        canvas: cropNormalized(crop, {
          x: 0.24,
          y: 0.02,
          width: 0.76,
          height: 0.96,
        }),
        masked: false,
        trimLeft: 0.24,
        focused: false,
      },
      {
        canvas: buildWhiteTextCanvas(
          cropNormalized(crop, {
            x: 0.00,
            y: 0.02,
            width: 1.00,
            height: 0.96,
          })
        ),
        masked: true,
        trimLeft: 0.00,
        focused: false,
      },
      {
        canvas: buildWhiteTextCanvas(
          cropNormalized(crop, {
            x: 0.08,
            y: 0.02,
            width: 0.92,
            height: 0.96,
          })
        ),
        masked: true,
        trimLeft: 0.08,
        focused: false,
      },
      {
        canvas: buildWhiteTextCanvas(
          cropNormalized(crop, {
            x: 0.16,
            y: 0.02,
            width: 0.84,
            height: 0.96,
          })
        ),
        masked: true,
        trimLeft: 0.16,
        focused: false,
      },
      {
        canvas: buildWhiteTextCanvas(
          cropNormalized(crop, {
            x: 0.10,
            y: 0.08,
            width: 0.84,
            height: 0.72,
          })
        ),
        masked: true,
        trimLeft: 0.10,
        focused: true,
      },
    ];

    const candidates: NumericCandidate[] = [];

    for (const variant of variants) {
      const prepared = upscaleCanvas(
        variant.canvas,
        variant.masked || variant.focused ? 5 : 4
      );

      const ocr = await recognizeDetailed(prepared, {
        whitelist: "0123456789OoQIl|!SsBbZz,.",
        pageSegMode: "7",
      });

      let sourceWeight = (variant.masked ? 1.15 : 1.0) * 1.05;

      if (variant.focused) {
        sourceWeight *= 1.08;
      }

      candidates.push(
        ...extractNumericCandidatesFromOCR(ocr, sourceWeight, {
          masked: variant.masked,
          trimLeft: variant.trimLeft,
          pageSegMode: "7",
        })
      );
    }

    return candidates;
  }

  const trimSpecs = [
    { x: 0.00, width: 1.00 },
    { x: 0.04, width: 0.96 },
    { x: 0.08, width: 0.92 },
    { x: 0.12, width: 0.88 },
    { x: 0.16, width: 0.84 },
    { x: 0.20, width: 0.80 },
    { x: 0.24, width: 0.76 },
    { x: 0.28, width: 0.72 },
    { x: 0.32, width: 0.68 },
  ];

  const variants: Array<{
    canvas: HTMLCanvasElement;
    masked: boolean;
    trimLeft: number;
    focused: boolean;
  }> = [];

  for (const trim of trimSpecs) {
    const baseCrop = cropNormalized(crop, {
      x: trim.x,
      y: 0.02,
      width: trim.width,
      height: 0.96,
    });

    variants.push({
      canvas: baseCrop,
      masked: false,
      trimLeft: trim.x,
      focused: false,
    });

    variants.push({
      canvas: buildWhiteTextCanvas(baseCrop),
      masked: true,
      trimLeft: trim.x,
      focused: false,
    });
  }

  const focusedSpecs = [
    { x: 0.08, y: 0.00, width: 0.86, height: 0.72, trimLeft: 0.08 },
    { x: 0.10, y: 0.08, width: 0.84, height: 0.72, trimLeft: 0.10 },
    { x: 0.14, y: 0.12, width: 0.80, height: 0.66, trimLeft: 0.14 },
    { x: 0.18, y: 0.14, width: 0.76, height: 0.62, trimLeft: 0.18 },
  ];

  for (const focused of focusedSpecs) {
    const focusCrop = cropNormalized(crop, {
      x: focused.x,
      y: focused.y,
      width: focused.width,
      height: focused.height,
    });

    variants.push({
      canvas: focusCrop,
      masked: false,
      trimLeft: focused.trimLeft,
      focused: true,
    });

    variants.push({
      canvas: buildWhiteTextCanvas(focusCrop),
      masked: true,
      trimLeft: focused.trimLeft,
      focused: true,
    });
  }

  const usePsm6 = mode === "full_with_psm6";
  const candidates: NumericCandidate[] = [];

  for (const variant of variants) {
    const allowRawPsm6 =
      usePsm6 &&
      !variant.masked &&
      (
        (!variant.focused && variant.trimLeft <= 0.12) ||
        (variant.focused && variant.trimLeft <= 0.10)
      );

    const pageSegModes: Array<"6" | "7"> =
      usePsm6 && (variant.masked || allowRawPsm6) ? ["7", "6"] : ["7"];

    for (const pageSegMode of pageSegModes) {
      const prepared = upscaleCanvas(
        variant.canvas,
        variant.focused ? 5 : 4
      );

      const ocr = await recognizeDetailed(prepared, {
        whitelist: "0123456789OoQIl|!SsBbZz,.",
        pageSegMode,
      });

      let sourceWeight =
        (variant.masked ? 1.15 : 1.0) *
        (pageSegMode === "7" ? 1.05 : 0.93);

      if (variant.focused) {
        sourceWeight *= 1.10;
      }

      candidates.push(
        ...extractNumericCandidatesFromOCR(ocr, sourceWeight, {
          masked: variant.masked,
          trimLeft: variant.trimLeft,
          pageSegMode,
        })
      );
    }
  }

  return candidates;
}

function extractNumericCandidatesFromOCR(
  ocr: OCRResultLite,
  sourceWeight: number,
  meta: {
    masked: boolean;
    trimLeft: number;
    pageSegMode: "6" | "7";
  }
): NumericCandidate[] {
  const bestWeightByValue = new Map<string, number>();

  function addDigits(digits: string, extraWeight = 1) {
    if (digits.length < 7 || digits.length > 10) {
      return;
    }

    const weight = sourceWeight * extraWeight;
    const previous = bestWeightByValue.get(digits);

    if (previous === undefined || weight > previous) {
      bestWeightByValue.set(digits, weight);
    }
  }

  function pushCandidate(rawValue: string, extraWeight = 1) {
    const digits = normalizeNumericToken(rawValue);

    if (!digits) {
      return;
    }

    if (digits.length >= 7 && digits.length <= 10) {
      addDigits(digits, extraWeight);
    }

for (const len of [10, 9, 8] as const) {
  if (digits.length <= len) {
    continue;
  }

  for (let start = 0; start <= digits.length - len; start += 1) {
    const slice = digits.slice(start, start + len);

    let sliceWeight = extraWeight * 0.72;

    if (start === 0 || start + len === digits.length) {
      sliceWeight *= 1.08;
    }

    addDigits(slice, sliceWeight);

    if (len === 8) {
      addDigits(`${slice.slice(1)}0`, sliceWeight * 0.62);

      if (slice.endsWith("0")) {
        addDigits(`${slice.slice(0, 7)}8`, sliceWeight * 0.46);
      }
    }

    if (len === 9) {
      addDigits(slice.slice(1), sliceWeight * 0.60);
      addDigits(slice.slice(0, 8), sliceWeight * 0.58);
    }
  }
}

    if (digits.length === 8) {
      addDigits(`${digits.slice(1)}0`, extraWeight * 0.62);

      if (digits.endsWith("0")) {
        addDigits(`${digits.slice(0, 7)}8`, extraWeight * 0.46);
      }
    }

    if (digits.length === 9) {
      addDigits(digits.slice(1), extraWeight * 0.60);
      addDigits(digits.slice(0, 8), extraWeight * 0.58);
    }
  }

  const rawMatches =
    (ocr.text ?? "").match(/[0-9OoQIl|!SsBbZz][0-9OoQIl|!SsBbZz,.\s]{4,}/g) ?? [];

  for (const match of rawMatches) {
    pushCandidate(match, 0.9);
  }

  const wordTokens = ocr.words
    .map((word) => ({
      value: normalizeNumericToken(word.text ?? ""),
      confidence: Number.isFinite(word.confidence) ? word.confidence : 0,
    }))
    .filter((entry) => entry.value.length > 0);

  for (const token of wordTokens) {
    pushCandidate(token.value, Math.max(0.45, token.confidence / 100));
  }

  for (let start = 0; start < wordTokens.length; start += 1) {
    let combined = "";
    let minConfidence = 100;

    for (
      let end = start;
      end < Math.min(wordTokens.length, start + 4);
      end += 1
    ) {
      combined += wordTokens[end].value;
      minConfidence = Math.min(minConfidence, wordTokens[end].confidence);

      if (combined.length >= 7) {
        pushCandidate(combined, Math.max(0.5, minConfidence / 100) * 1.08);
      }
    }
  }

  return [...bestWeightByValue.entries()].map(([value, weight]) => ({
    value,
    weight,
    masked: meta.masked,
    trimLeft: meta.trimLeft,
    pageSegMode: meta.pageSegMode,
  }));
}

function scoreNumericCandidateGroups(
  candidates: NumericCandidate[]
): NumericCandidateGroup[] {
  const filtered = candidates
    .map((candidate) => ({
      ...candidate,
      value: candidate.value.replace(/^0+/, "") || "0",
    }))
    .filter((candidate) => /^\d+$/.test(candidate.value))
    .filter((candidate) => candidate.value.length >= 8 && candidate.value.length <= 10)
    .filter((candidate) => {
      const numeric = Number(candidate.value);
      return Number.isFinite(numeric) && numeric >= 1000000 && numeric <= 500000000;
    });

  if (!filtered.length) {
    return [];
  }

  const grouped = new Map<
    string,
    Omit<NumericCandidateGroup, "score">
  >();

  for (const candidate of filtered) {
    const current = grouped.get(candidate.value) ?? {
      value: candidate.value,
      totalWeight: 0,
      hits: 0,
      maskedHits: 0,
      trimTotal: 0,
      psm6Hits: 0,
      psm7Hits: 0,
      sources: [],
    };

    current.totalWeight += candidate.weight;
    current.hits += 1;
    current.maskedHits += candidate.masked ? 1 : 0;
    current.trimTotal += candidate.trimLeft;
    current.psm6Hits += candidate.pageSegMode === "6" ? 1 : 0;
    current.psm7Hits += candidate.pageSegMode === "7" ? 1 : 0;

    const sourceTag = `${candidate.masked ? "M" : "R"}@${candidate.trimLeft.toFixed(2)}/psm${candidate.pageSegMode}`;
    if (!current.sources.includes(sourceTag)) {
      current.sources.push(sourceTag);
    }

    grouped.set(candidate.value, current);
  }

  const values = [...grouped.keys()];
  const scored: NumericCandidateGroup[] = [];

  for (const value of values) {
    const entry = grouped.get(value)!;
    const averageTrim = entry.trimTotal / Math.max(entry.hits, 1);
    const numeric = Number(value);

    let score =
      entry.totalWeight * 120 +
      entry.hits * 24 +
      entry.maskedHits * 8 +
      Math.min(14, Math.log10(Math.max(numeric, 1)) * 2);

    if (value.length === 9) score += 18;
    else if (value.length === 8) score += 12;
    else if (value.length === 10) score -= 10;
    else score -= 24;

    if (averageTrim >= 0.08 && averageTrim <= 0.24) {
      score += 8;
    } else if (averageTrim > 0.24 && averageTrim <= 0.30) {
      score += 4;
    }

    let strongSameLengthFamilyWeight = 0;
    let shorterPrefixSuffixWeight = 0;
    let longerPrefixSuffixWeight = 0;

    for (const other of filtered) {
      if (other.value === value) {
        continue;
      }

      const similarity = numericStringSimilarity(value, other.value);
      const prefixLen = commonPrefixLength(value, other.value);

      if (other.value.length === value.length) {
        if (similarity >= 0.89) {
          score += 18 * other.weight;
          strongSameLengthFamilyWeight += other.weight;
        } else if (similarity >= 0.78) {
          score += 10 * other.weight;
          strongSameLengthFamilyWeight += other.weight * 0.75;
        } else {
          score += similarity * 4 * other.weight;
        }

        if (prefixLen >= value.length - 1) {
          score += 8 * other.weight;
        } else if (prefixLen >= value.length - 2) {
          score += 4 * other.weight;
        }

        continue;
      }

      const valueContainsOtherAsPrefixOrSuffix =
        value.startsWith(other.value) || value.endsWith(other.value);

      const otherContainsValueAsPrefixOrSuffix =
        other.value.startsWith(value) || other.value.endsWith(value);

      if (value.length === other.value.length + 1) {
        if (valueContainsOtherAsPrefixOrSuffix) {
          score -= 42 * other.weight;
          shorterPrefixSuffixWeight += other.weight;
        } else if (similarity >= 0.78) {
          score -= 16 * other.weight;
        } else {
          score += similarity * 2 * other.weight;
        }

        continue;
      }

      if (other.value.length === value.length + 1) {
        if (otherContainsValueAsPrefixOrSuffix) {
          score += 12 * other.weight;
          longerPrefixSuffixWeight += other.weight;
        } else if (similarity >= 0.78) {
          score += 6 * other.weight;
        }

        continue;
      }

      if (value.length === other.value.length + 2) {
        if (valueContainsOtherAsPrefixOrSuffix) {
          score -= 54 * other.weight;
          shorterPrefixSuffixWeight += other.weight * 1.25;
        } else if (similarity >= 0.75) {
          score -= 12 * other.weight;
        }

        continue;
      }

      if (other.value.length === value.length + 2) {
        if (otherContainsValueAsPrefixOrSuffix) {
          score += 8 * other.weight;
          longerPrefixSuffixWeight += other.weight * 0.75;
        } else if (similarity >= 0.75) {
          score += 4 * other.weight;
        }

        continue;
      }

      score += similarity * 1.5 * other.weight;
    }

    if (strongSameLengthFamilyWeight >= 1.2) {
      score += 12 * strongSameLengthFamilyWeight;
    }

    if (shorterPrefixSuffixWeight > 0) {
      score -= 18 * shorterPrefixSuffixWeight;
    }

    if (
      value.length >= 9 &&
      shorterPrefixSuffixWeight >= 0.8 &&
      strongSameLengthFamilyWeight >= shorterPrefixSuffixWeight * 0.6
    ) {
      score -= 34;
    }

    if (
      value.length === 10 &&
      strongSameLengthFamilyWeight >= 1.2
    ) {
      score -= 18;
    }

    if (
      value.length === 8 &&
      longerPrefixSuffixWeight >= 0.8 &&
      strongSameLengthFamilyWeight >= 0.8
    ) {
      score += 10;
    }

let repairBoost = 0;
let rawSiblingPenalty = 0;
let nineDigitSandwichBoost = 0;
let oneSidedNineDigitBoost = 0;
let oneSidedEightDigitPenalty = 0;
let trailingEightRepairBoost = 0;
let trailingZeroSiblingPenalty = 0;

if (
  value.length === 8 &&
  entry.hits >= 4 &&
  entry.psm7Hits >= 4 &&
  entry.maskedHits <= Math.floor(entry.hits / 2)
) {
  for (const otherValue of values) {
    if (otherValue === value || otherValue.length !== 8) {
      continue;
    }

    const otherEntry = grouped.get(otherValue)!;

    if (otherValue.slice(1) + "0" === value) {
      repairBoost += otherEntry.totalWeight * 22 + otherEntry.hits * 6;
    }

    if (value.slice(1) + "0" === otherValue) {
      rawSiblingPenalty += otherEntry.totalWeight * 18 + otherEntry.hits * 5;
    }
  }
}

if (repairBoost > 0 && strongSameLengthFamilyWeight < 0.9) {
  score += repairBoost;

  if (value.endsWith("0")) {
    score += 12;
  }
}

if (rawSiblingPenalty > 0 && strongSameLengthFamilyWeight < 0.9) {
  score -= rawSiblingPenalty;
}

if (value.length === 8) {
  if (value.endsWith("8")) {
    const zeroSiblingValue = `${value.slice(0, 7)}0`;
    const zeroSibling = grouped.get(zeroSiblingValue);

    if (zeroSibling) {
      const enoughPresence =
        entry.hits >= 1 &&
        entry.psm7Hits >= 1 &&
        entry.totalWeight >= zeroSibling.totalWeight * 0.16;

      if (enoughPresence) {
        trailingEightRepairBoost =
          zeroSibling.totalWeight * 62 +
          zeroSibling.hits * 18 +
          zeroSibling.psm7Hits * 6;
      }
    }
  }

  if (value.endsWith("0")) {
    const eightSiblingValue = `${value.slice(0, 7)}8`;
    const eightSibling = grouped.get(eightSiblingValue);

    if (eightSibling) {
      const siblingLooksReal =
        eightSibling.hits >= 1 &&
        eightSibling.psm7Hits >= 1 &&
        eightSibling.totalWeight >= entry.totalWeight * 0.16;

      if (siblingLooksReal) {
        trailingZeroSiblingPenalty =
          eightSibling.totalWeight * 50 +
          eightSibling.hits * 14 +
          eightSibling.psm7Hits * 5;
      }
    }
  }
}

if (value.length === 9 && entry.hits >= 4 && entry.psm7Hits >= 3) {
  const dropFirst = value.slice(1);
  const dropLast = value.slice(0, 8);

  const dropFirstEntry = grouped.get(dropFirst);
  const dropLastEntry = grouped.get(dropLast);

  if (dropFirstEntry && dropLastEntry) {
    const bestChildHits = Math.max(dropFirstEntry.hits, dropLastEntry.hits);
    const bestChildWeight = Math.max(
      dropFirstEntry.totalWeight,
      dropLastEntry.totalWeight
    );
    const bestChildPsm7 = Math.max(
      dropFirstEntry.psm7Hits,
      dropLastEntry.psm7Hits
    );

    const comparableHits =
      entry.hits >= bestChildHits * 0.78;

    const comparableWeight =
      entry.totalWeight >= bestChildWeight * 0.72;

    const comparablePsm7 =
      entry.psm7Hits >= Math.max(2, bestChildPsm7 * 0.6);

    if (comparableHits && comparableWeight && comparablePsm7) {
      const combinedChildWeight =
        dropFirstEntry.totalWeight + dropLastEntry.totalWeight;
      const combinedChildHits =
        dropFirstEntry.hits + dropLastEntry.hits;
      const combinedChildPsm7 =
        dropFirstEntry.psm7Hits + dropLastEntry.psm7Hits;

      let boost =
        combinedChildWeight * 58 +
        combinedChildHits * 18 +
        combinedChildPsm7 * 6;

      if (value.startsWith("1")) {
        boost += 48;
      }

      if (boost > nineDigitSandwichBoost) {
        nineDigitSandwichBoost = boost;
      }
    }
  }
}

/**
 * Novo caso: o pai de 9 dígitos só tem UM filho forte de 8 dígitos.
 * Exemplo típico:
 *   109116342  vs  10911634
 */
if (value.length === 9 && entry.hits >= 6 && entry.psm7Hits >= 4) {
  for (const otherValue of values) {
    if (otherValue.length !== 8) {
      continue;
    }

    const isChild =
      value.startsWith(otherValue) || value.endsWith(otherValue);

    if (!isChild) {
      continue;
    }

    const childEntry = grouped.get(otherValue)!;

    const comparableHits =
      entry.hits >= childEntry.hits * 0.92;

    const strongerWeight =
      entry.totalWeight >= childEntry.totalWeight * 1.08;

    const comparablePsm7 =
      entry.psm7Hits >= Math.max(2, childEntry.psm7Hits * 0.75);

    if (comparableHits && strongerWeight && comparablePsm7) {
      let boost =
        childEntry.totalWeight * 34 +
        childEntry.hits * 10;

      if (value.startsWith(otherValue)) {
        boost += 24;
      }

      if (value.startsWith("1")) {
        boost += 18;
      }

      if (boost > oneSidedNineDigitBoost) {
        oneSidedNineDigitBoost = boost;
      }
    }
  }
}

/**
 * Penaliza o filho de 8 dígitos quando existe um pai de 9 dígitos
 * claramente mais forte e com suporte semelhante.
 */
if (value.length === 8 && entry.hits >= 6 && entry.psm7Hits >= 4) {
  for (const otherValue of values) {
    if (otherValue.length !== 9) {
      continue;
    }

    const isParent =
      otherValue.startsWith(value) || otherValue.endsWith(value);

    if (!isParent) {
      continue;
    }

    const parentEntry = grouped.get(otherValue)!;

    const comparableHits =
      parentEntry.hits >= entry.hits * 0.92;

    const strongerWeight =
      parentEntry.totalWeight >= entry.totalWeight * 1.08;

    const comparablePsm7 =
      parentEntry.psm7Hits >= Math.max(2, entry.psm7Hits * 0.75);

    if (comparableHits && strongerWeight && comparablePsm7) {
      let penalty =
        parentEntry.totalWeight * 28 +
        parentEntry.hits * 8;

      if (otherValue.startsWith(value)) {
        penalty += 18;
      }

      if (penalty > oneSidedEightDigitPenalty) {
        oneSidedEightDigitPenalty = penalty;
      }
    }
  }
}

if (nineDigitSandwichBoost > 0) {
  score += nineDigitSandwichBoost;
}

if (oneSidedNineDigitBoost > 0) {
  score += oneSidedNineDigitBoost;
}

if (oneSidedEightDigitPenalty > 0 && strongSameLengthFamilyWeight < 1.6) {
  score -= oneSidedEightDigitPenalty;
}

if (trailingEightRepairBoost > 0 && strongSameLengthFamilyWeight < 2.2) {
  score += trailingEightRepairBoost;
}

if (trailingZeroSiblingPenalty > 0 && strongSameLengthFamilyWeight < 2.2) {
  score -= trailingZeroSiblingPenalty;
}

    scored.push({
      ...entry,
      score,
    });
  }

  scored.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (right.hits !== left.hits) {
      return right.hits - left.hits;
    }

    return Number(right.value) - Number(left.value);
  });

  return scored;
}

function numericStringSimilarity(left: string, right: string) {
  const max = Math.max(left.length, right.length);
  if (max === 0) {
    return 0;
  }

  const a = left.padStart(max, "_");
  const b = right.padStart(max, "_");

  let matches = 0;
  for (let index = 0; index < max; index += 1) {
    if (a[index] === b[index]) {
      matches += 1;
    }
  }

  return matches / max;
}

type TargetCircleDetection = {
  target: ArtifactSearchTarget;
  circle: PixelCircle | null;
};

function detectArtifactCircles(
  rootCanvas: HTMLCanvasElement,
  gridRect: PixelRect
): Partial<Record<ArtifactSlotKey, PixelCircle>> {
  const gridCanvas = cropPixelRect(rootCanvas, gridRect);
  const context = gridCanvas.getContext("2d");

  if (!context) {
    return {};
  }

  const { width, height } = gridCanvas;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  const cellWidth = width / 3;
  const cellHeight = height / 3;

  const firstPass: TargetCircleDetection[] = ARTIFACT_SEARCH_TARGETS.map(
    (target) => ({
      target,
      circle: detectBestCircleInTargetCell(
        data,
        width,
        height,
        gridRect,
        cellWidth,
        cellHeight,
        target
      ),
    })
  );

  const regularized = regularizeArtifactTargetDetections(
    firstPass,
    gridRect,
    cellWidth,
    cellHeight
  );

  const secondPass: TargetCircleDetection[] = regularized.map((entry) => {
    const refined = detectCircleAroundExpected(
      data,
      width,
      height,
      gridRect,
      cellWidth,
      cellHeight,
      entry
    );

    return {
      target: entry.target,
      circle: refined ?? entry.circle,
    };
  });

  const result: Partial<Record<ArtifactSlotKey, PixelCircle>> = {};

  for (const entry of secondPass) {
    if (!entry.circle || entry.target.slot === "ignore") {
      continue;
    }

    result[entry.target.slot] = entry.circle;
  }

  return result;
}

function regularizeArtifactTargetDetections(
  detections: TargetCircleDetection[],
  gridRect: PixelRect,
  cellWidth: number,
  cellHeight: number
): Array<
  TargetCircleDetection & {
    expectedCx: number;
    expectedCy: number;
    expectedR: number;
  }
> {
  const local = detections.map((entry) => ({
    ...entry,
    localCx: entry.circle ? entry.circle.cx - gridRect.x : null,
    localCy: entry.circle ? entry.circle.cy - gridRect.y : null,
    localR: entry.circle ? entry.circle.r : null,
  }));

  const radii = local
    .map((entry) => entry.localR)
    .filter((value): value is number => typeof value === "number");

  const medianR =
    median(radii) ?? Math.min(cellWidth, cellHeight) * 0.34;

  const colMedians = [0, 1, 2].map((col) =>
    median(
      local
        .filter((entry) => entry.target.col === col && entry.localCx !== null)
        .map((entry) => entry.localCx as number)
    )
  );

  const rowMedians = [0, 1, 2].map((row) =>
    median(
      local
        .filter((entry) => entry.target.row === row && entry.localCy !== null)
        .map((entry) => entry.localCy as number)
    )
  );

  const gapXCandidates: number[] = [];
  const gapYCandidates: number[] = [];

  for (let row = 0; row < 3; row += 1) {
    const rowEntries = local.filter((entry) => entry.target.row === row);

    const c0 = rowEntries.find((entry) => entry.target.col === 0)?.localCx;
    const c1 = rowEntries.find((entry) => entry.target.col === 1)?.localCx;
    const c2 = rowEntries.find((entry) => entry.target.col === 2)?.localCx;

    if (typeof c0 === "number" && typeof c1 === "number") {
      gapXCandidates.push(c1 - c0);
    }
    if (typeof c1 === "number" && typeof c2 === "number") {
      gapXCandidates.push(c2 - c1);
    }
    if (typeof c0 === "number" && typeof c2 === "number") {
      gapXCandidates.push((c2 - c0) / 2);
    }
  }

  for (let col = 0; col < 3; col += 1) {
    const colEntries = local.filter((entry) => entry.target.col === col);

    const r0 = colEntries.find((entry) => entry.target.row === 0)?.localCy;
    const r1 = colEntries.find((entry) => entry.target.row === 1)?.localCy;
    const r2 = colEntries.find((entry) => entry.target.row === 2)?.localCy;

    if (typeof r0 === "number" && typeof r1 === "number") {
      gapYCandidates.push(r1 - r0);
    }
    if (typeof r1 === "number" && typeof r2 === "number") {
      gapYCandidates.push(r2 - r1);
    }
    if (typeof r0 === "number" && typeof r2 === "number") {
      gapYCandidates.push((r2 - r0) / 2);
    }
  }

  if (
    typeof colMedians[0] === "number" &&
    typeof colMedians[1] === "number"
  ) {
    gapXCandidates.push(colMedians[1]! - colMedians[0]!);
  }
  if (
    typeof colMedians[1] === "number" &&
    typeof colMedians[2] === "number"
  ) {
    gapXCandidates.push(colMedians[2]! - colMedians[1]!);
  }
  if (
    typeof rowMedians[0] === "number" &&
    typeof rowMedians[1] === "number"
  ) {
    gapYCandidates.push(rowMedians[1]! - rowMedians[0]!);
  }
  if (
    typeof rowMedians[1] === "number" &&
    typeof rowMedians[2] === "number"
  ) {
    gapYCandidates.push(rowMedians[2]! - rowMedians[1]!);
  }

  const centerX = colMedians[1] ?? cellWidth * 1.5;
  const centerY = rowMedians[1] ?? cellHeight * 1.5;

  const gapX = medianPositive(gapXCandidates, cellWidth * 0.92);
  const gapY = medianPositive(gapYCandidates, cellHeight * 0.98);

  let regX0 = colMedians[0] ?? centerX - gapX;
  let regX1 = centerX;
  let regX2 = colMedians[2] ?? centerX + gapX;

  if (
    typeof colMedians[0] === "number" &&
    typeof colMedians[2] === "number"
  ) {
    const symmetricGap =
      ((centerX - colMedians[0]!) + (colMedians[2]! - centerX)) / 2;
    regX0 = centerX - symmetricGap;
    regX2 = centerX + symmetricGap;
  } else if (
    typeof colMedians[0] === "number" &&
    typeof colMedians[2] !== "number"
  ) {
    regX2 = centerX + (centerX - colMedians[0]!);
  } else if (
    typeof colMedians[2] === "number" &&
    typeof colMedians[0] !== "number"
  ) {
    regX0 = centerX - (colMedians[2]! - centerX);
  }

  let regY0 = rowMedians[0] ?? centerY - gapY;
  let regY1 = centerY;
  let regY2 = rowMedians[2] ?? centerY + gapY;

  if (
    typeof rowMedians[0] === "number" &&
    typeof rowMedians[2] === "number"
  ) {
    const symmetricGap =
      ((centerY - rowMedians[0]!) + (rowMedians[2]! - centerY)) / 2;
    regY0 = centerY - symmetricGap;
    regY2 = centerY + symmetricGap;
  } else if (
    typeof rowMedians[0] === "number" &&
    typeof rowMedians[2] !== "number"
  ) {
    regY2 = centerY + (centerY - rowMedians[0]!);
  } else if (
    typeof rowMedians[2] === "number" &&
    typeof rowMedians[0] !== "number"
  ) {
    regY0 = centerY - (rowMedians[2]! - centerY);
  }

  const regXs = [regX0, regX1, regX2];
  const regYs = [regY0, regY1, regY2];

  const sword = local.find((entry) => entry.target.slot === "sword") ?? null;
  const boots = local.find((entry) => entry.target.slot === "boots") ?? null;
  const chest = local.find((entry) => entry.target.slot === "chest") ?? null;
  const helmet = local.find((entry) => entry.target.slot === "helmet") ?? null;

  const shieldGeomCx =
    typeof sword?.localCx === "number" && typeof boots?.localCx === "number"
      ? (sword.localCx + boots.localCx) / 2
      : null;

  const shieldGeomCy =
    typeof sword?.localCy === "number" && typeof boots?.localCy === "number"
      ? (sword.localCy + boots.localCy) / 2
      : null;

  const shieldGeomR =
    median(
      [
        sword?.localR,
        boots?.localR,
        chest?.localR,
        helmet?.localR,
      ].filter((value): value is number => typeof value === "number")
    ) ?? medianR;

  return local.map((entry) => {
    const targetX = regXs[entry.target.col];
    const targetY = regYs[entry.target.row];

    let expectedCx =
      typeof entry.localCx === "number"
        ? targetX * 0.65 + entry.localCx * 0.35
        : targetX;

    let expectedCy =
      typeof entry.localCy === "number"
        ? targetY * 0.65 + entry.localCy * 0.35
        : targetY;

    let expectedR =
      typeof entry.localR === "number"
        ? medianR * 0.70 + entry.localR * 0.30
        : medianR;

    const isTopCenter = entry.target.row === 0 && entry.target.col === 1;

    if (isTopCenter) {
      if (typeof shieldGeomCx === "number") {
        expectedCx = shieldGeomCx * 0.85 + expectedCx * 0.15;
      }
      if (typeof shieldGeomCy === "number") {
        expectedCy = shieldGeomCy * 0.85 + expectedCy * 0.15;
      }
      expectedR = shieldGeomR;
    }

    return {
      target: entry.target,
      circle: entry.circle,
      expectedCx,
      expectedCy,
      expectedR,
    };
  });
}

function detectCircleAroundExpected(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  gridRect: PixelRect,
  cellWidth: number,
  cellHeight: number,
  entry: TargetCircleDetection & {
    expectedCx: number;
    expectedCy: number;
    expectedR: number;
  }
): PixelCircle | null {
  const cellX = entry.target.col * cellWidth;
  const cellY = entry.target.row * cellHeight;
  const isTopCenter = entry.target.row === 0 && entry.target.col === 1;

  // Shield dourado: fixar raio pela geometria e só procurar melhor centro
  if (isTopCenter) {
    const lockedR = Math.round(
      Math.max(entry.expectedR, entry.circle?.r ?? 0)
    );

    const cxMin = Math.max(
      Math.floor(cellX + cellWidth * 0.22),
      Math.floor(entry.expectedCx - cellWidth * 0.07)
    );
    const cxMax = Math.min(
      Math.ceil(cellX + cellWidth * 0.78),
      Math.ceil(entry.expectedCx + cellWidth * 0.07)
    );

    const cyMin = Math.max(
      Math.floor(cellY + cellHeight * 0.18),
      Math.floor(entry.expectedCy - cellHeight * 0.07)
    );
    const cyMax = Math.min(
      Math.ceil(cellY + cellHeight * 0.66),
      Math.ceil(entry.expectedCy + cellHeight * 0.07)
    );

    let bestRaw = Number.NEGATIVE_INFINITY;
    let bestCx = Math.round(entry.expectedCx);
    let bestCy = Math.round(entry.expectedCy);

    for (let cy = cyMin; cy <= cyMax; cy += 1) {
      for (let cx = cxMin; cx <= cxMax; cx += 1) {
        const raw = scoreAnchoredArtifactCircleCandidate(
          data,
          width,
          height,
          cx,
          cy,
          lockedR
        );

        const centerPenalty =
          Math.hypot(cx - entry.expectedCx, cy - entry.expectedCy) * 1.8;

        const adjusted = raw - centerPenalty;

        if (adjusted > bestRaw) {
          bestRaw = adjusted;
          bestCx = cx;
          bestCy = cy;
        }
      }
    }

    return {
      cx: gridRect.x + bestCx,
      cy: gridRect.y + bestCy,
      r: lockedR,
      score: bestRaw,
    };
  }

  const cxMin = Math.max(
    Math.floor(cellX + cellWidth * 0.18),
    Math.floor(entry.expectedCx - cellWidth * 0.10)
  );
  const cxMax = Math.min(
    Math.ceil(cellX + cellWidth * 0.82),
    Math.ceil(entry.expectedCx + cellWidth * 0.10)
  );

  const cyMin = Math.max(
    Math.floor(cellY + cellHeight * 0.16),
    Math.floor(entry.expectedCy - cellHeight * 0.10)
  );
  const cyMax = Math.min(
    Math.ceil(cellY + cellHeight * 0.74),
    Math.ceil(entry.expectedCy + cellHeight * 0.10)
  );

  const baseR = Math.max(entry.circle?.r ?? 0, entry.expectedR);

  const rMin = Math.max(12, Math.floor(baseR * 0.88));
  const rMax = Math.max(rMin + 1, Math.ceil(baseR * 1.08));

  let bestAdjusted = Number.NEGATIVE_INFINITY;
  let bestRaw = Number.NEGATIVE_INFINITY;
  let best: PixelCircle | null = null;

  for (let cy = cyMin; cy <= cyMax; cy += 2) {
    for (let cx = cxMin; cx <= cxMax; cx += 2) {
      for (let r = rMin; r <= rMax; r += 1) {
        const raw = scoreAnchoredArtifactCircleCandidate(
          data,
          width,
          height,
          cx,
          cy,
          r
        );

        const centerPenalty =
          Math.hypot(cx - entry.expectedCx, cy - entry.expectedCy) * 1.5;

        const radiusPenalty =
          Math.abs(r - entry.expectedR) * 2.2 +
          Math.max(0, entry.expectedR - r) * 4.8;

        const adjusted = raw - centerPenalty - radiusPenalty;

        if (adjusted > bestAdjusted) {
          bestAdjusted = adjusted;
          bestRaw = raw;
          best = {
            cx: gridRect.x + cx,
            cy: gridRect.y + cy,
            r,
            score: bestRaw,
          };
        }
      }
    }
  }

  if (!best) {
    return entry.circle;
  }

  if (entry.circle) {
    const minAllowedR = entry.circle.r * 0.86;
    const maxCenterShift = entry.circle.r * 0.35;
    const centerShift = Math.hypot(
      best.cx - entry.circle.cx,
      best.cy - entry.circle.cy
    );

    if (best.r < minAllowedR && centerShift < maxCenterShift) {
      return entry.circle;
    }
  }

  if (bestRaw < 58) {
    return entry.circle;
  }

  return {
    ...best,
    cx: Math.round(best.cx),
    cy: Math.round(best.cy),
    r: Math.round(best.r),
  };
}

function median(values: number[]): number | null {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) {
    return null;
  }

  const sorted = [...filtered].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }

  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function medianPositive(values: number[], fallback: number): number {
  const filtered = values.filter(
    (value) => Number.isFinite(value) && value > 0
  );

  return median(filtered) ?? fallback;
}

function detectBestCircleInTargetCell(
  data: Uint8ClampedArray,
  gridWidth: number,
  gridHeight: number,
  gridRect: PixelRect,
  cellWidth: number,
  cellHeight: number,
  target: ArtifactSearchTarget
): PixelCircle | null {
  const cellX = target.col * cellWidth;
  const cellY = target.row * cellHeight;

  const cxMin = Math.floor(cellX + cellWidth * 0.24);
  const cxMax = Math.ceil(cellX + cellWidth * 0.76);

  const cyMin = Math.floor(cellY + cellHeight * 0.18);
  const cyMax = Math.ceil(cellY + cellHeight * 0.60);

  const baseRadius = Math.min(cellWidth, cellHeight);
  const rMin = Math.max(16, Math.floor(baseRadius * 0.24));
  const rMax = Math.max(rMin + 2, Math.ceil(baseRadius * 0.40));

  let best: PixelCircle | null = null;

  for (let cy = cyMin; cy <= cyMax; cy += 3) {
    for (let cx = cxMin; cx <= cxMax; cx += 3) {
      for (let r = rMin; r <= rMax; r += 2) {
        const score = scoreAnchoredArtifactCircleCandidate(
          data,
          gridWidth,
          gridHeight,
          cx,
          cy,
          r
        );

        if (!best || score > best.score) {
          best = {
            cx: gridRect.x + cx,
            cy: gridRect.y + cy,
            r,
            score,
          };
        }
      }
    }
  }

  if (!best || best.score < 62) {
    return null;
  }

  return refineCircleLocally(
    data,
    gridWidth,
    gridHeight,
    gridRect,
    best
  );
}

function refineCircleLocally(
  data: Uint8ClampedArray,
  gridWidth: number,
  gridHeight: number,
  gridRect: PixelRect,
  seed: PixelCircle
): PixelCircle {
  const localCx = seed.cx - gridRect.x;
  const localCy = seed.cy - gridRect.y;

  let best = {
    ...seed,
    cx: localCx,
    cy: localCy,
  };

  for (let cy = localCy - 4; cy <= localCy + 4; cy += 1) {
    for (let cx = localCx - 4; cx <= localCx + 4; cx += 1) {
      for (let r = seed.r - 2; r <= seed.r + 2; r += 1) {
        if (r < 12) {
          continue;
        }

        const score = scoreAnchoredArtifactCircleCandidate(
          data,
          gridWidth,
          gridHeight,
          cx,
          cy,
          r
        );

        if (score > best.score) {
          best = {
            cx,
            cy,
            r,
            score,
          };
        }
      }
    }
  }

  return {
    cx: gridRect.x + Math.round(best.cx),
    cy: gridRect.y + Math.round(best.cy),
    r: Math.round(best.r),
    score: best.score,
  };
}

function scoreAnchoredArtifactCircleCandidate(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  cx: number,
  cy: number,
  r: number
): number {
  const samples = 36;

  let recognised = 0;
  let outsidePenalty = 0;
  let contrastTotal = 0;
  let valid = 0;

  const bins = {
    grey: 0,
    green: 0,
    blue: 0,
    purple: 0,
    gold: 0,
    red: 0,
    other: 0,
  };

  for (let i = 0; i < samples; i += 1) {
    const angle = (i / samples) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const pInner = readPixel(
      data,
      width,
      height,
      Math.round(cx + cos * r * 0.46),
      Math.round(cy + sin * r * 0.46)
    );

    const pRingA = readPixel(
      data,
      width,
      height,
      Math.round(cx + cos * r * 0.72),
      Math.round(cy + sin * r * 0.72)
    );

    const pRingB = readPixel(
      data,
      width,
      height,
      Math.round(cx + cos * r * 0.82),
      Math.round(cy + sin * r * 0.82)
    );

    const pRingC = readPixel(
      data,
      width,
      height,
      Math.round(cx + cos * r * 0.90),
      Math.round(cy + sin * r * 0.90)
    );

    const pOuter = readPixel(
      data,
      width,
      height,
      Math.round(cx + cos * r * 1.08),
      Math.round(cy + sin * r * 1.08)
    );

    if (!pInner || !pRingA || !pRingB || !pRingC || !pOuter) {
      continue;
    }

    const family = pickRingFamily([
      classifyArtifactPalette(pRingA.r, pRingA.g, pRingA.b),
      classifyArtifactPalette(pRingB.r, pRingB.g, pRingB.b),
      classifyArtifactPalette(pRingC.r, pRingC.g, pRingC.b),
    ]);

    bins[family] += 1;

    if (family !== "other") {
      recognised += 1;
    }

    const outerFamily = classifyArtifactPalette(pOuter.r, pOuter.g, pOuter.b);

    if (family !== "other") {
      if (family === "gold") {
        if (outerFamily === family) {
          outsidePenalty += 0.18;
        }
      } else if (outerFamily === family) {
        outsidePenalty += 1;
      }
    }

    const innerL = luminance(pInner.r, pInner.g, pInner.b);
    const ringL =
      (luminance(pRingA.r, pRingA.g, pRingA.b) +
        luminance(pRingB.r, pRingB.g, pRingB.b) +
        luminance(pRingC.r, pRingC.g, pRingC.b)) /
      3;
    const outerL = luminance(pOuter.r, pOuter.g, pOuter.b);

    contrastTotal += Math.abs(ringL - outerL) + Math.abs(ringL - innerL) * 0.45;
    valid += 1;
  }

  if (valid < Math.floor(samples * 0.8)) {
    return 0;
  }

  const dominant = Math.max(
    bins.grey,
    bins.green,
    bins.blue,
    bins.purple,
    bins.gold,
    bins.red
  );

  const coverage = recognised / valid;
  const dominantRatio = dominant / Math.max(recognised, 1);
  const contrast = contrastTotal / valid;

  return (
    coverage * 58 +
    dominantRatio * 26 +
    contrast * 24 -
    outsidePenalty * 4.5
  );
}

function classifyArtifactPalette(
  r: number,
  g: number,
  b: number
): ArtifactColor | "other" {
  const { hue, saturation, value } = rgbToHsv(r, g, b);

  if (value < 0.14) {
    return "other";
  }

  if (saturation < 0.16 && value >= 0.24) {
    return "grey";
  }

  if ((hue <= 18 || hue >= 342) && saturation >= 0.28 && value >= 0.20) {
    return "red";
  }

  if (hue >= 70 && hue < 170 && saturation >= 0.22 && value >= 0.18) {
    return "green";
  }

  if (hue >= 170 && hue < 250 && saturation >= 0.21 && value >= 0.18) {
    return "blue";
  }

  if (hue >= 250 && hue < 320 && saturation >= 0.20 && value >= 0.18) {
    return "purple";
  }

  if (hue >= 18 && hue < 70 && saturation >= 0.22 && value >= 0.20) {
    return "gold";
  }

  return "other";
}

function pickRingFamily(
  families: Array<ArtifactColor | "other">
): ArtifactColor | "other" {
  const counts = new Map<ArtifactColor | "other", number>();

  for (const family of families) {
    counts.set(family, (counts.get(family) ?? 0) + 1);
  }

  let best: ArtifactColor | "other" = "other";
  let bestCount = -1;

  for (const family of [
    "grey",
    "green",
    "blue",
    "purple",
    "gold",
    "red",
    "other",
  ] as const) {
    const count = counts.get(family) ?? 0;
    if (count > bestCount) {
      best = family;
      bestCount = count;
    }
  }

  return best;
}

function readPixel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
) {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return null;
  }

  const index = (y * width + x) * 4;

  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3],
  };
}

function luminance(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function analyzeSlots(
  rootCanvas: HTMLCanvasElement,
  layout: LayoutModel
): Record<ArtifactSlotKey, ArtifactSlotAnalysis> {
  const entries = SLOT_ORDER.map((slot) => {
    const circle = layout.artifactCircles[slot];

    let color: ArtifactColor;
    let runeColor: ArtifactColor;

    if (circle) {
      color = detectArtifactColorFromCircle(rootCanvas, circle, slot);
      runeColor = detectRuneColorFromCircle(rootCanvas, circle);
    } else {
      const slotCanvas = cropPixelRect(rootCanvas, layout.slotRects[slot]);
      color = detectArtifactColor(slotCanvas, slot);
      runeColor = detectRuneColor(slotCanvas);
    }

    const level = LEVEL_BY_ARTIFACT_COLOR[color];

    return [
      slot,
      {
        slot,
        color,
        level,
        runeColor,
        score: COLOR_WEIGHTS[color] * 100 + level,
        runeScore: COLOR_WEIGHTS[runeColor],
      },
    ] as const;
  });

  return Object.fromEntries(
    entries
  ) as Record<ArtifactSlotKey, ArtifactSlotAnalysis>;
}

function buildArmyScores(
  slots: Record<ArtifactSlotKey, ArtifactSlotAnalysis>
): Record<ArmyType, number> {
  return {
    archer: slots.sword.score + slots.helmet.score,
    berserker: slots.shield.score + slots.chest.score,
    cavalry: slots.boots.score + slots.pants.score,
  };
}

function decideArmyType(
  armyScores: Record<ArmyType, number>,
  slots: Record<ArtifactSlotKey, ArtifactSlotAnalysis>
): ArmyType {
  const runeTieScores: Record<ArmyType, number> = {
    archer: slots.sword.runeScore + slots.helmet.runeScore,
    berserker: slots.shield.runeScore + slots.chest.runeScore,
    cavalry: slots.boots.runeScore + slots.pants.runeScore,
  };

  const sorted = [...ARMY_ORDER].sort((left, right) => {
    const scoreGap = armyScores[right] - armyScores[left];
    if (scoreGap !== 0) {
      return scoreGap;
    }

    return runeTieScores[right] - runeTieScores[left];
  });

  return sorted[0];
}

function getConfidenceLabel(
  armyScores: Record<ArmyType, number>,
  winner: ArmyType,
  chiefName: string
): Confidence {
  const sorted = [...ARMY_ORDER]
    .map((armyType) => armyScores[armyType])
    .sort((left, right) => right - left);

  const best = sorted[0] ?? 0;
  const second = sorted[1] ?? 0;
  const gap = best - second;

  if (gap >= 120) {
    return chiefName === "Unknown" ? "medium" : "high";
  }

  if (gap >= 45) {
    return chiefName === "Unknown" ? "low" : "medium";
  }

  if (winner === "archer" && gap >= 30) {
    return "medium";
  }

  return "low";
}

function cleanLeadingNoise(name: string) {
  let cleaned = name
    .replace(/[★☆•·™△▲◆♦♡♥]/gu, " ")
    .replace(/^\[+/, "")
    .replace(/\]+$/, "")
    .replace(/\s+/g, "");

  cleaned = cleaned
    .replace(/^[^0-9A-Za-z\p{L}_.@€-]+/gu, "")
    .replace(/[^0-9A-Za-z\p{L}_.@€-]+$/gu, "")
    .replace(/^[._-]+/g, "")
    .replace(/[._-]+$/g, "");

  cleaned = cleaned.replace(/^[Il|!]+(?=[A-Za-z\p{L}])/gu, "");
  cleaned = cleaned.replace(/^[^A-Za-z\p{L}]+(?=[A-Za-z\p{L}])/gu, "");

  if (!cleaned) {
    return "Unknown";
  }

  if (!/[\p{L}A-Za-z]/u.test(cleaned)) {
    return "Unknown";
  }

  if (cleaned.length < 3 || cleaned.length > 24) {
    return "Unknown";
  }

  return cleaned;
}

function scoreNameCandidate(name: string) {
  if (name === "Unknown") {
    return -1;
  }

  const letters = (name.match(/[A-Za-z]/g) ?? []).length;
  const digits = (name.match(/\d/g) ?? []).length;
  const lowers = (name.match(/[a-z]/g) ?? []).length;
  const uppers = (name.match(/[A-Z]/g) ?? []).length;
  const length = name.length;

  let score = letters * 5 + digits * 1.5 + length;

  if (length < 4) score -= 24;
  if (length > 16) score -= 12 + (length - 16) * 3;
  if (digits > 4) score -= 18;
  if (letters < 3) score -= 28;
  if (uppers >= 1 && lowers >= 1) score += 8;
  if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(name)) score += 10;
  if (/(.)\1\1/i.test(name)) score -= 18;
  if (/[_-]{2,}/.test(name)) score -= 18;

  if (
    /phoenixveritas|artifact|artefact|artefatto|artefato|chief|capo|kingdom|regno|reino|info|vai|go/i.test(
      name
    )
  ) {
    score -= 90;
  }

  return score;
}

function detectArtifactColorFromCircle(
  rootCanvas: HTMLCanvasElement,
  circle: PixelCircle,
  slot: ArtifactSlotKey
): ArtifactColor {
  const counts = countArtifactRingColorsFromCircle(rootCanvas, circle);
  return chooseArtifactColorFromCounts(counts, slot);
}

function detectRuneColorFromCircle(
  rootCanvas: HTMLCanvasElement,
  circle: PixelCircle
): ArtifactColor {
  const counts = countRuneDotColorsFromCircle(rootCanvas, circle);
  return chooseArtifactColorFromCounts(counts);
}

function countArtifactRingColorsFromCircle(
  rootCanvas: HTMLCanvasElement,
  circle: PixelCircle
): Record<ArtifactColor, number> {
  const context = rootCanvas.getContext("2d");
  const empty: Record<ArtifactColor, number> = {
    grey: 0,
    green: 0,
    blue: 0,
    purple: 0,
    gold: 0,
    red: 0,
  };

  if (!context) {
    return empty;
  }

  const sampleRect = {
    x: clamp(circle.cx - circle.r * 1.10, 0, rootCanvas.width - 1),
    y: clamp(circle.cy - circle.r * 1.10, 0, rootCanvas.height - 1),
    width: clamp(circle.r * 2.20, 1, rootCanvas.width),
    height: clamp(circle.r * 2.20, 1, rootCanvas.height),
  };

  const crop = cropPixelRect(rootCanvas, sampleRect);
  const cropContext = crop.getContext("2d");

  if (!cropContext) {
    return empty;
  }

  const { width, height } = crop;
  const imageData = cropContext.getImageData(0, 0, width, height);
  const { data } = imageData;

  const localCx = circle.cx - sampleRect.x;
  const localCy = circle.cy - sampleRect.y;
  const innerRadius = circle.r * 0.70;
  const outerRadius = circle.r * 0.88;
  const ringMid = (innerRadius + outerRadius) / 2;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const dx = x - localCx;
      const dy = y - localCy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < innerRadius || distance > outerRadius) {
        continue;
      }

      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (a < 20) {
        continue;
      }

      const { hue, saturation, value } = rgbToHsv(r, g, b);

      if (value < 0.12) {
        continue;
      }

      const ringWeight =
        1.10 -
        Math.abs(distance - ringMid) / Math.max(outerRadius - innerRadius, 1);

      const weight = Math.max(ringWeight, 0.05);

      if (saturation < 0.16 && value >= 0.22) {
        empty.grey += weight;
        continue;
      }

      if ((hue <= 18 || hue >= 342) && saturation >= 0.30 && value >= 0.22) {
        empty.red += weight;
        continue;
      }

      if (hue >= 72 && hue < 170 && saturation >= 0.24 && value >= 0.18) {
        empty.green += weight;
        continue;
      }

      if (hue >= 170 && hue < 250 && saturation >= 0.23 && value >= 0.18) {
        empty.blue += weight;
        continue;
      }

      if (hue >= 250 && hue < 320 && saturation >= 0.22 && value >= 0.18) {
        empty.purple += weight;
        continue;
      }

      if (hue >= 20 && hue < 70 && saturation >= 0.26 && value >= 0.22) {
        empty.gold += weight;
        continue;
      }
    }
  }

  return empty;
}

function countRuneDotColorsFromCircle(
  rootCanvas: HTMLCanvasElement,
  circle: PixelCircle
): Record<ArtifactColor, number> {
  const stripRect: PixelRect = {
    x: clamp(circle.cx - circle.r * 0.86, 0, rootCanvas.width - 1),
    y: clamp(circle.cy + circle.r * 0.72, 0, rootCanvas.height - 1),
    width: clamp(circle.r * 1.72, 1, rootCanvas.width),
    height: clamp(circle.r * 0.46, 1, rootCanvas.height),
  };

  const strip = cropPixelRect(rootCanvas, stripRect);
  const empty: Record<ArtifactColor, number> = {
    grey: 0,
    green: 0,
    blue: 0,
    purple: 0,
    gold: 0,
    red: 0,
  };

  const width = strip.width;
  const height = strip.height;

  const dotCenters = [0.10, 0.30, 0.50, 0.70, 0.90];
  const radius = Math.min(width / 12, height / 2.2);

  for (const centerRatio of dotCenters) {
    const cx = width * centerRatio;
    const cy = height * 0.54;
    const counts = countColorsInsideDisk(strip, cx, cy, radius);
    const dotColor = chooseArtifactColorFromCounts(counts);
    empty[dotColor] += 1;
  }

  return empty;
}

function detectArtifactColor(
  slotCanvas: HTMLCanvasElement,
  slot: ArtifactSlotKey
): ArtifactColor {
  const counts = countArtifactBorderColors(slotCanvas);
  return chooseArtifactColorFromCounts(counts, slot);
}

function detectRuneColor(slotCanvas: HTMLCanvasElement): ArtifactColor {
  const strip = cropNormalized(slotCanvas, {
    x: 0.12,
    y: 0.74,
    width: 0.76,
    height: 0.18,
  });

  const counts = countRuneDotColors(strip);
  return chooseArtifactColorFromCounts(counts);
}

function chooseArtifactColorFromCounts(
  counts: Record<ArtifactColor, number>,
  slot?: ArtifactSlotKey
): ArtifactColor {
  const strongTotal =
    counts.green + counts.blue + counts.purple + counts.gold + counts.red;

  if (strongTotal <= 0.25) {
    return "grey";
  }

  const adjusted: Record<ArtifactColor, number> = {
    grey: counts.grey * 0.35,
    green: counts.green,
    blue: counts.blue,
    purple: counts.purple * 1.02,
    gold: counts.gold,
    red: counts.red * 1.03,
  };

  if (slot === "helmet") {
    if (
      adjusted.red >= adjusted.gold * 0.7 &&
      adjusted.red >= adjusted.purple * 0.9
    ) {
      return "red";
    }
  }

  const ranked = (
    ["green", "blue", "purple", "gold", "red"] as ArtifactColor[]
  )
    .map((color) => ({ color, value: adjusted[color] }))
    .sort((a, b) => b.value - a.value);

  const first = ranked[0];
  const second = ranked[1];

  if (!first || first.value <= 0) {
    return "grey";
  }

  if (
    first.color === "gold" &&
    second &&
    second.color === "red" &&
    second.value >= first.value * 0.96
  ) {
    return slot === "helmet" ? "red" : "gold";
  }

  if (
    first.color === "red" &&
    second &&
    second.color === "gold" &&
    second.value >= first.value * 0.92
  ) {
    return slot === "helmet" ? "red" : "gold";
  }

  return first.color;
}

function countArtifactBorderColors(
  slotCanvas: HTMLCanvasElement
): Record<ArtifactColor, number> {
  const context = slotCanvas.getContext("2d");
  const empty: Record<ArtifactColor, number> = {
    grey: 0,
    green: 0,
    blue: 0,
    purple: 0,
    gold: 0,
    red: 0,
  };

  if (!context) {
    return empty;
  }

  const { width, height } = slotCanvas;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  const cx = width / 2;
  const cy = height * 0.44;
  const minDimension = Math.min(width, height);
  const innerRadius = minDimension * 0.25;
  const outerRadius = minDimension * 0.34;
  const ringMid = (innerRadius + outerRadius) / 2;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (y < height * 0.08 || y > height * 0.64) {
        continue;
      }

      const dx = x - cx;
      const dy = y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < innerRadius || distance > outerRadius) {
        continue;
      }

      const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;

      const isSideArc =
        angle <= 35 || angle >= 325 || (angle >= 145 && angle <= 215);

      if (!isSideArc) {
        continue;
      }

      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const alpha = data[index + 3];

      if (alpha < 20) {
        continue;
      }

      const { hue, saturation, value } = rgbToHsv(r, g, b);

      if (value < 0.12) {
        continue;
      }

      const ringWeight =
        1.10 -
        Math.abs(distance - ringMid) /
          Math.max(outerRadius - innerRadius, 1);

      const weight = Math.max(ringWeight, 0.05);

      if (saturation < 0.16 && value >= 0.20) {
        empty.grey += weight;
        continue;
      }

      if ((hue <= 18 || hue >= 342) && saturation >= 0.30 && value >= 0.22) {
        empty.red += weight;
        continue;
      }

      if (hue >= 70 && hue < 170 && saturation >= 0.24 && value >= 0.18) {
        empty.green += weight;
        continue;
      }

      if (hue >= 170 && hue < 250 && saturation >= 0.23 && value >= 0.18) {
        empty.blue += weight;
        continue;
      }

      if (hue >= 250 && hue < 320 && saturation >= 0.22 && value >= 0.18) {
        empty.purple += weight;
        continue;
      }

      if (hue >= 20 && hue < 70 && saturation >= 0.26 && value >= 0.22) {
        empty.gold += weight;
        continue;
      }
    }
  }

  return empty;
}

function countRuneDotColors(
  stripCanvas: HTMLCanvasElement
): Record<ArtifactColor, number> {
  const context = stripCanvas.getContext("2d");
  const empty: Record<ArtifactColor, number> = {
    grey: 0,
    green: 0,
    blue: 0,
    purple: 0,
    gold: 0,
    red: 0,
  };

  if (!context) {
    return empty;
  }

  const width = stripCanvas.width;
  const height = stripCanvas.height;

  const dotCenters = [0.1, 0.3, 0.5, 0.7, 0.9];
  const radius = Math.min(width / 11, height / 2.4);

  for (const centerRatio of dotCenters) {
    const cx = width * centerRatio;
    const cy = height * 0.52;

    const counts = countColorsInsideDisk(stripCanvas, cx, cy, radius);
    const dotColor = chooseArtifactColorFromCounts(counts);

    empty[dotColor] += 1;
  }

  return empty;
}

function countColorsInsideDisk(
  canvas: HTMLCanvasElement,
  cx: number,
  cy: number,
  radius: number
): Record<ArtifactColor, number> {
  const context = canvas.getContext("2d");
  const empty: Record<ArtifactColor, number> = {
    grey: 0,
    green: 0,
    blue: 0,
    purple: 0,
    gold: 0,
    red: 0,
  };

  if (!context) {
    return empty;
  }

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  for (
    let y = Math.max(0, Math.floor(cy - radius));
    y <= Math.min(height - 1, Math.ceil(cy + radius));
    y += 1
  ) {
    for (
      let x = Math.max(0, Math.floor(cx - radius));
      x <= Math.min(width - 1, Math.ceil(cx + radius));
      x += 1
    ) {
      const dx = x - cx;
      const dy = y - cy;

      if (dx * dx + dy * dy > radius * radius) {
        continue;
      }

      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const alpha = data[index + 3];

      if (alpha < 20) {
        continue;
      }

      const { hue, saturation, value } = rgbToHsv(r, g, b);

      if (value < 0.14) {
        continue;
      }

      if (saturation < 0.16 && value >= 0.22) {
        empty.grey += 1;
        continue;
      }

      if ((hue <= 18 || hue >= 342) && saturation >= 0.3 && value >= 0.22) {
        empty.red += 1;
        continue;
      }

      if (hue >= 72 && hue < 170 && saturation >= 0.24 && value >= 0.18) {
        empty.green += 1;
        continue;
      }

      if (hue >= 170 && hue < 250 && saturation >= 0.23 && value >= 0.18) {
        empty.blue += 1;
        continue;
      }

      if (hue >= 250 && hue < 320 && saturation >= 0.22 && value >= 0.18) {
        empty.purple += 1;
        continue;
      }

      if (hue >= 20 && hue < 70 && saturation >= 0.26 && value >= 0.22) {
        empty.gold += 1;
        continue;
      }
    }
  }

  return empty;
}

async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const image = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create image context.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function fileToImage(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not load image."));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function cropNormalized(
  source: HTMLCanvasElement,
  region: NormalizedRegion
): HTMLCanvasElement {
  return cropPixels(
    source,
    region.x * source.width,
    region.y * source.height,
    region.width * source.width,
    region.height * source.height
  );
}

function cropRelativeToRect(
  source: HTMLCanvasElement,
  baseRect: PixelRect,
  relative: NormalizedRegion
): HTMLCanvasElement {
  return cropPixels(
    source,
    baseRect.x + relative.x * baseRect.width,
    baseRect.y + relative.y * baseRect.height,
    relative.width * baseRect.width,
    relative.height * baseRect.height
  );
}

function cropPixelRect(
  source: HTMLCanvasElement,
  rect: PixelRect
): HTMLCanvasElement {
  return cropPixels(source, rect.x, rect.y, rect.width, rect.height);
}

function expandPixelRect(
  source: HTMLCanvasElement,
  rect: PixelRect,
  padX: number,
  padTop: number,
  padBottom: number
): PixelRect {
  const x = clamp(Math.floor(rect.x - padX), 0, source.width - 1);
  const y = clamp(Math.floor(rect.y - padTop), 0, source.height - 1);

  const right = clamp(
    Math.ceil(rect.x + rect.width + padX),
    x + 1,
    source.width
  );

  const bottom = clamp(
    Math.ceil(rect.y + rect.height + padBottom),
    y + 1,
    source.height
  );

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  };
}

function cropPixels(
  source: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(Math.floor(width), 1);
  canvas.height = Math.max(Math.floor(height), 1);

  const context = canvas.getContext("2d");
  if (!context) {
    return canvas;
  }

  const sx = clamp(Math.floor(x), 0, source.width - 1);
  const sy = clamp(Math.floor(y), 0, source.height - 1);
  const sw = clamp(Math.floor(width), 1, source.width - sx);
  const sh = clamp(Math.floor(height), 1, source.height - sy);

  context.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function upscaleCanvas(
  source: HTMLCanvasElement,
  factor: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(Math.floor(source.width * factor), 1);
  canvas.height = Math.max(Math.floor(source.height * factor), 1);

  const context = canvas.getContext("2d");
  if (!context) {
    return source;
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function cleanupBinaryTextMask(
  sourceCanvas: HTMLCanvasElement,
  passes = 1
): HTMLCanvasElement {
  let current = sourceCanvas;

  for (let pass = 0; pass < passes; pass += 1) {
    const output = document.createElement("canvas");
    output.width = current.width;
    output.height = current.height;

    const srcCtx = current.getContext("2d");
    const outCtx = output.getContext("2d");

    if (!srcCtx || !outCtx) {
      return current;
    }

    const srcImage = srcCtx.getImageData(0, 0, current.width, current.height);
    const dstImage = outCtx.createImageData(current.width, current.height);

    const src = srcImage.data;
    const dst = dstImage.data;
    const width = current.width;
    const height = current.height;

    function isBlackAt(x: number, y: number) {
      const index = (y * width + x) * 4;
      return src[index] < 128;
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;

        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          const value = src[index];
          dst[index] = value;
          dst[index + 1] = value;
          dst[index + 2] = value;
          dst[index + 3] = 255;
          continue;
        }

        let blackNeighbours = 0;

        for (let oy = -1; oy <= 1; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            if (ox === 0 && oy === 0) {
              continue;
            }

            if (isBlackAt(x + ox, y + oy)) {
              blackNeighbours += 1;
            }
          }
        }

        const currentBlack = src[index] < 128;
        let outBlack = currentBlack;

        if (currentBlack && blackNeighbours <= 1) {
          outBlack = false;
        } else if (!currentBlack && blackNeighbours >= 6) {
          outBlack = true;
        }

        const out = outBlack ? 0 : 255;
        dst[index] = out;
        dst[index + 1] = out;
        dst[index + 2] = out;
        dst[index + 3] = 255;
      }
    }

    outCtx.putImageData(dstImage, 0, 0);
    current = output;
  }

  return current;
}

function buildYellowTextCanvas(
  sourceCanvas: HTMLCanvasElement,
  mode: "soft" | "strict" = "strict"
) {
  const output = document.createElement("canvas");
  output.width = sourceCanvas.width;
  output.height = sourceCanvas.height;

  const srcCtx = sourceCanvas.getContext("2d");
  const outCtx = output.getContext("2d");

  if (!srcCtx || !outCtx) {
    return sourceCanvas;
  }

  const imageData = srcCtx.getImageData(
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height
  );
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const a = data[index + 3];

    const isYellow = isYellowNamePixel(r, g, b, a, mode);
    const out = isYellow ? 0 : 255;

    data[index] = out;
    data[index + 1] = out;
    data[index + 2] = out;
    data[index + 3] = 255;
  }

  outCtx.putImageData(imageData, 0, 0);
  return cleanupBinaryTextMask(output, 1);
}

function buildWhiteTextCanvas(sourceCanvas: HTMLCanvasElement) {
  const output = document.createElement("canvas");
  output.width = sourceCanvas.width;
  output.height = sourceCanvas.height;

  const srcCtx = sourceCanvas.getContext("2d");
  const outCtx = output.getContext("2d");

  if (!srcCtx || !outCtx) {
    return sourceCanvas;
  }

  const imageData = srcCtx.getImageData(
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height
  );
  const { data } = imageData;

  for (let index = 0; index < data.length; index += 4) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];

    const { saturation } = rgbToHsv(r, g, b);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    const isWhiteText =
      (luminance >= 160 && saturation <= 0.35) || luminance >= 215;
    const out = isWhiteText ? 0 : 255;

    data[index] = out;
    data[index + 1] = out;
    data[index + 2] = out;
    data[index + 3] = 255;
  }

  outCtx.putImageData(imageData, 0, 0);
  return output;
}

async function recognizeDetailed(
  source: HTMLCanvasElement,
  options?: {
    whitelist?: string;
    pageSegMode?: "6" | "7";
  }
): Promise<OCRResultLite> {
  return runOcrTask(async () => {
    const worker = await getOcrWorker();

    await worker.setParameters({
      tessedit_pageseg_mode: options?.pageSegMode ?? "7",
      tessedit_char_whitelist: options?.whitelist ?? "",
    } as never);

    const result = await worker.recognize(source);

    const words = ((result.data.words ?? []) as Array<{
      text?: string;
      confidence?: number;
    }>).map((word) => ({
      text: (word.text ?? "").trim(),
      confidence: Number.isFinite(word.confidence)
        ? Number(word.confidence)
        : 0,
    }));

    return {
      text: result.data.text ?? "",
      words,
    };
  });
}

async function recognizeDetailedWithBoxes(
  source: HTMLCanvasElement,
  options?: {
    whitelist?: string;
    pageSegMode?: "6" | "7";
  }
): Promise<OCRResultWithBoxesLite> {
  return runOcrTask(async () => {
    const worker = await getOcrWorker();

    await worker.setParameters({
      tessedit_pageseg_mode: options?.pageSegMode ?? "7",
      tessedit_char_whitelist: options?.whitelist ?? "",
    } as never);

    const result = await worker.recognize(source);

    const words = ((result.data.words ?? []) as Array<{
      text?: string;
      confidence?: number;
      bbox?: {
        x0?: number;
        y0?: number;
        x1?: number;
        y1?: number;
      };
    }>).map((word) => ({
      text: (word.text ?? "").trim(),
      confidence: Number.isFinite(word.confidence)
        ? Number(word.confidence)
        : 0,
      bbox: {
        x0: Number.isFinite(word.bbox?.x0) ? Number(word.bbox?.x0) : 0,
        y0: Number.isFinite(word.bbox?.y0) ? Number(word.bbox?.y0) : 0,
        x1: Number.isFinite(word.bbox?.x1) ? Number(word.bbox?.x1) : 0,
        y1: Number.isFinite(word.bbox?.y1) ? Number(word.bbox?.y1) : 0,
      },
    }));

    return {
      text: result.data.text ?? "",
      words,
    };
  });
}

function rgbToHsv(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;

  if (delta !== 0) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }

    hue *= 60;

    if (hue < 0) {
      hue += 360;
    }
  }

  const saturation = max === 0 ? 0 : delta / max;
  const value = max;

  return { hue, saturation, value };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getSlotLabel(slot: ArtifactSlotKey) {
  switch (slot) {
    case "sword":
      return "Sword";
    case "shield":
      return "Shield";
    case "boots":
      return "Boots";
    case "chest":
      return "Chest";
    case "helmet":
      return "Helmet";
    case "pants":
      return "Pants";
  }
}

function buildDebugCrops(
  rootCanvas: HTMLCanvasElement,
  layout: LayoutModel,
  chiefName: string,
  individualMight: number,
  slots: Record<ArtifactSlotKey, ArtifactSlotAnalysis>,
  individualMightDebugLines: string[] = []
): DebugCropResult[] {
  const results: DebugCropResult[] = [];

  const detectedNameRect = layout.nameRect;

  const nameCrop = detectedNameRect
    ? cropPixelRect(rootCanvas, detectedNameRect)
    : cropRelativeToRect(rootCanvas, layout.topInfoRect, {
        x: 0.16,
        y: 0.05,
        width: 0.64,
        height: 0.16,
      });

  const { individualRect } = findMightLineRects(rootCanvas, layout.topInfoRect);

  const individualCrop = individualRect
    ? cropPixelRect(rootCanvas, individualRect)
    : cropRelativeToRect(rootCanvas, layout.topInfoRect, {
        x: 0.28,
        y: 0.32,
        width: 0.56,
        height: 0.12,
      });

  results.push({
    id: "name",
    label: "Name region",
    imageUrl: canvasToDataUrl(nameCrop),
    meta: `Detected: ${chiefName}`,
  });

  results.push({
    id: "individual-might",
    label: "Individual Might region",
    imageUrl: canvasToDataUrl(individualCrop),
    meta: [
      `Detected: ${formatNumber(individualMight)}`,
      ...individualMightDebugLines,
    ].join("\n"),
  });

  results.push({
    id: "artifact-title",
    label: "Artifact title region",
    imageUrl: canvasToDataUrl(cropPixelRect(rootCanvas, layout.artifactTitleRect)),
  });

  results.push({
    id: "artifact-grid",
    label: "Artifact grid region",
    imageUrl: canvasToDataUrl(cropPixelRect(rootCanvas, layout.artifactGridRect)),
  });

  for (const slot of SLOT_ORDER) {
    const circle = layout.artifactCircles[slot];
    const crop = cropPixelRect(rootCanvas, layout.slotRects[slot]);
    const entry = slots[slot];

    results.push({
      id: slot,
      label: `${capitalize(slot)} slot`,
      imageUrl: canvasToDataUrl(crop),
      meta: circle
        ? `Artifact: ${capitalize(entry.color)} | Level: ${entry.level} | Rune: ${capitalize(entry.runeColor)} | Circle: (${Math.round(circle.cx)}, ${Math.round(circle.cy)}) r=${Math.round(circle.r)}`
        : `Artifact: ${capitalize(entry.color)} | Level: ${entry.level} | Rune: ${capitalize(entry.runeColor)}`,
    });
  }

  return results;
}

function canvasToDataUrl(canvas: HTMLCanvasElement) {
  return canvas.toDataURL("image/png");
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}