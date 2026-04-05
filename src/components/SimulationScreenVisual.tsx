import { useEffect, useMemo, useState } from "react";
import type { AppText } from "../i18n";
import type {
  DayNumber,
  HomeAssignment,
  PassState,
  PassStateField,
  RuinState,
  RuinStateField,
  Tribe,
  TribeId,
} from "../types";
import GvgMap from "../features/gvg/components/GvgMap";
import { HOME_NODES } from "../features/gvg/data/mapLayout";

type SimulationScreenVisualProps = {
  t: AppText;
  tribes: Tribe[];
  currentDay: DayNumber;
  currentUtc: Date;
  homeAssignments: HomeAssignment[];
  passStates: PassState[];
  ruinStates: RuinState[];
  onCurrentDayChange: (day: DayNumber) => void;
  onAssignTribeToHome: (homeId: string, tribeId: string | null) => void;
  onPassChange: (
    passId: string,
    field: PassStateField,
    value: string | null
  ) => void;
  onRuinChange: (
    ruinId: string,
    field: RuinStateField,
    value: string | null
  ) => void;
  onCopyCurrentToScenario: () => void;
  onBack: () => void;
};

function getNextOwnerFromSelected(
  currentValue: string | null,
  selectedTribeId: TribeId | null
): TribeId | null {
  if (!selectedTribeId) {
    return currentValue;
  }

  if (currentValue === selectedTribeId) {
    return null;
  }

  return selectedTribeId;
}

export default function SimulationScreenVisual({
  t,
  tribes,
  currentDay,
  currentUtc,
  homeAssignments,
  passStates,
  ruinStates,
  onCurrentDayChange,
  onAssignTribeToHome,
  onPassChange,
  onRuinChange,
  onCopyCurrentToScenario,
  onBack,
}: SimulationScreenVisualProps) {
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [selectedTribeId, setSelectedTribeId] = useState<TribeId | null>(
    tribes[0]?.id ?? null
  );

  useEffect(() => {
    if (selectedTribeId && tribes.some((tribe) => tribe.id === selectedTribeId)) {
      return;
    }

    setSelectedTribeId(tribes[0]?.id ?? null);
  }, [tribes, selectedTribeId]);

  const utcDate = currentUtc.toISOString().slice(0, 10);
  const utcTime = currentUtc.toISOString().slice(11, 19);

  const tribeColorById = useMemo(() => {
    return Object.fromEntries(tribes.map((tribe) => [tribe.id, tribe.color]));
  }, [tribes]);

  const passStateById = useMemo(() => {
    return Object.fromEntries(passStates.map((pass) => [pass.id, pass]));
  }, [passStates]);

  const ruinStateById = useMemo(() => {
    return Object.fromEntries(ruinStates.map((ruin) => [ruin.id, ruin]));
  }, [ruinStates]);

  const homeAssignmentById = useMemo(() => {
    return Object.fromEntries(
      homeAssignments.map((assignment) => [assignment.homeId, assignment])
    );
  }, [homeAssignments]);

  const homeIdByTribeId = useMemo(() => {
    const result: Record<string, string> = {};

    homeAssignments.forEach((assignment) => {
      if (assignment.tribeId) {
        result[assignment.tribeId] = assignment.homeId;
      }
    });

    return result;
  }, [homeAssignments]);

  const homeLabelById = useMemo(() => {
    return Object.fromEntries(HOME_NODES.map((home) => [home.id, home.label]));
  }, []);

  const activeHomeId = selectedTribeId
    ? homeIdByTribeId[selectedTribeId] ?? null
    : null;

  const nodeColors = useMemo(() => {
    const colors: Record<string, string> = {};

    homeAssignments.forEach((assignment) => {
      if (assignment.tribeId) {
        colors[assignment.homeId] =
          tribeColorById[assignment.tribeId] ?? "#9ca3af";
      }
    });

    passStates.forEach((pass) => {
      const effectiveOwner = pass.simulatedOwner ?? pass.currentOwner;
      if (effectiveOwner) {
        colors[pass.id] = tribeColorById[effectiveOwner] ?? "#9ca3af";
      }
    });

    ruinStates.forEach((ruin) => {
      const effectiveOwner = ruin.simulatedOwner ?? ruin.currentOwner;
      if (effectiveOwner) {
        colors[ruin.id] = tribeColorById[effectiveOwner] ?? "#9ca3af";
      }
    });

    return colors;
  }, [homeAssignments, passStates, ruinStates, tribeColorById]);

  function handleHomeClick(homeId: string) {
    const currentAssignedTribeId = homeAssignmentById[homeId]?.tribeId ?? null;

    if (selectedTribeId) {
      if (currentAssignedTribeId === selectedTribeId) {
        onAssignTribeToHome(homeId, null);
        return;
      }

      onAssignTribeToHome(homeId, selectedTribeId);
      return;
    }

    if (currentAssignedTribeId) {
      setSelectedTribeId(currentAssignedTribeId);
    }
  }

  function handlePassClick(passId: string) {
    const passState = passStateById[passId];
    if (!passState || !selectedTribeId) {
      return;
    }

    const displayedOwner = passState.simulatedOwner ?? passState.currentOwner;
    const nextOwner = getNextOwnerFromSelected(displayedOwner, selectedTribeId);

    onPassChange(passId, "simulatedOwner", nextOwner);
  }

  function handleRuinClick(ruinId: string) {
    const ruinState = ruinStateById[ruinId];
    if (!ruinState || !selectedTribeId) {
      return;
    }

    const displayedOwner = ruinState.simulatedOwner ?? ruinState.currentOwner;
    const nextOwner = getNextOwnerFromSelected(displayedOwner, selectedTribeId);

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

      <section className="card">
        <div className="card-header">
          <div>
            <h2>Tribos em jogo</h2>
            <p className="phoenix-subtitle" style={{ marginTop: 4 }}>
              Seleciona uma tribo e depois clica num home para a atribuir. A mesma
              tribo fica selecionada para pintar passes e ruínas.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.85rem",
          }}
        >
          {tribes.map((tribe) => {
            const assignedHomeId = homeIdByTribeId[tribe.id] ?? null;
            const assignedHomeLabel = assignedHomeId
              ? homeLabelById[assignedHomeId] ?? assignedHomeId
              : "Sem home";

            const isSelected = selectedTribeId === tribe.id;

            return (
              <button
                key={tribe.id}
                type="button"
                className={isSelected ? "primary-button" : "secondary-button"}
                style={{
                  textAlign: "left",
                  minHeight: 88,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.9rem",
                  justifyContent: "flex-start",
                }}
                onClick={() => setSelectedTribeId(tribe.id)}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: tribe.color,
                    border: "2px solid rgba(255,255,255,0.9)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <strong>{tribe.name}</strong>
                  <span style={{ opacity: 0.85, fontSize: "0.92rem" }}>
                    {assignedHomeLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="secondary-button"
            onClick={() => setSelectedTribeId(null)}
          >
            Limpar seleção de tribo
          </button>

          {activeHomeId ? (
            <button
              type="button"
              className="secondary-button"
              onClick={() => onAssignTribeToHome(activeHomeId, null)}
            >
              Libertar {homeLabelById[activeHomeId] ?? activeHomeId}
            </button>
          ) : null}
        </div>
      </section>

      <GvgMap
        t={t}
        currentDay={currentDay}
        calibrationMode={calibrationMode}
        activeHomeId={activeHomeId}
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