import type { Language } from "../../types";

type HomeScreenProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onOpenGvg: () => void;
  onOpenEnemyAnalysis: () => void;
};

const LANGUAGE_OPTIONS: Array<{ value: Language; label: string }> = [
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "it", label: "Italiano" },
  { value: "ru", label: "Русский" },
  { value: "tr", label: "Türkçe" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "uk", label: "Українська" },
];

export default function HomeScreen({
  language,
  onLanguageChange,
  onOpenGvg,
  onOpenEnemyAnalysis,
}: HomeScreenProps) {
  return (
    <div className="stack">
      <section className="phoenix-banner mode-banner phoenix-banner-with-watermark">
        <div className="phoenix-banner-inner phoenix-banner-grid">
          <div>
            <h1 className="phoenix-title">Phoenix Veritas toolkit</h1>
            <p className="phoenix-subtitle">Forged in fire, united in truth.</p>
          </div>

          <div className="home-banner-side">
            <label className="field home-language-field">
              <span>Language</span>
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

            <div className="banner-watermark-block" aria-hidden="true">
              <div className="banner-watermark-title">PHOENIX VERITAS</div>
              <div className="banner-watermark-motto">
                FORGED IN FIRE, UNITED IN TRUTH.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mode-grid">
        <article className="card mode-card">
          <div className="mode-card-body">
            <h2>GvG simulator</h2>
            <p className="muted">
              Open the existing scoring simulator and keep working with tribe
              setup, current points and ruin scenarios.
            </p>
          </div>

          <div className="actions">
            <button className="primary-button" onClick={onOpenGvg}>
              Open GvG
            </button>
          </div>
        </article>

        <article className="card mode-card">
          <div className="mode-card-body">
            <h2>Enemy tribe analysis</h2>
            <p className="muted">
              Scan a screenshots folder, infer the main army type and rank the
              enemy chiefs by Individual Might or Hero Might.
            </p>
          </div>

          <div className="actions">
            <button className="primary-button" onClick={onOpenEnemyAnalysis}>
              Open analysis
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
