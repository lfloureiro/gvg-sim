import type { ArmyType, Confidence, EnemyAnalysisRow, EnemyAnalysisRowOverride } from "./analysis";
import {
  readEnemyAnalysisFeedbackMemory,
  type EnemyAnalysisFeedbackEntry,
} from "./enemyAnalysisLearning";

const MODEL_STORAGE_KEY = "phoenix-veritas-enemy-analysis-might-ml-model-v1";
const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
const ARMY_TYPES: ArmyType[] = ["archer", "berserker", "cavalry"];
const MAX_CANDIDATES = 18;

type ConfidenceLabel = (typeof CONFIDENCE_LEVELS)[number];

type MightTransformId =
  | "identity"
  | "drop_first"
  | "drop_last"
  | "drop_first_add_0"
  | "drop_first_add_8"
  | "drop_last_add_0"
  | "drop_last_add_8"
  | "first_8"
  | "last_8"
  | "first_9"
  | "last_9"
  | "first_10"
  | "last_10"
  | "replace_last_0"
  | "replace_last_8"
  | "remove_pos"
  | "remove_pos_add_0"
  | "remove_pos_add_8"
  | "window"
  | "window_add_0"
  | "window_add_8";

export type MightMlCandidate = {
  value: number;
  digits: string;
  transformId: MightTransformId;
  metadata?: string;
};

export type MightMlModel = {
  version: 1;
  createdAt: string;
  updatedAt: string;
  epochs: number;
  learningRate: number;
  featureNames: string[];
  weights: number[];
  bias: number;
  trainingExamples: number;
  coveredExamples: number;
  trainingAccuracy: number;
};

export type MightMlPrediction = {
  predictedValue: number;
  confidence: number;
  margin: number;
  candidates: Array<{
    value: number;
    score: number;
    probability: number;
    transformId: MightTransformId;
    metadata?: string;
  }>;
};

export type MightMlSummary = {
  hasModel: boolean;
  createdAt?: string;
  updatedAt?: string;
  trainingExamples: number;
  coveredExamples: number;
  trainingAccuracy?: number;
  featureCount: number;
};

type MightTrainingExample = {
  row: EnemyAnalysisRow;
  correctedValue: number;
};

export function trainAndSaveMightMlModelFromLearningMemory(options?: {
  epochs?: number;
  learningRate?: number;
}): MightMlModel | null {
  const entries = readEnemyAnalysisFeedbackMemory();
  const model = trainMightMlModel(entries, options);
  if (!model) {
    return null;
  }

  saveMightMlModel(model);
  return model;
}

export function trainMightMlModel(
  entries: EnemyAnalysisFeedbackEntry[],
  options?: {
    epochs?: number;
    learningRate?: number;
  }
): MightMlModel | null {
  const examples = buildTrainingExamples(entries);
  if (!examples.length) {
    return null;
  }

  const templateRow = examples[0].row;
  const templateCandidate = buildMightCandidates(templateRow)[0] ?? {
    value: templateRow.individualMight,
    digits: String(Math.max(0, Math.round(templateRow.individualMight))),
    transformId: "identity" as const,
  };
  const featureTemplate = extractMightCandidateFeatures(templateRow, templateCandidate);
  const weights = new Array(featureTemplate.featureNames.length).fill(0);
  let bias = 0;

  const epochs = Math.max(4, Math.min(40, options?.epochs ?? 14));
  const learningRate = Math.max(0.01, Math.min(1, options?.learningRate ?? 0.08));

  let coveredExamples = 0;

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const orderedExamples = [...examples].sort((left, right) => {
      if (left.correctedValue !== right.correctedValue) {
        return right.correctedValue - left.correctedValue;
      }
      return left.row.fileName.localeCompare(right.row.fileName);
    });

    for (const example of orderedExamples) {
      const candidates = buildMightCandidates(example.row);
      if (!candidates.length) {
        continue;
      }

      const correct = candidates.find((candidate) => candidate.value === example.correctedValue);
      if (!correct) {
        continue;
      }

      coveredExamples += epoch === 0 ? 1 : 0;

      const predicted = chooseBestCandidate(example.row, candidates, { weights, bias });
      if (predicted.value === correct.value) {
        continue;
      }

      const correctFeatures = extractMightCandidateFeatures(example.row, correct).vector;
      const predictedFeatures = extractMightCandidateFeatures(example.row, predicted).vector;

      for (let index = 0; index < weights.length; index += 1) {
        weights[index] += learningRate * (correctFeatures[index] - predictedFeatures[index]);
      }

      bias += learningRate;
    }
  }

  const trainingAccuracy = computeTrainingAccuracy(examples, { weights, bias });
  const timestamp = new Date().toISOString();

  return {
    version: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    epochs,
    learningRate,
    featureNames: featureTemplate.featureNames,
    weights,
    bias,
    trainingExamples: examples.length,
    coveredExamples,
    trainingAccuracy,
  };
}

export function buildMightMlOverrideSuggestions(
  rows: EnemyAnalysisRow[],
  options?: {
    model?: MightMlModel | null;
    confidenceThreshold?: number;
    marginThreshold?: number;
    allowSameValue?: boolean;
  }
): Record<string, EnemyAnalysisRowOverride> {
  const model = options?.model ?? loadMightMlModel();
  if (!model) {
    return {};
  }

  const confidenceThreshold = Math.max(0.45, Math.min(0.99, options?.confidenceThreshold ?? 0.72));
  const marginThreshold = Math.max(0.02, Math.min(0.95, options?.marginThreshold ?? 0.12));
  const allowSameValue = options?.allowSameValue ?? false;
  const suggestions: Record<string, EnemyAnalysisRowOverride> = {};

  for (const row of rows) {
    const prediction = predictMightWithModel(row, model);
    if (!prediction.candidates.length) {
      continue;
    }

    if (!allowSameValue && prediction.predictedValue === row.individualMight) {
      continue;
    }

    if (prediction.confidence < confidenceThreshold || prediction.margin < marginThreshold) {
      continue;
    }

    suggestions[row.fileName] = {
      individualMight: prediction.predictedValue,
      notes: `ML might suggestion (${Math.round(prediction.confidence * 100)}%)`,
    };
  }

  return suggestions;
}

export function predictMightWithModel(
  row: EnemyAnalysisRow,
  model?: MightMlModel | null
): MightMlPrediction {
  const currentModel = model ?? loadMightMlModel();
  const candidates = buildMightCandidates(row);

  if (!candidates.length) {
    return {
      predictedValue: row.individualMight,
      confidence: 0,
      margin: 0,
      candidates: [],
    };
  }

  if (!currentModel) {
    return {
      predictedValue: row.individualMight,
      confidence: 0,
      margin: 0,
      candidates: candidates.map((candidate, index) => ({
        value: candidate.value,
        score: candidate.value === row.individualMight ? 1 : 0,
        probability: candidate.value === row.individualMight ? 1 : index === 0 ? 0 : 0,
        transformId: candidate.transformId,
        metadata: candidate.metadata,
      })),
    };
  }

  const scored = candidates.map((candidate) => {
    const { vector } = extractMightCandidateFeatures(row, candidate);
    return {
      candidate,
      score: dot(currentModel.weights, vector) + currentModel.bias,
    };
  });

  const probabilities = softmax(scored.map((entry) => entry.score));
  const sorted = scored
    .map((entry, index) => ({
      ...entry,
      probability: probabilities[index],
    }))
    .sort((left, right) => right.probability - left.probability);

  const best = sorted[0];
  const second = sorted[1];

  return {
    predictedValue: best.candidate.value,
    confidence: best.probability,
    margin: best.probability - (second?.probability ?? 0),
    candidates: sorted.slice(0, 6).map((entry) => ({
      value: entry.candidate.value,
      score: entry.score,
      probability: entry.probability,
      transformId: entry.candidate.transformId,
      metadata: entry.candidate.metadata,
    })),
  };
}

export function buildMightCandidates(row: Pick<EnemyAnalysisRow, "individualMight" | "armyType" | "confidence" | "armyScores">): MightMlCandidate[] {
  const rawDigits = normalizeDigits(String(Math.max(0, Math.round(row.individualMight))));
  if (!rawDigits) {
    return [];
  }

  const candidates = new Map<string, MightMlCandidate>();

  function addCandidate(digits: string, transformId: MightTransformId, metadata?: string) {
    const normalized = normalizeDigits(digits);
    if (!normalized || normalized.length < 7 || normalized.length > 10) {
      return;
    }

    const value = Number(normalized);
    if (!Number.isFinite(value) || value < 1_000_000 || value > 500_000_000) {
      return;
    }

    if (!candidates.has(normalized)) {
      candidates.set(normalized, {
        value,
        digits: normalized,
        transformId,
        metadata,
      });
    }
  }

  addCandidate(rawDigits, "identity");

  const targetLengths = [8, 9, 10] as const;

  for (const targetLength of targetLengths) {
    if (rawDigits.length >= targetLength) {
      addCandidate(rawDigits.slice(0, targetLength), targetLength === 8 ? "first_8" : targetLength === 9 ? "first_9" : "first_10");
      addCandidate(rawDigits.slice(rawDigits.length - targetLength), targetLength === 8 ? "last_8" : targetLength === 9 ? "last_9" : "last_10");

      for (let start = 0; start <= rawDigits.length - targetLength; start += 1) {
        addCandidate(rawDigits.slice(start, start + targetLength), "window", `${start}:${targetLength}`);
      }
    }
  }

  if (rawDigits.length >= 2) {
    addCandidate(rawDigits.slice(1), "drop_first");
    addCandidate(rawDigits.slice(0, -1), "drop_last");
    addCandidate(`${rawDigits.slice(1)}0`, "drop_first_add_0");
    addCandidate(`${rawDigits.slice(1)}8`, "drop_first_add_8");
    addCandidate(`${rawDigits.slice(0, -1)}0`, "drop_last_add_0");
    addCandidate(`${rawDigits.slice(0, -1)}8`, "drop_last_add_8");
  }

  if (rawDigits.length >= 3) {
    for (let index = 0; index < rawDigits.length; index += 1) {
      const removed = `${rawDigits.slice(0, index)}${rawDigits.slice(index + 1)}`;
      addCandidate(removed, "remove_pos", `${index}`);
      addCandidate(`${removed}0`, "remove_pos_add_0", `${index}`);
      addCandidate(`${removed}8`, "remove_pos_add_8", `${index}`);
    }
  }

  if (rawDigits.endsWith("8")) {
    addCandidate(`${rawDigits.slice(0, -1)}0`, "replace_last_0");
  }
  if (rawDigits.endsWith("0")) {
    addCandidate(`${rawDigits.slice(0, -1)}8`, "replace_last_8");
  }

  for (const targetLength of [8, 9] as const) {
    if (rawDigits.length >= targetLength - 1) {
      for (let start = 0; start <= rawDigits.length - (targetLength - 1); start += 1) {
        const slice = rawDigits.slice(start, start + (targetLength - 1));
        addCandidate(`${slice}0`, "window_add_0", `${start}:${targetLength - 1}`);
        addCandidate(`${slice}8`, "window_add_8", `${start}:${targetLength - 1}`);
      }
    }
  }

  return [...candidates.values()]
    .sort((left, right) => scoreCandidateHeuristic(row, right) - scoreCandidateHeuristic(row, left))
    .slice(0, MAX_CANDIDATES);
}

export function loadMightMlModel(): MightMlModel | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!isMightMlModel(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveMightMlModel(model: MightMlModel) {
  if (typeof window === "undefined") {
    return;
  }

  const next = {
    ...model,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(next));
}

export function clearMightMlModel() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(MODEL_STORAGE_KEY);
}

export function getMightMlSummary(): MightMlSummary {
  const model = loadMightMlModel();
  return {
    hasModel: Boolean(model),
    createdAt: model?.createdAt,
    updatedAt: model?.updatedAt,
    trainingExamples: model?.trainingExamples ?? 0,
    coveredExamples: model?.coveredExamples ?? 0,
    trainingAccuracy: model?.trainingAccuracy,
    featureCount: model?.featureNames.length ?? 0,
  };
}

function buildTrainingExamples(entries: EnemyAnalysisFeedbackEntry[]): MightTrainingExample[] {
  const examples: MightTrainingExample[] = [];

  for (const entry of entries) {
    const corrected = entry.manual.individualMight;
    if (corrected === undefined || corrected === entry.auto.individualMight) {
      continue;
    }

    if (!Number.isFinite(corrected) || corrected <= 0) {
      continue;
    }

    examples.push({
      row: entry.auto,
      correctedValue: corrected,
    });
  }

  return examples;
}

function chooseBestCandidate(
  row: EnemyAnalysisRow,
  candidates: MightMlCandidate[],
  model: { weights: number[]; bias: number }
): MightMlCandidate {
  let best = candidates[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const candidate of candidates) {
    const { vector } = extractMightCandidateFeatures(row, candidate);
    const score = dot(model.weights, vector) + model.bias;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}

function computeTrainingAccuracy(
  examples: MightTrainingExample[],
  model: { weights: number[]; bias: number }
) {
  let covered = 0;
  let correct = 0;

  for (const example of examples) {
    const candidates = buildMightCandidates(example.row);
    if (!candidates.some((candidate) => candidate.value === example.correctedValue)) {
      continue;
    }

    covered += 1;
    const predicted = chooseBestCandidate(example.row, candidates, model);
    if (predicted.value === example.correctedValue) {
      correct += 1;
    }
  }

  if (!covered) {
    return 0;
  }

  return correct / covered;
}

function extractMightCandidateFeatures(
  row: EnemyAnalysisRow,
  candidate: MightMlCandidate
): {
  vector: number[];
  featureNames: string[];
} {
  const featureNames: string[] = [];
  const vector: number[] = [];
  const autoDigits = normalizeDigits(String(Math.max(0, Math.round(row.individualMight))));
  const candidateDigits = candidate.digits;
  const autoValue = Math.max(0, row.individualMight);
  const candidateValue = Math.max(0, candidate.value);
  const lengthDiff = candidateDigits.length - autoDigits.length;
  const prefix = commonPrefixLength(autoDigits, candidateDigits);
  const suffix = commonSuffixLength(autoDigits, candidateDigits);

  pushFeature(featureNames, vector, "candidate.logNorm", normalizeMight(candidateValue));
  pushFeature(featureNames, vector, "auto.logNorm", normalizeMight(autoValue));
  pushFeature(featureNames, vector, "delta.logNorm", normalizeMight(candidateValue) - normalizeMight(autoValue));
  pushFeature(featureNames, vector, "sameAsAuto", candidateValue === autoValue ? 1 : 0);
  pushFeature(featureNames, vector, "candidate.gtAuto", candidateValue > autoValue ? 1 : 0);
  pushFeature(featureNames, vector, "candidate.ltAuto", candidateValue < autoValue ? 1 : 0);
  pushFeature(featureNames, vector, "ratioNorm", autoValue > 0 ? clamp(candidateValue / autoValue, 0, 4) / 4 : 0);
  pushFeature(featureNames, vector, "prefixNorm", autoDigits.length ? prefix / autoDigits.length : 0);
  pushFeature(featureNames, vector, "suffixNorm", autoDigits.length ? suffix / autoDigits.length : 0);

  for (const diff of [-2, -1, 0, 1, 2]) {
    pushFeature(featureNames, vector, `lengthDiff.${diff}`, lengthDiff === diff ? 1 : 0);
  }

  for (const length of [7, 8, 9, 10] as const) {
    pushFeature(featureNames, vector, `candidateLength.${length}`, candidateDigits.length === length ? 1 : 0);
  }

  for (const transformId of [
    "identity",
    "drop_first",
    "drop_last",
    "drop_first_add_0",
    "drop_first_add_8",
    "drop_last_add_0",
    "drop_last_add_8",
    "first_8",
    "last_8",
    "first_9",
    "last_9",
    "replace_last_0",
    "replace_last_8",
    "remove_pos",
    "remove_pos_add_0",
    "remove_pos_add_8",
    "window",
    "window_add_0",
    "window_add_8",
  ] as const) {
    pushFeature(featureNames, vector, `transform.${transformId}`, candidate.transformId === transformId ? 1 : 0);
  }

  pushFeature(featureNames, vector, "candidateEnds0", candidateDigits.endsWith("0") ? 1 : 0);
  pushFeature(featureNames, vector, "candidateEnds8", candidateDigits.endsWith("8") ? 1 : 0);
  pushFeature(featureNames, vector, "candidateStarts1", candidateDigits.startsWith("1") ? 1 : 0);
  pushFeature(featureNames, vector, "candidateStarts2", candidateDigits.startsWith("2") ? 1 : 0);

  for (const armyType of ARMY_TYPES) {
    pushFeature(featureNames, vector, `armyType.${armyType}`, row.armyType === armyType ? 1 : 0);
  }

  for (const level of CONFIDENCE_LEVELS) {
    pushFeature(featureNames, vector, `confidence.${level}`, row.confidence === level ? 1 : 0);
  }

  for (const armyType of ARMY_TYPES) {
    pushFeature(featureNames, vector, `armyScore.${armyType}`, clamp((row.armyScores[armyType] ?? 0) / 300, 0, 2));
  }

  return { vector, featureNames };
}

function scoreCandidateHeuristic(
  row: Pick<EnemyAnalysisRow, "individualMight" | "armyType" | "confidence">,
  candidate: MightMlCandidate
) {
  const autoDigits = normalizeDigits(String(Math.max(0, Math.round(row.individualMight))));
  const candidateDigits = candidate.digits;
  const candidateValue = candidate.value;
  let score = 0;

  if (candidateValue === row.individualMight) {
    score += 26;
  }

  if (candidateDigits.length === 9) {
    score += 14;
  } else if (candidateDigits.length === 8) {
    score += 10;
  } else if (candidateDigits.length === 10) {
    score -= 6;
  }

  score += commonPrefixLength(autoDigits, candidateDigits) * 2.2;
  score += commonSuffixLength(autoDigits, candidateDigits) * 1.7;

  if (candidate.transformId === "identity") score += 8;
  if (candidate.transformId === "drop_first") score += 9;
  if (candidate.transformId === "drop_last") score += 7;
  if (candidate.transformId === "drop_first_add_0") score += 10;
  if (candidate.transformId === "drop_first_add_8") score += 8;
  if (candidate.transformId === "remove_pos") score += 5;
  if (candidate.transformId === "window") score += 4;

  if (candidateDigits.endsWith("0")) score += 2;
  if (candidateDigits.endsWith("8")) score += 1;
  if (row.confidence === "low") score += candidate.transformId === "identity" ? -3 : 2;

  return score;
}

function normalizeDigits(value: string) {
  return value.replace(/\D+/g, "").replace(/^0+/, "") || "";
}

function normalizeMight(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return clamp((Math.log10(value) - 6) / 3, 0, 1.5);
}

function commonPrefixLength(left: string, right: string) {
  const limit = Math.min(left.length, right.length);
  let length = 0;
  while (length < limit && left[length] === right[length]) {
    length += 1;
  }
  return length;
}

function commonSuffixLength(left: string, right: string) {
  const limit = Math.min(left.length, right.length);
  let length = 0;
  while (length < limit && left[left.length - 1 - length] === right[right.length - 1 - length]) {
    length += 1;
  }
  return length;
}

function pushFeature(featureNames: string[], vector: number[], name: string, value: number) {
  featureNames.push(name);
  vector.push(value);
}

function dot(weights: number[], vector: number[]) {
  const limit = Math.min(weights.length, vector.length);
  let sum = 0;
  for (let index = 0; index < limit; index += 1) {
    sum += weights[index] * vector[index];
  }
  return sum;
}

function softmax(values: number[]) {
  if (!values.length) {
    return [];
  }

  const maxValue = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - maxValue));
  const total = exps.reduce((sum, value) => sum + value, 0) || 1;
  return exps.map((value) => value / total);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isMightMlModel(value: unknown): value is MightMlModel {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<MightMlModel>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.featureNames) &&
    Array.isArray(candidate.weights) &&
    typeof candidate.bias === "number"
  );
}
