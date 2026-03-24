import { useEffect, useMemo, useState } from "react";
import { TRIBE_COUNT } from "../../constants";
import { getTranslation } from "../../i18n";
import SetupScreen from "../../components/SetupScreen";
import SimulationScreen from "../../components/SimulationScreen";
import { buildInitialRuinStates } from "../../utils/scoring";
import type {
  DayNumber,
  Language,
  RuinState,
  RuinStateField,
  Tribe,
} from "../../types";

const STORAGE_KEY = "gvg-sim-state-v4";

const DEFAULT_TRIBE_COLORS = [
  "#ff6b6b",
  "#4dabf7",
  "#51cf66",
  "#ffd43b",
  "#b197fc",
  "#ffa94d",
  "#f783ac",
  "#63e6be",
];

type SetupErrorKey =
  | ""
  | "allTribesMustHaveAName"
  | "tribeNamesMustBeUnique";

type PersistedState = {
  configured: boolean;
  tribeNames: string[];
  tribeColors: string[];
  currentScores: number[];
  currentDay: DayNumber;
  ruinStates: RuinState[];
};

type GvgSimulatorAppProps = {
  language: Language;
  onReturnHome?: () => void;
};

function createDefaultState(): PersistedState {
  return {
    configured: false,
    tribeNames: Array.from({ length: TRIBE_COUNT }, (_, index) =>
      index === 0 ? "Phoenix Veritas" : `Tribo ${index + 1}`
    ),
    tribeColors: Array.from(
      { length: TRIBE_COUNT },
      (_, index) => DEFAULT_TRIBE_COLORS[index % DEFAULT_TRIBE_COLORS.length]
    ),
    currentScores: Array.from({ length: TRIBE_COUNT }, () => 0),
    currentDay: 1,
    ruinStates: buildInitialRuinStates(),
  };
}

function normalizeRuinStates(input: unknown): RuinState[] {
  const defaults = buildInitialRuinStates();

  if (!Array.isArray(input)) {
    return defaults;
  }

  const inputMap = new Map(
    input
      .filter(
        (item): item is RuinState =>
          !!item && typeof item === "object" && "id" in item
      )
      .map((item) => [item.id, item])
  );

  return defaults.map((defaultState) => {
    const saved = inputMap.get(defaultState.id);

    return {
      id: defaultState.id,
      firstCaptureBy: saved?.firstCaptureBy ?? null,
      currentOwner: saved?.currentOwner ?? null,
      simulatedOwner: saved?.simulatedOwner ?? null,
    };
  });
}

function loadInitialState(): PersistedState {
  const defaults = createDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    const loadedNames =
      Array.isArray(parsed.tribeNames) &&
      parsed.tribeNames.length === TRIBE_COUNT
        ? parsed.tribeNames.map((value) => String(value || ""))
        : defaults.tribeNames;

    loadedNames[0] = "Phoenix Veritas";

    return {
      configured: Boolean(parsed.configured),
      tribeNames: loadedNames,
      tribeColors:
        Array.isArray(parsed.tribeColors) &&
        parsed.tribeColors.length === TRIBE_COUNT
          ? parsed.tribeColors.map((value) => String(value || "#ffffff"))
          : defaults.tribeColors,
      currentScores:
        Array.isArray(parsed.currentScores) &&
        parsed.currentScores.length === TRIBE_COUNT
          ? parsed.currentScores.map((value) => Number(value) || 0)
          : defaults.currentScores,
      currentDay:
        parsed.currentDay === 1 ||
        parsed.currentDay === 2 ||
        parsed.currentDay === 3
          ? parsed.currentDay
          : 1,
      ruinStates: normalizeRuinStates(parsed.ruinStates),
    };
  } catch {
    return defaults;
  }
}

export default function GvgSimulatorApp({
  language,
  onReturnHome,
}: GvgSimulatorAppProps) {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [setupErrorKey, setSetupErrorKey] = useState<SetupErrorKey>("");
  const [currentUtc, setCurrentUtc] = useState(new Date());

  const t = useMemo(() => getTranslation(language), [language]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentUtc(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const tribes = useMemo<Tribe[]>(
    () =>
      state.tribeNames.map((name, index) => ({
        id: `tribe-${index + 1}`,
        name:
          index === 0
            ? "Phoenix Veritas"
            : name.trim() || `Tribo ${index + 1}`,
        color:
          state.tribeColors[index] ??
          DEFAULT_TRIBE_COLORS[index % DEFAULT_TRIBE_COLORS.length],
        currentScore: state.currentScores[index] ?? 0,
      })),
    [state.tribeNames, state.tribeColors, state.currentScores]
  );

  function handleTribeNameChange(index: number, value: string) {
    if (index === 0) {
      return;
    }

    setState((previous) => {
      const nextNames = [...previous.tribeNames];
      nextNames[index] = value;

      return {
        ...previous,
        tribeNames: nextNames,
      };
    });
  }

  function handleTribeColorChange(index: number, value: string) {
    setState((previous) => {
      const nextColors = [...previous.tribeColors];
      nextColors[index] = value;

      return {
        ...previous,
        tribeColors: nextColors,
      };
    });
  }

  function handleCurrentScoreChange(index: number, value: number) {
    setState((previous) => {
      const nextScores = [...previous.currentScores];
      nextScores[index] = value;

      return {
        ...previous,
        currentScores: nextScores,
      };
    });
  }

  function handleCurrentDayChange(day: DayNumber) {
    setState((previous) => ({
      ...previous,
      currentDay: day,
    }));
  }

  function handleRuinChange(
    ruinId: string,
    field: RuinStateField,
    value: string | null
  ) {
    setState((previous) => ({
      ...previous,
      ruinStates: previous.ruinStates.map((ruinState) => {
        if (ruinState.id !== ruinId) {
          return ruinState;
        }

        if (field === "currentOwner") {
          const previousCurrentOwner = ruinState.currentOwner;
          const shouldSyncSimulation =
            ruinState.simulatedOwner === null ||
            ruinState.simulatedOwner === previousCurrentOwner;

          return {
            ...ruinState,
            currentOwner: value,
            simulatedOwner: shouldSyncSimulation
              ? value
              : ruinState.simulatedOwner,
          };
        }

        return {
          ...ruinState,
          [field]: value,
        };
      }),
    }));
  }

  function handleCopyCurrentToScenario() {
    setState((previous) => ({
      ...previous,
      ruinStates: previous.ruinStates.map((ruinState) => ({
        ...ruinState,
        simulatedOwner: ruinState.currentOwner,
      })),
    }));
  }

  function handleContinue() {
    const cleanedNames = state.tribeNames.map((name, index) =>
      index === 0 ? "Phoenix Veritas" : name.trim()
    );

    if (cleanedNames.some((name) => !name)) {
      setSetupErrorKey("allTribesMustHaveAName");
      return;
    }

    const lowered = cleanedNames.map((name) => name.toLocaleLowerCase());
    if (new Set(lowered).size !== lowered.length) {
      setSetupErrorKey("tribeNamesMustBeUnique");
      return;
    }

    setSetupErrorKey("");

    setState((previous) => ({
      ...previous,
      configured: true,
      tribeNames: cleanedNames,
      currentScores: previous.currentScores.map((score) =>
        Number(score) > 0 ? Number(score) : 0
      ),
    }));
  }

  function handleBack() {
    setState((previous) => ({
      ...previous,
      configured: false,
    }));
  }

  return (
    <main className="app-shell">
      <div className="app-container stack">
        {onReturnHome ? (
          <div className="app-top-actions">
            <button className="secondary-button" onClick={onReturnHome}>
              ← Back to home
            </button>
          </div>
        ) : null}

        {!state.configured ? (
          <SetupScreen
            t={t}
            tribeNames={state.tribeNames}
            tribeColors={state.tribeColors}
            currentScores={state.currentScores}
            error={setupErrorKey ? t.errors[setupErrorKey] : ""}
            onTribeNameChange={handleTribeNameChange}
            onTribeColorChange={handleTribeColorChange}
            onCurrentScoreChange={handleCurrentScoreChange}
            onContinue={handleContinue}
          />
        ) : (
          <SimulationScreen
            t={t}
            tribes={tribes}
            currentDay={state.currentDay}
            currentUtc={currentUtc}
            ruinStates={state.ruinStates}
            onCurrentDayChange={handleCurrentDayChange}
            onRuinChange={handleRuinChange}
            onCopyCurrentToScenario={handleCopyCurrentToScenario}
            onBack={handleBack}
          />
        )}
      </div>
    </main>
  );
}