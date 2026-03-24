import { getTranslation, LANGUAGE_OPTIONS } from "../../i18n";
import type { Language } from "../../types";
import {
  APP_VERSION_STRING,
  PHOENIX_MOTTO,
  PHOENIX_TITLE,
} from "../../version";

type HomeScreenProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onOpenGvg: () => void;
  onOpenEnemyAnalysis: () => void;
};

export default function HomeScreen({
  language,
  onLanguageChange,
  onOpenGvg,
  onOpenEnemyAnalysis,
}: HomeScreenProps) {
  const t = getTranslation(language);

  return (
    <div className="stack">
      <section className="card">
        <div
          className="phoenix-banner phoenix-banner-compact"
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: 170,
          }}
        >
          <div
            className="phoenix-banner-inner"
            style={{
              position: "relative",
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              minHeight: 170,
            }}
          >
            <div style={{ maxWidth: "60%" }}>
              <h1 className="phoenix-title">{t.home.title}</h1>
              <p className="phoenix-subtitle">{t.home.subtitle}</p>
            </div>

            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "1.5rem",
              }}
            >
              <label className="field" style={{ width: 260 }}>
                <span>{t.common.language}</span>
                <select
                  value={language}
                  onChange={(event) =>
                    onLanguageChange(event.target.value as Language)
                  }
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  opacity: 0.78,
                  textAlign: "right",
                  paddingBottom: "0.2rem",
                  whiteSpace: "nowrap",
                }}
              >
                {t.common.version} {APP_VERSION_STRING}
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: "1.1rem",
              right: "1.4rem",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              textAlign: "right",
              pointerEvents: "none",
              opacity: 0.11,
              lineHeight: 0.95,
              maxWidth: "42%",
            }}
          >
            <div
              style={{
                fontSize: "clamp(2rem, 3.6vw, 4.4rem)",
                fontWeight: 800,
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
              }}
            >
              {PHOENIX_TITLE}
            </div>

            <div
              style={{
                marginTop: "0.35rem",
                fontSize: "clamp(0.68rem, 0.95vw, 0.9rem)",
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
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        <section className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">{t.home.gvgEyebrow}</p>
              <h2>{t.home.gvgTitle}</h2>
              <p className="muted">{t.home.gvgDescription}</p>
            </div>
          </div>

          <div className="actions">
            <button className="primary-button" onClick={onOpenGvg}>
              {t.home.gvgButton}
            </button>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">{t.home.enemyEyebrow}</p>
              <h2>{t.home.enemyTitle}</h2>
              <p className="muted">{t.home.enemyDescription}</p>
            </div>
          </div>

          <div className="actions">
            <button className="primary-button" onClick={onOpenEnemyAnalysis}>
              {t.home.enemyButton}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}