export type DayNumber = 1 | 2 | 3;
export type RuinType = "bastion" | "valkyrie" | "temple";
export type TribeId = string;
export type NullableTribeId = TribeId | null;

export type Tribe = {
  id: TribeId;
  name: string;
  color: string;
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
  pendingFirstCapture: number;
  pointsPerMinute: number;
  addedProduction: number;
  finalScore: number;
};

export type ScenarioProjectionResult = {
  minutesRemainingByDay: Record<DayNumber, number>;
  rows: ScenarioProjectionRow[];
};

export type ScenarioTimelinePoint = {
  label: string;
  scores: Record<TribeId, number>;
};