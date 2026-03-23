type SetupScreenProps = {
  tribeNames: string[];
  currentScores: number[];
  error: string;
  onTribeNameChange: (index: number, value: string) => void;
  onCurrentScoreChange: (index: number, value: number) => void;
  onContinue: () => void;
};

function isPhoenixVeritas(name: string): boolean {
  return name.trim().toLowerCase() === "phoenix veritas";
}

export default function SetupScreen({
  tribeNames,
  currentScores,
  error,
  onTribeNameChange,
  onCurrentScoreChange,
  onContinue,
}: SetupScreenProps) {
  return (
    <section className="card">
      <div className="phoenix-banner">
        <div className="phoenix-banner-inner">
          <p className="phoenix-kicker">PHOENIX VERITAS</p>
          <h1 className="phoenix-title">GvG Score Simulator</h1>
          <p className="phoenix-subtitle">
            Enter the 8 tribe names and each tribe&apos;s current score.
          </p>
        </div>
      </div>

      <h2>Initial tribe data</h2>

      <div className="tribe-setup-grid">
        {tribeNames.map((name, index) => (
          <div
            key={index}
            className={`tribe-setup-row ${
              isPhoenixVeritas(name) ? "featured-tribe-block" : ""
            }`}
          >
            <label className="field">
              <span>Tribe name {index + 1}</span>
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  onTribeNameChange(index, event.target.value)
                }
                placeholder={`Tribe ${index + 1}`}
              />
            </label>

            <label className="field">
              <span>Current score</span>
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
        ))}
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