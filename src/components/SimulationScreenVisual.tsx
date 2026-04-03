import { useState } from "react";
import type { AppText } from "../i18n";
import type {
  DayNumber,
  RuinState,
  RuinStateField,
  Tribe,
} from "../types";
import GvgMap from "../features/gvg/components/GvgMap";

type SimulationScreenVisualProps = {
  t: AppText;
  tribes: Tribe[];
  currentDay: DayNumber;
  currentUtc: Date;
  ruinStates: RuinState[];
  onCurrentDayChange: (day: DayNumber) => void;
  onRuinChange: (
    ruinId: string,
    field: RuinStateField,
    value: string | null
  ) => void;
  onCopyCurrentToScenario: () => void;
  onBack: () => void;
};

export default function SimulationScreenVisual({
  t,
  tribes: _tribes,
  currentDay,
  currentUtc,
  ruinStates: _ruinStates,
  onCurrentDayChange,
  onRuinChange: _onRuinChange,
  onCopyCurrentToScenario,
  onBack,
}: SimulationScreenVisualProps) {
  const [calibrationMode, setCalibrationMode] = useState(false);

  const utcDate = currentUtc.toISOString().slice(0, 10);
  const utcTime = currentUtc.toISOString().slice(11, 19);

  return (
    <div className="stack">
      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">{t.simulationVisual.eyebrow}</p>
            <h1>{t.simulationVisual.title}</h1>
            <p className="phoenix-subtitle">{t.simulationVisual.subtitle}</p>
          </div>

          <div className="inline-actions">
            <button className="secondary-button" onClick={onBack}>
              {t.common.back}
            </button>

            <button
              className="secondary-button"
              onClick={() => setCalibrationMode((prev) => !prev)}
            >
              {calibrationMode
                ? t.simulationVisual.calibrationOff
                : t.simulationVisual.calibrationOn}
            </button>

            <button
              className="secondary-button"
              onClick={onCopyCurrentToScenario}
            >
              {t.common.copyCurrentToSimulation}
            </button>
          </div>
        </div>

        <div className="top-grid">
          <label className="field">
            <span>{t.common.currentDay}</span>
            <select
              value={currentDay}
              onChange={(event) =>
                onCurrentDayChange(Number(event.target.value) as DayNumber)
              }
            >
              <option value={1}>{t.common.day1}</option>
              <option value={2}>{t.common.day2}</option>
              <option value={3}>{t.common.day3}</option>
            </select>
          </label>

          <div className="info-box">
            <span className="info-label">{t.common.currentGmtTime}</span>
            <strong>
              {utcDate} {utcTime} GMT
            </strong>
          </div>
        </div>
      </section>

      <GvgMap
        t={t}
        calibrationMode={calibrationMode}
        onHomeClick={(homeId: string) => {
          console.log("visual mode - home clicked:", homeId);
        }}
        onMainRuinClick={() => {
          console.log("visual mode - main ruin clicked");
        }}
      />

      <section className="card">
        <div className="card-header">
          <div>
            <h2>{t.simulationVisual.nextStepTitle}</h2>
          </div>
        </div>

        <div className="note-box">
          {t.simulationVisual.nextStepBodyLine1}
          <br />
          {t.simulationVisual.nextStepBodyLine2}
        </div>
      </section>
    </div>
  );
}