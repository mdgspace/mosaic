import assert from "node:assert/strict";
import test from "node:test";
import {
  ConditionEvaluationError,
  ExpressionEvaluationError,
  SimulationEngine,
} from "../dist/index.js";

test("executes a single declarative transition during step()", () => {
  const spec = {
    initialState: { count: 0 },
    parameters: [{ name: "stepSize", type: "number", value: 5 }],
    transitions: [
      {
        updates: [
          {
            target: ["count"],
            value: {
              type: "operation",
              operation: "add",
              operands: [
                { type: "state", path: ["count"] },
                { type: "parameter", name: "stepSize" },
              ],
            },
          },
        ],
      },
    ],
  };

  const engine = new SimulationEngine(spec);
  const result = engine.step();

  assert.deepEqual(result.state, { count: 5 });
  assert.deepEqual(engine.getState(), { count: 5 });
  assert.deepEqual(result.events, []);
});

test("executes multiple transitions sequentially with later transitions seeing earlier working state", () => {
  // T1: pos = pos + speed (0 + 10 -> 10)
  // T2: if pos >= 10 then status = "reached"
  const spec = {
    initialState: { pos: 0, status: "in_progress" },
    parameters: [{ name: "speed", type: "number", value: 10 }],
    transitions: [
      {
        updates: [
          {
            target: ["pos"],
            value: {
              type: "operation",
              operation: "add",
              operands: [
                { type: "state", path: ["pos"] },
                { type: "parameter", name: "speed" },
              ],
            },
          },
        ],
      },
      {
        condition: {
          expression: {
            type: "operation",
            operation: "greater_than_or_equal",
            operands: [
              { type: "state", path: ["pos"] },
              { type: "literal", value: 10 },
            ],
          },
        },
        updates: [
          {
            target: ["status"],
            value: { type: "literal", value: "reached" },
          },
        ],
      },
    ],
  };

  const engine = new SimulationEngine(spec);
  const result = engine.step();

  assert.deepEqual(result.state, { pos: 10, status: "reached" });
  assert.deepEqual(engine.getState(), { pos: 10, status: "reached" });
});

test("preserves intra-transition snapshot semantics within each transition", () => {
  // In single transition:
  // pos = pos + vel (10 + 2 = 12)
  // vel = vel + acc (2 + 1 = 3)
  // Second update MUST evaluate against pre-transition vel (2), not updated pos or anything else
  const spec = {
    initialState: { pos: 10, vel: 2 },
    parameters: [{ name: "acc", type: "number", value: 1 }],
    transitions: [
      {
        updates: [
          {
            target: ["pos"],
            value: {
              type: "operation",
              operation: "add",
              operands: [
                { type: "state", path: ["pos"] },
                { type: "state", path: ["vel"] },
              ],
            },
          },
          {
            target: ["vel"],
            value: {
              type: "operation",
              operation: "add",
              operands: [
                { type: "state", path: ["vel"] },
                { type: "parameter", name: "acc" },
              ],
            },
          },
        ],
      },
    ],
  };

  const engine = new SimulationEngine(spec);
  const result = engine.step();

  assert.deepEqual(result.state, { pos: 12, vel: 3 });
  assert.deepEqual(engine.getState(), { pos: 12, vel: 3 });
});

test("conditional transition applies when condition is true", () => {
  const spec = {
    initialState: { score: 100, rank: "unranked" },
    parameters: [{ name: "threshold", type: "number", value: 50 }],
    transitions: [
      {
        condition: {
          expression: {
            type: "operation",
            operation: "greater_than",
            operands: [
              { type: "state", path: ["score"] },
              { type: "parameter", name: "threshold" },
            ],
          },
        },
        updates: [
          {
            target: ["rank"],
            value: { type: "literal", value: "master" },
          },
        ],
      },
    ],
  };

  const engine = new SimulationEngine(spec);
  const result = engine.step();

  assert.equal(result.state.rank, "master");
});

test("conditional transition false does not apply and skips update evaluation", () => {
  // Condition is false (score 20 > 50 -> false)
  // Update contains division by zero which must NOT be evaluated
  const spec = {
    initialState: { score: 20, rank: "novice" },
    parameters: [{ name: "threshold", type: "number", value: 50 }],
    transitions: [
      {
        condition: {
          expression: {
            type: "operation",
            operation: "greater_than",
            operands: [
              { type: "state", path: ["score"] },
              { type: "parameter", name: "threshold" },
            ],
          },
        },
        updates: [
          {
            target: ["score"],
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
      },
    ],
  };

  const engine = new SimulationEngine(spec);
  const result = engine.step();

  assert.deepEqual(result.state, { score: 20, rank: "novice" });
});

test("EventRules observe post-transition state and emit in declaration order", () => {
  const spec = {
    initialState: { t: 0, temp: 80 },
    parameters: [{ name: "maxTemp", type: "number", value: 100 }],
    transitions: [
      {
        updates: [
          {
            target: ["t"],
            value: {
              type: "operation",
              operation: "add",
              operands: [{ type: "state", path: ["t"] }, { type: "literal", value: 1 }],
            },
          },
          {
            target: ["temp"],
            value: {
              type: "operation",
              operation: "add",
              operands: [{ type: "state", path: ["temp"] }, { type: "literal", value: 25 }],
            },
          },
        ],
      },
    ],
    eventRules: [
      {
        name: "tick",
        payload: { type: "state", path: ["t"] },
      },
      {
        name: "overheat",
        condition: {
          expression: {
            type: "operation",
            operation: "greater_than",
            operands: [
              { type: "state", path: ["temp"] },
              { type: "parameter", name: "maxTemp" },
            ],
          },
        },
        payload: {
          type: "operation",
          operation: "subtract",
          operands: [
            { type: "state", path: ["temp"] },
            { type: "parameter", name: "maxTemp" },
          ],
        },
      },
      {
        name: "untriggered",
        condition: {
          expression: {
            type: "operation",
            operation: "less_than",
            operands: [
              { type: "state", path: ["temp"] },
              { type: "literal", value: 50 },
            ],
          },
        },
      },
    ],
  };

  const engine = new SimulationEngine(spec);
  const result = engine.step();

  assert.deepEqual(result.state, { t: 1, temp: 105 });
  assert.equal(result.events.length, 2);
  assert.deepEqual(result.events[0], { name: "tick", payload: 1 });
  assert.deepEqual(result.events[1], { name: "overheat", payload: 5 });
});

test("conditional EventRule false does not evaluate payload expression", () => {
  const spec = {
    initialState: { val: 5 },
    parameters: [],
    eventRules: [
      {
        name: "never_fire",
        condition: {
          expression: {
            type: "operation",
            operation: "greater_than",
            operands: [{ type: "state", path: ["val"] }, { type: "literal", value: 100 }],
          },
        },
        payload: {
          type: "operation",
          operation: "divide",
          operands: [{ type: "literal", value: 1 }, { type: "literal", value: 0 }],
        },
      },
    ],
  };

  const engine = new SimulationEngine(spec);
  const result = engine.step();

  assert.deepEqual(result.events, []);
});

test("enforces step-level atomicity when a transition fails (no state change committed)", () => {
  const spec = {
    initialState: { pos: 0, status: "initial" },
    parameters: [],
    transitions: [
      // T1 succeeds
      {
        updates: [{ target: ["pos"], value: { type: "literal", value: 99 } }],
      },
      // T2 fails with division by zero
      {
        updates: [
          {
            target: ["status"],
            value: {
              type: "operation",
              operation: "divide",
              operands: [{ type: "literal", value: 1 }, { type: "literal", value: 0 }],
            },
          },
        ],
      },
    ],
  };

  const engine = new SimulationEngine(spec);

  assert.throws(() => engine.step(), ExpressionEvaluationError);
  // Engine state must be completely untouched
  assert.deepEqual(engine.getState(), { pos: 0, status: "initial" });
});

test("enforces step-level atomicity when an event rule evaluation fails (no state change committed)", () => {
  const spec = {
    initialState: { pos: 0 },
    parameters: [],
    transitions: [
      {
        updates: [{ target: ["pos"], value: { type: "literal", value: 50 } }],
      },
    ],
    eventRules: [
      {
        name: "faulty_event",
        condition: {
          expression: { type: "literal", value: "non_boolean_condition" },
        },
      },
    ],
  };

  const engine = new SimulationEngine(spec);

  assert.throws(() => engine.step(), ConditionEvaluationError);
  // Engine state must remain at pre-step state
  assert.deepEqual(engine.getState(), { pos: 0 });
});

test("defensively isolates emitted event payloads from caller mutation", () => {
  const spec = {
    initialState: { items: ["initial_item"] },
    parameters: [],
    eventRules: [
      {
        name: "inventory",
        payload: { type: "state", path: ["items"] },
      },
    ],
  };

  const engine = new SimulationEngine(spec);
  const result = engine.step();

  // Caller mutates the returned payload
  if (Array.isArray(result.events[0].payload)) {
    result.events[0].payload.push("mutated");
  }

  assert.deepEqual(engine.getState(), { items: ["initial_item"] });
});

test("dispatch({ type: 'step' }) delegates to step execution and reset restores initial state", () => {
  const spec = {
    initialState: { counter: 1 },
    parameters: [{ name: "factor", type: "number", value: 2 }],
    transitions: [
      {
        updates: [
          {
            target: ["counter"],
            value: {
              type: "operation",
              operation: "multiply",
              operands: [
                { type: "state", path: ["counter"] },
                { type: "parameter", name: "factor" },
              ],
            },
          },
        ],
      },
    ],
  };

  const engine = new SimulationEngine(spec);

  engine.dispatch({ type: "step" });
  assert.deepEqual(engine.getState(), { counter: 2 });

  engine.dispatch({ type: "step" });
  assert.deepEqual(engine.getState(), { counter: 4 });

  engine.dispatch({ type: "reset" });
  assert.deepEqual(engine.getState(), { counter: 1 });
});
