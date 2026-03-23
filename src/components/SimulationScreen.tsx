import { useMemo } from "react";
import { LANGUAGE_OPTIONS } from "../i18n";
import type { AppText } from "../i18n";
import { RUIN_DEFINITIONS } from "../constants";
import {
  buildScenarioTimeline,
  projectScenario,
} from "../utils/scoring";
import type {
  DayNumber,
  Language,
  RuinState,
  RuinStateField,
  Tribe,
  ScenarioTimelinePoint,
} from "../types";
import {
  APP_VERSION_STRING,
  PHOENIX_MOTTO,
  PHOENIX_TITLE,
} from "../version";
import RuinTable from "./RuinTable";

type SimulationScreenProps = {
  language: Language;
  t: AppText;
  tribes: Tribe[];
  currentDay: DayNumber;
  currentUtc: Date;
  ruinStates: RuinState[];
  onLanguageChange: (language: Language) => void;
  onCurrentDayChange: (day: DayNumber) => void;
  onRuinChange: (
    ruinId: string,
    field: RuinStateField,
    value: string | null
  ) => void;
  onCopyCurrentToScenario: () => void;
  onBack: () => void;
};

const numberFormatter = new Intl.NumberFormat("en-GB");

function formatSigned(value: number): string {
  if (value > 0) {
    return `+${numberFormatter.format(value)}`;
  }

  if (value < 0) {
    return `-${numberFormatter.format(Math.abs(value))}`;
  }

  return numberFormatter.format(0);
}

function isPhoenixVeritas(name: string): boolean {
  return name.trim().toLowerCase() === "phoenix veritas";
}

function ScoreEvolutionChart({
  tribes,
  timeline,
  t,
}: {
  tribes: Tribe[];
  timeline: ScenarioTimelinePoint[];
  t: AppText;
}) {
  const width = 920;
  const height = 360;
  const left = 72;
  const right = 28;
  const top = 24;
  const bottom = 48;

  const allValues = timeline.flatMap((point) =>
    tribes.map((tribe) => point.scores[tribe.id] ?? 0)
  );

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const span = Math.max(1, rawMax - rawMin);
  const minValue = Math.max(0, rawMin - span * 0.08);
  const maxValue = rawMax + span * 0.08;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  function getX(index: number): number {
    if (timeline.length <= 1) {
      return left;
    }

    return left + (index * plotWidth) / (timeline.length - 1);
  }

  function getY(value: number): number {
    if (maxValue === minValue) {
      return top + plotHeight / 2;
    }

    return top + ((maxValue - value) / (maxValue - minValue)) * plotHeight;
  }

  function buildPath(tribeId: string): string {
    return timeline
      .map((point, index) => {
        const x = getX(index);
        const y = getY(point.scores[tribeId] ?? 0);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }

  const horizontalGridValues = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    return maxValue - (maxValue - minValue) * ratio;
  });

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{t.simulation.simulatedScoreEvolution}</h2>
          <p className="phoenix-subtitle">
            {t.simulation.simulatedScoreEvolutionSubtitle}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.9rem",
          marginBottom: "1rem",
        }}
      >
        {tribes.map((tribe) => (
          <div
            key={tribe.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.95rem",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "999px",
                backgroundColor: tribe.color,
                display: "inline-block",
              }}
            />
            <span>{tribe.name}</span>
          </div>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", minWidth: 760, display: "block" }}
        >
          {horizontalGridValues.map((value, index) => {
            const y = getY(value);

            return (
              <g key={index}>
                <line
                  x1={left}
                  y1={y}
                  x2={width - right}
                  y2={y}
                  stroke="rgba(255,255,255,0.12)"
                />
                <text
                  x={left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="rgba(255,255,255,0.75)"
                >
                  {numberFormatter.format(Math.round(value))}
                </text>
              </g>
            );
          })}

          <line
            x1={left}
            y1={top}
            x2={left}
            y2={height - bottom}
            stroke="rgba(255,255,255,0.25)"
          />
          <line
            x1={left}
            y1={height - bottom}
            x2={width - right}
            y2={height - bottom}
            stroke="rgba(255,255,255,0.25)"
          />

          {timeline.map((point, index) => {
            const x = getX(index);

            return (
              <text
                key={point.label}
                x={x}
                y={height - 18}
                textAnchor="middle"
                fontSize="12"
                fill="rgba(255,255,255,0.75)"
              >
                {point.label}
              </text>
            );
          })}

          {tribes.map((tribe) => (
            <g key={tribe.id}>
              <path
                d={buildPath(tribe.id)}
                fill="none"
                stroke={tribe.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {timeline.map((point, index) => (
                <circle
                  key={`${tribe.id}-${point.label}`}
                  cx={getX(index)}
                  cy={getY(point.scores[tribe.id] ?? 0)}
                  r={4}
                  fill={tribe.color}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

export default function SimulationScreen({
  language,
  t,
  tribes,
  currentDay,
  currentUtc,
  ruinStates,
  onLanguageChange,
  onCurrentDayChange,
  onRuinChange,
  onCopyCurrentToScenario,
  onBack,
}: SimulationScreenProps) {
  const ruinStateMap = useMemo<Record<string, RuinState>>(
    () =>
      Object.fromEntries(
        ruinStates.map((ruinState) => [ruinState.id, ruinState])
      ),
    [ruinStates]
  );

  const bastions = useMemo(
    () => RUIN_DEFINITIONS.filter((ruin) => ruin.type === "bastion"),
    []
  );
  const valkyries = useMemo(
    () => RUIN_DEFINITIONS.filter((ruin) => ruin.type === "valkyrie"),
    []
  );
  const temples = useMemo(
    () => RUIN_DEFINITIONS.filter((ruin) => ruin.type === "temple"),
    []
  );

  const currentProjection = useMemo(
    () =>
      projectScenario({
        tribes,
        ruinStates,
        currentDay,
        now: currentUtc,
        ownerField: "currentOwner",
      }),
    [tribes, ruinStates, currentDay, currentUtc]
  );

  const simulatedProjection = useMemo(
    () =>
      projectScenario({
        tribes,
        ruinStates,
        currentDay,
        now: currentUtc,
        ownerField: "simulatedOwner",
      }),
    [tribes, ruinStates, currentDay, currentUtc]
  );

  const simulatedTimeline = useMemo(
    () =>
      buildScenarioTimeline({
        tribes,
        ruinStates,
        currentDay,
        now: currentUtc,
        ownerField: "simulatedOwner",
      }),
    [tribes, ruinStates, currentDay, currentUtc]
  );

  const currentProjectionMap = useMemo(
    () =>
      Object.fromEntries(
        currentProjection.rows.map((row) => [row.tribeId, row])
      ),
    [currentProjection.rows]
  );

  const simulatedProjectionMap = useMemo(
    () =>
      Object.fromEntries(
        simulatedProjection.rows.map((row) => [row.tribeId, row])
      ),
    [simulatedProjection.rows]
  );

  const minutesRemainingByDay = currentProjection.minutesRemainingByDay;
  const totalMinutesRemaining =
    minutesRemainingByDay[1] +
    minutesRemainingByDay[2] +
    minutesRemainingByDay[3];

  const utcDate = currentUtc.toISOString().slice(0, 10);
  const utcTime = currentUtc.toISOString().slice(11, 19);

  return (
    <div className="stack">
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
            <p className="phoenix-kicker">{PHOENIX_TITLE}</p>
            <h1 className="phoenix-title">{t.simulation.title}</h1>
            <p className="phoenix-subtitle">{t.simulation.subtitle}</p>

            <div
              style={{
                marginTop: "0.7rem",
                display: "flex",
                gap: "0.8rem",
                flexWrap: "wrap",
                alignItems: "end",
              }}
            >
              <label className="field" style={{ minWidth: 180 }}>
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
                  paddingBottom: "0.75rem",
                }}
              >
                {t.common.version} {APP_VERSION_STRING}
              </div>
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

        <div className="card-header">
          <div>
            <p className="eyebrow">{t.simulation.eyebrow}</p>
            <h1>{t.simulation.day3Finish}</h1>
          </div>
          <div className="inline-actions">
            <button className="secondary-button" onClick={onBack}>
              {t.common.back}
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

          <div className="info-box">
            <span className="info-label">
              {t.common.minutesRemainingToTheEnd}
            </span>
            <strong>{numberFormatter.format(totalMinutesRemaining)}</strong>
          </div>
        </div>

        <div className="note-box">
          <strong>{t.simulation.howToRead}</strong>
          <br />
          {t.simulation.noteLine1}
          <br />
          {t.simulation.noteLine2}
          <br />
          {t.simulation.noteLine3}
        </div>
      </section>

      <RuinTable
        title={t.simulation.bastions}
        t={t}
        ruins={bastions}
        ruinStateMap={ruinStateMap}
        tribes={tribes}
        onChange={onRuinChange}
      />

      <RuinTable
        title={t.simulation.valkyries}
        t={t}
        ruins={valkyries}
        ruinStateMap={ruinStateMap}
        tribes={tribes}
        onChange={onRuinChange}
      />

      <RuinTable
        title={t.simulation.temple}
        t={t}
        ruins={temples}
        ruinStateMap={ruinStateMap}
        tribes={tribes}
        onChange={onRuinChange}
      />

      <section className="card">
        <div className="card-header">
          <div>
            <h2>{t.simulation.finalSummary}</h2>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.common.tribe}</th>
                <th>{t.common.currentPoints}</th>
                <th>{t.common.firstCapture}</th>
                <th>{t.common.pointsPerMinute}</th>
                <th>{t.common.finalIfUnchanged}</th>
                <th>{t.common.finalSimulated}</th>
                <th>{t.common.difference}</th>
              </tr>
            </thead>
            <tbody>
              {tribes.map((tribe) => {
                const currentRow = currentProjectionMap[tribe.id];
                const simulatedRow = simulatedProjectionMap[tribe.id];

                const pendingFirstCapture =
                  simulatedRow?.pendingFirstCapture ?? 0;
                const currentFinal =
                  currentRow?.finalScore ?? tribe.currentScore;
                const simulatedFinal =
                  simulatedRow?.finalScore ?? tribe.currentScore;
                const pointsPerMinute =
                  simulatedRow?.pointsPerMinute ?? 0;
                const delta = simulatedFinal - currentFinal;
                const featured = isPhoenixVeritas(tribe.name);

                return (
                  <tr
                    key={tribe.id}
                    className={featured ? "featured-table-row" : ""}
                  >
                    <td
                      className={`tribe-name-cell ${
                        featured ? "featured-name" : ""
                      }`}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          borderRadius: "999px",
                          backgroundColor: tribe.color,
                          marginRight: 8,
                        }}
                      />
                      {tribe.name}
                    </td>
                    <td>{numberFormatter.format(tribe.currentScore)}</td>
                    <td>{numberFormatter.format(pendingFirstCapture)}</td>
                    <td>{numberFormatter.format(pointsPerMinute)}</td>
                    <td>{numberFormatter.format(currentFinal)}</td>
                    <td className="total-cell">
                      {numberFormatter.format(simulatedFinal)}
                    </td>
                    <td
                      className={
                        delta > 0
                          ? "delta-positive"
                          : delta < 0
                          ? "delta-negative"
                          : "delta-neutral"
                      }
                    >
                      {formatSigned(delta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <ScoreEvolutionChart tribes={tribes} timeline={simulatedTimeline} t={t} />
    </div>
  );
}