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

type GroupedRows = {
  armyType: ArmyType;
  label: string;
  rows: EnemyAnalysisRow[];
};

type NormalizedRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const OCR_LANGUAGE = "eng";

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

type ArtifactPanelAnchor = {
  left: number;
  top: number;
  slotWidth: number;
  slotHeight: number;
  colGap: number;
  rowGap: number;
};

const TITLE_SEARCH_REGION: NormalizedRegion = {
  x: 0.685,
  y: 0.335,
  width: 0.305,
  height: 0.125,
};

const SLOT_GRID_POSITION: Record<
  ArtifactSlotKey,
  { col: number; row: number }
> = {
  sword: { col: 0, row: 0 },
  shield: { col: 1, row: 0 },
  boots: { col: 2, row: 0 },
  chest: { col: 0, row: 1 },
  helmet: { col: 1, row: 1 },
  pants: { col: 0, row: 2 },
};

const NAME_REGIONS: NormalizedRegion[] = [
  { x: 0.760, y: 0.035, width: 0.185, height: 0.086 },
  { x: 0.768, y: 0.040, width: 0.175, height: 0.080 },
  { x: 0.752, y: 0.030, width: 0.195, height: 0.092 },
];

const INDIVIDUAL_MIGHT_REGION: NormalizedRegion = {
  x: 0.811,
  y: 0.116,
  width: 0.125,
  height: 0.058,
};

const HERO_MIGHT_REGION: NormalizedRegion = {
  x: 0.811,
  y: 0.176,
  width: 0.125,
  height: 0.058,
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

export async function analyzeEnemyImages(
  files: File[],
  onProgress?: (progress: AnalysisProgress) => void
): Promise<EnemyAnalysisRow[]> {
  const rows: EnemyAnalysisRow[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];

    try {
      onProgress?.({
        current: index + 1,
        total: files.length,
        fileName: file.name,
        step: "Loading screenshot",
      });

      const rootCanvas = await fileToCanvas(file);

      onProgress?.({
        current: index + 1,
        total: files.length,
        fileName: file.name,
        step: "Reading chief name",
      });

      const chiefName = await extractChiefName(rootCanvas);

      onProgress?.({
        current: index + 1,
        total: files.length,
        fileName: file.name,
        step: "Reading might values",
      });

      const [individualMight, heroMight] = await Promise.all([
        extractMight(rootCanvas, INDIVIDUAL_MIGHT_REGION),
        extractMight(rootCanvas, HERO_MIGHT_REGION),
      ]);

      onProgress?.({
        current: index + 1,
        total: files.length,
        fileName: file.name,
        step: "Analyzing artifacts",
      });

      const slots = await analyzeSlots(rootCanvas);

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
      // ignora ficheiros problemáticos e continua
    }
  }

  return rows;
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

async function analyzeSlots(
  rootCanvas: HTMLCanvasElement
): Promise<Record<ArtifactSlotKey, ArtifactSlotAnalysis>> {
  const anchor = await findArtifactPanelAnchor(rootCanvas);

  const entries = await Promise.all(
    (Object.keys(SLOT_GRID_POSITION) as ArtifactSlotKey[]).map(async (slot) => {
      const slotCanvas = cropSlotFromAnchor(rootCanvas, anchor, slot);
      const color = detectArtifactColor(slotCanvas, slot);
      const runeColor = detectRuneColor(slotCanvas);
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
    })
  );

  return Object.fromEntries(
    entries
  ) as Record<ArtifactSlotKey, ArtifactSlotAnalysis>;
}

async function findArtifactPanelAnchor(
  rootCanvas: HTMLCanvasElement
): Promise<ArtifactPanelAnchor> {
  const rootWidth = rootCanvas.width;
  const rootHeight = rootCanvas.height;

  const fallback: ArtifactPanelAnchor = {
    left: rootWidth * 0.738,
    top: rootHeight * 0.484,
    slotWidth: rootWidth * 0.069,
    slotHeight: rootHeight * 0.155,
    colGap: rootWidth * 0.068,
    rowGap: rootHeight * 0.179,
  };

  try {
    const searchCanvas = cropNormalized(rootCanvas, TITLE_SEARCH_REGION);
    const prepared = upscaleCanvas(buildWhiteTextCanvas(searchCanvas), 3);

    const result = await Tesseract.recognize(prepared, OCR_LANGUAGE, {
      tessedit_pageseg_mode: "6",
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' ",
    } as never);

    const words = (result.data.words ?? []) as Array<{
      text: string;
      bbox: { x0: number; y0: number; x1: number; y1: number };
    }>;

    const artifactWord = words.find((word) =>
      /artifact/i.test((word.text ?? "").replace(/[^A-Za-z]/g, ""))
    );

    if (!artifactWord) {
      return fallback;
    }

    const searchLeft = TITLE_SEARCH_REGION.x * rootWidth;
    const searchTop = TITLE_SEARCH_REGION.y * rootHeight;
    const scale = 3;

    const titleLeft = searchLeft + artifactWord.bbox.x0 / scale;
    const titleBottom = searchTop + artifactWord.bbox.y1 / scale;

    return {
      left: titleLeft - rootWidth * 0.052,
      top: titleBottom + rootHeight * 0.020,
      slotWidth: rootWidth * 0.069,
      slotHeight: rootHeight * 0.155,
      colGap: rootWidth * 0.068,
      rowGap: rootHeight * 0.179,
    };
  } catch {
    return fallback;
  }
}

function cropSlotFromAnchor(
  rootCanvas: HTMLCanvasElement,
  anchor: ArtifactPanelAnchor,
  slot: ArtifactSlotKey
) {
  const grid = SLOT_GRID_POSITION[slot];

  const left = anchor.left + grid.col * anchor.colGap;
  const top = anchor.top + grid.row * anchor.rowGap;

  return cropPixels(
    rootCanvas,
    left,
    top,
    anchor.slotWidth,
    anchor.slotHeight
  );
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

  const sx = Math.max(Math.floor(x), 0);
  const sy = Math.max(Math.floor(y), 0);
  const sw = Math.min(Math.floor(width), source.width - sx);
  const sh = Math.min(Math.floor(height), source.height - sy);

  context.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
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

async function extractChiefName(rootCanvas: HTMLCanvasElement) {
  const candidates: string[] = [];

  for (const region of NAME_REGIONS) {
    const crop = cropNormalized(rootCanvas, region);
    const yellowMask = buildYellowTextCanvas(crop);
    const prepared = upscaleCanvas(yellowMask, 4);

    const rawText = await recognizeText(prepared, {
      whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",
    });

    const normalized = normalizeChiefName(rawText);

    if (normalized !== "Unknown") {
      candidates.push(normalized);
    }
  }

  if (!candidates.length) {
    return "Unknown";
  }

  candidates.sort(
    (left, right) => scoreNameCandidate(right) - scoreNameCandidate(left)
  );

  return cleanLeadingNoise(candidates[0]);
}

async function extractMight(
  rootCanvas: HTMLCanvasElement,
  region: NormalizedRegion
): Promise<number> {
  const crop = cropNormalized(rootCanvas, region);
  const prepared = upscaleCanvas(buildWhiteTextCanvas(crop), 4);
  const rawText = await recognizeText(prepared, {
    whitelist: "0123456789,.",
  });

  return parseNumberFromOCR(rawText);
}

function parseNumberFromOCR(raw: string) {
  const candidate = raw.match(/\d[\d,.\s]{2,}/)?.[0] ?? raw;
  const digits = candidate.replace(/[^\d]/g, "");
  if (!digits) {
    return 0;
  }

  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeChiefName(raw: string) {
  const cleaned = raw
    .replace(/\b(ID|KINGDOM|GO)\b/gi, " ")
    .replace(/[^\p{L}\p{N}_-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Unknown";
  }

  const tokens = cleaned
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length >= 2);

  if (!tokens.length) {
    return "Unknown";
  }

  const joined = tokens.join("").replace(/^[-_]+/, "");

  if (!joined || joined.length <= 1) {
    return "Unknown";
  }

  return joined;
}

function cleanLeadingNoise(name: string) {
  if (name === "Unknown") {
    return name;
  }

  let cleaned = name;

  cleaned = cleaned.replace(/^[^A-Za-z0-9]+/, "");

  if (/xcal$/i.test(cleaned)) {
    cleaned = cleaned.replace(/^[A-Za-z]{2,6}(?=Xcal$)/i, "");
    cleaned = `Phvt${cleaned}`;
  }

  if (/^pvi/i.test(cleaned)) {
    cleaned = cleaned.replace(/^pvi/i, "Phvt");
  }

  if (/^phvi/i.test(cleaned)) {
    cleaned = cleaned.replace(/^phvi/i, "Phvt");
  }

  if (/^pivt/i.test(cleaned)) {
    cleaned = cleaned.replace(/^pivt/i, "Phvt");
  }

  return cleaned;
}

function scoreNameCandidate(name: string) {
  if (name === "Unknown") {
    return -1;
  }

  const letters = (name.match(/[A-Za-z]/g) ?? []).length;
  const digits = (name.match(/\d/g) ?? []).length;
  const length = name.length;

  let score = letters * 4 + digits * 2 + length;

  if (length < 4) score -= 30;
  if (length > 18) score -= 12;
  if (/^phvt/i.test(name)) score += 16;
  if (!/[A-Za-z]/.test(name)) score -= 20;

  return score;
}

function detectArtifactColor(
  slotCanvas: HTMLCanvasElement,
  slot: ArtifactSlotKey
): ArtifactColor {
  const counts = countArtifactRingColors(slotCanvas);
  return chooseArtifactColorFromCounts(counts, slot);
}

function detectRuneColor(slotCanvas: HTMLCanvasElement): ArtifactColor {
  const runeStrip = cropNormalized(slotCanvas, {
    x: 0.10,
    y: 0.72,
    width: 0.80,
    height: 0.22,
  });

  const counts = countWeightedColors(runeStrip);
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
    grey: counts.grey * 0.4,
    green: counts.green,
    blue: counts.blue,
    purple: counts.purple * 1.03,
    gold: counts.gold * 1.02,
    red: counts.red * 1.03,
  };

  if (slot === "helmet") {
    if (
      adjusted.red >= adjusted.gold * 0.62 &&
      adjusted.red >= adjusted.purple * 0.90
    ) {
      return "red";
    }
  }

  const bestNonGrey = (
    ["green", "blue", "purple", "gold", "red"] as ArtifactColor[]
  )
    .map((color) => ({ color, value: adjusted[color] }))
    .sort((a, b) => b.value - a.value);

  const first = bestNonGrey[0];
  const second = bestNonGrey[1];

  if (!first || first.value <= 0) {
    return "grey";
  }

  if (
    first.color === "red" &&
    second &&
    second.color === "gold" &&
    second.value >= first.value * 0.90
  ) {
    return slot === "helmet" ? "red" : "gold";
  }

  if (
    first.color === "gold" &&
    second &&
    second.color === "red" &&
    second.value >= first.value * 0.94
  ) {
    return slot === "helmet" ? "red" : "gold";
  }

  return first.color;
}

function countArtifactRingColors(
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
  const cy = height * 0.38;
  const minDimension = Math.min(width, height);
  const innerRadius = minDimension * 0.16;
  const outerRadius = minDimension * 0.34;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (y > height * 0.70) {
        continue;
      }

      const dx = x - cx;
      const dy = y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < innerRadius || distance > outerRadius) {
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

      const ringWeight = 1.15 - Math.abs(distance - (innerRadius + outerRadius) / 2) / outerRadius;
      const weight = Math.max(ringWeight, 0.05);

      if (saturation < 0.18 && value >= 0.20) {
        empty.grey += weight;
        continue;
      }

      if ((hue <= 18 || hue >= 342) && saturation >= 0.30 && value >= 0.22) {
        empty.red += weight;
        continue;
      }

      if (hue >= 70 && hue < 170 && saturation >= 0.25 && value >= 0.18) {
        empty.green += weight;
        continue;
      }

      if (hue >= 170 && hue < 250 && saturation >= 0.24 && value >= 0.18) {
        empty.blue += weight;
        continue;
      }

      if (hue >= 250 && hue < 320 && saturation >= 0.22 && value >= 0.18) {
        empty.purple += weight;
        continue;
      }

      if (hue >= 20 && hue < 70 && saturation >= 0.26 && value >= 0.24) {
        empty.gold += weight;
        continue;
      }
    }
  }

  return empty;
}

function countWeightedColors(canvas: HTMLCanvasElement): Record<ArtifactColor, number> {
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
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
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

      const dx = x - centerX;
      const dy = y - centerY;
      const distanceWeight =
        1.15 - Math.min(Math.sqrt(dx * dx + dy * dy) / maxDistance, 1);
      const weight = Math.max(distanceWeight, 0.05);

      if (saturation < 0.18 && value >= 0.20) {
        empty.grey += weight;
        continue;
      }

      if ((hue <= 18 || hue >= 342) && saturation >= 0.30 && value >= 0.22) {
        empty.red += weight;
        continue;
      }

      if (hue >= 70 && hue < 170 && saturation >= 0.25 && value >= 0.18) {
        empty.green += weight;
        continue;
      }

      if (hue >= 170 && hue < 250 && saturation >= 0.24 && value >= 0.18) {
        empty.blue += weight;
        continue;
      }

      if (hue >= 250 && hue < 320 && saturation >= 0.22 && value >= 0.18) {
        empty.purple += weight;
        continue;
      }

      if (hue >= 20 && hue < 70 && saturation >= 0.26 && value >= 0.24) {
        empty.gold += weight;
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
  const canvas = document.createElement("canvas");
  const sourceWidth = source.width;
  const sourceHeight = source.height;

  const sx = Math.max(Math.floor(region.x * sourceWidth), 0);
  const sy = Math.max(Math.floor(region.y * sourceHeight), 0);
  const sw = Math.max(Math.floor(region.width * sourceWidth), 1);
  const sh = Math.max(Math.floor(region.height * sourceHeight), 1);

  canvas.width = sw;
  canvas.height = sh;

  const context = canvas.getContext("2d");
  if (!context) {
    return canvas;
  }

  context.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
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

function buildYellowTextCanvas(sourceCanvas: HTMLCanvasElement) {
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
    const alpha = data[index + 3];

    if (alpha < 10) {
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = 255;
      continue;
    }

    const { hue, saturation, value } = rgbToHsv(r, g, b);

    const isYellow =
      hue >= 28 && hue <= 68 && saturation >= 0.30 && value >= 0.46;

    const out = isYellow ? 0 : 255;

    data[index] = out;
    data[index + 1] = out;
    data[index + 2] = out;
    data[index + 3] = 255;
  }

  outCtx.putImageData(imageData, 0, 0);
  return output;
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

    const isWhiteText = (luminance >= 160 && saturation <= 0.35) || luminance >= 215;
    const out = isWhiteText ? 0 : 255;

    data[index] = out;
    data[index + 1] = out;
    data[index + 2] = out;
    data[index + 3] = 255;
  }

  outCtx.putImageData(imageData, 0, 0);
  return output;
}

async function recognizeText(
  source: HTMLCanvasElement,
  options?: {
    whitelist?: string;
  }
) {
  const result = await Tesseract.recognize(source, OCR_LANGUAGE, {
    tessedit_pageseg_mode: "7",
    tessedit_char_whitelist: options?.whitelist ?? "",
  } as never);

  return result.data.text ?? "";
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

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}