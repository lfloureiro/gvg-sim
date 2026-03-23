import {
  RUIN_DEFINITIONS,
  RUIN_FIRST_CAPTURE_POINTS,
  RUIN_MINUTE_RATES,
} from "../constants";
import type {
  DayNumber,
  ScenarioOwnerField,
  ScenarioProjectionResult,
  ScenarioTimelinePoint,
  RuinState,
  Tribe,
} from "../types";

const ruinDefinitionMap = new Map(
  RUIN_DEFINITIONS.map((ruin) => [ruin.id, ruin])
);

export function buildInitialRuinStates(): RuinState[] {
  return RUIN_DEFINITIONS.map((ruin) => ({
    id: ruin.id,
    firstCaptureBy: null,
    currentOwner: null,
    simulatedOwner: null,
  }));
}

export function getMinutesRemainingByDay(
  currentDay: DayNumber,
  now: Date = new Date()
): Record<DayNumber, number> {
  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );

  const minutesLeftToday = Math.max(
    0,
    Math.floor((nextUtcMidnight - now.getTime()) / 60000)
  );

  const result: Record<DayNumber, number> = {
    1: 0,
    2: 0,
    3: 0,
  };

  result[currentDay] = minutesLeftToday;

  for (let day = currentDay + 1; day <= 3; day += 1) {
    result[day as DayNumber] = 1440;
  }

  return result;
}

export function getFirstCaptureTotals(
  tribes: Tribe[],
  ruinStates: RuinState[]
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const tribe of tribes) {
    totals.set(tribe.id, 0);
  }

  for (const ruinState of ruinStates) {
    if (!ruinState.firstCaptureBy) {
      continue;
    }

    const ruinDefinition = ruinDefinitionMap.get(ruinState.id);
    if (!ruinDefinition) {
      continue;
    }

    const current = totals.get(ruinState.firstCaptureBy) ?? 0;
    totals.set(
      ruinState.firstCaptureBy,
      current + RUIN_FIRST_CAPTURE_POINTS[ruinDefinition.type]
    );
  }

  return totals;
}

export function getPointsPerMinuteByOwner(
  tribes: Tribe[],
  ruinStates: RuinState[],
  currentDay: DayNumber,
  ownerField: ScenarioOwnerField
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const tribe of tribes) {
    totals.set(tribe.id, 0);
  }

  for (const ruinState of ruinStates) {
    const ruinDefinition = ruinDefinitionMap.get(ruinState.id);
    if (!ruinDefinition) {
      continue;
    }

    const owner = ruinState[ownerField];
    if (!owner) {
      continue;
    }

    const current = totals.get(owner) ?? 0;
    totals.set(owner, current + RUIN_MINUTE_RATES[ruinDefinition.type][currentDay]);
  }

  return totals;
}

type ProjectScenarioInput = {
  tribes: Tribe[];
  ruinStates: RuinState[];
  currentDay: DayNumber;
  ownerField: ScenarioOwnerField;
  now?: Date;
};

export function projectScenario({
  tribes,
  ruinStates,
  currentDay,
  ownerField,
  now = new Date(),
}: ProjectScenarioInput): ScenarioProjectionResult {
  const minutesRemainingByDay = getMinutesRemainingByDay(currentDay, now);
  const firstCaptureTotals = getFirstCaptureTotals(tribes, ruinStates);
  const pointsPerMinuteTotals = getPointsPerMinuteByOwner(
    tribes,
    ruinStates,
    currentDay,
    ownerField
  );

  const addedProductionByTribe = new Map<string, number>();

  for (const tribe of tribes) {
    addedProductionByTribe.set(tribe.id, 0);
  }

  for (const ruinState of ruinStates) {
    const ruinDefinition = ruinDefinitionMap.get(ruinState.id);
    if (!ruinDefinition) {
      continue;
    }

    const owner = ruinState[ownerField];
    if (!owner) {
      continue;
    }

    const rates = RUIN_MINUTE_RATES[ruinDefinition.type];
    const futureProduction =
      rates[1] * minutesRemainingByDay[1] +
      rates[2] * minutesRemainingByDay[2] +
      rates[3] * minutesRemainingByDay[3];

    const currentProduction = addedProductionByTribe.get(owner) ?? 0;
    addedProductionByTribe.set(owner, currentProduction + futureProduction);
  }

  const rows = tribes.map((tribe) => {
    const addedProduction = addedProductionByTribe.get(tribe.id) ?? 0;
    const pendingFirstCapture = firstCaptureTotals.get(tribe.id) ?? 0;
    const pointsPerMinute = pointsPerMinuteTotals.get(tribe.id) ?? 0;

    return {
      tribeId: tribe.id,
      tribeName: tribe.name,
      currentScore: tribe.currentScore,
      pendingFirstCapture,
      pointsPerMinute,
      addedProduction,
      finalScore: tribe.currentScore + pendingFirstCapture + addedProduction,
    };
  });

  return {
    minutesRemainingByDay,
    rows,
  };
}

export function buildScenarioTimeline({
  tribes,
  ruinStates,
  currentDay,
  ownerField,
  now = new Date(),
}: ProjectScenarioInput): ScenarioTimelinePoint[] {
  const firstCaptureTotals = getFirstCaptureTotals(tribes, ruinStates);
  const minutesRemainingByDay = getMinutesRemainingByDay(currentDay, now);

  const runningScores = new Map<string, number>(
    tribes.map((tribe) => [
      tribe.id,
      tribe.currentScore + (firstCaptureTotals.get(tribe.id) ?? 0),
    ])
  );

  const timeline: ScenarioTimelinePoint[] = [
    {
      label: "Now",
      scores: Object.fromEntries(runningScores) as Record<string, number>,
    },
  ];

  for (let day = currentDay; day <= 3; day += 1) {
    const typedDay = day as DayNumber;
    const minutes = minutesRemainingByDay[typedDay];

    if (minutes <= 0) {
      continue;
    }

    const pointsPerMinute = getPointsPerMinuteByOwner(
      tribes,
      ruinStates,
      typedDay,
      ownerField
    );

    for (const tribe of tribes) {
      const currentScore = runningScores.get(tribe.id) ?? 0;
      const ppm = pointsPerMinute.get(tribe.id) ?? 0;
      runningScores.set(tribe.id, currentScore + ppm * minutes);
    }

    timeline.push({
      label: `End D${typedDay}`,
      scores: Object.fromEntries(runningScores) as Record<string, number>,
    });
  }

  return timeline;
}