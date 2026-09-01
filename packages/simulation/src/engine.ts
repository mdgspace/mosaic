import { evaluateEvent } from "./event.js";
import { applyTransition } from "./transition.js";
import type {
  EmittedEvent,
  EngineAction,
  EventRule,
  JsonObject,
  JsonValue,
  ParameterType,
  ParameterValues,
  SimulationEngineOptions,
  SimulationState,
  StepContext,
  StepResult,
  Transition,
  ValidatedSimulationSpec,
} from "./types.js";

/**
 * Framework-independent state holder and execution engine for a validated SimulationSpec.
 *
 * It executes structured Transitions and EventRules deterministically without owning
 * scheduling, rendering, or domain-specific UI behavior.
 */
export class SimulationEngine {
  readonly #eventRules: readonly EventRule[];
  readonly #initialParameters: Record<string, JsonValue>;
  readonly #initialState: SimulationState;
  readonly #onStep?: SimulationEngineOptions["onStep"];
  readonly #parameterTypes: Record<string, ParameterType>;
  readonly #transitions: readonly Transition[];

  #parameters: Record<string, JsonValue>;
  #state: SimulationState;

  constructor(spec: ValidatedSimulationSpec, options: SimulationEngineOptions = {}) {
    this.#initialState = clone(spec.initialState);
    this.#state = clone(spec.initialState);
    this.#initialParameters = parametersFrom(spec);
    this.#parameterTypes = parameterTypesFrom(spec);
    this.#parameters = clone(this.#initialParameters);
    this.#transitions = spec.transitions ? clone(spec.transitions) : [];
    this.#eventRules = spec.eventRules ? clone(spec.eventRules) : [];
    this.#onStep = options.onStep;
  }

  /** Returns a snapshot so callers cannot mutate engine-owned state. */
  getState(): SimulationState {
    return clone(this.#state);
  }

  /** Returns the current parameter values, kept separate from simulation state. */
  getParameters(): ParameterValues {
    return clone(this.#parameters);
  }

  /**
   * Executes a single simulation step:
   * 1. Evaluates declared Transitions sequentially against the working state.
   * 2. Evaluates declared EventRules against the post-transition working state.
   * 3. Atomically commits the working state only after all transitions and event rules succeed.
   * 4. Returns the resulting state snapshot and emitted events.
   */
  step(): StepResult {
    const preStepState = this.getState();
    const parameters = this.getParameters();
    let workingState = clone(preStepState);

    // 1. Evaluate transitions sequentially
    for (const transition of this.#transitions) {
      const result = applyTransition(transition, {
        state: workingState,
        parameters,
      });
      if (result.applied) {
        workingState = result.state;
      }
    }

    // 2. Legacy onStep callback compatibility
    if (this.#onStep !== undefined) {
      const nextState = this.#onStep({
        state: clone(workingState),
        parameters,
      });
      if (nextState !== undefined) {
        workingState = clone(nextState);
      }
    }

    // 3. Evaluate event rules against post-transition working state
    const emittedEvents: EmittedEvent[] = [];
    for (const eventRule of this.#eventRules) {
      const eventResult = evaluateEvent(eventRule, {
        state: workingState,
        parameters,
      });
      if (eventResult.emitted) {
        emittedEvents.push(
          eventResult.payload !== undefined
            ? { name: eventResult.name, payload: clone(eventResult.payload) }
            : { name: eventResult.name },
        );
      }
    }

    // 4. Atomically commit post-step state
    this.#state = clone(workingState);

    return {
      state: this.getState(),
      events: emittedEvents,
    };
  }

  dispatch(action: EngineAction): void {
    switch (action.type) {
      case "reset":
        this.#state = clone(this.#initialState);
        this.#parameters = clone(this.#initialParameters);
        return;
      case "set_parameter":
        this.#setParameter(action.target, action.parameters);
        return;
      case "step":
        this.step();
        return;
    }
  }

  #setParameter(target: string | undefined, parameters: JsonObject | undefined): void {
    if (target === undefined || parameters === undefined || !("value" in parameters)) {
      throw new Error("set_parameter requires a target and parameters.value");
    }

    if (!(target in this.#parameters)) {
      throw new Error(`Unknown simulation parameter: ${target}`);
    }

    const value = parameters.value;
    if (!matchesParameterType(value, this.#parameterTypes[target])) {
      throw new Error(`Invalid value for simulation parameter: ${target}`);
    }

    this.#parameters[target] = clone(value);
  }
}

function parametersFrom(spec: ValidatedSimulationSpec): Record<string, JsonValue> {
  return Object.fromEntries(spec.parameters.map((parameter) => [parameter.name, parameter.value]));
}

function parameterTypesFrom(spec: ValidatedSimulationSpec): Record<string, ParameterType> {
  return Object.fromEntries(spec.parameters.map((parameter) => [parameter.name, parameter.type]));
}

function matchesParameterType(value: JsonValue, type: ParameterType): boolean {
  switch (type) {
    case "array":
      return Array.isArray(value);
    case "boolean":
    case "number":
    case "string":
      return typeof value === type;
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
