import { useState, type ChangeEvent } from "react";
import type { Language } from "../../types";
import {
  analyzeEnemyImageDebug,
  type ArtifactSlotKey,
  type DebugAnalysisResult,
  type PixelRect,
} from "./analysis";

type EnemyTribeDebugScreenProps = {
  language: Language;
};

const SLOT_ORDER: ArtifactSlotKey[] = [
  "sword",
  "shield",
  "boots",
  "chest",
  "helmet",
  "pants",
];

const SLOT_LABELS: Record<ArtifactSlotKey, string> = {
  sword: "Sword",
  shield: "Shield",
  boots: "Boots",
  chest: "Chest",
  helmet: "Helmet",
  pants: "Pants",
};

export default function EnemyTribeDebugScreen({
  language,
}: EnemyTribeDebugScreenProps) {
  void language;

  const [result, setResult] = useState<DebugAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const debugResult = await analyzeEnemyImageDebug(file);
      setResult(debugResult);
    } catch {
      setError("Could not analyze the selected image in debug mode.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Debug</p>
          <h2>Single image visual debug</h2>
          <p className="muted">
            Load one image and inspect the detected regions before adjusting OCR
            or artifact rules.
          </p>
        </div>
      </div>

      <label className="folder-picker-fallback">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <strong>Choose one image for debug</strong>
        <small>
          This mode shows the detected layout, the crops used for OCR and the
          artifact slot cuts.
        </small>
      </label>

      {isLoading ? (
        <div className="note-box">Analyzing image in debug mode...</div>
      ) : null}

      {error ? <div className="error-box">{error}</div> : null}

      {result ? (
        <div className="stack" style={{ marginTop: "1rem" }}>
          <section className="top-grid">
            <div className="info-box">
              <span className="info-label">Chief</span>
              <strong>{result.chiefName}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">Individual Might</span>
              <strong>{formatNumber(result.individualMight)}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">Army Type</span>
              <strong>{capitalize(result.armyType)}</strong>
            </div>

            <div className="info-box">
              <span className="info-label">Confidence</span>
              <strong>{capitalize(result.confidence)}</strong>
            </div>
          </section>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 1fr)",
              gap: "1rem",
              alignItems: "start",
            }}
          >
            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ marginBottom: "0.75rem", fontWeight: 700 }}>
                Original image with detected regions
              </div>

              <div
                style={{
                  position: "relative",
                  width: "100%",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#020817",
                }}
              >
                <img
                  src={result.imageUrl}
                  alt="Debug source"
                  style={{ width: "100%", display: "block" }}
                />

                <RectOverlay
                  rect={result.layout.topInfoRect}
                  imageWidth={result.imageWidth}
                  imageHeight={result.imageHeight}
                  color="#ef4444"
                  label="Top info"
                />

                <RectOverlay
                  rect={result.layout.artifactTitleRect}
                  imageWidth={result.imageWidth}
                  imageHeight={result.imageHeight}
                  color="#f59e0b"
                  label="Artifact title"
                />

                <RectOverlay
                  rect={result.layout.artifactGridRect}
                  imageWidth={result.imageWidth}
                  imageHeight={result.imageHeight}
                  color="#3b82f6"
                  label="Artifact grid"
                />

                {SLOT_ORDER.map((slot) => (
                  <RectOverlay
                    key={slot}
                    rect={result.layout.slotRects[slot]}
                    imageWidth={result.imageWidth}
                    imageHeight={result.imageHeight}
                    color="#22c55e"
                    label={SLOT_LABELS[slot]}
                  />
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ marginBottom: "0.75rem", fontWeight: 700 }}>
                Slot interpretation
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "0.6rem",
                }}
              >
                {SLOT_ORDER.map((slot) => {
                  const entry = result.slots[slot];

                  return (
                    <div
                      key={slot}
                      style={{
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 14,
                        padding: "0.75rem",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        {SLOT_LABELS[slot]}
                      </div>
                      <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>
                        Artifact: {capitalize(entry.color)} | Level: {entry.level}
                      </div>
                      <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>
                        Rune: {capitalize(entry.runeColor)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <section className="card" style={{ padding: "1rem" }}>
            <div style={{ marginBottom: "0.75rem", fontWeight: 700 }}>
              Crops used by the analyzer
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "0.9rem",
              }}
            >
              {result.crops.map((crop) => (
                <div
                  key={crop.id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14,
                    padding: "0.75rem",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 6,
                      fontSize: "0.95rem",
                    }}
                  >
                    {crop.label}
                  </div>

                  <img
                    src={crop.imageUrl}
                    alt={crop.label}
                    style={{
                      width: "100%",
                      display: "block",
                      borderRadius: 10,
                      background: "#020817",
                      marginBottom: 8,
                    }}
                  />

                  {crop.meta ? (
                    <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>
                      {crop.meta}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function RectOverlay({
  rect,
  imageWidth,
  imageHeight,
  color,
  label,
}: {
  rect: PixelRect;
  imageWidth: number;
  imageHeight: number;
  color: string;
  label: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${(rect.x / imageWidth) * 100}%`,
        top: `${(rect.y / imageHeight) * 100}%`,
        width: `${(rect.width / imageWidth) * 100}%`,
        height: `${(rect.height / imageHeight) * 100}%`,
        border: `2px solid ${color}`,
        boxSizing: "border-box",
        background: `${color}16`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -24,
          left: 0,
          background: color,
          color: "#020817",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: 1,
          padding: "4px 8px",
          borderRadius: 999,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}