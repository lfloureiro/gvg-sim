export type DayNumber = 1 | 2 | 3;
export type RuinType = "bastion" | "valkyrie" | "temple";
export type TribeId = string;
export type NullableTribeId = TribeId | null;
export type Language = "en" | "pt" | "it" | "ru" | "tr" | "de" | "fr" | "uk" | "zhTW";
export type OrderId = "order-a" | "order-b";

export type Tribe = {
  id: TribeId;
  name: string;
  color: string;
  accentColor: string;
  currentScore: number;
  orderId: OrderId | null;
};

export type TribeSlot = {
  id: TribeId;
  slotIndex: number;
  name: string;
  color: string;
  accentColor: string;
  currentScore: number;
  enabled: boolean;
  orderId: OrderId | null;
};

export type RuinDefinition = {
  id: string;
  name: string;
  type: RuinType;
};

export type HomeAssignment = {
  homeId: string;
  tribeId: NullableTribeId;
};

export type PassState = {
  id: string;
  currentOwner: NullableTribeId;
  simulatedOwner: NullableTribeId;
};

export type PassStateField = "currentOwner" | "simulatedOwner";

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