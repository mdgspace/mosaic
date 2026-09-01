import assert from "node:assert/strict";
import test from "node:test";
import {
  ConditionEvaluationError,
  ExpressionEvaluationError,
  evaluateCondition,
} from "../dist/index.js";

const context = {
  state: {
    t: 15,
    position: -25,
    status: "active",
    velocity: -8,
    config: {
      flags: [true, false],
    },
  },
  parameters: {
    limit: 10,
    maxSpeed: 5,
    multiplier: 2,
  },
};

test("evaluates boolean literal conditions", () => {
  const trueCondition = {
    expression: { type: "literal", value: true },
  };
  assert.equal(evaluateCondition(trueCondition, context), true);

  const falseCondition = {
    expression: { type: "literal", value: false },
  };
  assert.equal(evaluateCondition(falseCondition, context), false);
});

test("evaluates comparison conditions returning true and false", () => {
  // state.t >= parameter.limit (15 >= 10 -> true)
  const trueComparison = {
    expression: {
      type: "operation",
      operation: "greater_than_or_equal",
      operands: [
        { type: "state", path: ["t"] },
        { type: "parameter", name: "limit" },
      ],
    },
  };
  assert.equal(evaluateCondition(trueComparison, context), true);

  // state.t < parameter.limit (15 < 10 -> false)
  const falseComparison = {
    expression: {
      type: "operation",
      operation: "less_than",
      operands: [
        { type: "state", path: ["t"] },
        { type: "parameter", name: "limit" },
      ],
    },
  };
  assert.equal(evaluateCondition(falseComparison, context), false);
});

test("evaluates nested expression conditions returning a boolean", () => {
  // abs(state.velocity) > parameter.maxSpeed -> abs(-8) > 5 -> 8 > 5 -> true
  const nestedCondition = {
    expression: {
      type: "operation",
      operation: "greater_than",
      operands: [
        {
          type: "operation",
          operation: "abs",
          operands: [{ type: "state", path: ["velocity"] }],
        },
        { type: "parameter", name: "maxSpeed" },
      ],
    },
  };
  assert.equal(evaluateCondition(nestedCondition, context), true);
});

test("throws ConditionEvaluationError when expression evaluates to a non-boolean (no truthiness coercion)", () => {
  // numeric 1
  assert.throws(
    () =>
      evaluateCondition(
        { expression: { type: "literal", value: 1 } },
        context,
      ),
    ConditionEvaluationError,
  );

  // numeric 0
  assert.throws(
    () =>
      evaluateCondition(
        { expression: { type: "literal", value: 0 } },
        context,
      ),
    ConditionEvaluationError,
  );

  // string "true"
  assert.throws(
    () =>
      evaluateCondition(
        { expression: { type: "literal", value: "true" } },
        context,
      ),
    ConditionEvaluationError,
  );

  // empty string ""
  assert.throws(
    () =>
      evaluateCondition(
        { expression: { type: "literal", value: "" } },
        context,
      ),
    ConditionEvaluationError,
  );

  // null
  assert.throws(
    () =>
      evaluateCondition(
        { expression: { type: "literal", value: null } },
        context,
      ),
    ConditionEvaluationError,
  );

  // array []
  assert.throws(
    () =>
      evaluateCondition(
        { expression: { type: "literal", value: [] } },
        context,
      ),
    ConditionEvaluationError,
  );

  // object {}
  assert.throws(
    () =>
      evaluateCondition(
        { expression: { type: "literal", value: {} } },
        context,
      ),
    ConditionEvaluationError,
  );

  // arithmetic expression producing number
  assert.throws(
    () =>
      evaluateCondition(
        {
          expression: {
            type: "operation",
            operation: "add",
            operands: [
              { type: "state", path: ["t"] },
              { type: "parameter", name: "limit" },
            ],
          },
        },
        context,
      ),
    ConditionEvaluationError,
  );
});

test("preserves underlying ExpressionEvaluationError unchanged", () => {
  // missing state path
  assert.throws(
    () =>
      evaluateCondition(
        { expression: { type: "state", path: ["missingProperty"] } },
        context,
      ),
    ExpressionEvaluationError,
  );

  // unknown parameter
  assert.throws(
    () =>
      evaluateCondition(
        { expression: { type: "parameter", name: "unknownParam" } },
        context,
      ),
    ExpressionEvaluationError,
  );

  // division by zero
  assert.throws(
    () =>
      evaluateCondition(
        {
          expression: {
            type: "operation",
            operation: "equal",
            operands: [
              {
                type: "operation",
                operation: "divide",
                operands: [
                  { type: "literal", value: 10 },
                  { type: "literal", value: 0 },
                ],
              },
              { type: "literal", value: 5 },
            ],
          },
        },
        context,
      ),
    ExpressionEvaluationError,
  );
});

test("condition evaluation does not mutate state or parameters", () => {
  const originalState = structuredClone(context.state);
  const originalParams = structuredClone(context.parameters);

  const condition = {
    expression: {
      type: "operation",
      operation: "equal",
      operands: [
        { type: "state", path: ["config"] },
        { type: "literal", value: { flags: [true, false] } },
      ],
    },
  };

  const result = evaluateCondition(condition, context);
  assert.equal(result, true);

  assert.deepEqual(context.state, originalState);
  assert.deepEqual(context.parameters, originalParams);
});

test("throws ConditionEvaluationError on malformed condition objects", () => {
  assert.throws(() => evaluateCondition(null, context), ConditionEvaluationError);
  assert.throws(() => evaluateCondition({}, context), ConditionEvaluationError);
  assert.throws(() => evaluateCondition({ expression: null }, context), ConditionEvaluationError);
});
