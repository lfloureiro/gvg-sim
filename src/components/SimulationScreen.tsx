import { useMemo } from "react";
import { RUIN_DEFINITIONS } from "../constants";
import {
  getFirstCaptureTotals,
  projectScenario,
} from "../utils/scoring";
import type {
  DayNumber,
  RuinState,
  RuinStateField,
  Tribe,
} from "../types";
import RuinTable from "./RuinTable";

type SimulationScreenProps = {
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

export default function SimulationScreen({
  tribes,
  currentDay,
  currentUtc,
  ruinStates,
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

  const firstCaptureTotals = useMemo(
    () => getFirstCaptureTotals(tribes, ruinStates),
    [tribes, ruinStates]
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
        <div className="phoenix-banner phoenix-banner-compact">
          <div className="phoenix-banner-inner">
            <p className="phoenix-kicker">PHOENIX VERITAS</p>
            <h1 className="phoenix-title">GvG End of Day 3 Projection</h1>
            <p className="phoenix-subtitle">
              Current state versus simulated state if changes happen now.
            </p>
          </div>
        </div>

        <div className="card-header">
          <div>
            <p className="eyebrow">Ruins and final projection</p>
            <h1>Day 3 finish</h1>
          </div>
          <div className="inline-actions">
            <button className="secondary-button" onClick={onBack}>
              Back
            </button>
            <button
              className="secondary-button"
              onClick={onCopyCurrentToScenario}
            >
              Copy current to simulation
            </button>
          </div>
        </div>

        <div className="top-grid">
          <label className="field">
            <span>Current day</span>
            <select
              value={currentDay}
              onChange={(event) =>
                onCurrentDayChange(Number(event.target.value) as DayNumber)
              }
            >
              <option value={1}>Day 1</option>
              <option value={2}>Day 2</option>
              <option value={3}>Day 3</option>
            </select>
          </label>

          <div className="info-box">
            <span className="info-label">Current GMT time</span>
            <strong>
              {utcDate} {utcTime} GMT
            </strong>
          </div>

          <div className="info-box">
            <span className="info-label">Minutes remaining to the end</span>
            <strong>{numberFormatter.format(totalMinutesRemaining)}</strong>
          </div>
        </div>

        <div className="note-box">
          <strong>How to read the final table:</strong>
          <br />
          First-capture points = total bonus from first captures already marked.
          <br />
          Final if unchanged = current score + remaining points if nothing changes.
          <br />
          Final simulated = current score + remaining points if the simulated state starts now.
        </div>
      </section>

      <RuinTable
        title="Bastions"
        ruins={bastions}
        ruinStateMap={ruinStateMap}
        tribes={tribes}
        onChange={onRuinChange}
      />

      <RuinTable
        title="Valkyries"
        ruins={valkyries}
        ruinStateMap={ruinStateMap}
        tribes={tribes}
        onChange={onRuinChange}
      />

      <RuinTable
        title="Temple"
        ruins={temples}
        ruinStateMap={ruinStateMap}
        tribes={tribes}
        onChange={onRuinChange}
      />

      <section className="card">
        <div className="card-header">
          <div>
            <h2>Final summary</h2>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tribe</th>
                <th>First-capture points</th>
                <th>Current score</th>
                <th>Final if unchanged</th>
                <th>Final simulated</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {tribes.map((tribe) => {
                const firstCaptureInitial =
                  firstCaptureTotals.get(tribe.id) ?? 0;
                const currentFinal =
                  currentProjectionMap[tribe.id]?.finalScore ??
                  tribe.currentScore;
                const simulatedFinal =
                  simulatedProjectionMap[tribe.id]?.finalScore ??
                  tribe.currentScore;
                const delta = simulatedFinal - currentFinal;
                const featured = isPhoenixVeritas(tribe.name);

                return (
                  <tr
                    key={tribe.id}
                    className={featured ? "featured-table-row" : ""}
                  >
                    <td className={`tribe-name-cell ${featured ? "featured-name" : ""}`}>
                      {tribe.name}
                    </td>
                    <td>{numberFormatter.format(firstCaptureInitial)}</td>
                    <td>{numberFormatter.format(tribe.currentScore)}</td>
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
    </div>
  );
}