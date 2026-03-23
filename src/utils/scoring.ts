import {
  RUIN_DEFINITIONS,
  RUIN_FIRST_CAPTURE_POINTS,
  RUIN_MINUTE_RATES,
} from "../constants";
import type {
  DayNumber,
  ScenarioOwnerField,
  ScenarioProjectionResult,
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

  const addedProductionByTribe = new Map<string, number>();
  const addedFutureFirstCaptureByTribe = new Map<string, number>();

  for (const tribe of tribes) {
    addedProductionByTribe.set(tribe.id, 0);
    addedFutureFirstCaptureByTribe.set(tribe.id, 0);
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

    if (!ruinState.firstCaptureBy) {
      const currentBonus = addedFutureFirstCaptureByTribe.get(owner) ?? 0;
      addedFutureFirstCaptureByTribe.set(
        owner,
        currentBonus + RUIN_FIRST_CAPTURE_POINTS[ruinDefinition.type]
      );
    }
  }

  const rows = tribes.map((tribe) => {
    const addedProduction = addedProductionByTribe.get(tribe.id) ?? 0;
    const addedFutureFirstCapture =
      addedFutureFirstCaptureByTribe.get(tribe.id) ?? 0;

    return {
      tribeId: tribe.id,
      tribeName: tribe.name,
      currentScore: tribe.currentScore,
      addedProduction,
      addedFutureFirstCapture,
      finalScore:
        tribe.currentScore + addedProduction + addedFutureFirstCapture,
    };
  });

  return {
    minutesRemainingByDay,
    rows,
  };
}