/**
 * SimulationSpec v0.1 is schema-first. Consumers should validate against the
 * exported JSON Schema rather than relying on a hand-written runtime contract.
 */

export type JsonValue = boolean | JsonObject | JsonValue[] | null | number | string;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type ArithmeticOperation = "add" | "subtract" | "multiply" | "divide";

export type ComparisonOperation =
  | "equal"
  | "not_equal"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal";

export type UnaryOperation = "abs";

export type BinaryOperation = ArithmeticOperation | ComparisonOperation;

export type Operation = BinaryOperation | UnaryOperation;

export interface StateExpression {
  readonly type: "state";
  readonly path: readonly string[];
}

export interface ParameterExpression {
  readonly type: "parameter";
  readonly name: string;
}

export interface LiteralExpression {
  readonly type: "literal";
  readonly value: JsonValue;
}

export interface BinaryOperationExpression {
  readonly type: "operation";
  readonly operation: BinaryOperation;
  readonly operands: readonly [Expression, Expression];
}

export interface UnaryOperationExpression {
  readonly type: "operation";
  readonly operation: UnaryOperation;
  readonly operands: readonly [Expression];
}

export type OperationExpression = BinaryOperationExpression | UnaryOperationExpression;

export type Expression =
  | StateExpression
  | ParameterExpression
  | LiteralExpression
  | OperationExpression;

export interface Condition {
  readonly expression: Expression;
}

export interface StateUpdate {
  readonly target: readonly string[];
  readonly value: Expression;
}

export interface Transition {
  readonly condition?: Condition;
  readonly updates: readonly StateUpdate[];
}

export interface EventRule {
  readonly name: string;
  readonly condition?: Condition;
  readonly payload?: Expression;
}

export interface EventEvaluationResult {
  readonly emitted: boolean;
  readonly name: string;
  readonly payload?: JsonValue;
}

export interface EmittedEvent {
  readonly name: string;
  readonly payload?: JsonValue;
}
