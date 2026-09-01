import assert from "node:assert/strict";
import test from "node:test";
import {
  ExpressionEvaluationError,
  areJsonValuesEqual,
  evaluateExpression,
} from "../dist/index.js";

const context = {
  state: {
    position: 10,
    velocity: 5,
    status: "active",
    player: {
      health: 100,
      physics: {
        velocity: 2.5,
      },
    },
    items: ["sword", "shield"],
    config: {
      tags: ["alpha", "beta"],
    },
  },
  parameters: {
    multiplier: 2,
    threshold: 50,
    flag: true,
    label: "default",
  },
};

test("evaluates state references with single and nested paths", () => {
  const singleSegment = { type: "state", path: ["position"] };
  assert.equal(evaluateExpression(singleSegment, context), 10);

  const nestedSegment = { type: "state", path: ["player", "physics", "velocity"] };
  assert.equal(evaluateExpression(nestedSegment, context), 2.5);

  const arrayInState = { type: "state", path: ["items"] };
  assert.deepEqual(evaluateExpression(arrayInState, context), ["sword", "shield"]);
});

test("evaluates parameter references by name", () => {
  const param = { type: "parameter", name: "multiplier" };
  assert.equal(evaluateExpression(param, context), 2);

  const boolParam = { type: "parameter", name: "flag" };
  assert.equal(evaluateExpression(boolParam, context), true);
});

test("evaluates literals across JSON types", () => {
  assert.equal(evaluateExpression({ type: "literal", value: 5 }, context), 5);
  assert.equal(evaluateExpression({ type: "literal", value: true }, context), true);
  assert.equal(evaluateExpression({ type: "literal", value: "hello" }, context), "hello");
  assert.equal(evaluateExpression({ type: "literal", value: null }, context), null);
  assert.deepEqual(evaluateExpression({ type: "literal", value: [1, 2, 3] }, context), [1, 2, 3]);
  assert.deepEqual(evaluateExpression({ type: "literal", value: { a: 1 } }, context), { a: 1 });
});

test("evaluates arithmetic operations with strict numeric operands", () => {
  // 2 + 3 = 5
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "add",
        operands: [
          { type: "literal", value: 2 },
          { type: "literal", value: 3 },
        ],
      },
      context,
    ),
    5,
  );

  // 10 - 4 = 6
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "subtract",
        operands: [
          { type: "literal", value: 10 },
          { type: "literal", value: 4 },
        ],
      },
      context,
    ),
    6,
  );

  // 3 * 4 = 12
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "multiply",
        operands: [
          { type: "literal", value: 3 },
          { type: "literal", value: 4 },
        ],
      },
      context,
    ),
    12,
  );

  // 10 / 2 = 5
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "divide",
        operands: [
          { type: "literal", value: 10 },
          { type: "literal", value: 2 },
        ],
      },
      context,
    ),
    5,
  );
});

test("evaluates nested expression: state.position + state.velocity * parameter.multiplier", () => {
  // 10 + (5 * 2) = 20
  const nestedExpr = {
    type: "operation",
    operation: "add",
    operands: [
      {
        type: "state",
        path: ["position"],
      },
      {
        type: "operation",
        operation: "multiply",
        operands: [
          {
            type: "state",
            path: ["velocity"],
          },
          {
            type: "parameter",
            name: "multiplier",
          },
        ],
      },
    ],
  };

  assert.equal(evaluateExpression(nestedExpr, context), 20);
});

test("evaluates unary abs operation", () => {
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "abs",
        operands: [{ type: "literal", value: -5 }],
      },
      context,
    ),
    5,
  );

  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "abs",
        operands: [{ type: "literal", value: 5 }],
      },
      context,
    ),
    5,
  );

  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "abs",
        operands: [{ type: "literal", value: 0 }],
      },
      context,
    ),
    0,
  );
});

test("evaluates equality comparisons using deep JSON-value semantics", () => {
  // equal primitives
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "equal",
        operands: [
          { type: "state", path: ["status"] },
          { type: "literal", value: "active" },
        ],
      },
      context,
    ),
    true,
  );

  // not equal primitives
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "not_equal",
        operands: [
          { type: "state", path: ["status"] },
          { type: "literal", value: "inactive" },
        ],
      },
      context,
    ),
    true,
  );

  // deep equality on arrays
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "equal",
        operands: [
          { type: "state", path: ["items"] },
          { type: "literal", value: ["sword", "shield"] },
        ],
      },
      context,
    ),
    true,
  );

  // deep equality on objects with different key insertion order
  assert.equal(
    areJsonValuesEqual({ a: 1, b: { c: 2 } }, { b: { c: 2 }, a: 1 }),
    true,
  );
});

test("evaluates ordering comparisons with strict numeric operands", () => {
  // greater_than
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "greater_than",
        operands: [
          { type: "state", path: ["player", "health"] },
          { type: "parameter", name: "threshold" },
        ],
      },
      context,
    ),
    true,
  );

  // greater_than_or_equal
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "greater_than_or_equal",
        operands: [
          { type: "literal", value: 50 },
          { type: "parameter", name: "threshold" },
        ],
      },
      context,
    ),
    true,
  );

  // less_than
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "less_than",
        operands: [
          { type: "state", path: ["position"] },
          { type: "parameter", name: "threshold" },
        ],
      },
      context,
    ),
    true,
  );

  // less_than_or_equal
  assert.equal(
    evaluateExpression(
      {
        type: "operation",
        operation: "less_than_or_equal",
        operands: [
          { type: "literal", value: 50 },
          { type: "parameter", name: "threshold" },
        ],
      },
      context,
    ),
    true,
  );
});

test("throws ExpressionEvaluationError on missing state path", () => {
  assert.throws(
    () => evaluateExpression({ type: "state", path: ["missing"] }, context),
    ExpressionEvaluationError,
  );

  assert.throws(
    () => evaluateExpression({ type: "state", path: ["player", "missingProp"] }, context),
    ExpressionEvaluationError,
  );

  assert.throws(
    () => evaluateExpression({ type: "state", path: ["position", "nestedOnNumber"] }, context),
    ExpressionEvaluationError,
  );
});

test("throws ExpressionEvaluationError on unknown parameter", () => {
  assert.throws(
    () => evaluateExpression({ type: "parameter", name: "nonExistentParam" }, context),
    ExpressionEvaluationError,
  );
});

test("throws ExpressionEvaluationError when non-numeric operands are passed to arithmetic", () => {
  // string operand
  assert.throws(
    () =>
      evaluateExpression(
        {
          type: "operation",
          operation: "add",
          operands: [
            { type: "literal", value: "hello" },
            { type: "literal", value: 5 },
          ],
        },
        context,
      ),
    /requires numeric operands/,
  );

  // boolean operand
  assert.throws(
    () =>
      evaluateExpression(
        {
          type: "operation",
          operation: "multiply",
          operands: [
            { type: "literal", value: true },
            { type: "literal", value: 5 },
          ],
        },
        context,
      ),
    /requires numeric operands/,
  );
});

test("throws ExpressionEvaluationError on division by zero", () => {
  assert.throws(
    () =>
      evaluateExpression(
        {
          type: "operation",
          operation: "divide",
          operands: [
            { type: "literal", value: 10 },
            { type: "literal", value: 0 },
          ],
        },
        context,
      ),
    /Division by zero/,
  );
});

test("throws ExpressionEvaluationError when non-numeric operand is passed to abs", () => {
  assert.throws(
    () =>
      evaluateExpression(
        {
          type: "operation",
          operation: "abs",
          operands: [{ type: "literal", value: "negative" }],
        },
        context,
      ),
    /requires a finite number operand|requires numeric operands/,
  );
});

test("throws ExpressionEvaluationError on invalid ordering comparison operands", () => {
  assert.throws(
    () =>
      evaluateExpression(
        {
          type: "operation",
          operation: "greater_than",
          operands: [
            { type: "literal", value: "apple" },
            { type: "literal", value: "banana" },
          ],
        },
        context,
      ),
    /requires numeric operands/,
  );
});

test("evaluator does not mutate supplied state or parameters", () => {
  const originalState = structuredClone(context.state);
  const originalParams = structuredClone(context.parameters);

  const evaluated = evaluateExpression({ type: "state", path: ["config"] }, context);
  if (typeof evaluated === "object" && evaluated !== null && "tags" in evaluated && Array.isArray(evaluated.tags)) {
    evaluated.tags.push("gamma");
  }

  assert.deepEqual(context.state, originalState);
  assert.deepEqual(context.parameters, originalParams);
});
