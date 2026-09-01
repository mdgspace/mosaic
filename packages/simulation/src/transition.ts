import { evaluateCondition } from "./condition.js";
import { evaluateExpression } from "./evaluator.js";
import type {
  EvaluationContext,
  JsonValue,
  SimulationState,
  Transition,
} from "./types.js";

/** Error thrown when a state transition fails or encounters an invalid target. */
export class TransitionEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransitionEvaluationError";
  }
}

/** The result of applying a transition to simulation state. */
export interface TransitionResult {
  readonly applied: boolean;
  readonly state: SimulationState;
}

interface EvaluatedUpdate {
  readonly target: readonly string[];
  readonly value: JsonValue;
}

const FORBIDDEN_SEGMENTS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Deterministically applies an atomic State Transition to simulation state.
 *
 * - If a condition exists and evaluates to false, updates are not evaluated and the state is unchanged.
 * - All updates are evaluated against the SAME pre-transition state snapshot.
 * - If any update fails, no updates are committed (atomicity).
 * - Supplied state and parameters are never mutated (immutability).
 */
export function applyTransition(
  transition: Transition,
  context: EvaluationContext,
): TransitionResult {
  if (
    transition === null ||
    typeof transition !== "object" ||
    !("updates" in transition) ||
    !Array.isArray(transition.updates) ||
    transition.updates.length === 0
  ) {
    throw new TransitionEvaluationError("Invalid transition: missing or empty updates array");
  }

  if (transition.condition !== undefined) {
    const conditionMet = evaluateCondition(transition.condition, context);
    if (!conditionMet) {
      return {
        applied: false,
        state: clone(context.state),
      };
    }
  }

  // Pre-transition snapshot semantics: all updates observe this snapshot
  const snapshot = clone(context.state);
  const snapshotContext: EvaluationContext = {
    state: snapshot,
    parameters: context.parameters,
  };

  const evaluatedUpdates: EvaluatedUpdate[] = [];

  for (let i = 0; i < transition.updates.length; i++) {
    const update = transition.updates[i];
    if (
      update === null ||
      typeof update !== "object" ||
      !("target" in update) ||
      !("value" in update) ||
      !Array.isArray(update.target) ||
      update.target.length === 0
    ) {
      throw new TransitionEvaluationError(
        `Invalid state update at index ${i}: target must be a non-empty string array and value must be an Expression`,
      );
    }

    for (const segment of update.target) {
      if (typeof segment !== "string" || segment === "") {
        throw new TransitionEvaluationError(
          `Invalid state update target at index ${i}: segments must be non-empty strings`,
        );
      }
      if (FORBIDDEN_SEGMENTS.has(segment)) {
        throw new TransitionEvaluationError(
          `Invalid state update target at index ${i}: forbidden target segment "${segment}"`,
        );
      }
    }

    // Verify that parent path exists in snapshot and is an object
    let current: unknown = snapshot;
    for (let j = 0; j < update.target.length - 1; j++) {
      const segment = update.target[j];
      if (current === null || typeof current !== "object" || !(segment in current)) {
        const resolvedPath = update.target.slice(0, j + 1).join(".");
        throw new TransitionEvaluationError(
          `Target parent path not found: "${update.target.join(".")}" (missing segment "${segment}" at "${resolvedPath}")`,
        );
      }
      current = (current as Record<string, unknown>)[segment];
      if (current === null || typeof current !== "object" || Array.isArray(current)) {
        const resolvedPath = update.target.slice(0, j + 1).join(".");
        throw new TransitionEvaluationError(
          `Target parent path is not an object: "${update.target.join(".")}" (segment "${segment}" at "${resolvedPath}" is ${typeof current})`,
        );
      }
    }

    if (current === null || typeof current !== "object" || Array.isArray(current)) {
      throw new TransitionEvaluationError(
        `Target parent container is not an object for target "${update.target.join(".")}"`,
      );
    }

    // Evaluate update value against the pre-transition snapshot
    const evaluatedValue = evaluateExpression(update.value, snapshotContext);
    evaluatedUpdates.push({
      target: update.target,
      value: clone(evaluatedValue),
    });
  }

  // Atomically apply all evaluated updates to a fresh clone
  const nextState = clone(context.state);
  for (const { target, value } of evaluatedUpdates) {
    let current: any = nextState;
    for (let j = 0; j < target.length - 1; j++) {
      current = current[target[j]];
    }
    const lastSegment = target[target.length - 1];
    current[lastSegment] = value;
  }

  return {
    applied: true,
    state: nextState,
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
