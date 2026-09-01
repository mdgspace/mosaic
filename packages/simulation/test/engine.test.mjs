import assert from "node:assert/strict";
import test from "node:test";
import { SimulationEngine } from "../dist/index.js";

const spec = {
  initialState: {
    status: "ready",
    turn: 0,
    nested: { value: "initial" },
  },
  parameters: [
    { name: "amount", type: "number", value: 2 },
    { name: "enabled", type: "boolean", value: true },
  ],
};

test("initializes state and parameters without exposing mutable references", () => {
  const engine = new SimulationEngine(spec);
  const state = engine.getState();
  state.nested.value = "changed outside the engine";

  assert.deepEqual(engine.getState(), spec.initialState);
  assert.deepEqual(engine.getParameters(), { amount: 2, enabled: true });
});

test("updates a parameter without duplicating it into simulation state", () => {
  const engine = new SimulationEngine(spec);

  engine.dispatch({ type: "set_parameter", target: "amount", parameters: { value: 5 } });

  assert.deepEqual(engine.getParameters(), { amount: 5, enabled: true });
  assert.deepEqual(engine.getState(), spec.initialState);
});

test("rejects incomplete and unknown set_parameter actions", () => {
  const engine = new SimulationEngine(spec);

  assert.throws(() => engine.dispatch({ type: "set_parameter" }), /requires a target/);
  assert.throws(
    () => engine.dispatch({ type: "set_parameter", target: "missing", parameters: { value: 1 } }),
    /Unknown simulation parameter: missing/,
  );
  assert.throws(
    () => engine.dispatch({ type: "set_parameter", target: "amount", parameters: { value: "five" } }),
    /Invalid value for simulation parameter: amount/,
  );
});

test("runs an explicit step behavior and resets state and parameters", () => {
  const engine = new SimulationEngine(spec, {
    onStep: ({ parameters, state }) => ({
      ...state,
      turn: state.turn + parameters.amount,
      status: "stepped",
    }),
  });

  engine.dispatch({ type: "set_parameter", target: "amount", parameters: { value: 3 } });
  engine.dispatch({ type: "step" });

  assert.deepEqual(engine.getState(), {
    status: "stepped",
    turn: 3,
    nested: { value: "initial" },
  });

  engine.dispatch({ type: "reset" });

  assert.deepEqual(engine.getState(), spec.initialState);
  assert.deepEqual(engine.getParameters(), { amount: 2, enabled: true });
});
