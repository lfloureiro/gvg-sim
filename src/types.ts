export type DayNumber = 1 | 2 | 3;
export type RuinType = "bastion" | "valkyrie" | "temple";
export type TribeId = string;
export type NullableTribeId = TribeId | null;

export type Tribe = {
  id: TribeId;
  name: string;
  currentScore: number;
};

export type RuinDefinition = {
  id: string;
  name: string;
  type: RuinType;
};

export type RuinState = {
  id: string;
  firstCaptureBy: NullableTribeId;
  currentOwner: NullableTribeId;
  simulatedOwner: NullableTribeId;
};

export type RuinStateField =
  | "firstCaptureBy"
  | "currentOwner"
  | "simulatedOwner";

export type ScenarioOwnerField = "currentOwner" | "simulatedOwner";

export type ScenarioProjectionRow = {
  tribeId: TribeId;
  tribeName: string;
  currentScore: number;
  addedProduction: number;
  addedFutureFirstCapture: number;
  finalScore: number;
};

export type ScenarioProjectionResult = {
  minutesRemainingByDay: Record<DayNumber, number>;
  rows: ScenarioProjectionRow[];
};