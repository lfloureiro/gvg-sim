import { useMemo, useState } from "react";
import type { AppText } from "../i18n";
import type {
  DayNumber,
  RuinState,
  RuinStateField,
  Tribe,
  TribeId,
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

function getNextTribeId(
  currentValue: string | null,
  tribes: Tribe[]
): TribeId | null {
  if (tribes.length === 0) {
    return null;
  }

  if (currentValue === null) {
    return tribes[0].id;
  }

  const index = tribes.findIndex((tribe) => tribe.id === currentValue);

  if (index === -1) {
    return tribes[0].id;
  }

  if (index === tribes.length - 1) {
    return null;
  }

  return tribes[index + 1].id;
}

export default function SimulationScreenVisual({
  t,
  tribes,
  currentDay,
  currentUtc,
  ruinStates,
  onCurrentDayChange,
  onRuinChange,
  onCopyCurrentToScenario,
  onBack,
}: SimulationScreenVisualProps) {
  const [calibrationMode, setCalibrationMode] = useState(false);

  const utcDate = currentUtc.toISOString().slice(0, 10);
  const utcTime = currentUtc.toISOString().slice(11, 19);

  const tribeColorById = useMemo(() => {
    return Object.fromEntries(tribes.map((tribe) => [tribe.id, tribe.color]));
  }, [tribes]);

  const ruinStateById = useMemo(() => {
    return Object.fromEntries(ruinStates.map((ruin) => [ruin.id, ruin]));
  }, [ruinStates]);

  const nodeColors = useMemo(() => {
    const colors: Record<string, string> = {};

    tribes.forEach((tribe, index) => {
      colors[`home-${index + 1}`] = tribe.color;
    });

    ruinStates.forEach((ruin) => {
      const effectiveOwner = ruin.simulatedOwner ?? ruin.currentOwner;
      if (effectiveOwner) {
        colors[ruin.id] = tribeColorById[effectiveOwner] ?? "#9ca3af";
      }
    });

    return colors;
  }, [tribes, ruinStates, tribeColorById]);

  function handleHomeClick(_homeId: string) {
    // Para já não fazemos nada nos homes.
  }

  function handlePassClick(_passId: string) {
    // Para já as passes só têm abertura/fecho visual por dia.
    // O projeto ainda não tem passStates no estado global.
  }

  function handleRuinClick(ruinId: string) {
    const ruinState = ruinStateById[ruinId];
    if (!ruinState) {
      return;
    }

    const displayedOwner = ruinState.simulatedOwner ?? ruinState.currentOwner;
    const nextOwner = getNextTribeId(displayedOwner, tribes);

    onRuinChange(ruinId, "simulatedOwner", nextOwner);
  }

  function handleMainRuinClick() {
    handleRuinClick("T1");
  }

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
        currentDay={currentDay}
        calibrationMode={calibrationMode}
        nodeColors={nodeColors}
        onHomeClick={handleHomeClick}
        onPassClick={handlePassClick}
        onRuinClick={handleRuinClick}
        onMainRuinClick={handleMainRuinClick}
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