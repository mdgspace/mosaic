import { evaluateExpression } from "./evaluator.js";
import type { Condition, EvaluationContext } from "./types.js";

/** Error thrown when condition evaluation fails or produces a non-boolean result. */
export class ConditionEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConditionEvaluationError";
  }
}

/**
 * Deterministically evaluates a Condition against state and parameters.
 *
 * Enforces that the underlying expression produces a strict boolean result (no truthiness coercion).
 * Propagates underlying ExpressionEvaluationErrors unchanged if expression evaluation fails.
 */
export function evaluateCondition(
  condition: Condition,
  context: EvaluationContext,
): boolean {
  if (
    condition === null ||
    typeof condition !== "object" ||
    !("expression" in condition) ||
    condition.expression === null ||
    typeof condition.expression !== "object"
  ) {
    throw new ConditionEvaluationError("Invalid condition: missing or malformed expression");
  }

  const result = evaluateExpression(condition.expression, context);

  if (typeof result !== "boolean") {
    const formatted =
      result === null
        ? "null"
        : typeof result === "object"
          ? JSON.stringify(result)
          : String(result);
    throw new ConditionEvaluationError(
      `Condition expression must evaluate to a boolean, received: ${formatted} (${typeof result})`,
    );
  }

  return result;
}
