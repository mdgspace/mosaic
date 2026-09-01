import type {
  Condition,
  EmittedEvent,
  EventRule,
  Expression,
  StateUpdate,
  Transition,
} from "@mosaic/schemas";

export type {
  ArithmeticOperation,
  BinaryOperation,
  BinaryOperationExpression,
  ComparisonOperation,
  Condition,
  EmittedEvent,
  EventEvaluationResult,
  EventRule,
  Expression,
  LiteralExpression,
  Operation,
  OperationExpression,
  ParameterExpression,
  StateExpression,
  StateUpdate,
  Transition,
  UnaryOperation,
  UnaryOperationExpression,
} from "@mosaic/schemas";

/** JSON-compatible values accepted by a validated SimulationSpec. */
export type JsonValue = boolean | JsonObject | JsonValue[] | null | number | string;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type SimulationState = JsonObject;

export type ParameterType = "array" | "boolean" | "number" | "string";

export interface ValidatedParameter {
  readonly name: string;
  readonly type: ParameterType;
  readonly value: JsonValue;
}

/**
 * The engine accepts these validated SimulationSpec fields. The complete
 * contract remains defined by the JSON Schema in @mosaic/schemas.
 */
export interface ValidatedSimulationSpec {
  readonly initialState: SimulationState;
  readonly parameters: readonly ValidatedParameter[];
  readonly transitions?: readonly Transition[];
  readonly eventRules?: readonly EventRule[];
}

export interface StepResult {
  readonly state: SimulationState;
  readonly events: readonly EmittedEvent[];
}


export type ParameterValues = Readonly<Record<string, JsonValue>>;

export interface StepAction {
  readonly type: "step";
}

export interface ResetAction {
  readonly type: "reset";
}

export interface SetParameterAction {
  readonly type: "set_parameter";
  readonly target?: string;
  readonly parameters?: JsonObject;
}

/** The subset of SimulationSpec actions with engine behavior in v0.1. */
export type EngineAction = ResetAction | SetParameterAction | StepAction;

export interface StepContext {
  readonly parameters: ParameterValues;
  readonly state: SimulationState;
}

export interface EvaluationContext {
  readonly parameters: ParameterValues;
  readonly state: SimulationState;
}

export interface TransitionResult {
  readonly applied: boolean;
  readonly state: SimulationState;
}

/** A trusted, typed state transition supplied by a future simulation layer. */
export type StepBehavior = (context: StepContext) => SimulationState | undefined;

export interface SimulationEngineOptions {
  readonly onStep?: StepBehavior;
}
