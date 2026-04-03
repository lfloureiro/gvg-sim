import type { RuinType } from "../../../types";

export type HomeNode = {
  id: string;
  kind: "home";
  label: string;
  x: number;
  y: number;
};

export type PassNode = {
  id: string;
  kind: "pass";
  label: string;
  x: number;
  y: number;
};

export type RuinNode = {
  id: string;
  kind: "ruin";
  label: string;
  ruinType: RuinType;
  x: number;
  y: number;
  isCentralTemple?: boolean;
};

export type MapNode = HomeNode | PassNode | RuinNode;

export const HOME_NODES: HomeNode[] = [
  { id: "home-1", kind: "home", label: "Home 1", x: 14.4, y: 29 },
  { id: "home-2", kind: "home", label: "Home 2", x: 20.7, y: 21.8 },
  { id: "home-3", kind: "home", label: "Home 3", x: 29.2, y: 16.8 },
  { id: "home-4", kind: "home", label: "Home 4", x: 41.9, y: 11.8 },
  { id: "home-5", kind: "home", label: "Home 5", x: 54.4, y: 10.5 },
  { id: "home-6", kind: "home", label: "Home 6", x: 66.9, y: 13 },
  { id: "home-7", kind: "home", label: "Home 7", x: 88.4, y: 51.1 },
  { id: "home-8", kind: "home", label: "Home 8", x: 83.5, y: 62.7 },
  { id: "home-9", kind: "home", label: "Home 9", x: 73, y: 73.4 },
  { id: "home-10", kind: "home", label: "Home 10", x: 54.3, y: 80.1 },
  { id: "home-11", kind: "home", label: "Home 11", x: 40, y: 77.5 },
  { id: "home-12", kind: "home", label: "Home 12", x: 26.6, y: 70.2 },
];

export const PASS_NODES: PassNode[] = [
  { id: "pass-01", kind: "pass", label: "Pass 1", x: 40, y: 65.4 },
  { id: "pass-02", kind: "pass", label: "Pass 2", x: 29, y: 22 },
  { id: "pass-03", kind: "pass", label: "Pass 3", x: 47, y: 12.8 },
  { id: "pass-04", kind: "pass", label: "Pass 4", x: 44.8, y: 21 },
  { id: "pass-05", kind: "pass", label: "Pass 5", x: 70.4, y: 18.2 },
  { id: "pass-06", kind: "pass", label: "Pass 6", x: 64.8, y: 25.8 },
  { id: "pass-07", kind: "pass", label: "Pass 7", x: 84.8, y: 44.4 },
  { id: "pass-08", kind: "pass", label: "Pass 8", x: 54.8, y: 61.4 },
  { id: "pass-09", kind: "pass", label: "Pass 9", x: 74.4, y: 64.4 },
  { id: "pass-10", kind: "pass", label: "Pass 10", x: 49.8, y: 68.2 },
  { id: "pass-11", kind: "pass", label: "Pass 11", x: 47.8, y: 77.8 },
  { id: "pass-12", kind: "pass", label: "Pass 12", x: 26.8, y: 63.8 },
  { id: "pass-13", kind: "pass", label: "Pass 13", x: 38.8, y: 53.4 },
  { id: "pass-14", kind: "pass", label: "Pass 14", x: 33.4, y: 42.8 },
  { id: "pass-15", kind: "pass", label: "Pass 15", x: 19.8, y: 35.4 },
  { id: "pass-16", kind: "pass", label: "Pass 16", x: 32.2, y: 30.8 },
  { id: "pass-17", kind: "pass", label: "Pass 17", x: 39.6, y: 25.8 },
  { id: "pass-18", kind: "pass", label: "Pass 18", x: 56.2, y: 18.6 },
  { id: "pass-19", kind: "pass", label: "Pass 19", x: 63.8, y: 39.4 },
  { id: "pass-20", kind: "pass", label: "Pass 20", x: 67.8, y: 57.6 },
  { id: "pass-21", kind: "pass", label: "Pass 21", x: 45.6, y: 39.8 },
  { id: "pass-22", kind: "pass", label: "Pass 22", x: 53.8, y: 40.8 },
];

export const RUIN_NODES: RuinNode[] = [
  { id: "B1", kind: "ruin", label: "B1", ruinType: "bastion", x: 16.02, y: 42.8 },
  { id: "B2", kind: "ruin", label: "B2", ruinType: "bastion", x: 22.2, y: 28.22 },
  { id: "B3", kind: "ruin", label: "B3", ruinType: "bastion", x: 36.6, y: 17.2 },
  { id: "B4", kind: "ruin", label: "B4", ruinType: "bastion", x: 59.4, y: 14.02 },
  { id: "B5", kind: "ruin", label: "B5", ruinType: "bastion", x: 71.58, y: 24.2 },
  { id: "B6", kind: "ruin", label: "B6", ruinType: "bastion", x: 81.6, y: 39.6 },
  { id: "B7", kind: "ruin", label: "B7", ruinType: "bastion", x: 82.58, y: 55.2 },
  { id: "B8", kind: "ruin", label: "B8", ruinType: "bastion", x: 62.6, y: 72.98 },
  { id: "B9", kind: "ruin", label: "B9", ruinType: "bastion", x: 33.4, y: 74 },
  { id: "B10", kind: "ruin", label: "B10", ruinType: "bastion", x: 22.8, y: 60.18 },
  { id: "V1", kind: "ruin", label: "V1", ruinType: "valkyrie", x: 38.6, y: 37.28 },
  { id: "V2", kind: "ruin", label: "V2", ruinType: "valkyrie", x: 56.6, y: 27.68 },
  { id: "V3", kind: "ruin", label: "V3", ruinType: "valkyrie", x: 71, y: 34.6 },
  { id: "V4", kind: "ruin", label: "V4", ruinType: "valkyrie", x: 60.8, y: 47.32 },
  { id: "V5", kind: "ruin", label: "V5", ruinType: "valkyrie", x: 46.2, y: 60.12 },
  { id: "V6", kind: "ruin", label: "V6", ruinType: "valkyrie", x: 24.6, y: 49.4 },
  { id: "T1", kind: "ruin", label: "T1", ruinType: "temple", x: 49.6, y: 40, isCentralTemple: true },
];

export const INITIAL_MAP_NODES: MapNode[] = [
  ...HOME_NODES,
  ...PASS_NODES,
  ...RUIN_NODES,
];