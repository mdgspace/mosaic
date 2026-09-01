import type {
  EvaluationContext,
  Expression,
  JsonObject,
  JsonValue,
} from "./types.js";

/** Error thrown during expression evaluation when a contract or semantic rule is violated. */
export class ExpressionEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpressionEvaluationError";
  }
}

/**
 * Deterministically evaluates a structured Expression against state and parameters.
 *
 * It is side-effect free, does not mutate input context, and enforces strict
 * type and arity constraints without JavaScript coercion.
 */
export function evaluateExpression(
  expression: Expression,
  context: EvaluationContext,
): JsonValue {
  switch (expression.type) {
    case "state": {
      if (!Array.isArray(expression.path) || expression.path.length === 0) {
        throw new ExpressionEvaluationError("State reference path must be a non-empty array of strings");
      }

      let current: unknown = context.state;
      for (let i = 0; i < expression.path.length; i++) {
        const segment = expression.path[i];
        if (current === null || typeof current !== "object" || !(segment in current)) {
          const resolvedPath = expression.path.slice(0, i + 1).join(".");
          throw new ExpressionEvaluationError(
            `State path not found: "${expression.path.join(".")}" (missing segment "${segment}" at "${resolvedPath}")`,
          );
        }
        current = (current as Record<string, unknown>)[segment];
      }

      return clone(current as JsonValue);
    }

    case "parameter": {
      if (typeof expression.name !== "string" || !(expression.name in context.parameters)) {
        throw new ExpressionEvaluationError(`Unknown simulation parameter: "${expression.name}"`);
      }

      return clone(context.parameters[expression.name]);
    }

    case "literal": {
      return clone(expression.value);
    }

    case "operation": {
      switch (expression.operation) {
        case "abs": {
          if (expression.operands.length !== 1) {
            throw new ExpressionEvaluationError(
              `Operation "abs" requires exactly 1 operand, received ${expression.operands.length}`,
            );
          }
          const val = evaluateExpression(expression.operands[0], context);
          const num = assertFiniteNumber(val, "abs", "operand");
          return Math.abs(num);
        }

        case "add":
        case "subtract":
        case "multiply":
        case "divide": {
          if (expression.operands.length !== 2) {
            throw new ExpressionEvaluationError(
              `Operation "${expression.operation}" requires exactly 2 operands, received ${expression.operands.length}`,
            );
          }
          const leftVal = evaluateExpression(expression.operands[0], context);
          const rightVal = evaluateExpression(expression.operands[1], context);
          const left = assertFiniteNumber(leftVal, expression.operation, "left operand");
          const right = assertFiniteNumber(rightVal, expression.operation, "right operand");

          if (expression.operation === "divide") {
            if (right === 0) {
              throw new ExpressionEvaluationError('Division by zero in operation "divide"');
            }
            return left / right;
          }

          if (expression.operation === "add") return left + right;
          if (expression.operation === "subtract") return left - right;
          return left * right;
        }

        case "equal":
        case "not_equal": {
          if (expression.operands.length !== 2) {
            throw new ExpressionEvaluationError(
              `Operation "${expression.operation}" requires exactly 2 operands, received ${expression.operands.length}`,
            );
          }
          const left = evaluateExpression(expression.operands[0], context);
          const right = evaluateExpression(expression.operands[1], context);
          const isEqual = areJsonValuesEqual(left, right);
          return expression.operation === "equal" ? isEqual : !isEqual;
        }

        case "greater_than":
        case "greater_than_or_equal":
        case "less_than":
        case "less_than_or_equal": {
          if (expression.operands.length !== 2) {
            throw new ExpressionEvaluationError(
              `Operation "${expression.operation}" requires exactly 2 operands, received ${expression.operands.length}`,
            );
          }
          const leftVal = evaluateExpression(expression.operands[0], context);
          const rightVal = evaluateExpression(expression.operands[1], context);
          const left = assertFiniteNumber(leftVal, expression.operation, "left operand");
          const right = assertFiniteNumber(rightVal, expression.operation, "right operand");

          if (expression.operation === "greater_than") return left > right;
          if (expression.operation === "greater_than_or_equal") return left >= right;
          if (expression.operation === "less_than") return left < right;
          return left <= right;
        }

        default: {
          throw new ExpressionEvaluationError(
            `Unsupported operation: "${(expression as { operation: string }).operation}"`,
          );
        }
      }
    }

    default: {
      throw new ExpressionEvaluationError(
        `Unsupported expression type: "${(expression as { type: string }).type}"`,
      );
    }
  }
}

/** Deterministic deep equality comparison for JSON-compatible values. */
export function areJsonValuesEqual(a: JsonValue, b: JsonValue): boolean {
  if (a === b) {
    return true;
  }

  if (a === null || b === null || typeof a !== typeof b) {
    return false;
  }

  if (typeof a === "object" && typeof b === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) {
      return false;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!areJsonValuesEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }

    const aObj = a as JsonObject;
    const bObj = b as JsonObject;
    const keysA = Object.keys(aObj);
    const keysB = Object.keys(bObj);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!(key in bObj) || !areJsonValuesEqual(aObj[key], bObj[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function assertFiniteNumber(value: JsonValue, operation: string, operandDesc: string): number {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new ExpressionEvaluationError(
      `Operation "${operation}" requires numeric operands, but ${operandDesc} evaluated to ${formatValue(value)} (${typeof value})`,
    );
  }
  return value;
}

function formatValue(value: JsonValue): string {
  if (value === null) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
