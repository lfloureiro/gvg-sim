import { useMemo, useState } from "react";
import BrandBanner from "./BrandBanner";
import type { AppText } from "../i18n";
import type {
  DayNumber,
  HomeAssignment,
  OrderId,
  PassState,
  PassStateField,
  RuinState,
  RuinStateField,
  ScenarioProjectionRow,
  ScenarioTimelinePoint,
  Tribe,
  TribeSlot,
} from "../types";
import GvgMap from "../features/gvg/components/GvgMap";
import { HOME_NODES } from "../features/gvg/data/mapLayout";
import {
  buildScenarioTimeline,
  getPointsPerMinuteByOwner,
  projectScenario,
} from "../utils/scoring";

type SimulationScreenVisualProps = {
  t: AppText;
  tribeSlots: TribeSlot[];
  currentDay: DayNumber;
  currentUtc: Date;
  homeAssignments: HomeAssignment[];
  passStates: PassState[];
  ruinStates: RuinState[];
  onCurrentDayChange: (day: DayNumber) => void;
  onTribeNameChange: (index: number, value: string) => void;
  onTribeEnabledChange: (index: number, value: boolean) => void;
  onTribeOrderChange: (index: number, value: OrderId | null) => void;
  onCurrentScoreChange: (index: number, value: number) => void;
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
  onResetSimulation: () => void;
  onSwitchToTableMode: () => void;
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

type ChartSeries = {
  id: string;
  label: string;
  color: string;
  accentColor: string;
};

function clampMenuPosition(x: number, y: number) {
  const width = typeof window !== "undefined" ? window.innerWidth : 1200;
  const height = typeof window !== "undefined" ? window.innerHeight : 800;

  return {
    x: Math.min(Math.max(180, x), width - 180),
    y: Math.min(Math.max(120, y), height - 180),
  };
}

function formatInt(value: number): string {
  return Math.round(value).toLocaleString("pt-PT");
}

function getHomeLabelByIdMap() {
  return Object.fromEntries(HOME_NODES.map((home) => [home.id, home.label]));
}

function GenericTrendChart({
  title,
  timeline,
  series,
}: {
  title: string;
  timeline: ScenarioTimelinePoint[];
  series: ChartSeries[];
}) {
  if (series.length === 0 || timeline.length === 0) {
    return null;
  }

  const width = 760;
  const height = 300;
  const marginTop = 26;
  const marginRight = 120;
  const marginBottom = 42;
  const marginLeft = 64;

  const innerWidth = width - marginLeft - marginRight;
  const innerHeight = height - marginTop - marginBottom;

  const maxScore = Math.max(
    1,
    ...timeline.flatMap((point) =>
      series.map((item) => point.scores[item.id] ?? 0)
    )
  );

  const xAt = (index: number) =>
    marginLeft +
    (timeline.length === 1
      ? innerWidth / 2
      : (innerWidth * index) / (timeline.length - 1));

  const yAt = (score: number) =>
    marginTop + innerHeight - (score / maxScore) * innerHeight;

  const yTicks = 5;
  const tickValues = Array.from({ length: yTicks }, (_, index) =>
    Math.round((maxScore * (yTicks - 1 - index)) / (yTicks - 1))
  );

  const rawEndLabels = series.map((item) => {
    const lastScore = timeline[timeline.length - 1]?.scores[item.id] ?? 0;
    return {
      ...item,
      x: xAt(timeline.length - 1),
      y: yAt(lastScore),
    };
  });

  const endLabels = [...rawEndLabels]
    .sort((a, b) => a.y - b.y)
    .map((item, index, arr) => {
      if (index === 0) {
        return item;
      }

      const minGap = 16;
      const previous = arr[index - 1];
      const adjustedY =
        item.y - previous.y < minGap ? previous.y + minGap : item.y;

      return {
        ...item,
        y: adjustedY,
      };
    });

  return (
    <div
      style={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.02)",
        padding: "0.45rem",
      }}
    >
      <div
        style={{
          padding: "0.1rem 0.35rem 0.55rem 0.35rem",
          fontWeight: 700,
          fontSize: "0.95rem",
        }}
      >
        {title}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="auto"
        role="img"
        aria-label={title}
      >
        {tickValues.map((tickValue) => {
          const y = yAt(tickValue);

          return (
            <g key={tickValue}>
              <line
                x1={marginLeft}
                y1={y}
                x2={width - marginRight}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <text
                x={marginLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="rgba(255,255,255,0.72)"
              >
                {formatInt(tickValue)}
              </text>
            </g>
          );
        })}

        {timeline.map((point, index) => {
          const x = xAt(index);

          return (
            <text
              key={point.label}
              x={x}
              y={height - 12}
              textAnchor="middle"
              fontSize="11"
              fill="rgba(255,255,255,0.76)"
            >
              {point.label}
            </text>
          );
        })}

        {series.map((item) => {
          const points = timeline
            .map((point, index) => {
              const x = xAt(index);
              const y = yAt(point.scores[item.id] ?? 0);
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <g key={item.id}>
              <polyline
                points={points}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {timeline.map((point, index) => {
                const x = xAt(index);
                const y = yAt(point.scores[item.id] ?? 0);

                return (
                  <circle
                    key={`${item.id}-${point.label}`}
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill={item.accentColor}
                    stroke={item.color}
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          );
        })}

        {endLabels.map((item) => (
          <g key={`label-${item.id}`}>
            <line
              x1={item.x}
              y1={item.y}
              x2={item.x + 10}
              y2={item.y}
              stroke={item.color}
              strokeWidth="2"
            />
            <text
              x={item.x + 14}
              y={item.y + 4}
              fontSize="12"
              fontWeight="700"
              fill={item.color}
            >
              {item.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function SimulationScreenVisual({
  t,
  tribeSlots,
  currentDay,
  currentUtc,
  homeAssignments,
  passStates,
  ruinStates,
  onCurrentDayChange,
  onTribeNameChange,
  onTribeEnabledChange,
  onTribeOrderChange,
  onCurrentScoreChange,
  onAssignTribeToHome,
  onPassChange,
  onRuinChange,
  onResetSimulation,
  onSwitchToTableMode,
}: SimulationScreenVisualProps) {
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);

  const activeTribes = useMemo<Tribe[]>(
    () =>
      tribeSlots
        .filter((slot) => slot.enabled)
        .map(({ slotIndex: _slotIndex, enabled: _enabled, ...tribe }) => tribe),
    [tribeSlots]
  );

  const utcDate = currentUtc.toISOString().slice(0, 10);
  const utcTime = currentUtc.toISOString().slice(11, 19);

  const homeAssignmentById = useMemo(
    () =>
      Object.fromEntries(
        homeAssignments.map((assignment) => [assignment.homeId, assignment])
      ),
    [homeAssignments]
  );

  const unusedHomeIds = useMemo(
    () =>
      homeAssignments
        .filter((assignment) => !assignment.tribeId)
        .map((assignment) => assignment.homeId),
    [homeAssignments]
  );

  const passStateById = useMemo(
    () => Object.fromEntries(passStates.map((pass) => [pass.id, pass])),
    [passStates]
  );

  const ruinStateById = useMemo(
    () => Object.fromEntries(ruinStates.map((ruin) => [ruin.id, ruin])),
    [ruinStates]
  );

  const effectiveRuinStates = useMemo(
    () =>
      ruinStates.map((ruin) => ({
        ...ruin,
        simulatedOwner: ruin.simulatedOwner ?? ruin.currentOwner,
      })),
    [ruinStates]
  );

  const pointsPerMinuteByOwner = useMemo(
    () =>
      getPointsPerMinuteByOwner(
        activeTribes,
        effectiveRuinStates,
        currentDay,
        "simulatedOwner"
      ),
    [activeTribes, effectiveRuinStates, currentDay]
  );

  const projection = useMemo(
    () =>
      projectScenario({
        tribes: activeTribes,
        ruinStates: effectiveRuinStates,
        currentDay,
        ownerField: "simulatedOwner",
        now: currentUtc,
      }),
    [activeTribes, effectiveRuinStates, currentDay, currentUtc]
  );

  const timeline = useMemo(
    () =>
      buildScenarioTimeline({
        tribes: activeTribes,
        ruinStates: effectiveRuinStates,
        currentDay,
        ownerField: "simulatedOwner",
        now: currentUtc,
      }),
    [activeTribes, effectiveRuinStates, currentDay, currentUtc]
  );

  const orderTimeline = useMemo(() => {
    const tribeOrderById = new Map(
      tribeSlots
        .filter((slot) => slot.enabled && slot.orderId)
        .map((slot) => [slot.id, slot.orderId as OrderId])
    );

    return timeline.map((point) => {
      let orderA = 0;
      let orderB = 0;

      Object.entries(point.scores).forEach(([tribeId, score]) => {
        const orderId = tribeOrderById.get(tribeId);
        if (orderId === "order-a") {
          orderA += score;
        } else if (orderId === "order-b") {
          orderB += score;
        }
      });

      return {
        label: point.label,
        scores: {
          "order-a": orderA,
          "order-b": orderB,
        },
      };
    });
  }, [timeline, tribeSlots]);

  const orderSeries = useMemo(() => {
    const hasOrderA = tribeSlots.some(
      (slot) => slot.enabled && slot.orderId === "order-a"
    );
    const hasOrderB = tribeSlots.some(
      (slot) => slot.enabled && slot.orderId === "order-b"
    );

    const result: ChartSeries[] = [];

    if (hasOrderA) {
      result.push({
        id: "order-a",
        label: "Chaos",
        color: "#ff1e00f6",
        accentColor: "#ff8282fa",
      });
    }

    if (hasOrderB) {
      result.push({
        id: "order-b",
        label: "Order",
        color: "#29b6f6",
        accentColor: "#81d4fa",
      });
    }

    return result;
  }, [tribeSlots]);

  const projectionRowById = useMemo(
    () =>
      new Map<string, ScenarioProjectionRow>(
        projection.rows.map((row) => [row.tribeId, row])
      ),
    [projection.rows]
  );

  const rankedProjectionRows = useMemo(
    () => [...projection.rows].sort((a, b) => b.finalScore - a.finalScore),
    [projection.rows]
  );

  const nodeColorSchemes = useMemo(() => {
    const schemes: Record<string, { primary: string; secondary: string }> = {};

    homeAssignments.forEach((assignment) => {
      if (!assignment.tribeId) {
        return;
      }

      const tribe = activeTribes.find((item) => item.id === assignment.tribeId);
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

      const tribe = activeTribes.find((item) => item.id === owner);
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

      const tribe = activeTribes.find((item) => item.id === owner);
      if (!tribe) {
        return;
      }

      schemes[ruin.id] = {
        primary: tribe.color,
        secondary: tribe.accentColor,
      };
    });

    return schemes;
  }, [homeAssignments, passStates, ruinStates, activeTribes]);

  const firstCaptureRuinIds = useMemo(
    () =>
      ruinStates
        .filter((ruin) => Boolean(ruin.firstCaptureBy))
        .map((ruin) => ruin.id),
    [ruinStates]
  );

  const homeLabelById = useMemo(() => getHomeLabelByIdMap(), []);

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

  return (
    <div className="stack" style={{ position: "relative" }}>
      <BrandBanner
        eyebrow={t.simulationVisual.eyebrow}
        title={t.simulationVisual.title}
        subtitle={t.simulationVisual.subtitle}
      />
      <section className="card">
        <div className="card-header">
          <div>
            <p className="eyebrow">{t.simulationVisual.eyebrow}</p>
            <h1>{t.simulationVisual.title}</h1>
            <p className="phoenix-subtitle">{t.simulationVisual.subtitle}</p>
          </div>

          <div className="inline-actions">
            <button
              className="secondary-button"
              onClick={() => setCalibrationMode((prev) => !prev)}
            >
              {calibrationMode
                ? t.simulationVisual.calibrationOff
                : t.simulationVisual.calibrationOn}
            </button>

            <button className="secondary-button" onClick={onResetSimulation}>
              {t.common.reset}
            </button>

            <button
              className="secondary-button"
              onClick={onSwitchToTableMode}
            >
              {t.common.switchToTableMode}
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
            <h2>{t.common.tribes}</h2>
            <p className="phoenix-subtitle" style={{ marginTop: 4 }}>
              Homes sem tribo ficam esbatidos. O seletor de Order já fica pronto
              para a próxima fase.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
            gap: "0.7rem",
          }}
        >
          {tribeSlots.map((slot) => {
            const ppm = pointsPerMinuteByOwner.get(slot.id) ?? 0;
            const finalProjected =
              projectionRowById.get(slot.id)?.finalScore ?? slot.currentScore;

            return (
              <div
                key={slot.id}
                className="card"
                style={{
                  padding: "0.7rem 0.8rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  opacity: slot.enabled ? 1 : 0.5,
                  minHeight: 0,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "18px minmax(0,1fr) auto",
                    gap: "0.5rem",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      position: "relative",
                      width: 18,
                      height: 18,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 999,
                        background: slot.color,
                        border: "2px solid rgba(255,255,255,0.9)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        inset: 4,
                        borderRadius: 999,
                        background: slot.accentColor,
                        border: "1px solid rgba(255,255,255,0.55)",
                      }}
                    />
                  </span>

                  <input
                    type="text"
                    value={slot.name}
                    onChange={(event) =>
                      onTribeNameChange(slot.slotIndex, event.target.value)
                    }
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.06)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      padding: "0.38rem 0.54rem",
                      minWidth: 0,
                    }}
                  />

                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.72rem",
                    }}
                  >
                    <span>Jogo</span>
                    <input
                      type="checkbox"
                      checked={slot.enabled}
                      onChange={(event) =>
                        onTribeEnabledChange(slot.slotIndex, event.target.checked)
                      }
                      style={{ width: 16, height: 16 }}
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "0.5rem",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span style={{ opacity: 0.72, fontSize: "0.76rem" }}>
                      Score
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={slot.currentScore}
                      onChange={(event) =>
                        onCurrentScoreChange(
                          slot.slotIndex,
                          Number(event.target.value) || 0
                        )
                      }
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.06)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 10,
                        padding: "0.35rem 0.52rem",
                      }}
                    />
                  </label>

                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      minWidth: 94,
                    }}
                  >
                    <span style={{ opacity: 0.72, fontSize: "0.76rem" }}>
                      Order
                    </span>
                    <select
                      value={slot.orderId ?? ""}
                      onChange={(event) =>
                        onTribeOrderChange(
                          slot.slotIndex,
                          (event.target.value as OrderId) || null
                        )
                      }
                      style={{
                        background: "rgba(18,31,74,0.98)",
                        color: "#ffffff",
                        border: "1px solid rgba(255,255,255,0.16)",
                        borderRadius: 10,
                        padding: "0.35rem 0.45rem",
                      }}
                    >
                      <option
                        value=""
                        style={{ background: "#0b1e56", color: "#fff" }}
                      >
                        —
                      </option>
                      <option
                        value="order-a"
                        style={{ background: "#0b1e56", color: "#fff" }}
                      >
                        Chaos
                      </option>
                      <option
                        value="order-b"
                        style={{ background: "#0b1e56", color: "#fff" }}
                      >
                        Order
                      </option>
                    </select>
                  </label>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.45rem 0.7rem",
                    fontSize: "0.84rem",
                  }}
                >
                  <div>
                    <div style={{ opacity: 0.68 }}>PPM</div>
                    <strong>{formatInt(ppm)}</strong>
                  </div>
                  <div>
                    <div style={{ opacity: 0.68 }}>Final</div>
                    <strong>{formatInt(finalProjected)}</strong>
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
        highlightedNodeId={menuTarget?.id ?? null}
        nodeColorSchemes={nodeColorSchemes}
        firstCaptureRuinIds={firstCaptureRuinIds}
        unusedHomeIds={unusedHomeIds}
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
              style={{
                background: "rgba(18,31,74,0.98)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              <option
                value=""
                style={{ background: "#0b1e56", color: "#fff" }}
              >
                {menuTarget.kind === "home" ? "Sem tribo" : "Neutro"}
              </option>
              {activeTribes.map((tribe) => (
                <option
                  key={tribe.id}
                  value={tribe.id}
                  style={{ background: "#0b1e56", color: "#fff" }}
                >
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
            <h2>Previsão do cenário</h2>
            <p className="phoenix-subtitle" style={{ marginTop: 4 }}>
              Tabela mais compacta e dois gráficos à direita.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 0.92fr) minmax(500px, 1.08fr)",
            gap: "0.95rem",
            alignItems: "start",
          }}
        >
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 18,
              overflow: "hidden",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "42px minmax(150px, 1.45fr) repeat(5, minmax(68px, 0.82fr))",
                gap: 0,
                padding: "0.62rem 0.68rem",
                background: "rgba(255,255,255,0.03)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              <div>#</div>
              <div style={{ textAlign: "left" }}>Tribo</div>
              <div>Atual</div>
              <div>1st</div>
              <div>PPM</div>
              <div>Prod.</div>
              <div>Final</div>
            </div>

            {rankedProjectionRows.map((row, index) => {
              const tribe = activeTribes.find((item) => item.id === row.tribeId);

              return (
                <div
                  key={row.tribeId}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "42px minmax(150px, 1.45fr) repeat(5, minmax(68px, 0.82fr))",
                    gap: 0,
                    padding: "0.56rem 0.68rem",
                    borderBottom:
                      index === rankedProjectionRows.length - 1
                        ? "none"
                        : "1px solid rgba(255,255,255,0.06)",
                    textAlign: "center",
                    alignItems: "center",
                    fontSize: "0.93rem",
                  }}
                >
                  <div>{index + 1}</div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                      textAlign: "left",
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 999,
                          background: tribe?.color ?? "#9ca3af",
                          border: "2px solid rgba(255,255,255,0.9)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          inset: 4,
                          borderRadius: 999,
                          background: tribe?.accentColor ?? "#e5e7eb",
                        }}
                      />
                    </span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.tribeName}
                    </span>
                  </div>

                  <div>{formatInt(row.currentScore)}</div>
                  <div>{formatInt(row.pendingFirstCapture)}</div>
                  <div>{formatInt(row.pointsPerMinute)}</div>
                  <div>{formatInt(row.addedProduction)}</div>
                  <div>
                    <strong>{formatInt(row.finalScore)}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "grid",
              gap: "0.85rem",
            }}
          >
            <GenericTrendChart
              title="Evolução por tribo"
              timeline={timeline}
              series={tribeSlots
                .filter((slot) => slot.enabled)
                .map((slot) => ({
                  id: slot.id,
                  label: slot.name,
                  color: slot.color,
                  accentColor: slot.accentColor,
                }))}
            />

            {orderSeries.length > 0 ? (
              <GenericTrendChart
                title="Evolução por Order"
                timeline={orderTimeline}
                series={orderSeries}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}