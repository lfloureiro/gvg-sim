import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_TRIBE_COLOR_SCHEMES,
  TRIBE_COUNT,
} from "../../constants";
import { getTranslation } from "../../i18n";
import SetupScreen from "../../components/SetupScreen";
import SimulationScreen from "../../components/SimulationScreen";
import SimulationScreenVisual from "../../components/SimulationScreenVisual";
import { buildInitialRuinStates } from "../../utils/scoring";
import type {
  DayNumber,
  HomeAssignment,
  Language,
  OrderId,
  PassState,
  PassStateField,
  RuinState,
  RuinStateField,
  Tribe,
  TribeSlot,
} from "../../types";
import ModeSelectionScreen from "./ModeSelectionScreen";
import type { SimulatorMode } from "./types";
import { HOME_NODES, PASS_NODES } from "./data/mapLayout";

const STORAGE_KEY = "gvg-sim-state-v13-mf69";

type PersistedState = {
  mode: SimulatorMode | null;
  configured: boolean;
  tribeNames: string[];
  tribeEnabled: boolean[];
  tribeOrders: (OrderId | null)[];
  currentScores: number[];
  currentDay: DayNumber;
  homeAssignments: HomeAssignment[];
  passStates: PassState[];
  ruinStates: RuinState[];
};

type GvgSimulatorAppProps = {
  language: Language;
  onReturnHome?: () => void;
};

function buildInitialPassStates(): PassState[] {
  return PASS_NODES.map((passNode) => ({
    id: passNode.id,
    currentOwner: null,
    simulatedOwner: null,
  }));
}

function buildInitialHomeAssignments(
  tribeEnabled: boolean[] = Array.from(
    { length: TRIBE_COUNT },
    (_, index) => index < 8
  )
): HomeAssignment[] {
  const activeTribeIds = tribeEnabled
    .map((enabled, index) => (enabled ? `tribe-${index + 1}` : null))
    .filter((value): value is string => value !== null);

  return HOME_NODES.map((homeNode, index) => ({
    homeId: homeNode.id,
    tribeId: activeTribeIds[index] ?? null,
  }));
}

function getEnabledTribeIds(tribeEnabled: boolean[]): Set<string> {
  return new Set(
    tribeEnabled
      .map((enabled, index) => (enabled ? `tribe-${index + 1}` : null))
      .filter((value): value is string => value !== null)
  );
}

function normalizeHomeAssignments(
  input: unknown,
  tribeEnabled: boolean[]
): HomeAssignment[] {
  const defaults = buildInitialHomeAssignments(tribeEnabled);
  const allowedTribeIds = getEnabledTribeIds(tribeEnabled);

  if (!Array.isArray(input)) {
    return defaults;
  }

  const rawMap = new Map<string, string | null>();

  input.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const maybeHomeId =
      "homeId" in item && typeof item.homeId === "string" ? item.homeId : null;
    const maybeTribeId =
      "tribeId" in item &&
      (typeof item.tribeId === "string" || item.tribeId === null)
        ? item.tribeId
        : null;

    if (maybeHomeId) {
      rawMap.set(maybeHomeId, maybeTribeId);
    }
  });

  const usedTribes = new Set<string>();

  return defaults.map((defaultItem) => {
    const savedTribeId = rawMap.get(defaultItem.homeId);

    if (
      savedTribeId &&
      allowedTribeIds.has(savedTribeId) &&
      !usedTribes.has(savedTribeId)
    ) {
      usedTribes.add(savedTribeId);
      return {
        homeId: defaultItem.homeId,
        tribeId: savedTribeId,
      };
    }

    return {
      homeId: defaultItem.homeId,
      tribeId: null,
    };
  });
}

function normalizePassStates(
  input: unknown,
  tribeEnabled: boolean[]
): PassState[] {
  const defaults = buildInitialPassStates();
  const allowedTribeIds = getEnabledTribeIds(tribeEnabled);

  if (!Array.isArray(input)) {
    return defaults;
  }

  const inputMap = new Map(
    input
      .filter(
        (item): item is PassState =>
          !!item && typeof item === "object" && "id" in item
      )
      .map((item) => [item.id, item])
  );

  return defaults.map((defaultState) => {
    const saved = inputMap.get(defaultState.id);

    return {
      id: defaultState.id,
      currentOwner:
        saved?.currentOwner && allowedTribeIds.has(saved.currentOwner)
          ? saved.currentOwner
          : null,
      simulatedOwner:
        saved?.simulatedOwner && allowedTribeIds.has(saved.simulatedOwner)
          ? saved.simulatedOwner
          : null,
    };
  });
}

function normalizeRuinStates(
  input: unknown,
  tribeEnabled: boolean[]
): RuinState[] {
  const defaults = buildInitialRuinStates();
  const allowedTribeIds = getEnabledTribeIds(tribeEnabled);

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
      firstCaptureBy:
        saved?.firstCaptureBy && allowedTribeIds.has(saved.firstCaptureBy)
          ? saved.firstCaptureBy
          : null,
      currentOwner:
        saved?.currentOwner && allowedTribeIds.has(saved.currentOwner)
          ? saved.currentOwner
          : null,
      simulatedOwner:
        saved?.simulatedOwner && allowedTribeIds.has(saved.simulatedOwner)
          ? saved.simulatedOwner
          : null,
    };
  });
}

function createDefaultState(): PersistedState {
  const tribeEnabled = Array.from(
    { length: TRIBE_COUNT },
    (_, index) => index < 8
  );

  return {
    mode: null,
    configured: false,
    tribeNames: Array.from({ length: TRIBE_COUNT }, (_, index) =>
      index === 0 ? "MF69" : `Tribo ${index + 1}`
    ),
    tribeEnabled,
    tribeOrders: Array.from({ length: TRIBE_COUNT }, () => null),
    currentScores: Array.from({ length: TRIBE_COUNT }, () => 0),
    currentDay: 1,
    homeAssignments: buildInitialHomeAssignments(tribeEnabled),
    passStates: buildInitialPassStates(),
    ruinStates: buildInitialRuinStates(),
  };
}

function loadInitialState(): PersistedState {
  const defaults = createDefaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    const tribeEnabled =
      Array.isArray(parsed.tribeEnabled) &&
      parsed.tribeEnabled.length === TRIBE_COUNT
        ? parsed.tribeEnabled.map(Boolean)
        : defaults.tribeEnabled;

    const tribeOrders =
      Array.isArray(parsed.tribeOrders) &&
      parsed.tribeOrders.length === TRIBE_COUNT
        ? parsed.tribeOrders.map((value) =>
            value === "order-a" || value === "order-b" ? value : null
          )
        : defaults.tribeOrders;

    return {
      mode:
        parsed.mode === "table" || parsed.mode === "visual"
          ? parsed.mode
          : null,
      configured:
        parsed.mode === "table" || parsed.mode === "visual"
          ? Boolean(parsed.configured)
          : false,
      tribeNames:
        Array.isArray(parsed.tribeNames) &&
        parsed.tribeNames.length === TRIBE_COUNT
          ? parsed.tribeNames.map((value) => String(value || ""))
          : defaults.tribeNames,
      tribeEnabled,
      tribeOrders,
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
      homeAssignments: normalizeHomeAssignments(
        parsed.homeAssignments,
        tribeEnabled
      ),
      passStates: normalizePassStates(parsed.passStates, tribeEnabled),
      ruinStates: normalizeRuinStates(parsed.ruinStates, tribeEnabled),
    };
  } catch {
    return defaults;
  }
}

function clearDisabledTribeFromState(
  state: PersistedState,
  disabledTribeId: string,
  disabledSlotIndex: number
): PersistedState {
  const nextOrders = [...state.tribeOrders];
  nextOrders[disabledSlotIndex] = null;

  return {
    ...state,
    tribeOrders: nextOrders,
    homeAssignments: state.homeAssignments.map((assignment) =>
      assignment.tribeId === disabledTribeId
        ? { ...assignment, tribeId: null }
        : assignment
    ),
    passStates: state.passStates.map((passState) => ({
      ...passState,
      currentOwner:
        passState.currentOwner === disabledTribeId
          ? null
          : passState.currentOwner,
      simulatedOwner:
        passState.simulatedOwner === disabledTribeId
          ? null
          : passState.simulatedOwner,
    })),
    ruinStates: state.ruinStates.map((ruinState) => ({
      ...ruinState,
      firstCaptureBy:
        ruinState.firstCaptureBy === disabledTribeId
          ? null
          : ruinState.firstCaptureBy,
      currentOwner:
        ruinState.currentOwner === disabledTribeId
          ? null
          : ruinState.currentOwner,
      simulatedOwner:
        ruinState.simulatedOwner === disabledTribeId
          ? null
          : ruinState.simulatedOwner,
    })),
  };
}

export default function GvgSimulatorApp({
  language,
  onReturnHome,
}: GvgSimulatorAppProps) {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [setupError, setSetupError] = useState("");
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

  const tribeSlots = useMemo<TribeSlot[]>(
    () =>
      Array.from({ length: TRIBE_COUNT }, (_, index) => ({
        id: `tribe-${index + 1}`,
        slotIndex: index,
        name: state.tribeNames[index]?.trim() || `Tribo ${index + 1}`,
        color:
          DEFAULT_TRIBE_COLOR_SCHEMES[index % DEFAULT_TRIBE_COLOR_SCHEMES.length]
            .primary,
        accentColor:
          DEFAULT_TRIBE_COLOR_SCHEMES[index % DEFAULT_TRIBE_COLOR_SCHEMES.length]
            .secondary,
        currentScore: state.currentScores[index] ?? 0,
        enabled: state.tribeEnabled[index] ?? false,
        orderId: state.tribeOrders[index] ?? null,
      })),
    [state.tribeNames, state.currentScores, state.tribeEnabled, state.tribeOrders]
  );

  const activeTribes = useMemo<Tribe[]>(
    () =>
      tribeSlots
        .filter((slot) => slot.enabled)
        .map(({ slotIndex: _slotIndex, enabled: _enabled, ...tribe }) => tribe),
    [tribeSlots]
  );

  function handleModeSelect(mode: SimulatorMode) {
    setSetupError("");
    setState((previous) => ({
      ...previous,
      mode,
      configured: false,
    }));
  }

  function handleBackToModeSelection() {
    setSetupError("");
    setState((previous) => ({
      ...previous,
      mode: null,
      configured: false,
    }));
  }

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

  function handleTribeEnabledChange(index: number, value: boolean) {
    setSetupError("");

    setState((previous) => {
      const nextEnabled = [...previous.tribeEnabled];
      nextEnabled[index] = value;

      let nextState: PersistedState = {
        ...previous,
        tribeEnabled: nextEnabled,
      };

      if (!value) {
        nextState = clearDisabledTribeFromState(
          nextState,
          `tribe-${index + 1}`,
          index
        );
      }

      return nextState;
    });
  }

  function handleTribeOrderChange(index: number, value: OrderId | null) {
    setState((previous) => {
      const nextOrders = [...previous.tribeOrders];
      nextOrders[index] = value;

      return {
        ...previous,
        tribeOrders: nextOrders,
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

  function handleAssignTribeToHome(homeId: string, tribeId: string | null) {
    setState((previous) => ({
      ...previous,
      homeAssignments: previous.homeAssignments.map((assignment) => {
        if (assignment.homeId === homeId) {
          return {
            ...assignment,
            tribeId,
          };
        }

        if (tribeId && assignment.tribeId === tribeId) {
          return {
            ...assignment,
            tribeId: null,
          };
        }

        return assignment;
      }),
    }));
  }

  function handlePassChange(
    passId: string,
    field: PassStateField,
    value: string | null
  ) {
    setState((previous) => ({
      ...previous,
      passStates: previous.passStates.map((passState) => {
        if (passState.id !== passId) {
          return passState;
        }

        if (field === "currentOwner") {
          const previousCurrentOwner = passState.currentOwner;
          const shouldSyncSimulation =
            passState.simulatedOwner === null ||
            passState.simulatedOwner === previousCurrentOwner;

          return {
            ...passState,
            currentOwner: value,
            simulatedOwner: shouldSyncSimulation
              ? value
              : passState.simulatedOwner,
          };
        }

        return {
          ...passState,
          [field]: value,
        };
      }),
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

  function handleSwitchMode(mode: SimulatorMode) {
    setState((previous) => ({
      ...previous,
      mode,
      configured: true,
    }));
  }

function handleResetSimulation() {
  setState((previous) => ({
    ...previous,
    currentDay: 1,
    tribeOrders: Array.from({ length: previous.tribeOrders.length }, () => null),
    passStates: previous.passStates.map((passState) => ({
      ...passState,
      currentOwner: null,
      simulatedOwner: null,
    })),
    ruinStates: previous.ruinStates.map((ruinState) => ({
      ...ruinState,
      firstCaptureBy: null,
      currentOwner: null,
      simulatedOwner: null,
    })),
  }));
}

  function handleContinue() {
    const enabledIndexes = state.tribeEnabled
      .map((enabled, index) => (enabled ? index : -1))
      .filter((index) => index >= 0);

    if (enabledIndexes.length < 2) {
      setSetupError("Ativa pelo menos duas tribos.");
      return;
    }

    const cleanedNames = state.tribeNames.map((name) => name.trim());
    const activeNames = enabledIndexes.map((index) => cleanedNames[index]);

    if (activeNames.some((name) => !name)) {
      setSetupError(t.errors.allTribesMustHaveAName);
      return;
    }

    const lowered = activeNames.map((name) => name.toLocaleLowerCase());
    if (new Set(lowered).size !== lowered.length) {
      setSetupError(t.errors.tribeNamesMustBeUnique);
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

  const isTableMode = state.mode === "table";
  const isVisualMode = state.mode === "visual";

  return (
    <main className="app-shell">
      <div className="app-container stack">
        {onReturnHome ? (
          <div className="app-top-actions">
            <button className="secondary-button" onClick={onReturnHome}>
              ← {t.common.back}
            </button>
          </div>
        ) : null}

        {!state.mode ? (
          <ModeSelectionScreen t={t} onSelectMode={handleModeSelect} />
        ) : isTableMode && !state.configured ? (
          <SetupScreen
            t={t}
            tribeNames={state.tribeNames}
            tribeEnabled={state.tribeEnabled}
            currentScores={state.currentScores}
            error={setupError}
            onTribeNameChange={handleTribeNameChange}
            onTribeEnabledChange={handleTribeEnabledChange}
            onCurrentScoreChange={handleCurrentScoreChange}
            onContinue={handleContinue}
            onBackToModeSelection={handleBackToModeSelection}
          />
        ) : isTableMode ? (
          <SimulationScreen
            t={t}
            tribes={activeTribes}
            currentDay={state.currentDay}
            currentUtc={currentUtc}
            ruinStates={state.ruinStates}
            onCurrentDayChange={handleCurrentDayChange}
            onRuinChange={handleRuinChange}
            onResetSimulation={handleResetSimulation}
            onSwitchToVisualMode={() => handleSwitchMode("visual")}
          />
        ) : isVisualMode ? (
          <SimulationScreenVisual
            t={t}
            tribeSlots={tribeSlots}
            currentDay={state.currentDay}
            currentUtc={currentUtc}
            homeAssignments={state.homeAssignments}
            passStates={state.passStates}
            ruinStates={state.ruinStates}
            onCurrentDayChange={handleCurrentDayChange}
            onTribeNameChange={handleTribeNameChange}
            onTribeEnabledChange={handleTribeEnabledChange}
            onTribeOrderChange={handleTribeOrderChange}
            onCurrentScoreChange={handleCurrentScoreChange}
            onAssignTribeToHome={handleAssignTribeToHome}
            onPassChange={handlePassChange}
            onRuinChange={handleRuinChange}
            onResetSimulation={handleResetSimulation}
            onSwitchToTableMode={() => handleSwitchMode("table")}
          />
        ) : null}
      </div>
    </main>
  );
}



