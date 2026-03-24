import type { AppText } from "../i18n";
import {
  PHOENIX_MOTTO,
  PHOENIX_TITLE,
} from "../version";

type SetupScreenProps = {
  t: AppText;
  tribeNames: string[];
  tribeColors: string[];
  currentScores: number[];
  error: string;
  onTribeNameChange: (index: number, value: string) => void;
  onTribeColorChange: (index: number, value: string) => void;
  onCurrentScoreChange: (index: number, value: number) => void;
  onContinue: () => void;
};

function getColorOptions(t: AppText) {
  return [
    { value: "#ff6b6b", label: t.common.colours.red },
    { value: "#4dabf7", label: t.common.colours.blue },
    { value: "#51cf66", label: t.common.colours.green },
    { value: "#ffd43b", label: t.common.colours.yellow },
    { value: "#b197fc", label: t.common.colours.purple },
    { value: "#ffa94d", label: t.common.colours.orange },
    { value: "#f783ac", label: t.common.colours.pink },
    { value: "#63e6be", label: t.common.colours.mint },
  ];
}

export default function SetupScreen({
  t,
  tribeNames,
  tribeColors,
  currentScores,
  error,
  onTribeNameChange,
  onTribeColorChange,
  onCurrentScoreChange,
  onContinue,
}: SetupScreenProps) {
  const colorOptions = getColorOptions(t);

  return (
    <section className="card">
      <div
        className="phoenix-banner phoenix-banner-compact"
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: "2rem",
          overflow: "hidden",
        }}
      >
        <div
          className="phoenix-banner-inner"
          style={{ position: "relative", zIndex: 2, maxWidth: "56%" }}
        >
          <h1 className="phoenix-title">{t.setup.title}</h1>
          <p className="phoenix-subtitle">{t.setup.subtitle}</p>
        </div>

        <div
          style={{
            position: "absolute",
            top: "1.05rem",
            right: "1.55rem",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            textAlign: "right",
            pointerEvents: "none",
            opacity: 0.14,
            lineHeight: 0.95,
            maxWidth: "48%",
          }}
        >
          <div
            style={{
              fontSize: "clamp(2.4rem, 4.4vw, 4.8rem)",
              fontWeight: 800,
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
            }}
          >
            {PHOENIX_TITLE}
          </div>

          <div
            style={{
              marginTop: "0.45rem",
              fontSize: "clamp(0.7rem, 1vw, 0.95rem)",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {PHOENIX_MOTTO}
          </div>
        </div>
      </div>

      <h2>{t.setup.initialTribeData}</h2>

      <div className="tribe-setup-grid">
        {tribeNames.map((name, index) => {
          const isPhoenix = index === 0;

          return (
            <div
              key={index}
              className={`tribe-setup-row ${
                isPhoenix ? "featured-tribe-block" : ""
              }`}
            >
              <label className="field">
                <span>
                  {t.setup.tribeName} {index + 1}
                </span>
                <input
                  type="text"
                  value={isPhoenix ? "Phoenix Veritas" : name}
                  disabled={isPhoenix}
                  onChange={(event) =>
                    onTribeNameChange(index, event.target.value)
                  }
                  placeholder={`${t.common.tribe} ${index + 1}`}
                />
              </label>

              <label className="field">
                <span>{t.common.colour}</span>
                <select
                  value={tribeColors[index]}
                  onChange={(event) =>
                    onTribeColorChange(index, event.target.value)
                  }
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>{t.common.currentPoints}</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={currentScores[index]}
                  onChange={(event) =>
                    onCurrentScoreChange(index, Number(event.target.value) || 0)
                  }
                />
              </label>
            </div>
          );
        })}
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="actions">
        <button className="primary-button" onClick={onContinue}>
          {t.common.continue}
        </button>
      </div>
    </section>
  );
}