import { useEffect, useMemo, useState } from "react";
import type { AppText } from "../../../i18n";
import backgroundGvg from "../assets/background_gvg.png";
import {
  INITIAL_MAP_NODES,
  type MapNode,
  type PassNode,
  type RuinNode,
} from "../data/mapLayout";

type NodeAnchor = {
  x: number;
  y: number;
};

type ColorScheme = {
  primary: string;
  secondary: string;
};

type GvgMapProps = {
  t: AppText;
  currentDay: 1 | 2 | 3;
  highlightedNodeId?: string | null;
  onHomeClick?: (homeId: string, anchor: NodeAnchor) => void;
  onMainRuinClick?: (anchor: NodeAnchor) => void;
  onPassClick?: (passId: string, anchor: NodeAnchor) => void;
  onRuinClick?: (ruinId: string, anchor: NodeAnchor) => void;
  onRuinRightClick?: (ruinId: string) => void;
  calibrationMode?: boolean;
  nodeColorSchemes?: Partial<Record<string, ColorScheme>>;
  firstCaptureRuinIds?: string[];
};

const NEUTRAL_SCHEME: ColorScheme = {
  primary: "#9ca3af",
  secondary: "#e5e7eb",
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function cloneNodes(nodes: MapNode[]): MapNode[] {
  return nodes.map((node) => ({ ...node }));
}

function isPassNode(node: MapNode): node is PassNode {
  return node.kind === "pass";
}

function isRuinNode(node: MapNode): node is RuinNode {
  return node.kind === "ruin";
}

function isNodeOpen(node: MapNode, currentDay: 1 | 2 | 3): boolean {
  if (node.kind === "home") {
    return true;
  }

  return currentDay >= node.openDay;
}

function getNodeSize(node: MapNode): number {
  if (node.kind === "home") {
    return 46;
  }

  if (node.kind === "pass") {
    return 30;
  }

  if (node.kind === "ruin" && node.isCentralTemple) {
    return 30;
  }

  return 34;
}

function getNodeScheme(
  node: MapNode,
  nodeColorSchemes?: Partial<Record<string, ColorScheme>>
): ColorScheme {
  return nodeColorSchemes?.[node.id] ?? NEUTRAL_SCHEME;
}

function renderRuinBadgeBase(
  scheme: ColorScheme,
  isSelected: boolean
) {
  return (
    <>
      <circle
        cx="12"
        cy="12"
        r="11.2"
        fill="rgba(17,24,39,0.48)"
        stroke={scheme.primary}
        strokeWidth="3"
      />
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="rgba(17,24,39,0.2)"
        stroke={scheme.secondary}
        strokeWidth="2.5"
      />
      {isSelected ? (
        <circle
          cx="12"
          cy="12"
          r="10.1"
          fill="none"
          stroke="rgba(255,255,255,0.98)"
          strokeWidth="1.3"
        />
      ) : null}
    </>
  );
}

function renderHomeIcon(scheme: ColorScheme, isSelected: boolean) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="transparent"
        stroke={scheme.primary}
        strokeWidth="3.4"
      />
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="transparent"
        stroke={scheme.secondary}
        strokeWidth="3"
      />
      {isSelected ? (
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="rgba(255,255,255,0.98)"
          strokeWidth="1.4"
        />
      ) : null}
    </svg>
  );
}

function renderPassIcon(scheme: ColorScheme, isSelected: boolean) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      {renderRuinBadgeBase(scheme, isSelected)}

      <path
        d="M4.8 9 L12 5 L19.2 9"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.4 9.2 H17.6 V17.2 H6.4 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.95"
        strokeLinejoin="round"
      />
      <path
        d="M9 10.2 V17 M12 10.2 V17 M15 10.2 V17"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4.6 17.4 H19.4"
        stroke="#ffffff"
        strokeWidth="1.95"
        strokeLinecap="round"
      />
    </svg>
  );
}

function renderBastionIcon(scheme: ColorScheme, isSelected: boolean) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      {renderRuinBadgeBase(scheme, isSelected)}

      <path
        d="M7.2 7 H16.8 V9.2 L15.6 10.2 V14.8 C15.6 17 14 18.7 12 19.2 C10 18.7 8.4 17 8.4 14.8 V10.2 L7.2 9.2 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 7 V8.7 M12 7 V8.7 M14.8 7 V8.7"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function renderValkyrieIcon(scheme: ColorScheme, isSelected: boolean) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      {renderRuinBadgeBase(scheme, isSelected)}

      <path d="M12 5.2 L13.6 8.2 L12 18.6 L10.4 8.2 Z" fill="#ffffff" />
      <path
        d="M9.6 9.8 C7.6 8.8 6.1 9.5 4.9 11.5 C6.8 11.3 8.2 11.7 10 13.1"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.4 9.8 C16.4 8.8 17.9 9.5 19.1 11.5 C17.2 11.3 15.8 11.7 14 13.1"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderTempleIcon(scheme: ColorScheme, isSelected: boolean) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      {renderRuinBadgeBase(scheme, isSelected)}

      <path
        d="M12 5.4 L13.8 9.2 L18 9.8 L14.9 12.8 L15.6 17 L12 15.1 L8.4 17 L9.1 12.8 L6 9.8 L10.2 9.2 Z"
        fill="#ffffff"
        stroke="none"
      />
    </svg>
  );
}

function renderNodeIcon(node: MapNode, scheme: ColorScheme, isSelected: boolean) {
  if (node.kind === "home") {
    return renderHomeIcon(scheme, isSelected);
  }

  if (node.kind === "pass") {
    return renderPassIcon(scheme, isSelected);
  }

  if (node.ruinType === "bastion") {
    return renderBastionIcon(scheme, isSelected);
  }

  if (node.ruinType === "valkyrie") {
    return renderValkyrieIcon(scheme, isSelected);
  }

  return renderTempleIcon(scheme, isSelected);
}

function getAnchorFromButton(button: HTMLButtonElement): NodeAnchor {
  const rect = button.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.bottom + 6,
  };
}

export default function GvgMap({
  t,
  currentDay,
  highlightedNodeId = null,
  onHomeClick,
  onMainRuinClick,
  onPassClick,
  onRuinClick,
  onRuinRightClick,
  calibrationMode = false,
  nodeColorSchemes,
  firstCaptureRuinIds = [],
}: GvgMapProps) {
  const [nodes, setNodes] = useState<MapNode[]>(() =>
    cloneNodes(INITIAL_MAP_NODES)
  );
  const [selectedId, setSelectedId] = useState<string>(
    INITIAL_MAP_NODES[0]?.id ?? ""
  );

  const selectedNode = useMemo(
    () =>
      nodes.find((node) => node.id === selectedId) ??
      INITIAL_MAP_NODES[0] ??
      null,
    [nodes, selectedId]
  );

  const firstCaptureSet = useMemo(
    () => new Set(firstCaptureRuinIds),
    [firstCaptureRuinIds]
  );

  function moveSelected(dx: number, dy: number) {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === selectedId
          ? {
              ...node,
              x: round2(node.x + dx),
              y: round2(node.y + dy),
            }
          : node
      )
    );
  }

  useEffect(() => {
    if (!calibrationMode) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      const step = event.shiftKey ? 1 : 0.2;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveSelected(-step, 0);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        moveSelected(step, 0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSelected(0, -step);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSelected(0, step);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [calibrationMode, selectedId]);

  async function copyCoords() {
    const homes = nodes.filter(
      (node): node is Extract<MapNode, { kind: "home" }> => node.kind === "home"
    );
    const passes = nodes.filter(isPassNode);
    const ruins = nodes.filter(isRuinNode);

    const text = `export const HOME_NODES: HomeNode[] = [
${homes
  .map(
    (node) =>
      `  { id: "${node.id}", kind: "home", label: "${node.label}", x: ${node.x}, y: ${node.y} },`
  )
  .join("\n")}
];

export const PASS_NODES: PassNode[] = [
${passes
  .map(
    (node) =>
      `  { id: "${node.id}", kind: "pass", label: "${node.label}", passLevel: ${node.passLevel}, openDay: ${node.openDay}, x: ${node.x}, y: ${node.y} },`
  )
  .join("\n")}
];

export const RUIN_NODES: RuinNode[] = [
${ruins
  .map((node) => {
    const centralTemplePart = node.isCentralTemple
      ? ", isCentralTemple: true"
      : "";

    return `  { id: "${node.id}", kind: "ruin", label: "${node.label}", ruinType: "${node.ruinType}", ruinLevel: ${node.ruinLevel}, openDay: ${node.openDay}, x: ${node.x}, y: ${node.y}${centralTemplePart} },`;
  })
  .join("\n")}
];
`;

    await navigator.clipboard.writeText(text);
  }

  function resetCoords() {
    setNodes(cloneNodes(INITIAL_MAP_NODES));
    setSelectedId(INITIAL_MAP_NODES[0]?.id ?? "");
  }

  return (
    <div className="gvg-map-card">
      {calibrationMode ? (
        <>
          <div className="gvg-map-toolbar">
            <div className="gvg-map-toolbar__left">
              <label className="gvg-map-toolbar__field">
                <span>{t.mapCalibration.pointLabel}</span>
                <select
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                >
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.label} ({node.id})
                    </option>
                  ))}
                </select>
              </label>

              {selectedNode ? (
                <div className="gvg-map-toolbar__coords">
                  <strong>{selectedNode.label}</strong>
                  <span>
                    x: {selectedNode.x} | y: {selectedNode.y}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="gvg-map-toolbar__right">
              <button
                type="button"
                className="secondary-button"
                onClick={copyCoords}
              >
                {t.mapCalibration.copyCoordinates}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={resetCoords}
              >
                {t.mapCalibration.reset}
              </button>
            </div>
          </div>

          <div className="gvg-map-help">{t.mapCalibration.help}</div>
        </>
      ) : null}

      <div className="gvg-map">
        <img
          src={backgroundGvg}
          alt="GvG map"
          className="gvg-map__image"
          draggable={false}
        />

        <div className="gvg-map__overlay">
          {nodes.map((node) => {
            const isCalibrationSelected =
              calibrationMode && node.id === selectedId;
            const isHighlighted =
              !calibrationMode && highlightedNodeId === node.id;
            const shouldGlow = isCalibrationSelected || isHighlighted;

            const size = getNodeSize(node);
            const scheme = getNodeScheme(node, nodeColorSchemes);
            const isOpen = isNodeOpen(node, currentDay);
            const hasFirstCapture =
              node.kind === "ruin" && firstCaptureSet.has(node.id);

            return (
              <button
                key={node.id}
                type="button"
                className={[
                  "gvg-map__hotspot",
                  `gvg-map__hotspot--${node.kind}`,
                  node.kind === "ruin"
                    ? `gvg-map__hotspot--${node.ruinType}`
                    : "",
                  node.kind === "ruin" && node.isCentralTemple
                    ? "gvg-map__hotspot--central-temple"
                    : "",
                  isOpen ? "gvg-map__hotspot--open" : "gvg-map__hotspot--locked",
                  shouldGlow ? "gvg-map__hotspot--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  position: "absolute",
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: "translate(-50%, -50%)",
                  display: "grid",
                  placeItems: "center",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: calibrationMode || isOpen ? "pointer" : "not-allowed",
                  opacity: isOpen ? 1 : 0.45,
                  filter: shouldGlow
                    ? "drop-shadow(0 0 9px rgba(255,255,255,0.98))"
                    : isOpen
                    ? "drop-shadow(0 1px 3px rgba(0,0,0,0.45))"
                    : "grayscale(0.35) brightness(0.8)",
                }}
                title={
                  node.kind === "home"
                    ? `${node.label} (${node.id}) — x: ${node.x}, y: ${node.y}`
                    : `${node.label} (${node.id}) — x: ${node.x}, y: ${node.y} — opens day ${node.openDay}`
                }
                onClick={(event) => {
                  if (calibrationMode) {
                    setSelectedId(node.id);
                    return;
                  }

                  if (!isOpen) {
                    return;
                  }

                  const anchor = getAnchorFromButton(
                    event.currentTarget as HTMLButtonElement
                  );

                  if (node.kind === "home") {
                    onHomeClick?.(node.id, anchor);
                    return;
                  }

                  if (node.kind === "pass") {
                    onPassClick?.(node.id, anchor);
                    return;
                  }

                  onRuinClick?.(node.id, anchor);

                  if (node.isCentralTemple) {
                    onMainRuinClick?.(anchor);
                  }
                }}
                onContextMenu={(event) => {
                  if (calibrationMode || node.kind !== "ruin" || !isOpen) {
                    return;
                  }

                  event.preventDefault();
                  onRuinRightClick?.(node.id);
                }}
              >
                <>
                  {renderNodeIcon(node, scheme, shouldGlow)}

                  {node.kind !== "home" ? (
                    <>
                      <span
                        style={{
                          position: "absolute",
                          bottom: "-10px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: isOpen ? "#ffffff" : "#d1d5db",
                          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                          pointerEvents: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {node.kind === "pass"
                          ? `P${node.passLevel}`
                          : `R${node.ruinLevel}`}
                      </span>

                      {!isOpen ? (
                        <span
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            width: "16px",
                            height: "16px",
                            borderRadius: "999px",
                            background: "rgba(17,24,39,0.95)",
                            border: "1px solid rgba(255,255,255,0.35)",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "10px",
                            lineHeight: 1,
                            color: "#ffffff",
                            pointerEvents: "none",
                          }}
                          title={`Opens on day ${node.openDay}`}
                        >
                          🔒
                        </span>
                      ) : null}

                      {hasFirstCapture ? (
                        <span
                          style={{
                            position: "absolute",
                            top: "-8px",
                            left: "-8px",
                            width: "16px",
                            height: "16px",
                            borderRadius: "999px",
                            background: "rgba(120,72,0,0.95)",
                            border: "1px solid rgba(255,215,64,0.9)",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "10px",
                            lineHeight: 1,
                            color: "#ffd54f",
                            pointerEvents: "none",
                            boxShadow: "0 0 8px rgba(255,215,64,0.6)",
                          }}
                          title="First capture"
                        >
                          ★
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}