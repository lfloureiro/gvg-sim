import { useEffect, useMemo, useState } from "react";
import { TRIBE_COUNT } from "./constants";
import SetupScreen from "./components/SetupScreen";
import SimulationScreen from "./components/SimulationScreen";
import { buildInitialRuinStates } from "./utils/scoring";
import type {
  DayNumber,
  RuinState,
  RuinStateField,
  Tribe,
} from "./types";

const STORAGE_KEY = "gvg-sim-state-v2";

type PersistedState = {
  configured: boolean;
  tribeNames: string[];
  currentScores: number[];
  currentDay: DayNumber;
  ruinStates: RuinState[];
};

function createDefaultState(): PersistedState {
  return {
    configured: false,
    tribeNames: Array.from(
      { length: TRIBE_COUNT },
      (_, index) => `Tribo ${index + 1}`
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

    return {
      configured: Boolean(parsed.configured),
      tribeNames:
        Array.isArray(parsed.tribeNames) &&
        parsed.tribeNames.length === TRIBE_COUNT
          ? parsed.tribeNames
          : defaults.tribeNames,
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

export default function App() {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [setupError, setSetupError] = useState("");
  const [currentUtc, setCurrentUtc] = useState(new Date());

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
        name: name.trim() || `Tribo ${index + 1}`,
        currentScore: state.currentScores[index] ?? 0,
      })),
    [state.tribeNames, state.currentScores]
  );

  function handleTribeNameChange(index: number, value: string) {
    setState((previous) => {
      const nextNames = [...previous.tribeNames];
      nextNames[index] = value;

      return {
        ...previous,
        tribeNames: nextNames,
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
      ruinStates: previous.ruinStates.map((ruinState) =>
        ruinState.id === ruinId
          ? {
              ...ruinState,
              [field]: value,
            }
          : ruinState
      ),
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
    const cleanedNames = state.tribeNames.map((name) => name.trim());

  if (cleanedNames.some((name) => !name)) {
    setSetupError("All tribes must have a name.");
    return;
  }

  const lowered = cleanedNames.map((name) => name.toLocaleLowerCase());
  if (new Set(lowered).size !== lowered.length) {
    setSetupError("Tribe names must be unique.");
    return;
  }

    setSetupError("");

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
      <div className="app-container">
        {!state.configured ? (
          <SetupScreen
            tribeNames={state.tribeNames}
            currentScores={state.currentScores}
            error={setupError}
            onTribeNameChange={handleTribeNameChange}
            onCurrentScoreChange={handleCurrentScoreChange}
            onContinue={handleContinue}
          />
        ) : (
          <SimulationScreen
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