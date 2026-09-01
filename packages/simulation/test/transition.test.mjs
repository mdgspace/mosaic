import assert from "node:assert/strict";
import test from "node:test";
import {
  ConditionEvaluationError,
  ExpressionEvaluationError,
  TransitionEvaluationError,
  applyTransition,
} from "../dist/index.js";

const context = {
  state: {
    position: 10,
    velocity: 2,
    status: "idle",
    player: {
      health: 100,
      physics: {
        speed: 15,
      },
    },
    items: ["apple"],
  },
  parameters: {
    acceleration: 1,
    limit: 5,
    maxHealth: 150,
  },
};

test("applies unconditional transition", () => {
  const transition = {
    updates: [
      {
        target: ["status"],
        value: { type: "literal", value: "running" },
      },
    ],
  };

  const result = applyTransition(transition, context);
  assert.equal(result.applied, true);
  assert.equal(result.state.status, "running");
  assert.equal(result.state.position, 10);
});

test("applies conditional transition when condition is true", () => {
  // condition: position > limit (10 > 5 -> true)
  const transition = {
    condition: {
      expression: {
        type: "operation",
        operation: "greater_than",
        operands: [
          { type: "state", path: ["position"] },
          { type: "parameter", name: "limit" },
        ],
      },
    },
    updates: [
      {
        target: ["status"],
        value: { type: "literal", value: "limit_exceeded" },
      },
    ],
  };

  const result = applyTransition(transition, context);
  assert.equal(result.applied, true);
  assert.equal(result.state.status, "limit_exceeded");
});

test("does not apply transition when condition is false and skips update evaluation", () => {
  // condition: position < limit (10 < 5 -> false)
  // update contains division by zero which should NEVER be evaluated
  const transition = {
    condition: {
      expression: {
        type: "operation",
        operation: "less_than",
        operands: [
          { type: "state", path: ["position"] },
          { type: "parameter", name: "limit" },
        ],
      },
    },
    updates: [
      {
        target: ["position"],
        value: {
          type: "operation",
          operation: "divide",
          operands: [
            { type: "literal", value: 10 },
            { type: "literal", value: 0 },
          ],
        },
      },
    ],
  };

  const result = applyTransition(transition, context);
  assert.equal(result.applied, false);
  assert.deepEqual(result.state, context.state);
});

test("evaluates expression updates across literals, state refs, param refs, and nested targets", () => {
  const transition = {
    updates: [
      {
        target: ["player", "health"],
        value: { type: "parameter", name: "maxHealth" },
      },
      {
        target: ["player", "physics", "speed"],
        value: {
          type: "operation",
          operation: "add",
          operands: [
            { type: "state", path: ["player", "physics", "speed"] },
            { type: "literal", value: 5 },
          ],
        },
      },
      {
        target: ["status"],
        value: { type: "state", path: ["status"] },
      },
    ],
  };

  const result = applyTransition(transition, context);
  assert.equal(result.applied, true);
  assert.equal((result.state.player).health, 150);
  assert.equal((result.state.player).physics.speed, 20);
});

test("enforces snapshot semantics across multiple sequential updates", () => {
  // Initial: position = 10, velocity = 2, acceleration = 1
  // updates:
  // position = position + velocity  (10 + 2 = 12)
  // velocity = velocity + acceleration (2 + 1 = 3)
  const transition = {
    updates: [
      {
        target: ["position"],
        value: {
          type: "operation",
          operation: "add",
          operands: [
            { type: "state", path: ["position"] },
            { type: "state", path: ["velocity"] },
          ],
        },
      },
      {
        target: ["velocity"],
        value: {
          type: "operation",
          operation: "add",
          operands: [
            { type: "state", path: ["velocity"] },
            { type: "parameter", name: "acceleration" },
          ],
        },
      },
    ],
  };

  const result = applyTransition(transition, context);
  assert.equal(result.applied, true);
  assert.equal(result.state.position, 12);
  assert.equal(result.state.velocity, 3);
});

test("enforces atomicity: if any update fails, no state changes are committed", () => {
  // First update is valid, second update fails (division by zero)
  const transition = {
    updates: [
      {
        target: ["position"],
        value: { type: "literal", value: 999 },
      },
      {
        target: ["velocity"],
        value: {
          type: "operation",
          operation: "divide",
          operands: [
            { type: "literal", value: 10 },
            { type: "literal", value: 0 },
          ],
        },
      },
    ],
  };

  const originalState = structuredClone(context.state);

  assert.throws(() => applyTransition(transition, context), ExpressionEvaluationError);
  assert.deepEqual(context.state, originalState);
});

test("throws TransitionEvaluationError on invalid targets", () => {
  // empty target path
  assert.throws(
    () =>
      applyTransition(
        { updates: [{ target: [], value: { type: "literal", value: 1 } }] },
        context,
      ),
    TransitionEvaluationError,
  );

  // missing parent path
  assert.throws(
    () =>
      applyTransition(
        {
          updates: [
            {
              target: ["missingParent", "child"],
              value: { type: "literal", value: 1 },
            },
          ],
        },
        context,
      ),
    TransitionEvaluationError,
  );

  // parent path is primitive (not an object)
  assert.throws(
    () =>
      applyTransition(
        {
          updates: [
            {
              target: ["position", "subProp"],
              value: { type: "literal", value: 1 },
            },
          ],
        },
        context,
      ),
    TransitionEvaluationError,
  );

  // forbidden prototype targets
  assert.throws(
    () =>
      applyTransition(
        {
          updates: [
            {
              target: ["__proto__", "polluted"],
              value: { type: "literal", value: true },
            },
          ],
        },
        context,
      ),
    TransitionEvaluationError,
  );

  assert.throws(
    () =>
      applyTransition(
        {
          updates: [
            {
              target: ["constructor"],
              value: { type: "literal", value: true },
            },
          ],
        },
        context,
      ),
    TransitionEvaluationError,
  );
});

test("preserves underlying ExpressionEvaluationError and ConditionEvaluationError", () => {
  // missing state path in update expression
  assert.throws(
    () =>
      applyTransition(
        {
          updates: [
            {
              target: ["position"],
              value: { type: "state", path: ["nonExistent"] },
            },
          ],
        },
        context,
      ),
    ExpressionEvaluationError,
  );

  // condition evaluation error (non-boolean result)
  assert.throws(
    () =>
      applyTransition(
        {
          condition: {
            expression: { type: "literal", value: "not_a_boolean" },
          },
          updates: [
            {
              target: ["position"],
              value: { type: "literal", value: 1 },
            },
          ],
        },
        context,
      ),
    ConditionEvaluationError,
  );
});

test("transition evaluation does not mutate input context state or parameters", () => {
  const originalState = structuredClone(context.state);
  const originalParams = structuredClone(context.parameters);

  const transition = {
    updates: [
      {
        target: ["items"],
        value: { type: "literal", value: ["apple", "banana"] },
      },
    ],
  };

  const result = applyTransition(transition, context);
  assert.equal(result.applied, true);

  // Mutate returned state array to verify defensive cloning
  (result.state.items).push("orange");

  assert.deepEqual(context.state, originalState);
  assert.deepEqual(context.parameters, originalParams);
});

test("throws TransitionEvaluationError on malformed transition objects", () => {
  assert.throws(() => applyTransition(null, context), TransitionEvaluationError);
  assert.throws(() => applyTransition({}, context), TransitionEvaluationError);
  assert.throws(() => applyTransition({ updates: [] }, context), TransitionEvaluationError);
});
