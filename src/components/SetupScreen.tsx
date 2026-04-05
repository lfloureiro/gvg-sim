import type { AppText } from "../i18n";
import { PHOENIX_MOTTO, PHOENIX_TITLE } from "../version";

type SetupScreenProps = {
  t: AppText;
  tribeNames: string[];
  tribeEnabled: boolean[];
  currentScores: number[];
  error: string;
  onTribeNameChange: (index: number, value: string) => void;
  onTribeEnabledChange: (index: number, value: boolean) => void;
  onCurrentScoreChange: (index: number, value: number) => void;
  onContinue: () => void;
  onBackToModeSelection?: () => void;
};

export default function SetupScreen({
  t,
  tribeNames,
  tribeEnabled,
  currentScores,
  error,
  onTribeNameChange,
  onTribeEnabledChange,
  onCurrentScoreChange,
  onContinue,
  onBackToModeSelection,
}: SetupScreenProps) {
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
          const isEnabled = tribeEnabled[index];

          return (
            <div
              key={index}
              className="tribe-setup-row"
              style={{ opacity: isEnabled ? 1 : 0.72 }}
            >
              <label className="field">
                <span>
                  {t.setup.tribeName} {index + 1}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    onTribeNameChange(index, event.target.value)
                  }
                  placeholder={`${t.common.tribe} ${index + 1}`}
                />
              </label>

              <label className="field">
                <span>Em jogo</span>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(event) =>
                    onTribeEnabledChange(index, event.target.checked)
                  }
                  style={{ width: 20, height: 20 }}
                />
              </label>

              <label className="field">
                <span>{t.common.currentPoints}</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={currentScores[index]}
                  disabled={!isEnabled}
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
        {onBackToModeSelection ? (
          <button
            className="secondary-button"
            onClick={onBackToModeSelection}
          >
            Voltar aos modos
          </button>
        ) : null}

        <button className="primary-button" onClick={onContinue}>
          {t.common.continue}
        </button>
      </div>
    </section>
  );
}