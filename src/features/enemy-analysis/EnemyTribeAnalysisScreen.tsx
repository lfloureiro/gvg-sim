import { useMemo, useState, type ChangeEvent } from "react";
import { getTranslation } from "../../i18n";
import type { Language } from "../../types";
import {
  analyzeEnemyImages,
  countByArmyType,
  formatNumber,
  getPrimarySlotSummary,
  groupRowsByArmy,
  type AnalysisProgress,
  type ArmyType,
  type Confidence,
  type EnemyAnalysisRow,
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

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1486784864635195534/yibQrsnBaS3KXQxrSa-RCldQEgTxzLpq-KO07LBuzZ-vQEqXp_qifyejRShTqlOiEOm8";

export default function EnemyTribeAnalysisScreen({
  onBack,
  language,
}: EnemyTribeAnalysisScreenProps) {
  const t = getTranslation(language);

  const sortField: SortField = "individualMight";
  const [rows, setRows] = useState<EnemyAnalysisRow[]>([]);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [error, setError] = useState("");
  const [selectedFolderLabel, setSelectedFolderLabel] = useState("");
  const [fallbackPickerKey, setFallbackPickerKey] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  const supportsDirectoryPicker =
    typeof window !== "undefined" &&
    typeof (window as BrowserWindowWithDirectoryPicker).showDirectoryPicker ===
      "function";

  const groupedRows = useMemo(
    () => groupRowsByArmy(rows, sortField),
    [rows, sortField]
  );

  const counts = useMemo(() => countByArmyType(rows), [rows]);

  async function runAnalysis(files: PickedFile[], folderLabel: string) {
    if (!files.length) {
      return;
    }

    setError("");
    setRows([]);
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
      rawFiles[0]?.webkitRelativePath?.split("/")[0] ??
      `${files.length} images`;

    await runAnalysis(files, folderName);
    event.target.value = "";
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
                  rows,
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
                  rows,
                  sortField,
                  selectedFolderLabel || "enemy-analysis",
                  t
                )
              }
            >
              Send to Discord
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
      </section>

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
  t: ReturnType<typeof getTranslation>
) {
  const report = buildEnemyAnalysisTextReport(rows, sortField, folderLabel, t);
  const chunks = splitDiscordMessage(report, 1900);

  try {
    for (const chunk of chunks) {
      const response = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
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

    alert("Report sent to Discord.");
  } catch {
    alert("Could not send the report to Discord.");
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