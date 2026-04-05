import type { DayNumber, RuinDefinition, RuinType } from "./types";

export const TRIBE_COUNT = 12;

export const DEFAULT_TRIBE_COLOR_SCHEMES = [
  { primary: "#e53935", secondary: "#ffb300" }, // red / amber
  { primary: "#1e88e5", secondary: "#80d8ff" }, // blue / cyan
  { primary: "#43a047", secondary: "#d4e157" }, // green / lime
  { primary: "#8e24aa", secondary: "#fdd835" }, // purple / gold
  { primary: "#00897b", secondary: "#80deea" }, // teal / aqua
  { primary: "#6d4c41", secondary: "#ffcc80" }, // brown / sand
  { primary: "#d81b60", secondary: "#f8bbd0" }, // magenta / light pink
  { primary: "#3949ab", secondary: "#ff8a65" }, // indigo / coral
  { primary: "#7cb342", secondary: "#fff59d" }, // olive / pale yellow
  { primary: "#546e7a", secondary: "#ffab91" }, // blue grey / peach
  { primary: "#5e35b1", secondary: "#a5d6a7" }, // violet / mint
  { primary: "#00acc1", secondary: "#ce93d8" }, // cyan / lilac
];

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