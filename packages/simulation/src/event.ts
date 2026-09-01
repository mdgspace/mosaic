import { evaluateCondition } from "./condition.js";
import { evaluateExpression } from "./evaluator.js";
import type {
  EvaluationContext,
  EventEvaluationResult,
  EventRule,
} from "./types.js";

/** Error thrown when an event rule has an invalid structure at runtime. */
export class EventEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventEvaluationError";
  }
}

/**
 * Deterministically evaluates an EventRule against state and parameters.
 *
 * - If a condition exists and evaluates to false, the event is not emitted and its payload is not evaluated.
 * - If the event fires and a payload expression is provided, it is evaluated and deep-cloned.
 * - Side-effect free: does not mutate state/parameters and does not maintain internal history.
 * - Preserves underlying ConditionEvaluationError and ExpressionEvaluationError.
 */
export function evaluateEvent(
  event: EventRule,
  context: EvaluationContext,
): EventEvaluationResult {
  if (
    event === null ||
    typeof event !== "object" ||
    typeof event.name !== "string" ||
    event.name.trim() === ""
  ) {
    throw new EventEvaluationError(
      "Invalid event rule: name must be a non-empty string",
    );
  }

  if (event.condition !== undefined) {
    const conditionMet = evaluateCondition(event.condition, context);
    if (!conditionMet) {
      return {
        emitted: false,
        name: event.name,
      };
    }
  }

  if (event.payload !== undefined) {
    const payload = evaluateExpression(event.payload, context);
    return {
      emitted: true,
      name: event.name,
      payload: clone(payload),
    };
  }

  return {
    emitted: true,
    name: event.name,
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
