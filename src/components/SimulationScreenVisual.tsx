import { useMemo, useState } from "react";
import type { AppText } from "../i18n";
import type {
  DayNumber,
  HomeAssignment,
  PassState,
  PassStateField,
  RuinState,
  RuinStateField,
  Tribe,
} from "../types";
import GvgMap from "../features/gvg/components/GvgMap";
import { HOME_NODES } from "../features/gvg/data/mapLayout";
import { getPointsPerMinuteByOwner } from "../utils/scoring";

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

type MenuTarget =
  | {
      kind: "home";
      id: string;
      label: string;
      x: number;
      y: number;
    }
  | {
      kind: "pass";
      id: string;
      label: string;
      x: number;
      y: number;
    }
  | {
      kind: "ruin";
      id: string;
      label: string;
      x: number;
      y: number;
    };

function clampMenuPosition(x: number, y: number) {
  const width = typeof window !== "undefined" ? window.innerWidth : 1200;
  const height = typeof window !== "undefined" ? window.innerHeight : 800;

  return {
    x: Math.min(Math.max(170, x), width - 170),
    y: Math.min(Math.max(120, y), height - 180),
  };
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
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);

  const utcDate = currentUtc.toISOString().slice(0, 10);
  const utcTime = currentUtc.toISOString().slice(11, 19);

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

  const passStateById = useMemo(() => {
    return Object.fromEntries(passStates.map((pass) => [pass.id, pass]));
  }, [passStates]);

  const ruinStateById = useMemo(() => {
    return Object.fromEntries(ruinStates.map((ruin) => [ruin.id, ruin]));
  }, [ruinStates]);

  const effectiveRuinStates = useMemo(
    () =>
      ruinStates.map((ruin) => ({
        ...ruin,
        simulatedOwner: ruin.simulatedOwner ?? ruin.currentOwner,
      })),
    [ruinStates]
  );

  const ppmByOwner = useMemo(
    () =>
      getPointsPerMinuteByOwner(
        tribes,
        effectiveRuinStates,
        currentDay,
        "simulatedOwner"
      ),
    [tribes, effectiveRuinStates, currentDay]
  );

  const nodeColorSchemes = useMemo(() => {
    const schemes: Record<string, { primary: string; secondary: string }> = {};

    homeAssignments.forEach((assignment) => {
      if (!assignment.tribeId) {
        return;
      }

      const tribe = tribes.find((item) => item.id === assignment.tribeId);
      if (!tribe) {
        return;
      }

      schemes[assignment.homeId] = {
        primary: tribe.color,
        secondary: tribe.accentColor,
      };
    });

    passStates.forEach((pass) => {
      const owner = pass.simulatedOwner ?? pass.currentOwner;
      if (!owner) {
        return;
      }

      const tribe = tribes.find((item) => item.id === owner);
      if (!tribe) {
        return;
      }

      schemes[pass.id] = {
        primary: tribe.color,
        secondary: tribe.accentColor,
      };
    });

    ruinStates.forEach((ruin) => {
      const owner = ruin.simulatedOwner ?? ruin.currentOwner;
      if (!owner) {
        return;
      }

      const tribe = tribes.find((item) => item.id === owner);
      if (!tribe) {
        return;
      }

      schemes[ruin.id] = {
        primary: tribe.color,
        secondary: tribe.accentColor,
      };
    });

    return schemes;
  }, [homeAssignments, passStates, ruinStates, tribes]);

  const firstCaptureRuinIds = useMemo(
    () =>
      ruinStates
        .filter((ruin) => Boolean(ruin.firstCaptureBy))
        .map((ruin) => ruin.id),
    [ruinStates]
  );

  function openMenu(
    kind: "home" | "pass" | "ruin",
    id: string,
    label: string,
    x: number,
    y: number
  ) {
    const clamped = clampMenuPosition(x, y);

    setMenuTarget({
      kind,
      id,
      label,
      x: clamped.x,
      y: clamped.y,
    });
  }

  function handleHomeClick(homeId: string, anchor: { x: number; y: number }) {
    openMenu(
      "home",
      homeId,
      homeLabelById[homeId] ?? homeId,
      anchor.x,
      anchor.y
    );
  }

  function handlePassClick(passId: string, anchor: { x: number; y: number }) {
    openMenu("pass", passId, passId.toUpperCase(), anchor.x, anchor.y);
  }

  function handleRuinClick(ruinId: string, anchor: { x: number; y: number }) {
    openMenu("ruin", ruinId, ruinId.toUpperCase(), anchor.x, anchor.y);
  }

  function handleMainRuinClick(anchor: { x: number; y: number }) {
    openMenu("ruin", "T1", "T1", anchor.x, anchor.y);
  }

  function handleRuinRightClick(ruinId: string) {
    const ruinState = ruinStateById[ruinId];
    if (!ruinState) {
      return;
    }

    const effectiveOwner = ruinState.simulatedOwner ?? ruinState.currentOwner;
    if (!effectiveOwner) {
      return;
    }

    onRuinChange(
      ruinId,
      "firstCaptureBy",
      ruinState.firstCaptureBy === effectiveOwner ? null : effectiveOwner
    );
  }

  function getMenuValue(): string {
    if (!menuTarget) {
      return "";
    }

    if (menuTarget.kind === "home") {
      return homeAssignmentById[menuTarget.id]?.tribeId ?? "";
    }

    if (menuTarget.kind === "pass") {
      const passState = passStateById[menuTarget.id];
      return passState?.simulatedOwner ?? passState?.currentOwner ?? "";
    }

    const ruinState = ruinStateById[menuTarget.id];
    return ruinState?.simulatedOwner ?? ruinState?.currentOwner ?? "";
  }

  function applyMenuSelection(value: string) {
    if (!menuTarget) {
      return;
    }

    const nextValue = value || null;

    if (menuTarget.kind === "home") {
      onAssignTribeToHome(menuTarget.id, nextValue);
      setMenuTarget(null);
      return;
    }

    if (menuTarget.kind === "pass") {
      onPassChange(menuTarget.id, "simulatedOwner", nextValue);
      setMenuTarget(null);
      return;
    }

    onRuinChange(menuTarget.id, "simulatedOwner", nextValue);
    setMenuTarget(null);
  }

  function toggleFirstCaptureFromMenu() {
    if (!menuTarget || menuTarget.kind !== "ruin") {
      return;
    }

    const ruinState = ruinStateById[menuTarget.id];
    if (!ruinState) {
      return;
    }

    const effectiveOwner = ruinState.simulatedOwner ?? ruinState.currentOwner;
    if (!effectiveOwner) {
      return;
    }

    onRuinChange(
      menuTarget.id,
      "firstCaptureBy",
      ruinState.firstCaptureBy === effectiveOwner ? null : effectiveOwner
    );
  }

  const highlightedNodeId = menuTarget?.id ?? null;

  return (
    <div className="stack" style={{ position: "relative" }}>
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
              Clica diretamente num home, pass ou ruína para escolher a tribo no menu.
              Click direito numa ruína alterna a first capture.
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
            const ppm = ppmByOwner.get(tribe.id) ?? 0;

            return (
              <div
                key={tribe.id}
                className="card"
                style={{
                  padding: "0.9rem 1rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                  }}
                >
                  <span
                    style={{
                      position: "relative",
                      width: 18,
                      height: 18,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 999,
                        background: tribe.color,
                        border: "2px solid rgba(255,255,255,0.9)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        inset: 4,
                        borderRadius: 999,
                        background: tribe.accentColor,
                        border: "1px solid rgba(255,255,255,0.55)",
                      }}
                    />
                  </span>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{tribe.name}</div>
                    <div style={{ opacity: 0.82, fontSize: "0.92rem" }}>
                      {assignedHomeLabel}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "0.7rem",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem",
                    fontSize: "0.92rem",
                  }}
                >
                  <div>
                    <div style={{ opacity: 0.72 }}>Score</div>
                    <strong>{tribe.currentScore.toLocaleString()}</strong>
                  </div>
                  <div>
                    <div style={{ opacity: 0.72 }}>PPM</div>
                    <strong>{ppm.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <GvgMap
        t={t}
        currentDay={currentDay}
        calibrationMode={calibrationMode}
        highlightedNodeId={highlightedNodeId}
        nodeColorSchemes={nodeColorSchemes}
        firstCaptureRuinIds={firstCaptureRuinIds}
        onHomeClick={handleHomeClick}
        onPassClick={handlePassClick}
        onRuinClick={handleRuinClick}
        onMainRuinClick={handleMainRuinClick}
        onRuinRightClick={handleRuinRightClick}
      />

      {menuTarget ? (
        <div
          style={{
            position: "fixed",
            left: menuTarget.x,
            top: menuTarget.y,
            transform: "translate(-50%, 8px)",
            zIndex: 50,
            width: 320,
            maxWidth: "calc(100vw - 24px)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(7,18,54,0.96)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.42)",
            padding: "0.95rem",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              alignItems: "start",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{menuTarget.label}</div>
              <div style={{ opacity: 0.75, fontSize: "0.92rem" }}>
                {menuTarget.kind === "home"
                  ? "Atribuição de home"
                  : menuTarget.kind === "pass"
                  ? "Owner da pass"
                  : "Owner da ruína"}
              </div>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setMenuTarget(null)}
            >
              Fechar
            </button>
          </div>

          <label className="field">
            <span>
              {menuTarget.kind === "home" ? "Tribo atribuída" : "Owner"}
            </span>
            <select
              value={getMenuValue()}
              onChange={(event) => applyMenuSelection(event.target.value)}
            >
              <option value="">
                {menuTarget.kind === "home" ? "Sem tribo" : "Neutro"}
              </option>
              {tribes.map((tribe) => (
                <option key={tribe.id} value={tribe.id}>
                  {tribe.name}
                </option>
              ))}
            </select>
          </label>

          {menuTarget.kind === "ruin" ? (
            <div style={{ marginTop: "0.8rem" }}>
              <button
                type="button"
                className="secondary-button"
                onClick={toggleFirstCaptureFromMenu}
              >
                Alternar first capture
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

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