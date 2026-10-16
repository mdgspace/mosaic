# Simulation Engine Skill

This skill provides a technical reference for defining and executing simulations using `@mosaic/simulation` and `@mosaic/schemas`.

---

## 1. Overview & Architectural Role

The `@mosaic/simulation` package is a framework-independent, deterministic state foundation for Mosaic lessons.

* **Single Source of Truth**: Owns simulation state and parameter values.
* **Declarative Contracts**: Accepts validated specs conforming to the schema in `@mosaic/schemas`.
* **Atomic Step Commits**: Either all transitions and event evaluations in a step succeed, or the state remains untouched.
* **Side-Effect Free & Immutable**: State snapshots returned to the UI cannot mutate internal engine state.

---

## 2. Specification Data Structures

### 2.1. ValidatedSimulationSpec

```ts
import type { ValidatedSimulationSpec } from "@mosaic/simulation";

const spec: ValidatedSimulationSpec = {
  initialState: { count: 0, position: 0 },
  parameters: [
    { name: "stepSize", type: "number", value: 1 },
    { name: "enabled", type: "boolean", value: true },
  ],
  transitions: [ /* ... */ ],
  eventRules: [ /* ... */ ],
};
```

### 2.2. State & Parameters

* **`initialState`**: A JSON object (`Record<string, JsonValue>`) defining the initial values.
* **`parameters`**: An array of `ValidatedParameter` objects:
  * `name`: unique string identifier.
  * `type`: `"number"` | `"boolean"` | `"string"` | `"array"`.
  * `value`: initial JSON-compatible value.

---

## 3. Expressions (`Expression`)

Expressions are pure, deterministic AST representations evaluated against an `EvaluationContext` (`{ state, parameters }`).

```ts
export type Expression =
  | StateExpression
  | ParameterExpression
  | LiteralExpression
  | OperationExpression;
```

### 3.1. Expression Types

1. **State Reference** (`StateExpression`):
   ```json
   { "type": "state", "path": ["position", "x"] }
   ```
2. **Parameter Reference** (`ParameterExpression`):
   ```json
   { "type": "parameter", "name": "stepSize" }
   ```
3. **Literal Value** (`LiteralExpression`):
   ```json
   { "type": "literal", "value": 42 }
   ```
4. **Operations** (`OperationExpression`):
   * **Unary**: `"abs"` (requires exactly 1 operand):
     ```json
     {
       "type": "operation",
       "operation": "abs",
       "operands": [{ "type": "state", "path": ["velocity"] }]
     }
     ```
   * **Arithmetic Binary**: `"add"`, `"subtract"`, `"multiply"`, `"divide"` (requires 2 numeric operands, forbids divide by zero):
     ```json
     {
       "type": "operation",
       "operation": "add",
       "operands": [
         { "type": "state", "path": ["position"] },
         { "type": "parameter", "name": "stepSize" }
       ]
     }
     ```
   * **Comparison Binary**: `"equal"`, `"not_equal"`, `"greater_than"`, `"greater_than_or_equal"`, `"less_than"`, `"less_than_or_equal"` (returns boolean):
     ```json
     {
       "type": "operation",
       "operation": "greater_than_or_equal",
       "operands": [
         { "type": "state", "path": ["position"] },
         { "type": "literal", "value": 100 }
       ]
     }
     ```

---

## 4. Conditions (`Condition`)

Conditions wrap an `Expression` that must strictly evaluate to a boolean (no truthy/falsy coercion):

```json
{
  "condition": {
    "expression": {
      "type": "operation",
      "operation": "greater_than",
      "operands": [
        { "type": "state", "path": ["score"] },
        { "type": "parameter", "name": "threshold" }
      ]
    }
  }
}
```

---

## 5. Transitions (`Transition`)

A transition updates one or more fields in the simulation state:

```ts
export interface Transition {
  readonly condition?: Condition;
  readonly updates: readonly StateUpdate[];
}

export interface StateUpdate {
  readonly target: readonly string[]; // path e.g. ["pos", "x"]
  readonly value: Expression;
}
```

### Transition Execution Rules
1. **Condition Evaluation**: If `condition` is present and evaluates to `false`, the transition is skipped entirely (its updates are not evaluated).
2. **Intra-Transition Snapshot Semantics**: All `updates` within a single transition evaluate against the **same pre-transition state snapshot**. For example, updating `x` and `v` concurrently reads the unchanged `x` and `v` before either was mutated.
3. **Inter-Transition Sequential Evaluation**: Multiple transitions declared in the spec execute in list order. Transition 2 observes the state produced after Transition 1 finishes.
4. **Deep Target Mutation**: `target: ["particles", "0", "x"]` updates nested state. Forbidden segments like `__proto__`, `constructor`, or `prototype` are rejected.

---

## 6. Event Rules (`EventRule`)

Event rules emit structured notifications during a step without modifying state:

```ts
export interface EventRule {
  readonly name: string;
  readonly condition?: Condition;
  readonly payload?: Expression;
}
```

### Event Rule Execution Rules
1. Evaluated **after all transitions have completed** on the post-transition working state.
2. If `condition` is true (or omitted), the event is emitted.
3. If `payload` expression is provided, it is evaluated and attached to the event: `{ name: "overheat", payload: 105 }`.
4. Emitted events are returned in the `StepResult.events` array.

---

## 7. Engine Step Lifecycle & Atomicity

When `engine.step()` is invoked:

```text
1. Read current snapshot of state & parameters
       ↓
2. For each Transition in spec.transitions:
   - Check condition (if false, skip)
   - Evaluate all updates against pre-transition snapshot
   - Apply updates to workingState
       ↓
3. Execute optional onStep({ state, parameters }) callback (if registered)
       ↓
4. For each EventRule in spec.eventRules:
   - Check condition against post-transition workingState
   - If true, evaluate payload and record EmittedEvent
       ↓
5. Commit workingState to this.#state
       ↓
6. Return { state: snapshot, events: emittedEvents }
```

### Atomicity Guarantee
If any expression evaluation, division by zero, invalid target path, or malformed condition throws an error at any point during step execution:
* The exception is propagated.
* **No partial state updates are committed**. Engine state remains at its pre-step value.

---

## 8. Simulation Controller Integration (`useSimulationController`)

Bridge the engine to React using the `useSimulationController` hook from `@mosaic/ui`:

```tsx
import { useState } from "react";
import { SimulationEngine } from "@mosaic/simulation";
import { useSimulationController } from "@mosaic/ui";

function MySimulation() {
  const [engine] = useState(() => new SimulationEngine(spec));
  const simulation = useSimulationController({ engine, initialSpeed: 1 });

  // Controller API:
  // simulation.state        -> current SimulationState snapshot
  // simulation.parameters   -> current ParameterValues
  // simulation.events       -> accumulated list of EmittedEvent[]
  // simulation.isPlaying    -> boolean
  // simulation.speed        -> number (playback multiplier)
  // simulation.play()       -> starts auto-stepping timer
  // simulation.pause()      -> pauses timer
  // simulation.step()       -> executes one deterministic step
  // simulation.reset()      -> resets engine state & parameters to initial values
  // simulation.setSpeed(s)  -> updates playback speed
  // simulation.setParameter(name, value) -> dispatches set_parameter to engine
}
```

---

## 9. Declarative Transitions vs. the `onStep` Escape Hatch

### Primary Approach: Declarative Transitions
**Declarative transitions in `spec.transitions` are the default and preferred mechanism** for evolving simulation state. They maintain serializability, auditability, and full compatibility with the schema layer.

### Escape Hatch: `onStep` Callback
`SimulationEngineOptions.onStep` is strictly an **escape hatch**. It allows providing a typed TypeScript callback when a computation cannot reasonably be represented using the current declarative expression system (e.g., complex trigonometric functions like `Math.sin`/`Math.cos`, non-linear differential solvers, or complex array manipulation):

```ts
import type { StepContext, SimulationState } from "@mosaic/simulation";

const engine = new SimulationEngine(spec, {
  onStep: ({ state, parameters }: StepContext): SimulationState | undefined => {
    const angle = Number(parameters.angle) * (Math.PI / 180);
    const speed = Number(parameters.speed);
    return {
      ...state,
      t: Number(state.t) + 1,
      x: Number(state.x) + speed * Math.cos(angle),
      y: Number(state.y) + speed * Math.sin(angle),
    };
  },
});
```

### Critical Rules for `onStep`
1. **Never move ordinary simulation logic into `onStep` merely for developer convenience**. If an update can be expressed with arithmetic/comparison operations (`add`, `subtract`, `multiply`, `divide`, `abs`), use declarative `transitions`.
2. **Keep callbacks pure and deterministic**: Never perform asynchronous work, external network requests, or non-deterministic randomization inside `onStep`.
3. **Return state immutably**: Always return a new state object or `undefined` if no change occurred.
