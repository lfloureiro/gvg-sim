import type { DayNumber, RuinDefinition, RuinType } from "./types";

export const TRIBE_COUNT = 8;

export const RUIN_DEFINITIONS: RuinDefinition[] = [
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `B${index + 1}`,
    name: `B${index + 1}`,
    type: "bastion" as const,
  })),
  ...Array.from({ length: 6 }, (_, index) => ({
    id: `V${index + 1}`,
    name: `V${index + 1}`,
    type: "valkyrie" as const,
  })),
  {
    id: "T1",
    name: "T1",
    type: "temple" as const,
  },
];

export const RUIN_FIRST_CAPTURE_POINTS: Record<RuinType, number> = {
  bastion: 5000,
  valkyrie: 10000,
  temple: 30000,
};

export const RUIN_MINUTE_RATES: Record<RuinType, Record<DayNumber, number>> = {
  bastion: {
    1: 10,
    2: 20,
    3: 30,
  },
  valkyrie: {
    1: 20,
    2: 40,
    3: 60,
  },
  temple: {
    1: 60,
    2: 120,
    3: 180,
  },
};