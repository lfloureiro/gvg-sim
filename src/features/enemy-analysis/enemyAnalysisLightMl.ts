import {
  applyEnemyAnalysisOverride,
  type ArmyType,
  type ArtifactColor,
  type ArtifactSlotKey,
  type EnemyAnalysisRow,
  type EnemyAnalysisRowOverride,
} from "./analysis";
import {
  readEnemyAnalysisFeedbackMemory,
  type EnemyAnalysisFeedbackEntry,
} from "./enemyAnalysisLearning";

const MODEL_STORAGE_KEY = "phoenix-veritas-enemy-analysis-army-ml-model-v1";
const LABELS: ArmyType[] = ["archer", "berserker", "cavalry"];
const SLOT_ORDER: ArtifactSlotKey[] = [
  "sword",
  "shield",
  "boots",
  "chest",
  "helmet",
  "pants",
];
const COLORS: ArtifactColor[] = ["grey", "green", "blue", "purple", "gold", "red"];
const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;

type ConfidenceLabel = (typeof CONFIDENCE_LEVELS)[number];

export type ArmyTypeMlModel = {
  version: 1;
  createdAt: string;
  updatedAt: string;
  epochs: number;
  learningRate: number;
  featureNames: string[];
  labels: ArmyType[];
  weights: Record<ArmyType, number[]>;
  bias: Record<ArmyType, number>;
  trainingExamples: number;
  trainingAccuracy: number;
};

export type ArmyTypeMlPrediction = {
  predicted: ArmyType;
  confidence: number;
  probabilities: Record<ArmyType, number>;
  scores: Record<ArmyType, number>;
};

export type ArmyTypeMlSummary = {
  hasModel: boolean;
  createdAt?: string;
  updatedAt?: string;
  trainingExamples: number;
  trainingAccuracy?: number;
  featureCount: number;
};

type ArmyTypeTrainingExample = {
  features: number[];
  label: ArmyType;
};

export function trainAndSaveArmyTypeModelFromLearningMemory(options?: {
  epochs?: number;
  learningRate?: number;
}): ArmyTypeMlModel | null {
  const memory = readEnemyAnalysisFeedbackMemory();
  const model = trainArmyTypeModel(memory, options);

  if (!model) {
    return null;
  }

  saveArmyTypeMlModel(model);
  return model;
}

export function trainArmyTypeModel(
  entries: EnemyAnalysisFeedbackEntry[],
  options?: {
    epochs?: number;
    learningRate?: number;
  }
): ArmyTypeMlModel | null {
  const examples = buildTrainingExamples(entries);

  if (!examples.length) {
    return null;
  }

  const featureTemplate = extractArmyTypeFeatures(
    applyEnemyAnalysisOverride(entries[0].auto, entries[0].manual)
  );

  const epochs = Math.max(4, Math.min(40, options?.epochs ?? 12));
  const learningRate = Math.max(0.01, Math.min(1, options?.learningRate ?? 0.12));
  const weights = Object.fromEntries(
    LABELS.map((label) => [label, new Array(featureTemplate.vector.length).fill(0)])
  ) as Record<ArmyType, number[]>;
  const bias = Object.fromEntries(LABELS.map((label) => [label, 0])) as Record<ArmyType, number>;

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const shuffled = [...examples].sort((left, right) => {
      const leftScore = left.label.localeCompare(right.label);
      if (leftScore !== 0) {
        return leftScore;
      }

      return right.features.length - left.features.length;
    });

    for (const example of shuffled) {
      const predicted = predictLabel(example.features, weights, bias);
      if (predicted === example.label) {
        continue;
      }

      for (let index = 0; index < example.features.length; index += 1) {
        const value = example.features[index];
        weights[example.label][index] += learningRate * value;
        weights[predicted][index] -= learningRate * value;
      }

      bias[example.label] += learningRate;
      bias[predicted] -= learningRate;
    }
  }

  const trainingAccuracy = computeTrainingAccuracy(examples, weights, bias);
  const timestamp = new Date().toISOString();

  return {
    version: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    epochs,
    learningRate,
    featureNames: featureTemplate.featureNames,
    labels: LABELS,
    weights,
    bias,
    trainingExamples: examples.length,
    trainingAccuracy,
  };
}

export function buildArmyTypeMlOverrideSuggestions(
  rows: EnemyAnalysisRow[],
  options?: {
    model?: ArmyTypeMlModel | null;
    confidenceThreshold?: number;
    marginThreshold?: number;
  }
): Record<string, EnemyAnalysisRowOverride> {
  const model = options?.model ?? loadArmyTypeMlModel();
  if (!model) {
    return {};
  }

  const confidenceThreshold = Math.max(0.5, Math.min(0.99, options?.confidenceThreshold ?? 0.82));
  const marginThreshold = Math.max(0.05, Math.min(0.95, options?.marginThreshold ?? 0.14));
  const suggestions: Record<string, EnemyAnalysisRowOverride> = {};

  for (const row of rows) {
    const prediction = predictArmyTypeWithModel(row, model);
    const sorted = [...LABELS].sort(
      (left, right) => prediction.probabilities[right] - prediction.probabilities[left]
    );
    const margin =
      prediction.probabilities[sorted[0]] - prediction.probabilities[sorted[1]];

    if (
      prediction.predicted !== row.armyType &&
      prediction.confidence >= confidenceThreshold &&
      margin >= marginThreshold
    ) {
      suggestions[row.fileName] = {
        armyType: prediction.predicted,
        notes: `ML army suggestion (${Math.round(prediction.confidence * 100)}%)`,
      };
    }
  }

  return suggestions;
}

export function predictArmyTypeWithModel(
  row: EnemyAnalysisRow,
  model?: ArmyTypeMlModel | null
): ArmyTypeMlPrediction {
  const currentModel = model ?? loadArmyTypeMlModel();
  if (!currentModel) {
    return {
      predicted: row.armyType,
      confidence: 0,
      probabilities: {
        archer: row.armyType === "archer" ? 1 : 0,
        berserker: row.armyType === "berserker" ? 1 : 0,
        cavalry: row.armyType === "cavalry" ? 1 : 0,
      },
      scores: {
        archer: 0,
        berserker: 0,
        cavalry: 0,
      },
    };
  }

  const { vector } = extractArmyTypeFeatures(row);
  const scores = Object.fromEntries(
    LABELS.map((label) => [label, dot(currentModel.weights[label], vector) + currentModel.bias[label]])
  ) as Record<ArmyType, number>;
  const probabilities = softmax(scores);
  const predicted = [...LABELS].sort((left, right) => probabilities[right] - probabilities[left])[0];

  return {
    predicted,
    confidence: probabilities[predicted],
    probabilities,
    scores,
  };
}

export function loadArmyTypeMlModel(): ArmyTypeMlModel | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!isArmyTypeMlModel(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveArmyTypeMlModel(model: ArmyTypeMlModel) {
  if (typeof window === "undefined") {
    return;
  }

  const next = {
    ...model,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(next));
}

export function clearArmyTypeMlModel() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(MODEL_STORAGE_KEY);
}

export function getArmyTypeMlSummary(): ArmyTypeMlSummary {
  const model = loadArmyTypeMlModel();

  return {
    hasModel: Boolean(model),
    createdAt: model?.createdAt,
    updatedAt: model?.updatedAt,
    trainingExamples: model?.trainingExamples ?? 0,
    trainingAccuracy: model?.trainingAccuracy,
    featureCount: model?.featureNames.length ?? 0,
  };
}

export function extractArmyTypeFeatures(row: EnemyAnalysisRow): {
  vector: number[];
  featureNames: string[];
} {
  const vector: number[] = [];
  const featureNames: string[] = [];

  for (const slot of SLOT_ORDER) {
    const slotData = row.slots[slot];

    for (const color of COLORS) {
      featureNames.push(`${slot}.artifactColor.${color}`);
      vector.push(slotData.color === color ? 1 : 0);
    }

    featureNames.push(`${slot}.artifactLevelNorm`);
    vector.push(normalizeLevel(slotData.level));

    for (const color of COLORS) {
      featureNames.push(`${slot}.runeColor.${color}`);
      vector.push(slotData.runeColor === color ? 1 : 0);
    }
  }

  for (const label of LABELS) {
    featureNames.push(`armyScore.${label}`);
    vector.push((row.armyScores[label] ?? 0) / 300);
  }

  for (const level of CONFIDENCE_LEVELS) {
    featureNames.push(`confidence.${level}`);
    vector.push(row.confidence === level ? 1 : 0);
  }

  featureNames.push("individualMightLogNorm");
  vector.push(normalizeMight(row.individualMight));

  return { vector, featureNames };
}

function buildTrainingExamples(entries: EnemyAnalysisFeedbackEntry[]): ArmyTypeTrainingExample[] {
  return entries
    .map((entry) => {
      const effective = applyEnemyAnalysisOverride(entry.auto, entry.manual);
      return {
        features: extractArmyTypeFeatures(effective).vector,
        label: effective.armyType,
      };
    })
    .filter((example) => LABELS.includes(example.label));
}

function predictLabel(
  features: number[],
  weights: Record<ArmyType, number[]>,
  bias: Record<ArmyType, number>
): ArmyType {
  let bestLabel: ArmyType = LABELS[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const label of LABELS) {
    const score = dot(weights[label], features) + bias[label];
    if (score > bestScore) {
      bestScore = score;
      bestLabel = label;
    }
  }

  return bestLabel;
}

function computeTrainingAccuracy(
  examples: ArmyTypeTrainingExample[],
  weights: Record<ArmyType, number[]>,
  bias: Record<ArmyType, number>
) {
  if (!examples.length) {
    return 0;
  }

  let correct = 0;
  for (const example of examples) {
    if (predictLabel(example.features, weights, bias) === example.label) {
      correct += 1;
    }
  }

  return correct / examples.length;
}

function softmax(scores: Record<ArmyType, number>): Record<ArmyType, number> {
  const values = LABELS.map((label) => scores[label]);
  const max = Math.max(...values);
  const exps = LABELS.map((label) => Math.exp(scores[label] - max));
  const sum = exps.reduce((accumulator, value) => accumulator + value, 0) || 1;

  return Object.fromEntries(
    LABELS.map((label, index) => [label, exps[index] / sum])
  ) as Record<ArmyType, number>;
}

function dot(left: number[], right: number[]) {
  let total = 0;
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    total += left[index] * right[index];
  }
  return total;
}

function normalizeLevel(value: number) {
  return Math.max(0, Math.min(1, value / 60));
}

function normalizeMight(value: number) {
  if (!value || value <= 0) {
    return 0;
  }

  const min = Math.log10(1_000_000);
  const max = Math.log10(300_000_000);
  const current = Math.log10(value);
  return Math.max(0, Math.min(1, (current - min) / (max - min)));
}

function isArmyTypeMlModel(value: unknown): value is ArmyTypeMlModel {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ArmyTypeMlModel>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.featureNames) &&
    Array.isArray(candidate.labels) &&
    candidate.weights !== undefined &&
    candidate.bias !== undefined
  );
}
