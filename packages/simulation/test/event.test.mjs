import assert from "node:assert/strict";
import test from "node:test";
import {
  ConditionEvaluationError,
  EventEvaluationError,
  ExpressionEvaluationError,
  evaluateEvent,
} from "../dist/index.js";

const context = {
  state: {
    t: 10,
    temperature: 105,
    status: "running",
    sensor: {
      readings: [1.2, 3.4],
    },
  },
  parameters: {
    limit: 100,
    multiplier: 3,
  },
};

test("evaluates unconditional event without payload", () => {
  const event = {
    name: "step_completed",
  };

  const result = evaluateEvent(event, context);
  assert.equal(result.emitted, true);
  assert.equal(result.name, "step_completed");
  assert.equal(result.payload, undefined);
});

test("evaluates unconditional event with expression payload", () => {
  const event = {
    name: "state_reported",
    payload: {
      type: "operation",
      operation: "multiply",
      operands: [
        { type: "state", path: ["t"] },
        { type: "parameter", name: "multiplier" },
      ],
    },
  };

  const result = evaluateEvent(event, context);
  assert.equal(result.emitted, true);
  assert.equal(result.name, "state_reported");
  assert.equal(result.payload, 30);
});

test("evaluates conditional event when condition is true", () => {
  // condition: temperature >= limit (105 >= 100 -> true)
  const event = {
    name: "overheat_warning",
    condition: {
      expression: {
        type: "operation",
        operation: "greater_than_or_equal",
        operands: [
          { type: "state", path: ["temperature"] },
          { type: "parameter", name: "limit" },
        ],
      },
    },
    payload: {
      type: "operation",
      operation: "subtract",
      operands: [
        { type: "state", path: ["temperature"] },
        { type: "parameter", name: "limit" },
      ],
    },
  };

  const result = evaluateEvent(event, context);
  assert.equal(result.emitted, true);
  assert.equal(result.name, "overheat_warning");
  assert.equal(result.payload, 5);
});

test("does not emit conditional event when condition is false and skips payload evaluation", () => {
  // condition: temperature < limit (105 < 100 -> false)
  // payload contains division by zero which must NOT be evaluated
  const event = {
    name: "underflow",
    condition: {
      expression: {
        type: "operation",
        operation: "less_than",
        operands: [
          { type: "state", path: ["temperature"] },
          { type: "parameter", name: "limit" },
        ],
      },
    },
    payload: {
      type: "operation",
      operation: "divide",
      operands: [
        { type: "literal", value: 10 },
        { type: "literal", value: 0 },
      ],
    },
  };

  const result = evaluateEvent(event, context);
  assert.equal(result.emitted, false);
  assert.equal(result.name, "underflow");
  assert.equal(result.payload, undefined);
});

test("allows repeated emission without internal side-effects or state modification", () => {
  const event = {
    name: "tick",
    payload: { type: "state", path: ["t"] },
  };

  const first = evaluateEvent(event, context);
  const second = evaluateEvent(event, context);

  assert.deepEqual(first, second);
  assert.equal(first.emitted, true);
  assert.equal(first.payload, 10);
});

test("deep-clones structured payload values to protect state from external mutation", () => {
  const originalState = structuredClone(context.state);
  const originalParams = structuredClone(context.parameters);

  const event = {
    name: "sensor_dump",
    payload: { type: "state", path: ["sensor", "readings"] },
  };

  const result = evaluateEvent(event, context);
  assert.equal(result.emitted, true);
  assert.deepEqual(result.payload, [1.2, 3.4]);

  // Mutate returned payload
  if (Array.isArray(result.payload)) {
    result.payload.push(5.6);
  }

  assert.deepEqual(context.state, originalState);
  assert.deepEqual(context.parameters, originalParams);
});

test("preserves underlying ConditionEvaluationError and ExpressionEvaluationError", () => {
  // condition error (non-boolean)
  assert.throws(
    () =>
      evaluateEvent(
        {
          name: "bad_condition",
          condition: { expression: { type: "literal", value: "non_boolean" } },
        },
        context,
      ),
    ConditionEvaluationError,
  );

  // payload error (missing state path)
  assert.throws(
    () =>
      evaluateEvent(
        {
          name: "bad_payload",
          payload: { type: "state", path: ["missing_field"] },
        },
        context,
      ),
    ExpressionEvaluationError,
  );

  // payload error (division by zero when condition is true/absent)
  assert.throws(
    () =>
      evaluateEvent(
        {
          name: "zero_div_payload",
          payload: {
            type: "operation",
            operation: "divide",
            operands: [
              { type: "literal", value: 1 },
              { type: "literal", value: 0 },
            ],
          },
        },
        context,
      ),
    ExpressionEvaluationError,
  );
});

test("throws EventEvaluationError on malformed event rule objects", () => {
  assert.throws(() => evaluateEvent(null, context), EventEvaluationError);
  assert.throws(() => evaluateEvent({}, context), EventEvaluationError);
  assert.throws(() => evaluateEvent({ name: "" }, context), EventEvaluationError);
  assert.throws(() => evaluateEvent({ name: 123 }, context), EventEvaluationError);
  assert.throws(() => evaluateEvent({ name: "   " }, context), EventEvaluationError);
});
