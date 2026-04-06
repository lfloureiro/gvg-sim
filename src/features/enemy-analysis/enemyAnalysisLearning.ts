import type {
  AnalysisMode,
  ArtifactColor,
  ArtifactSlotKey,
  ArmyType,
  EnemyAnalysisRow,
  EnemyAnalysisRowOverride,
} from "./analysis";

const LEARNING_STORAGE_KEY = "phoenix-veritas-enemy-analysis-learning-v1";
const SLOT_ORDER: ArtifactSlotKey[] = [
  "sword",
  "shield",
  "boots",
  "chest",
  "helmet",
  "pants",
];

export type EnemyAnalysisFeedbackEntry = {
  version: 1;
  createdAt: string;
  folderLabel: string;
  analysisMode: AnalysisMode;
  fileName: string;
  auto: EnemyAnalysisRow;
  manual: EnemyAnalysisRowOverride;
  final: {
    chiefName: string;
    individualMight: number;
    armyType: ArmyType;
    ignored: boolean;
  };
};

export type EnemyAnalysisLearningSummary = {
  totalEntries: number;
  learnedNamePatterns: number;
  learnedArmyPatterns: number;
};

export function buildEnemyAnalysisFeedbackEntries(
  rows: EnemyAnalysisRow[],
  overrides: Record<string, EnemyAnalysisRowOverride>,
  folderLabel: string,
  analysisMode: AnalysisMode
): EnemyAnalysisFeedbackEntry[] {
  return rows
    .map((row) => {
      const override = cleanupLearningOverride(overrides[row.fileName]);

      if (!override) {
        return null;
      }

      return {
        version: 1 as const,
        createdAt: new Date().toISOString(),
        folderLabel,
        analysisMode,
        fileName: row.fileName,
        auto: row,
        manual: override,
        final: {
          chiefName: override.chiefName ?? row.chiefName,
          individualMight: override.individualMight ?? row.individualMight,
          armyType: override.armyType ?? row.armyType,
          ignored: override.ignored ?? false,
        },
      };
    })
    .filter((entry): entry is EnemyAnalysisFeedbackEntry => Boolean(entry));
}

export function exportFeedbackEntriesAsJson(entries: EnemyAnalysisFeedbackEntry[]) {
  return JSON.stringify(entries, null, 2);
}

export function exportFeedbackEntriesAsJsonl(entries: EnemyAnalysisFeedbackEntry[]) {
  return entries.map((entry) => JSON.stringify(entry)).join("\n");
}

export function downloadTextFile(
  fileName: string,
  content: string,
  mimeType = "text/plain;charset=utf-8"
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function appendEnemyAnalysisFeedbackToLocalMemory(
  entries: EnemyAnalysisFeedbackEntry[]
) {
  if (typeof window === "undefined" || !entries.length) {
    return 0;
  }

  const current = readEnemyAnalysisFeedbackMemory();
  const merged = [...current, ...entries];
  window.localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(merged));
  return merged.length;
}

export function buildLearnedOverrideSuggestions(
  rows: EnemyAnalysisRow[]
): Record<string, EnemyAnalysisRowOverride> {
  const memory = readEnemyAnalysisFeedbackMemory();

  if (!memory.length) {
    return {};
  }

  const nameMap = buildStableNameMap(memory);
  const armyMap = buildStableArmyMap(memory);
  const suggestions: Record<string, EnemyAnalysisRowOverride> = {};

  for (const row of rows) {
    const next: EnemyAnalysisRowOverride = {};

    const learnedName = nameMap.get(normalizeNameKey(row.chiefName));
    if (
      learnedName &&
      learnedName !== row.chiefName &&
      row.chiefName !== "Unknown"
    ) {
      next.chiefName = learnedName;
    }

    const learnedArmyType = armyMap.get(buildArmyFingerprint(row));
    if (learnedArmyType && learnedArmyType !== row.armyType) {
      next.armyType = learnedArmyType;
    }

    if (Object.keys(next).length) {
      suggestions[row.fileName] = next;
    }
  }

  return suggestions;
}

export function getEnemyAnalysisLearningSummary(): EnemyAnalysisLearningSummary {
  const memory = readEnemyAnalysisFeedbackMemory();

  return {
    totalEntries: memory.length,
    learnedNamePatterns: buildStableNameMap(memory).size,
    learnedArmyPatterns: buildStableArmyMap(memory).size,
  };
}



export function clearEnemyAnalysisFeedbackMemory() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LEARNING_STORAGE_KEY);
}
export function readEnemyAnalysisFeedbackMemory(): EnemyAnalysisFeedbackEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LEARNING_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isFeedbackEntry);
  } catch {
    return [];
  }
}

function isFeedbackEntry(value: unknown): value is EnemyAnalysisFeedbackEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<EnemyAnalysisFeedbackEntry>;
  return (
    candidate.version === 1 &&
    typeof candidate.fileName === "string" &&
    typeof candidate.folderLabel === "string" &&
    typeof candidate.analysisMode === "string" &&
    candidate.auto !== undefined &&
    candidate.manual !== undefined &&
    candidate.final !== undefined
  );
}

function cleanupLearningOverride(
  override?: EnemyAnalysisRowOverride
): EnemyAnalysisRowOverride | null {
  if (!override) {
    return null;
  }

  const next: EnemyAnalysisRowOverride = {};

  if (override.chiefName !== undefined) {
    next.chiefName = override.chiefName;
  }

  if (override.individualMight !== undefined) {
    next.individualMight = override.individualMight;
  }

  if (override.heroMight !== undefined) {
    next.heroMight = override.heroMight;
  }

  if (override.armyType !== undefined) {
    next.armyType = override.armyType;
  }

  if (override.ignored !== undefined) {
    next.ignored = override.ignored;
  }

  if ((override.notes?.trim() ?? "") !== "") {
    next.notes = override.notes?.trim();
  }

  if (override.slots) {
    const cleanedSlots: Partial<Record<ArtifactSlotKey, {
      color?: ArtifactColor;
      level?: number;
      runeColor?: ArtifactColor;
    }>> = {};

    for (const slot of SLOT_ORDER) {
      const current = override.slots[slot];
      if (!current) {
        continue;
      }

      const nextSlot = {
        color: current.color,
        level: current.level,
        runeColor: current.runeColor,
      };

      if (
        nextSlot.color !== undefined ||
        nextSlot.level !== undefined ||
        nextSlot.runeColor !== undefined
      ) {
        cleanedSlots[slot] = nextSlot;
      }
    }

    if (Object.keys(cleanedSlots).length) {
      next.slots = cleanedSlots;
    }
  }

  return Object.keys(next).length ? next : null;
}

function normalizeNameKey(value: string) {
  return value.trim().toLowerCase();
}

function buildStableNameMap(entries: EnemyAnalysisFeedbackEntry[]) {
  const counts = new Map<string, Map<string, number>>();

  for (const entry of entries) {
    const autoName = entry.auto.chiefName;
    const manualName = entry.manual.chiefName;

    if (!manualName || !autoName || autoName === manualName) {
      continue;
    }

    const autoKey = normalizeNameKey(autoName);
    const manualMap = counts.get(autoKey) ?? new Map<string, number>();
    manualMap.set(manualName, (manualMap.get(manualName) ?? 0) + 1);
    counts.set(autoKey, manualMap);
  }

  const stable = new Map<string, string>();

  for (const [autoKey, manualMap] of counts.entries()) {
    const sorted = [...manualMap.entries()].sort((a, b) => b[1] - a[1]);
    const [bestName, bestCount] = sorted[0] ?? [];
    const total = sorted.reduce((sum, [, count]) => sum + count, 0);

    if (bestName && bestCount >= 2 && bestCount / total >= 0.8) {
      stable.set(autoKey, bestName);
    }
  }

  return stable;
}

function buildArmyFingerprint(row: EnemyAnalysisRow) {
  return SLOT_ORDER.map((slot) => {
    const entry = row.slots[slot];
    return `${slot}:${entry.color}:${entry.level}:${entry.runeColor}`;
  }).join("|");
}

function buildStableArmyMap(entries: EnemyAnalysisFeedbackEntry[]) {
  const counts = new Map<string, Map<ArmyType, number>>();

  for (const entry of entries) {
    const manualArmyType = entry.manual.armyType;
    if (!manualArmyType || manualArmyType === entry.auto.armyType) {
      continue;
    }

    const fingerprint = buildArmyFingerprint(entry.auto);
    const armyMap = counts.get(fingerprint) ?? new Map<ArmyType, number>();
    armyMap.set(manualArmyType, (armyMap.get(manualArmyType) ?? 0) + 1);
    counts.set(fingerprint, armyMap);
  }

  const stable = new Map<string, ArmyType>();

  for (const [fingerprint, armyMap] of counts.entries()) {
    const sorted = [...armyMap.entries()].sort((a, b) => b[1] - a[1]);
    const [bestArmy, bestCount] = sorted[0] ?? [];
    const total = sorted.reduce((sum, [, count]) => sum + count, 0);

    if (bestArmy && bestCount >= 2 && bestCount / total >= 0.8) {
      stable.set(fingerprint, bestArmy);
    }
  }

  return stable;
}
