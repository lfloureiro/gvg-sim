import {
  APP_VERSION_LABEL,
  PHOENIX_MOTTO,
  PHOENIX_TITLE,
} from "../version";

type SetupScreenProps = {
  tribeNames: string[];
  tribeColors: string[];
  currentScores: number[];
  error: string;
  onTribeNameChange: (index: number, value: string) => void;
  onTribeColorChange: (index: number, value: string) => void;
  onCurrentScoreChange: (index: number, value: number) => void;
  onContinue: () => void;
};

const COLOR_OPTIONS = [
  { value: "#ff6b6b", label: "Red" },
  { value: "#4dabf7", label: "Blue" },
  { value: "#51cf66", label: "Green" },
  { value: "#ffd43b", label: "Yellow" },
  { value: "#b197fc", label: "Purple" },
  { value: "#ffa94d", label: "Orange" },
  { value: "#f783ac", label: "Pink" },
  { value: "#63e6be", label: "Mint" },
];

export default function SetupScreen({
  tribeNames,
  tribeColors,
  currentScores,
  error,
  onTribeNameChange,
  onTribeColorChange,
  onCurrentScoreChange,
  onContinue,
}: SetupScreenProps) {
  return (
    <section className="card">
      <div
        className="phoenix-banner"
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
          <p className="phoenix-kicker">{PHOENIX_TITLE}</p>
          <h1 className="phoenix-title">GvG Score Simulator</h1>
          <p className="phoenix-subtitle">
            Tribe 1 is always Phoenix Veritas. Choose names, colours and current
            points for the remaining tribes.
          </p>

          <div
            style={{
              marginTop: "0.7rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.65rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.78,
              }}
            >
              {APP_VERSION_LABEL}
            </span>
          </div>
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

      <h2>Initial tribe data</h2>

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
                <span>Tribe name {index + 1}</span>
                <input
                  type="text"
                  value={isPhoenix ? "Phoenix Veritas" : name}
                  disabled={isPhoenix}
                  onChange={(event) =>
                    onTribeNameChange(index, event.target.value)
                  }
                  placeholder={`Tribe ${index + 1}`}
                />
              </label>

              <label className="field">
                <span>Colour</span>
                <select
                  value={tribeColors[index]}
                  onChange={(event) =>
                    onTribeColorChange(index, event.target.value)
                  }
                >
                  {COLOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Current points</span>
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
          Continue
        </button>
      </div>
    </section>
  );
}