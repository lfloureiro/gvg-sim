import { PHOENIX_MOTTO, PHOENIX_TITLE } from "../../version";
import { useMemo, useRef, useState, type CSSProperties, type ChangeEvent } from "react";
import { getTranslation } from "../../i18n";
import type { Language } from "../../types";
import {
  analyzeEnemyImages,
  countByArmyType,
  formatNumber,
  getPrimarySlotSummary,
  groupRowsByArmy,
  type AnalysisMode,
  type AnalysisProgress,
  type ArmyType,
  type ArtifactColor,
  type ArtifactSlotKey,
  type ArtifactSlotOverride,
  type Confidence,
  type EnemyAnalysisRow,
  type EnemyAnalysisRowOverride,
  type SortField,
} from "./analysis";
import {
  appendEnemyAnalysisFeedbackToLocalMemory,
  buildEnemyAnalysisFeedbackEntries,
  buildLearnedOverrideSuggestions,
  clearEnemyAnalysisFeedbackMemory,
  downloadTextFile,
  exportFeedbackEntriesAsJsonl,
  getEnemyAnalysisLearningSummary,
} from "./enemyAnalysisLearning";
import {
  buildArmyTypeMlOverrideSuggestions,
  clearArmyTypeMlModel,
  getArmyTypeMlSummary,
  trainAndSaveArmyTypeModelFromLearningMemory,
} from "./enemyAnalysisLightMl";
import {
  buildMightMlOverrideSuggestions,
  clearMightMlModel,
  getMightMlSummary,
  trainAndSaveMightMlModelFromLearningMemory,
} from "./enemyAnalysisMightMl";
import EnemyTribeDebugScreen from "./EnemyTribeDebugScreen";

type EnemyTribeAnalysisScreenProps = {
  onBack: () => void;
  language: Language;
};

type DirectoryFile = File & {
  webkitRelativePath?: string;
};

type PickedFile = {
  file: File;
};

type BrowserWindowWithDirectoryPicker = Window & {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
};

const DISCORD_WEBHOOKS = {
  tribalShowdown:
    "https://discord.com/api/webhooks/1486791065095901195/NAOqjAO5sSwWo5nKu8xuHegyb3eXfIt4pC4zXPX_fhD1xkj9TqnIZLKxR1sUYPaTSTK9",
  jotunheim:
    "https://discord.com/api/webhooks/1488907707657486451/CdZDFyKYhNpMDn8Ci-WlkLP5KZzuOJeyT80BLFGxT4_5dXbDGiD_wzuWOf7qQuUSfEjF",
} as const;

const SLOT_ORDER: ArtifactSlotKey[] = [
  "sword",
  "shield",
  "boots",
  "chest",
  "helmet",
  "pants",
];

const SLOT_LABELS: Record<ArtifactSlotKey, string> = {
  sword: "Sword",
  shield: "Shield",
  boots: "Boots",
  chest: "Chest",
  helmet: "Helmet",
  pants: "Pants",
};

const ARTIFACT_COLORS: ArtifactColor[] = [
  "grey",
  "green",
  "blue",
  "purple",
  "gold",
  "red",
];

const DEFAULT_ANALYSIS_MODE: AnalysisMode = "fast";

type DiscordDestino = keyof typeof DISCORD_WEBHOOKS;
type OverrideMap = Record<string, EnemyAnalysisRowOverride>;
type SlotOverrideField = "color" | "level" | "runeColor";

type CorrectionFilePayload = {
  version: 1;
  folderLabel: string;
  overrides: OverrideMap;
};

type EffectiveEnemyAnalysisRow = EnemyAnalysisRow & {
  ignored: boolean;
  notes: string;
  hasManualChanges: boolean;
  sourceRow: EnemyAnalysisRow;
};

export default function EnemyTribeAnalysisScreen({
  onBack,
  language,
}: EnemyTribeAnalysisScreenProps) {
  const t = getTranslation(language);

  const sortField: SortField = "individualMight";
  const [rows, setRows] = useState<EnemyAnalysisRow[]>([]);
  const [manualOverrides, setManualOverrides] = useState<OverrideMap>({});
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [learningRefreshKey, setLearningRefreshKey] = useState(0);
  const [selectedFolderLabel, setSelectedFolderLabel] = useState("");
  const [fallbackPickerKey] = useState(0);
  const [correctionsPickerKey, setCorrectionsPickerKey] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fallbackFileRef = useRef<HTMLInputElement | null>(null);
  const correctionsFileRef = useRef<HTMLInputElement | null>(null);

  const supportsDirectoryPicker =
    typeof window !== "undefined" &&
    typeof (window as BrowserWindowWithDirectoryPicker).showDirectoryPicker ===
      "function";

  const effectiveRows = useMemo<EffectiveEnemyAnalysisRow[]>(
    () =>
      rows.map((row) =>
        applyOverrideLocally(row, manualOverrides[row.fileName])
      ),
    [rows, manualOverrides]
  );

  const activeRows = useMemo(
    () => effectiveRows.filter((row) => !row.ignored),
    [effectiveRows]
  );

  const groupedRows = useMemo(
    () => groupRowsByArmy(activeRows, sortField),
    [activeRows, sortField]
  );

  const counts = useMemo(() => countByArmyType(activeRows), [activeRows]);

  const reviewRows = useMemo(
    () =>
      [...effectiveRows].sort((left, right) => {
        if (left.ignored !== right.ignored) {
          return left.ignored ? 1 : -1;
        }

        const mightGap =
          getSortValue(right, sortField) - getSortValue(left, sortField);
        if (mightGap !== 0) {
          return mightGap;
        }

        return left.fileName.localeCompare(right.fileName);
      }),
    [effectiveRows, sortField]
  );

  const learningSummary = useMemo(
    () => getEnemyAnalysisLearningSummary(),
    [learningRefreshKey]
  );
  const armyMlSummary = useMemo(
    () => getArmyTypeMlSummary(),
    [learningRefreshKey]
  );
  const mightMlSummary = useMemo(
    () => getMightMlSummary(),
    [learningRefreshKey]
  );

  async function runAnalysis(files: PickedFile[], folderLabel: string) {
    if (!files.length) {
      return;
    }

    setError("");
    setStatusMessage("");
    setRows([]);
    setManualOverrides({});
    setSelectedFolderLabel(folderLabel);

    try {
      const orderedFiles = [...files].sort((left, right) =>
        left.file.name.localeCompare(right.file.name)
      );

      const results = await analyzeEnemyImages(
        orderedFiles.map((entry) => entry.file),
        (nextProgress) => {
          setProgress(nextProgress);
        }
      );

      setRows(results);
    } catch {
      setError(t.enemyAnalysis.openFolderError);
    } finally {
      setProgress(null);
    }
  }

  async function handleChooseFolder() {
    if (!supportsDirectoryPicker) {
      fallbackFileRef.current?.click();
      return;
    }

    setError("");

    try {
      const directoryHandle = await (
        window as BrowserWindowWithDirectoryPicker
      ).showDirectoryPicker?.();

      if (!directoryHandle) {
        return;
      }

      const files = await readImageFilesFromDirectory(directoryHandle);
      await runAnalysis(files, directoryHandle.name);
    } catch {
      setError(t.enemyAnalysis.openFolderError);
    }
  }

  async function handleFallbackFolderChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const rawFiles = Array.from(event.target.files ?? []) as DirectoryFile[];

    const files = rawFiles
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({ file }));

    if (!files.length) {
      return;
    }

    const folderName =
      rawFiles[0]?.webkitRelativePath?.split("/")[0] ??
      `${files.length} images`;

    await runAnalysis(files, folderName);
    event.target.value = "";
  }

  function updateRowOverride(
    fileName: string,
    updater: (current: EnemyAnalysisRowOverride) => EnemyAnalysisRowOverride
  ) {
    setManualOverrides((current) => {
      const next = { ...current };
      const updated = cleanupOverride(updater(next[fileName] ?? {}));

      if (isEmptyOverride(updated)) {
        delete next[fileName];
      } else {
        next[fileName] = updated;
      }

      return next;
    });
  }

  function resetRowOverride(fileName: string) {
    setManualOverrides((current) => {
      if (!current[fileName]) {
        return current;
      }

      const next = { ...current };
      delete next[fileName];
      return next;
    });
  }

  function resetAllOverrides() {
    setManualOverrides({});
    setStatusMessage("All manual corrections were reset.");
  }

  function updateSlotOverride(
    fileName: string,
    slot: ArtifactSlotKey,
    field: SlotOverrideField,
    value: ArtifactColor | number | undefined
  ) {
    updateRowOverride(fileName, (current) => {
      const currentSlot = current.slots?.[slot] ?? {};
      const nextSlot = {
        ...currentSlot,
        [field]: value,
      };

      return {
        ...current,
        slots: {
          ...(current.slots ?? {}),
          [slot]: nextSlot,
        },
      };
    });
  }

  function exportCorrections() {
    const payload: CorrectionFilePayload = {
      version: 1,
      folderLabel: selectedFolderLabel || "enemy-analysis",
      overrides: manualOverrides,
    };

    downloadTextFile(
      `${payload.folderLabel || "enemy-analysis"}-corrections.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8"
    );
  }

  async function handleCorrectionsFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as Partial<CorrectionFilePayload>;
      const importedOverrides = sanitizeOverrideMap(parsed.overrides);
      setManualOverrides(importedOverrides);
      setStatusMessage("Corrections loaded.");
    } catch {
      setStatusMessage("Could not load the corrections file.");
    } finally {
      setCorrectionsPickerKey((value) => value + 1);
    }
  }

  function mergeRowOverrides(
    current: EnemyAnalysisRowOverride,
    incoming: EnemyAnalysisRowOverride
  ): EnemyAnalysisRowOverride {
    const merged: EnemyAnalysisRowOverride = {
      ...current,
      ...incoming,
    };

    if (current.slots || incoming.slots) {
      merged.slots = {
        ...(current.slots ?? {}),
        ...(incoming.slots ?? {}),
      };
    }

    if (current.notes && incoming.notes && current.notes !== incoming.notes) {
      merged.notes = `${current.notes} | ${incoming.notes}`;
    }

    return cleanupOverride(merged);
  }

  function applySuggestedOverrides(suggestions: OverrideMap) {
    setManualOverrides((current) => {
      const next: OverrideMap = { ...current };

      for (const [fileName, suggestion] of Object.entries(suggestions)) {
        next[fileName] = mergeRowOverrides(next[fileName] ?? {}, suggestion);
      }

      return sanitizeOverrideMap(next);
    });
  }

  function handleApplyLearnedAndMlSuggestions() {
    const learnedSuggestions = buildLearnedOverrideSuggestions(rows);
    const armyMlSuggestions = buildArmyTypeMlOverrideSuggestions(effectiveRows, {
      confidenceThreshold: 0.82,
      marginThreshold: 0.14,
    });
    const mightMlSuggestions = buildMightMlOverrideSuggestions(effectiveRows, {
      confidenceThreshold: 0.72,
      marginThreshold: 0.12,
    });

    const combined: OverrideMap = {};

    for (const source of [learnedSuggestions, armyMlSuggestions, mightMlSuggestions]) {
      for (const [fileName, override] of Object.entries(source)) {
        combined[fileName] = mergeRowOverrides(combined[fileName] ?? {}, override);
      }
    }

    if (!Object.keys(combined).length) {
      setStatusMessage("No learned or ML suggestions matched this batch.");
      return;
    }

    applySuggestedOverrides(combined);
    setStatusMessage(
      `Applied ${Object.keys(combined).length} learned / ML suggestion(s).`
    );
  }

  function handleSaveCorrectionsToMemoryAndTrainMl() {
    const entries = buildEnemyAnalysisFeedbackEntries(
      rows,
      manualOverrides,
      selectedFolderLabel || "enemy-analysis",
      DEFAULT_ANALYSIS_MODE
    );

    if (!entries.length) {
      setStatusMessage("There are no manual corrections to save into learning memory.");
      return;
    }

    const total = appendEnemyAnalysisFeedbackToLocalMemory(entries);
    const armyModel = trainAndSaveArmyTypeModelFromLearningMemory();
    const mightModel = trainAndSaveMightMlModelFromLearningMemory();

    setLearningRefreshKey((value) => value + 1);

    const parts = [
      `Saved ${entries.length} correction example(s) to learning memory.`,
      `Total memory entries: ${total}.`,
    ];

    if (armyModel) {
      parts.push(
        `Army ML: ${armyModel.trainingExamples} examples, ${Math.round(
          armyModel.trainingAccuracy * 100
        )}% accuracy.`
      );
    }

    if (mightModel) {
      parts.push(
        `Might ML: ${mightModel.coveredExamples}/${mightModel.trainingExamples} covered, ${Math.round(
          mightModel.trainingAccuracy * 100
        )}% accuracy.`
      );
    }

    setStatusMessage(parts.join(" "));
  }

  function handleExportMlFeedback() {
    const entries = buildEnemyAnalysisFeedbackEntries(
      rows,
      manualOverrides,
      selectedFolderLabel || "enemy-analysis",
      DEFAULT_ANALYSIS_MODE
    );

    if (!entries.length) {
      setStatusMessage("There are no manual corrections to export as ML feedback.");
      return;
    }

    downloadTextFile(
      `${selectedFolderLabel || "enemy-analysis"}-ml-feedback.jsonl`,
      exportFeedbackEntriesAsJsonl(entries),
      "application/x-ndjson;charset=utf-8"
    );
    setStatusMessage(`Exported ${entries.length} ML feedback example(s).`);
  }

  function handleClearMemoryAndMl() {
    clearEnemyAnalysisFeedbackMemory();
    clearArmyTypeMlModel();
    clearMightMlModel();
    setLearningRefreshKey((value) => value + 1);
    setStatusMessage("Learning memory and ML models cleared.");
  }

  return (
    <div className="stack">
      <div className="app-top-actions">
        <button className="secondary-button" onClick={onBack}>
          ← {t.common.back}
        </button>

        <button
          className="secondary-button"
          onClick={() => setShowAdvanced((value) => !value)}
        >
          {showAdvanced ? "Hide debug panel" : "Show debug panel"}
        </button>

        {rows.length ? (
          <>
            <button
              className="primary-button"
              onClick={() =>
                copyEnemyAnalysisReport(
                  activeRows,
                  sortField,
                  selectedFolderLabel || "enemy-analysis",
                  t
                )
              }
            >
              Copy report
            </button>

            <button
              className="primary-button"
              onClick={() =>
                sendEnemyAnalysisReportToDiscord(
                  activeRows,
                  sortField,
                  selectedFolderLabel || "enemy-analysis",
                  t,
                  "tribalShowdown"
                )
              }
            >
              Send to Tribal Showdown
            </button>

            <button
              className="primary-button"
              onClick={() =>
                sendEnemyAnalysisReportToDiscord(
                  activeRows,
                  sortField,
                  selectedFolderLabel || "enemy-analysis",
                  t,
                  "jotunheim"
                )
              }
            >
              Send to Jotunheim
            </button>
          </>
        ) : null}
      </div>

      <section className="phoenix-banner mode-banner phoenix-banner-with-watermark">
        <div className="phoenix-banner-inner phoenix-banner-grid">
          <div>
            <p className="phoenix-kicker">{t.home.enemyEyebrow}</p>
            <h1 className="phoenix-title">{t.enemyAnalysis.title}</h1>
            <p className="phoenix-subtitle">{t.enemyAnalysis.subtitle}</p>
          </div>

          <div className="banner-watermark-block" aria-hidden="true">
            <div className="banner-watermark-title">{PHOENIX_TITLE}</div>
            <div className="banner-watermark-motto">
              {PHOENIX_MOTTO}
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">{t.enemyAnalysis.inputEyebrow}</p>
            <h2>{t.enemyAnalysis.inputTitle}</h2>
            <p className="muted">{t.enemyAnalysis.inputSubtitle}</p>
          </div>
        </div>

        <div className="analysis-controls">
          <div className="field">
            <span>{t.enemyAnalysis.screenshotFolder}</span>

            <button
              className="folder-picker-button"
              type="button"
              onClick={handleChooseFolder}
            >
              <strong>📁 {t.enemyAnalysis.chooseFolder}</strong>

              <small>{t.enemyAnalysis.chooseFolderHelp}</small>

              {selectedFolderLabel ? (
                <span className="folder-picker-selected">
                  {t.enemyAnalysis.selectedFolder}: {selectedFolderLabel}
                </span>
              ) : (
                <span className="folder-picker-selected">
                  {t.enemyAnalysis.noFolderSelected}
                </span>
              )}
            </button>

            {!supportsDirectoryPicker ? (
              <input
                key={fallbackPickerKey}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFallbackFolderChange}
                ref={(input) => {
                  fallbackFileRef.current = input;
                  if (input) {
                    input.setAttribute("webkitdirectory", "");
                    input.setAttribute("directory", "");
                  }
                }}
                style={{ display: "none" }}
                tabIndex={-1}
                aria-hidden="true"
              />
            ) : null}
          </div>
        </div>

        <div className="note-box compact-note-box">
          {t.enemyAnalysis.artifactNote}
        </div>

        {progress ? (
          <div className="note-box">
            {t.enemyAnalysis.analyzing} {progress.current}/{progress.total}:{" "}
            <strong>{progress.fileName}</strong>
            <br />
            {t.enemyAnalysis.step}: {progress.step}
          </div>
        ) : null}

        {error ? <div className="error-box">{error}</div> : null}
        {statusMessage && !showAdvanced ? (
          <div className="note-box">{statusMessage}</div>
        ) : null}
      </section>

      {showAdvanced && !rows.length ? (
        <>
          <section className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Debug</p>
                <h2>Debug panel</h2>
                <p className="muted">
                  Use this panel to analyse a single screenshot, inspect the crops
                  and verify what the OCR is reading before scanning a full folder.
                </p>
              </div>
            </div>
          </section>

          <EnemyTribeDebugScreen language={language} />
        </>
      ) : null}

      {rows.length ? (
        <>
          <section className="top-grid">
            <div className="info-box">
              <span className="info-label">
                {t.enemyAnalysis.screenshotsAnalyzed}
              </span>
              <strong>{rows.length}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">Active after review</span>
              <strong>{activeRows.length}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">Ignored</span>
              <strong>{rows.length - activeRows.length}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">Manual corrections</span>
              <strong>{Object.keys(manualOverrides).length}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">{t.enemyAnalysis.archers}</span>
              <strong>{counts.archer}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">{t.enemyAnalysis.berserkers}</span>
              <strong>{counts.berserker}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">{t.enemyAnalysis.cavalry}</span>
              <strong>{counts.cavalry}</strong>
            </div>
          </section>

          {groupedRows.map((group) => {
            const localizedArmyLabel = getArmyLabel(group.armyType, t);

            return (
              <section className="card" key={group.armyType}>
                <div className="card-header">
                  <div>
                    <p className="eyebrow">{t.enemyAnalysis.results}</p>
                    <h2>{localizedArmyLabel}</h2>
                    <p className="muted">
                      {group.rows.length
                        ? `${group.rows.length} ${t.enemyAnalysis.chiefsClassified} ${localizedArmyLabel}.`
                        : `${t.enemyAnalysis.noChiefsClassified} ${localizedArmyLabel}.`}
                    </p>
                  </div>
                </div>

                {group.rows.length ? (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{t.enemyAnalysis.name}</th>
                          <th>{t.enemyAnalysis.individualMight}</th>
                          <th>{t.enemyAnalysis.primaryBuild}</th>
                          <th>{t.enemyAnalysis.confidence}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row) => (
                          <tr key={`${group.armyType}-${row.fileName}`}>
                            <td className="tribe-name-cell">{row.chiefName}</td>
                            <td>{formatNumber(row.individualMight)}</td>
                            <td>{getPrimarySlotSummary(row)}</td>
                            <td>
                              <span
                                className={`confidence-pill confidence-${row.confidence}`}
                              >
                                {getConfidenceLabel(row.confidence, t)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>
            );
          })}

          {showAdvanced ? (
            <>
              <section className="card">
                <div className="card-header">
                  <div>
                    <p className="eyebrow">Advanced</p>
                    <h2>Debug / review / ML</h2>
                    <p className="muted">
                      Manual correction, learning memory and light ML stay here,
                      away from the normal day-to-day flow.
                    </p>
                  </div>
                </div>

                <div className="top-grid">
                  <div className="info-box">
                    <span className="info-label">Learning memory entries</span>
                    <strong>{learningSummary.totalEntries}</strong>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Learned name patterns</span>
                    <strong>{learningSummary.learnedNamePatterns}</strong>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Learned army patterns</span>
                    <strong>{learningSummary.learnedArmyPatterns}</strong>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Army ML examples</span>
                    <strong>{armyMlSummary.trainingExamples}</strong>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Army ML accuracy</span>
                    <strong>
                      {armyMlSummary.trainingAccuracy !== undefined
                        ? `${Math.round(armyMlSummary.trainingAccuracy * 100)}%`
                        : "—"}
                    </strong>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Might ML examples</span>
                    <strong>{mightMlSummary.trainingExamples}</strong>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Might ML accuracy</span>
                    <strong>
                      {mightMlSummary.trainingAccuracy !== undefined
                        ? `${Math.round(mightMlSummary.trainingAccuracy * 100)}%`
                        : "—"}
                    </strong>
                  </div>
                </div>

                <div className="app-top-actions" style={{ marginTop: 16, flexWrap: "wrap" }}>
                  <button
                    className="secondary-button"
                    onClick={handleApplyLearnedAndMlSuggestions}
                  >
                    Apply learned + ML suggestions
                  </button>

                  <button
                    className="secondary-button"
                    onClick={handleSaveCorrectionsToMemoryAndTrainMl}
                  >
                    Save corrections to memory + train ML
                  </button>

                  <button className="secondary-button" onClick={exportCorrections}>
                    Export corrections
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() => correctionsFileRef.current?.click()}
                  >
                    Import corrections
                  </button>

                  <button
                    className="secondary-button"
                    onClick={handleExportMlFeedback}
                  >
                    Export ML dataset
                  </button>

                  <button
                    className="secondary-button"
                    onClick={handleClearMemoryAndMl}
                  >
                    Clear memory + ML
                  </button>

                  <button
                    className="secondary-button"
                    onClick={resetAllOverrides}
                  >
                    Reset all corrections
                  </button>
                </div>

                <input
                  key={correctionsPickerKey}
                  ref={correctionsFileRef}
                  type="file"
                  accept="application/json"
                  onChange={handleCorrectionsFileChange}
                  style={{ display: "none" }}
                />

                {statusMessage ? (
                  <div className="note-box" style={{ marginTop: 16 }}>
                    {statusMessage}
                  </div>
                ) : null}
              </section>

              <EnemyTribeDebugScreen language={language} />

              <section className="card">
                <div className="card-header">
                  <div>
                    <p className="eyebrow">Review</p>
                    <h2>Manual correction before export</h2>
                    <p className="muted">
                      OCR stays as the automatic baseline, but the final report
                      and Discord export use the corrected values.
                    </p>
                  </div>
                </div>

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Use</th>
                        <th>Screenshot</th>
                        <th>Warnings</th>
                        <th>Name</th>
                        <th>Individual Might</th>
                        <th>Army Type</th>
                        <th>Primary Build</th>
                        <th>Confidence</th>
                        <th>Notes</th>
                        <th>Reset</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewRows.map((row) => {
                        const override = manualOverrides[row.fileName] ?? {};
                        const warnings = getRowWarnings(row.sourceRow);

                        return (
                          <tr
                            key={row.fileName}
                            style={row.ignored ? { opacity: 0.55 } : undefined}
                          >
                            <td>
                              <label style={{ display: "grid", gap: 6 }}>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>Include</span>
                                <input
                                  type="checkbox"
                                  checked={!row.ignored}
                                  onChange={(event) =>
                                    updateRowOverride(row.fileName, (current) => ({
                                      ...current,
                                      ignored: event.target.checked ? undefined : true,
                                    }))
                                  }
                                />
                              </label>
                            </td>

                            <td>
                              <div style={{ fontWeight: 700 }}>{row.fileName}</div>
                              <div style={smallMutedStyle}>
                                {row.hasManualChanges ? "Manual corrections applied" : "Auto only"}
                              </div>
                            </td>

                            <td>
                              {warnings.length ? (
                                <div style={{ display: "grid", gap: 6 }}>
                                  {warnings.map((warning) => (
                                    <span key={warning} style={warningBadgeStyle}>
                                      {warning}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={smallMutedStyle}>No obvious warnings</span>
                              )}
                            </td>

                            <td>
                              <input
                                type="text"
                                value={override.chiefName ?? row.chiefName}
                                onChange={(event) => {
                                  const value = event.target.value.trim();
                                  updateRowOverride(row.fileName, (current) => ({
                                    ...current,
                                    chiefName:
                                      value === "" || value === row.sourceRow.chiefName
                                        ? undefined
                                        : value,
                                  }));
                                }}
                                style={textInputStyle}
                              />
                              <div style={smallMutedStyle}>Auto: {row.sourceRow.chiefName}</div>
                            </td>

                            <td>
                              <input
                                type="number"
                                min={0}
                                step={1}
                                value={override.individualMight ?? row.individualMight}
                                onChange={(event) => {
                                  const rawValue = event.target.value;
                                  updateRowOverride(row.fileName, (current) => ({
                                    ...current,
                                    individualMight:
                                      rawValue === "" ||
                                      Number(rawValue) === row.sourceRow.individualMight
                                        ? undefined
                                        : Math.max(0, Math.floor(Number(rawValue))),
                                  }));
                                }}
                                style={textInputStyle}
                              />
                              <div style={smallMutedStyle}>
                                Auto: {formatNumber(row.sourceRow.individualMight)}
                              </div>
                            </td>

                            <td>
                              <select
                                value={override.armyType ?? ""}
                                onChange={(event) => {
                                  const value = event.target.value as ArmyType | "";
                                  updateRowOverride(row.fileName, (current) => ({
                                    ...current,
                                    armyType: value || undefined,
                                  }));
                                }}
                                style={textInputStyle}
                              >
                                <option value="">
                                  Auto ({capitalize(row.sourceRow.armyType)})
                                </option>
                                <option value="archer">Archer</option>
                                <option value="berserker">Berserker</option>
                                <option value="cavalry">Cavalry</option>
                              </select>
                              <div style={smallMutedStyle}>
                                Final: {capitalize(row.armyType)}
                              </div>
                            </td>

                            <td>
                              <div>{getPrimarySlotSummary(row)}</div>

                              <details style={{ marginTop: 8 }}>
                                <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                                  Edit artifacts
                                </summary>

                                <div style={slotGridStyle}>
                                  {SLOT_ORDER.map((slot) => {
                                    const sourceSlot = row.sourceRow.slots[slot];
                                    const slotOverride = override.slots?.[slot] ?? {};

                                    return (
                                      <div key={slot} style={slotCardStyle}>
                                        <div style={{ fontWeight: 700 }}>
                                          {SLOT_LABELS[slot]}
                                        </div>

                                        <label style={slotFieldStyle}>
                                          <span>Color</span>
                                          <select
                                            value={slotOverride.color ?? ""}
                                            onChange={(event) => {
                                              const value =
                                                (event.target.value as ArtifactColor | "") || undefined;
                                              updateSlotOverride(row.fileName, slot, "color", value);
                                            }}
                                            style={textInputStyle}
                                          >
                                            <option value="">
                                              Auto ({sourceSlot.color})
                                            </option>
                                            {ARTIFACT_COLORS.map((color) => (
                                              <option key={color} value={color}>
                                                {capitalize(color)}
                                              </option>
                                            ))}
                                          </select>
                                        </label>

                                        <label style={slotFieldStyle}>
                                          <span>Level</span>
                                          <input
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={slotOverride.level ?? sourceSlot.level}
                                            onChange={(event) => {
                                              const rawValue = event.target.value;
                                              updateSlotOverride(
                                                row.fileName,
                                                slot,
                                                "level",
                                                rawValue === "" ||
                                                  Number(rawValue) === sourceSlot.level
                                                  ? undefined
                                                  : Math.max(0, Math.floor(Number(rawValue)))
                                              );
                                            }}
                                            style={textInputStyle}
                                          />
                                        </label>

                                        <label style={slotFieldStyle}>
                                          <span>Rune</span>
                                          <select
                                            value={slotOverride.runeColor ?? ""}
                                            onChange={(event) => {
                                              const value =
                                                (event.target.value as ArtifactColor | "") || undefined;
                                              updateSlotOverride(
                                                row.fileName,
                                                slot,
                                                "runeColor",
                                                value
                                              );
                                            }}
                                            style={textInputStyle}
                                          >
                                            <option value="">
                                              Auto ({sourceSlot.runeColor})
                                            </option>
                                            {ARTIFACT_COLORS.map((color) => (
                                              <option key={color} value={color}>
                                                {capitalize(color)}
                                              </option>
                                            ))}
                                          </select>
                                        </label>
                                      </div>
                                    );
                                  })}
                                </div>
                              </details>
                            </td>

                            <td>
                              <span style={confidenceBadgeStyle(row.confidence)}>
                                {getConfidenceLabel(row.confidence, t)}
                              </span>
                            </td>

                            <td>
                              <textarea
                                value={override.notes ?? row.notes}
                                onChange={(event) => {
                                  const value = event.target.value.trim();
                                  updateRowOverride(row.fileName, (current) => ({
                                    ...current,
                                    notes: value === "" ? undefined : value,
                                  }));
                                }}
                                rows={3}
                                style={textAreaStyle}
                              />
                            </td>

                            <td>
                              <button
                                className="secondary-button"
                                onClick={() => resetRowOverride(row.fileName)}
                              >
                                Reset row
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function applyOverrideLocally(
  row: EnemyAnalysisRow,
  override?: EnemyAnalysisRowOverride
): EffectiveEnemyAnalysisRow {
  const slotOverrides = override?.slots ?? {};

  const nextSlots = Object.fromEntries(
    SLOT_ORDER.map((slot) => {
      const sourceSlot = row.slots[slot];
      const slotOverride = slotOverrides[slot];

      return [
        slot,
        {
          ...sourceSlot,
          color: slotOverride?.color ?? sourceSlot.color,
          level: slotOverride?.level ?? sourceSlot.level,
          runeColor: slotOverride?.runeColor ?? sourceSlot.runeColor,
        },
      ];
    })
  ) as EnemyAnalysisRow["slots"];

  return {
    ...row,
    chiefName: override?.chiefName ?? row.chiefName,
    individualMight: override?.individualMight ?? row.individualMight,
    heroMight: override?.heroMight ?? row.heroMight,
    armyType: override?.armyType ?? row.armyType,
    slots: nextSlots,
    ignored: override?.ignored ?? false,
    notes: override?.notes ?? "",
    hasManualChanges: !isEmptyOverride(override),
    sourceRow: row,
  };
}

function getArmyLabel(
  armyType: ArmyType,
  t: ReturnType<typeof getTranslation>
) {
  switch (armyType) {
    case "archer":
      return t.enemyAnalysis.archers;
    case "berserker":
      return t.enemyAnalysis.berserkers;
    case "cavalry":
      return t.enemyAnalysis.cavalry;
  }
}

function getConfidenceLabel(
  confidence: Confidence,
  t: ReturnType<typeof getTranslation>
) {
  switch (confidence) {
    case "high":
      return t.enemyAnalysis.high;
    case "medium":
      return t.enemyAnalysis.medium;
    case "low":
      return t.enemyAnalysis.low;
  }
}

function getRowWarnings(row: EnemyAnalysisRow) {
  const warnings: string[] = [];

  if (!row.chiefName || row.chiefName === "Unknown") {
    warnings.push("Unknown name");
  }

  if (!Number.isFinite(row.individualMight) || row.individualMight <= 0) {
    warnings.push("Might is zero");
  }

  if (row.confidence === "low") {
    warnings.push("Low confidence");
  }

  return warnings;
}

function cleanupOverride(
  override?: EnemyAnalysisRowOverride
): EnemyAnalysisRowOverride {
  if (!override) {
    return {};
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

  if (override.notes !== undefined) {
    const trimmed = override.notes.trim();
    if (trimmed) {
      next.notes = trimmed;
    }
  }

  if (override.slots) {
    const cleanedSlots: Partial<Record<ArtifactSlotKey, ArtifactSlotOverride>> = {};

    for (const slot of SLOT_ORDER) {
      const source = override.slots[slot];
      if (!source) {
        continue;
      }

      const cleanedSlot: ArtifactSlotOverride = {};

      if (source.color !== undefined) {
        cleanedSlot.color = source.color;
      }
      if (source.level !== undefined) {
        cleanedSlot.level = source.level;
      }
      if (source.runeColor !== undefined) {
        cleanedSlot.runeColor = source.runeColor;
      }

      if (Object.keys(cleanedSlot).length) {
        cleanedSlots[slot] = cleanedSlot;
      }
    }

    if (Object.keys(cleanedSlots).length) {
      next.slots = cleanedSlots;
    }
  }

  return next;
}

function isEmptyOverride(override?: EnemyAnalysisRowOverride) {
  if (!override) {
    return true;
  }

  return (
    override.chiefName === undefined &&
    override.individualMight === undefined &&
    override.heroMight === undefined &&
    override.armyType === undefined &&
    override.ignored === undefined &&
    override.notes === undefined &&
    (!override.slots || Object.keys(override.slots).length === 0)
  );
}

function sanitizeOverrideMap(input: unknown): OverrideMap {
  if (!input || typeof input !== "object") {
    return {};
  }

  const next: OverrideMap = {};

  for (const [fileName, value] of Object.entries(input as Record<string, unknown>)) {
    const cleaned = cleanupOverride(value as EnemyAnalysisRowOverride);
    if (!isEmptyOverride(cleaned)) {
      next[fileName] = cleaned;
    }
  }

  return next;
}

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

async function readImageFilesFromDirectory(
  directoryHandle: FileSystemDirectoryHandle
): Promise<PickedFile[]> {
  const files: PickedFile[] = [];
  const iterableHandle = directoryHandle as FileSystemDirectoryHandle & {
    values(): AsyncIterable<FileSystemHandle>;
  };

  for await (const entryHandle of iterableHandle.values()) {
    if (entryHandle.kind !== "file") {
      continue;
    }

    const fileHandle = entryHandle as FileSystemFileHandle;
    const entryName = fileHandle.name;

    if (!entryName.toLowerCase().match(/\.(png|jpe?g|webp)$/)) {
      continue;
    }

    const file = await fileHandle.getFile();
    files.push({ file });
  }

  return files;
}

async function copyEnemyAnalysisReport(
  rows: EnemyAnalysisRow[],
  sortField: SortField,
  folderLabel: string,
  t: ReturnType<typeof getTranslation>
) {
  const report = buildEnemyAnalysisTextReport(rows, sortField, folderLabel, t);

  try {
    await navigator.clipboard.writeText(report);
    alert("Report copied to clipboard.");
  } catch {
    fallbackCopyText(report);
    alert("Report copied to clipboard.");
  }
}

async function sendEnemyAnalysisReportToDiscord(
  rows: EnemyAnalysisRow[],
  sortField: SortField,
  folderLabel: string,
  t: ReturnType<typeof getTranslation>,
  destino: DiscordDestino
) {
  const report = buildEnemyAnalysisTextReport(rows, sortField, folderLabel, t);
  const chunks = splitDiscordMessage(report, 1900);
  const webhookUrl = DISCORD_WEBHOOKS[destino];

  try {
    for (const chunk of chunks) {
      const response = await fetch(`${webhookUrl}?wait=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: chunk,
          allowed_mentions: { parse: [] },
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed with ${response.status}`);
      }
    }

    alert(
      destino === "jotunheim"
        ? "Report sent to Jotunheim."
        : "Report sent to Tribal Showdown."
    );
  } catch {
    alert(
      destino === "jotunheim"
        ? "Could not send the report to Jotunheim."
        : "Could not send the report to Tribal Showdown."
    );
  }
}

function splitDiscordMessage(text: string, maxLength = 1900) {
  if (text.length <= maxLength) {
    return [text];
  }

  const lines = text.split("\n");
  const chunks: string[] = [];
  let current = "";

  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;

    if (next.length <= maxLength) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    if (line.length <= maxLength) {
      current = line;
      continue;
    }

    let start = 0;
    while (start < line.length) {
      chunks.push(line.slice(start, start + maxLength));
      start += maxLength;
    }

    current = "";
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function buildEnemyAnalysisTextReport(
  rows: EnemyAnalysisRow[],
  sortField: SortField,
  _folderLabel: string,
  _t: ReturnType<typeof getTranslation>
) {
  const validRows = rows.filter((row) => getSortValue(row, sortField) > 0);

  const sortedOverall = [...validRows].sort(
    (left, right) => getSortValue(right, sortField) - getSortValue(left, sortField)
  );

  const priorityTargets = sortedOverall.slice(0, 5);
  const grouped = groupRowsByArmy(validRows, sortField);

  const archerRows =
    grouped.find((group) => group.armyType === "archer")?.rows ?? [];
  const berserkerRows =
    grouped.find((group) => group.armyType === "berserker")?.rows ?? [];
  const cavalryRows =
    grouped.find((group) => group.armyType === "cavalry")?.rows ?? [];

  function formatMillions(value: number) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }

  function formatArmyInline(armyType: ArmyType) {
    switch (armyType) {
      case "archer":
        return "Archer";
      case "berserker":
        return "Berserker";
      case "cavalry":
        return "Cavalry";
    }
  }

  function renderPriorityLine(row: EnemyAnalysisRow) {
    return `${row.chiefName} – ${formatMillions(getSortValue(row, sortField))} → ${formatArmyInline(row.armyType)}`;
  }

  function renderArmyLine(row: EnemyAnalysisRow) {
    return `${row.chiefName} – ${formatMillions(getSortValue(row, sortField))}`;
  }

  return [
    "Priority Targets (Must Take Down as a Tribe)",
    ...priorityTargets.map(renderPriorityLine),
    "",
    "Archer Targets",
    ...(archerRows.length
      ? archerRows.map(renderArmyLine)
      : ["No archer targets found."]),
    "",
    "Berserker Targets",
    ...(berserkerRows.length
      ? berserkerRows.map(renderArmyLine)
      : ["No berserker targets found."]),
    "",
    "Cavalry Targets",
    ...(cavalryRows.length
      ? cavalryRows.map(renderArmyLine)
      : ["No cavalry targets found."]),
    "",
    "Strategy Reminder",
    "Swarm Attack is Key: Always move together as a group.",
    "Coordinate on Priority Targets: Focus fire on the main targets first to break enemy lines.",
  ].join("\n");
}

function getSortValue(row: EnemyAnalysisRow, sortField: SortField) {
  return sortField === "heroMight" ? row.heroMight : row.individualMight;
}

function fallbackCopyText(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

const textInputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 10,
  background: "rgba(8,12,18,0.8)",
  color: "inherit",
} satisfies CSSProperties;

const textAreaStyle = {
  ...textInputStyle,
  minHeight: 72,
  resize: "vertical",
} satisfies CSSProperties;

const smallMutedStyle = {
  marginTop: 6,
  fontSize: 12,
  opacity: 0.75,
} satisfies CSSProperties;

const warningBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(255,184,0,0.16)",
  border: "1px solid rgba(255,184,0,0.28)",
  fontSize: 12,
  fontWeight: 700,
} satisfies CSSProperties;

const slotGridStyle = {
  display: "grid",
  gap: 10,
  marginTop: 10,
  minWidth: 340,
} satisfies CSSProperties;

const slotCardStyle = {
  display: "grid",
  gap: 8,
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
} satisfies CSSProperties;

const slotFieldStyle = {
  display: "grid",
  gap: 4,
} satisfies CSSProperties;

function confidenceBadgeStyle(confidence: Confidence): CSSProperties {
  const palette =
    confidence === "high"
      ? {
          background: "rgba(84, 214, 44, 0.16)",
          border: "1px solid rgba(84, 214, 44, 0.28)",
        }
      : confidence === "medium"
        ? {
            background: "rgba(255, 184, 0, 0.16)",
            border: "1px solid rgba(255, 184, 0, 0.28)",
          }
        : {
            background: "rgba(255, 90, 90, 0.16)",
            border: "1px solid rgba(255, 90, 90, 0.28)",
          };

  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    ...palette,
  };
}
