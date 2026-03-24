import { useMemo, useState, type ChangeEvent } from "react";
import {
  analyzeEnemyImages,
  countByArmyType,
  formatConfidence,
  formatNumber,
  getPrimarySlotSummary,
  groupRowsByArmy,
  type AnalysisProgress,
  type EnemyAnalysisRow,
  type SortField,
} from "./analysis";
import type { Language } from "../../types";

type EnemyTribeAnalysisScreenProps = {
  onBack: () => void;
  language: Language;
};

type DirectoryFile = File & {
  webkitRelativePath?: string;
};

type PickedFile = {
  file: File;
  handle?: FileSystemFileHandle;
};

type BrowserWindowWithDirectoryPicker = Window & {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
};

const SORT_OPTIONS: Array<{
  value: SortField;
  label: string;
}> = [
  { value: "heroMight", label: "Hero Might" },
  { value: "individualMight", label: "Individual Might" },
];

export default function EnemyTribeAnalysisScreen({
  onBack,
}: EnemyTribeAnalysisScreenProps) {
  const [sortField, setSortField] = useState<SortField>("individualMight");
  const [rows, setRows] = useState<EnemyAnalysisRow[]>([]);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [error, setError] = useState("");
  const [selectedFolderLabel, setSelectedFolderLabel] = useState("");
  const [fallbackPickerKey, setFallbackPickerKey] = useState(0);

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
      setError("Could not analyze the selected folder.");
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
      setError("Could not open the selected folder.");
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

  return (
    <div className="stack">
      <div className="app-top-actions">
        <button className="secondary-button" onClick={onBack}>
          ← Back to home
        </button>
      </div>

      <section className="phoenix-banner mode-banner phoenix-banner-with-watermark">
        <div className="phoenix-banner-inner phoenix-banner-grid">
          <div>
            <p className="phoenix-kicker">Enemy tribe analysis</p>
            <h1 className="phoenix-title">Scan a folder of Fate War screenshots</h1>
            <p className="phoenix-subtitle">
              The analyzer reads the chief name, both might values and the six
              decisive artifact slots. Artifact color is the main signal. Rune
              colors are only used as a tie breaker.
            </p>
          </div>

          <div className="banner-watermark-block" aria-hidden="true">
            <div className="banner-watermark-title">PHOENIX VERITAS</div>
            <div className="banner-watermark-motto">FORGED IN FIRE, UNITED IN TRUTH.</div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Input</p>
            <h2>Folder selection and sort mode</h2>
            <p className="muted">
              Select a folder with screenshots from the same in-game page. This
              version expects the slot positions to stay fixed across all images.
            </p>
          </div>
        </div>

        <div className="analysis-controls">
          <div className="field">
            <span>Screenshot folder</span>
            <button
              className="folder-picker-button"
              type="button"
              onClick={handleChooseFolder}
            >
              <strong>📁 Click here to choose the screenshots folder</strong>
              <small>
                Select the folder that contains the Fate War screenshots you want to analyse.
                The app will only read the files. It will not move or delete them.
              </small>
              {selectedFolderLabel ? (
                <span className="folder-picker-selected">
                  Selected folder: {selectedFolderLabel}
                </span>
              ) : (
                <span className="folder-picker-selected">
                  No folder selected yet
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
                <strong>Fallback folder picker</strong>
                <small>Use this only if the main button is not available in your browser.</small>
              </label>
            ) : null}
          </div>

          <div className="field">
            <span>Order enemies by</span>
            <select
              value={sortField}
              onChange={(event) => setSortField(event.target.value as SortField)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="note-box compact-note-box">
          Artifact weights: grey 0, green 10, blue 20, purple 30, gold 40, red
          50. Primary slots: Archers = sword + helmet, Berserkers = shield +
          chest, Cavalry = boots + pants. Rune colors are only used as a tie
          breaker. If the level OCR fails, the analyzer now forces the minimum
          valid level for the detected artifact color so it avoids impossible
          outputs such as Gold Lv.0 or Red Lv.0.
        </div>

        {progress ? (
          <div className="note-box">
            Analyzing {progress.current}/{progress.total}: <strong>{progress.fileName}</strong>
            <br />
            Step: {progress.step}
          </div>
        ) : null}

        {error ? <div className="error-box">{error}</div> : null}
      </section>

      {rows.length ? (
        <>
          <section className="top-grid">
            <div className="info-box">
              <span className="info-label">Screenshots analyzed</span>
              <strong>{rows.length}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">Archers</span>
              <strong>{counts.archer}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">Berserkers</span>
              <strong>{counts.berserker}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">Cavalry</span>
              <strong>{counts.cavalry}</strong>
            </div>
          </section>

          {groupedRows.map((group) => (
            <section className="card" key={group.armyType}>
              <div className="card-header">
                <div>
                  <p className="eyebrow">Results</p>
                  <h2>{group.label}</h2>
                  <p className="muted">
                    {group.rows.length
                      ? `${group.rows.length} chiefs classified as ${group.label}.`
                      : `No chiefs classified as ${group.label} in the current folder.`}
                  </p>
                </div>
              </div>

              {group.rows.length ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Individual Might</th>
                        <th>Hero Might</th>
                        <th>Primary build</th>
                        <th>Confidence</th>
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
                              {formatConfidence(row.confidence)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          ))}
        </>
      ) : null}
    </div>
  );
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
