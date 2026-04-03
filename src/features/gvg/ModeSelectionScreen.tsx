import type { AppText } from "../../i18n";

type ModeSelectionScreenProps = {
  t: AppText;
  onSelectMode: (mode: "table" | "visual") => void;
};

export default function ModeSelectionScreen({
  t,
  onSelectMode,
}: ModeSelectionScreenProps) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">{t.modeSelection.eyebrow}</p>
          <h1>{t.modeSelection.title}</h1>
          <p className="phoenix-subtitle">{t.modeSelection.subtitle}</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        <button
          type="button"
          className="secondary-button"
          style={{
            minHeight: 150,
            textAlign: "left",
            padding: "1.2rem",
          }}
          onClick={() => onSelectMode("table")}
        >
          <div style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 8 }}>
            {t.modeSelection.tableTitle}
          </div>
          <div style={{ opacity: 0.85, lineHeight: 1.5 }}>
            {t.modeSelection.tableDescription}
          </div>
        </button>

        <button
          type="button"
          className="primary-button"
          style={{
            minHeight: 150,
            textAlign: "left",
            padding: "1.2rem",
          }}
          onClick={() => onSelectMode("visual")}
        >
          <div style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 8 }}>
            {t.modeSelection.visualTitle}
          </div>
          <div style={{ opacity: 0.92, lineHeight: 1.5 }}>
            {t.modeSelection.visualDescription}
          </div>
        </button>
      </div>
    </section>
  );
}