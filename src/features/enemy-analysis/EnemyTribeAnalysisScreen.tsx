import { useMemo, useRef, useState, type CSSProperties, type ChangeEvent } from "react";
import { getTranslation } from "../../i18n";
import type { Language } from "../../types";
import {
  analyzeEnemyImages,
  applyEnemyAnalysisOverride,
  countByArmyType,
  formatNumber,
  getEnemyAnalysisWarnings,
  getPrimarySlotSummary,
  groupRowsByArmy,
  type AnalysisProgress,
  type ArmyType,
  type ArtifactColor,
  type ArtifactSlotKey,
  type Confidence,
  type EnemyAnalysisRow,
  type EnemyAnalysisRowOverride,
  type SortField,
} from "./analysis";
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

type DiscordDestino = keyof typeof DISCORD_WEBHOOKS;
type OverrideMap = Record<string, EnemyAnalysisRowOverride>;

type CorrectionFilePayload = {
  version: 1;
  folderLabel: string;
  overrides: OverrideMap;
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
  const [selectedFolderLabel, setSelectedFolderLabel] = useState("");
  const [fallbackPickerKey, setFallbackPickerKey] = useState(0);
  const [correctionsPickerKey, setCorrectionsPickerKey] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const correctionsFileRef = useRef<HTMLInputElement | null>(null);

  const supportsDirectoryPicker =
    typeof window !== "undefined" &&
    typeof (window as BrowserWindowWithDirectoryPicker).showDirectoryPicker ===
      "function";

  const effectiveRows = useMemo(
    () => rows.map((row) => applyEnemyAnalysisOverride(row, manualOverrides[row.fileName])),
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

        const mightGap = getSortValue(right, sortField) - getSortValue(left, sortField);
        if (mightGap !== 0) {
          return mightGap;
        }

        return left.fileName.localeCompare(right.fileName);
      }),
    [effectiveRows, sortField]
  );

  async function runAnalysis(files: PickedFile[], folderLabel: string) {
    if (!files.length) {
      return;
    }

    setError("");
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
      setFallbackPickerKey((value) => value + 1);
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
      rawFiles[0]?.webkitRelativePath?.split("/")[0] ?? `${files.length} images`;

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
  }

  function updateSlotOverride(
    fileName: string,
    slot: ArtifactSlotKey,
    field: keyof NonNullable<EnemyAnalysisRowOverride["slots"]>[ArtifactSlotKey],
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

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${payload.folderLabel || "enemy-analysis"}-corrections.json`;
    anchor.click();
    URL.revokeObjectURL(url);
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
      alert("Corrections loaded.");
    } catch {
      alert("Could not load the corrections file.");
    } finally {
      setCorrectionsPickerKey((value) => value + 1);
    }
  }

  return (
    <div className="stack">
      <div className="app-top-actions">
        <button className="secondary-button" onClick={onBack}>
          ← {t.common.back}
        </button>

        <button
          className="secondary-button"
          onClick={() => setShowDebug((value) => !value)}
        >
          {showDebug ? "Hide debug" : "Debug single image"}
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

            <button className="secondary-button" onClick={exportCorrections}>
              Export corrections
            </button>

            <button
              className="secondary-button"
              onClick={() => correctionsFileRef.current?.click()}
            >
              Import corrections
            </button>

            <button className="secondary-button" onClick={resetAllOverrides}>
              Reset all corrections
            </button>

            <input
              key={correctionsPickerKey}
              ref={correctionsFileRef}
              type="file"
              accept="application/json"
              onChange={handleCorrectionsFileChange}
              style={{ display: "none" }}
            />
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
            <div className="banner-watermark-title">PHOENIX VERITAS</div>
            <div className="banner-watermark-motto">
              FORGED IN FIRE, UNITED IN TRUTH.
            </div>
          </div>
        </div>
      </section>

      {showDebug ? <EnemyTribeDebugScreen language={language} /> : null}

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
              <label className="folder-picker-fallback">
                <input
                  key={fallbackPickerKey}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFallbackFolderChange}
                  ref={(input) => {
                    if (input) {
                      input.setAttribute("webkitdirectory", "");
                      input.setAttribute("directory", "");
                    }
                  }}
                />
                <strong>📁 {t.enemyAnalysis.chooseFolder}</strong>
                <small>{t.enemyAnalysis.chooseFolderHelp}</small>
              </label>
            ) : null}
          </div>
        </div>

        <div className="note-box compact-note-box">{t.enemyAnalysis.artifactNote}</div>

        {progress ? (
          <div className="note-box">
            {t.enemyAnalysis.analyzing} {progress.current}/{progress.total}:{" "}
            <strong>{progress.fileName}</strong>
            <br />
            {t.enemyAnalysis.step}: {progress.step}
          </div>
        ) : null}

        {error ? <div className="error-box">{error}</div> : null}
      </section>

      {rows.length ? (
        <>
          <section className="top-grid">
            <div className="info-box">
              <span className="info-label">{t.enemyAnalysis.screenshotsAnalyzed}</span>
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

          <section className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Review</p>
                <h2>Manual correction before export</h2>
                <p className="muted">
                  OCR and interpretation stay as the automatic baseline, but the
                  final report and Discord export now use the corrected values.
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
                    const warnings = getEnemyAnalysisWarnings(row.sourceRow);

                    return (
                      <tr key={row.fileName} style={row.ignored ? { opacity: 0.55 } : undefined}>
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
                          {row.hasManualChanges ? (
                            <div style={smallMutedStyle}>Manual corrections applied</div>
                          ) : (
                            <div style={smallMutedStyle}>Auto only</div>
                          )}
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
                            <option value="">Auto ({capitalize(row.sourceRow.armyType)})</option>
                            <option value="archer">Archer</option>
                            <option value="berserker">Berserker</option>
                            <option value="cavalry">Cavalry</option>
                          </select>
                          <div style={smallMutedStyle}>Final: {capitalize(row.armyType)}</div>
                        </td>

                        <td>
                          <div>{getPrimarySlotSummary(row)}</div>

                          <details style={{ marginTop: 8 }}>
                            <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                              Edit artifacts
                            </summary>

                            <div
                              style={{
                                display: "grid",
                                gap: 10,
                                marginTop: 10,
                                minWidth: 320,
                              }}
                            >
                              {SLOT_ORDER.map((slot) => {
                                const sourceSlot = row.sourceRow.slots[slot];
                                const slotOverride = override.slots?.[slot] ?? {};

                                return (
                                  <div key={slot} style={slotCardStyle}>
                                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                                      {SLOT_LABELS[slot]}
                                    </div>

                                    <div style={slotGridStyle}>
                                      <label style={fieldStackStyle}>
                                        <span>Artifact</span>
                                        <select
                                          value={slotOverride.color ?? ""}
                                          onChange={(event) =>
                                            updateSlotOverride(
                                              row.fileName,
                                              slot,
                                              "color",
                                              (event.target.value || undefined) as
                                                | ArtifactColor
                                                | undefined
                                            )
                                          }
                                          style={textInputStyle}
                                        >
                                          <option value="">Auto ({capitalize(sourceSlot.color)})</option>
                                          {ARTIFACT_COLORS.map((color) => (
                                            <option key={color} value={color}>
                                              {capitalize(color)}
                                            </option>
                                          ))}
                                        </select>
                                      </label>

                                      <label style={fieldStackStyle}>
                                        <span>Level</span>
                                        <input
                                          type="number"
                                          min={0}
                                          step={1}
                                          value={slotOverride.level ?? ""}
                                          placeholder={String(sourceSlot.level)}
                                          onChange={(event) =>
                                            updateSlotOverride(
                                              row.fileName,
                                              slot,
                                              "level",
                                              event.target.value === ""
                                                ? undefined
                                                : Math.max(
                                                    0,
                                                    Math.floor(Number(event.target.value))
                                                  )
                                            )
                                          }
                                          style={textInputStyle}
                                        />
                                      </label>

                                      <label style={fieldStackStyle}>
                                        <span>Rune</span>
                                        <select
                                          value={slotOverride.runeColor ?? ""}
                                          onChange={(event) =>
                                            updateSlotOverride(
                                              row.fileName,
                                              slot,
                                              "runeColor",
                                              (event.target.value || undefined) as
                                                | ArtifactColor
                                                | undefined
                                            )
                                          }
                                          style={textInputStyle}
                                        >
                                          <option value="">Auto ({capitalize(sourceSlot.runeColor)})</option>
                                          {ARTIFACT_COLORS.map((color) => (
                                            <option key={color} value={color}>
                                              {capitalize(color)}
                                            </option>
                                          ))}
                                        </select>
                                      </label>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </details>
                        </td>

                        <td>
                          <span className={`confidence-pill confidence-${row.confidence}`}>
                            {getConfidenceLabel(row.confidence, t)}
                          </span>
                        </td>

                        <td>
                          <input
                            type="text"
                            value={override.notes ?? ""}
                            onChange={(event) =>
                              updateRowOverride(row.fileName, (current) => ({
                                ...current,
                                notes: event.target.value || undefined,
                              }))
                            }
                            style={textInputStyle}
                            placeholder="Optional note"
                          />
                        </td>

                        <td>
                          <button
                            className="secondary-button"
                            type="button"
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

          {activeRows.length ? (
            groupedRows.map((group) => {
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
                                <span className={`confidence-pill confidence-${row.confidence}`}>
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
            })
          ) : (
            <section className="card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">Results</p>
                  <h2>No active rows after review</h2>
                  <p className="muted">
                    Every row is currently ignored. Re-enable at least one row to
                    generate a report or send the result to Discord.
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
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
    ...(priorityTargets.length
      ? priorityTargets.map(renderPriorityLine)
      : ["No valid targets found."]),
    "",
    "Archer Targets",
    ...(archerRows.length ? archerRows.map(renderArmyLine) : ["No archer targets found."]),
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

function sanitizeOverrideMap(value: unknown): OverrideMap {
  if (!value || typeof value !== "object") {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>);
  const result: OverrideMap = {};

  for (const [fileName, override] of entries) {
    if (!override || typeof override !== "object") {
      continue;
    }

    result[fileName] = cleanupOverride(override as EnemyAnalysisRowOverride);
  }

  return result;
}

function cleanupOverride(override: EnemyAnalysisRowOverride): EnemyAnalysisRowOverride {
  const next: EnemyAnalysisRowOverride = { ...override };

  if (next.chiefName !== undefined) {
    const trimmed = next.chiefName.trim();
    next.chiefName = trimmed || undefined;
  }

  if (next.notes !== undefined) {
    const trimmed = next.notes.trim();
    next.notes = trimmed || undefined;
  }

  if (next.slots) {
    const cleanedSlots = Object.fromEntries(
      Object.entries(next.slots)
        .map(([slot, slotOverride]) => {
          if (!slotOverride) {
            return [slot, undefined];
          }

          const cleanedSlot = {
            color: slotOverride.color,
            level: slotOverride.level,
            runeColor: slotOverride.runeColor,
          };

          if (
            cleanedSlot.color === undefined &&
            cleanedSlot.level === undefined &&
            cleanedSlot.runeColor === undefined
          ) {
            return [slot, undefined];
          }

          return [slot, cleanedSlot];
        })
        .filter((entry) => entry[1] !== undefined)
    ) as EnemyAnalysisRowOverride["slots"];

    next.slots = cleanedSlots && Object.keys(cleanedSlots).length ? cleanedSlots : undefined;
  }

  return next;
}

function isEmptyOverride(override: EnemyAnalysisRowOverride) {
  return (
    override.chiefName === undefined &&
    override.individualMight === undefined &&
    override.heroMight === undefined &&
    override.armyType === undefined &&
    override.ignored === undefined &&
    override.notes === undefined &&
    override.slots === undefined
  );
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

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const textInputStyle: CSSProperties = {
  width: "100%",
  minWidth: 120,
  padding: "0.45rem 0.6rem",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(2, 6, 23, 0.7)",
  color: "inherit",
};

const smallMutedStyle: CSSProperties = {
  fontSize: 12,
  opacity: 0.75,
  marginTop: 6,
};

const warningBadgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: "rgba(245, 158, 11, 0.14)",
  border: "1px solid rgba(245, 158, 11, 0.35)",
  color: "#fbbf24",
};

const slotCardStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "0.75rem",
  background: "rgba(255,255,255,0.02)",
};

const slotGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
  gap: 10,
};

const fieldStackStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
};
