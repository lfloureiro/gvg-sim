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

export default function EnemyTribeAnalysisScreen({
  onBack,
  language,
}: EnemyTribeAnalysisScreenProps) {
  const t = getTranslation(language);

  const [sortField, setSortField] = useState<SortField>("individualMight");
  const [rows, setRows] = useState<EnemyAnalysisRow[]>([]);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [error, setError] = useState("");
  const [selectedFolderLabel, setSelectedFolderLabel] = useState("");
  const [fallbackPickerKey, setFallbackPickerKey] = useState(0);

  const sortOptions = useMemo(
    () => [
      {
        value: "individualMight" as SortField,
        label: t.enemyAnalysis.individualMight,
      },
      {
        value: "heroMight" as SortField,
        label: t.enemyAnalysis.heroMight,
      },
    ],
    [t]
  );

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

        {rows.length ? (
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

          <div className="field">
            <span>{t.enemyAnalysis.orderBy}</span>

            <select
              value={sortField}
              onChange={(event) =>
                setSortField(event.target.value as SortField)
              }
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
                          <th>{t.enemyAnalysis.heroMight}</th>
                          <th>{t.enemyAnalysis.primaryBuild}</th>
                          <th>{t.enemyAnalysis.confidence}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row) => (
                          <tr key={`${group.armyType}-${row.fileName}`}>
                            <td className="tribe-name-cell">{row.chiefName}</td>
                            <td>{formatNumber(row.individualMight)}</td>
                            <td>{formatNumber(row.heroMight)}</td>
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

function buildEnemyAnalysisTextReport(
  rows: EnemyAnalysisRow[],
  sortField: SortField,
  folderLabel: string,
  t: ReturnType<typeof getTranslation>
) {
  const grouped = groupRowsByArmy(rows, sortField);

  const sortLabel =
    sortField === "individualMight"
      ? t.enemyAnalysis.individualMight
      : t.enemyAnalysis.heroMight;

  const sections: string[] = [];

  sections.push("ENEMY TRIBE ANALYSIS");
  sections.push(`${t.enemyAnalysis.selectedFolder}: ${folderLabel}`);
  sections.push(`${t.enemyAnalysis.orderBy}: ${sortLabel}`);
  sections.push("");

  for (const group of grouped) {
    const label = getArmyLabel(group.armyType, t);

    sections.push(label);

    if (!group.rows.length) {
      sections.push(`- ${t.enemyAnalysis.noChiefsClassified} ${label}.`);
      sections.push("");
      continue;
    }

    for (const row of group.rows) {
      sections.push(
        `- ${row.chiefName} | IM: ${formatNumber(row.individualMight)} | HM: ${formatNumber(row.heroMight)} | Build: ${getPrimarySlotSummary(row)} | ${t.enemyAnalysis.confidence}: ${getConfidenceLabel(row.confidence, t)}`
      );
    }

    sections.push("");
  }

  return sections.join("\n").trim();
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