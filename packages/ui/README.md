# Mosaic Toolkit

`@mosaic/ui` is the React toolkit for building interactive learning experiences. Mosaic combines four layers:

```text
Simulation Engine + UI Toolkit + Visualization Toolkit + Educational Toolkit
```

The engine in `@mosaic/simulation` owns declarative state transitions, expressions, conditions, and events. This package owns presentation and interaction. Framer Motion animates Mosaic-owned visual components, React Flow powers the internal graph infrastructure, and Recharts powers charts. Keep those implementation details behind Mosaic's semantic API.

## Agent workflow

When developing a new simulation, an LLM or agent should:

1. Define the simulation state and parameters.
2. Define declarative transitions and events in a validated simulation spec.
3. Use `SimulationEngine` for execution.
4. Build the interface with Mosaic components.
5. Connect the engine with `useSimulationController`.
6. Visualize state with `Chart`, `Graph`, `Timeline`, or the most appropriate visual component. Pass changing state as props; components such as `Particle` animate those changes in the UI layer.
7. Explain the concept with `Explanation`, `Formula`, `CodeBlock`, `Hint`, `Question`, or `Quiz`.
8. Add `Play`, `Pause`, `Step`, `Reset`, `SpeedControl`, and `ParameterControl` where appropriate.
9. Test engine behavior in `@mosaic/simulation`.
10. Test the public toolkit behavior and build the web app.

Start the React tree with the provider and stylesheet:

```tsx
import { MosaicProvider } from "@mosaic/ui";
import "@mosaic/ui/styles.css";

<MosaicProvider><App /></MosaicProvider>
```

## Typical simulation composition

Keep the engine instance stable for the lifetime of `useSimulationController`; dynamic engine switching is not currently supported.

```tsx
import { useState } from "react";
import { SimulationEngine } from "@mosaic/simulation";
import {
  EventLog, Graph, MosaicProvider, ParameterControl, Pause, Play,
  Reset, SpeedControl, StateInspector, Step, useSimulationController,
} from "@mosaic/ui";

const spec = {
  initialState: { position: 0 },
  parameters: [{ name: "rate", type: "number", value: 1 }],
} satisfies import("@mosaic/simulation").ValidatedSimulationSpec;

function SimulationApp() {
  const [engine] = useState(() => new SimulationEngine(spec, {
    onStep: ({ state, parameters }) => ({
      position: Number(state.position) + Number(parameters.rate),
    }),
  }));
  const simulation = useSimulationController({ engine });

  return (
    <MosaicProvider>
      <Play onClick={simulation.play} disabled={simulation.isPlaying} />
      <Pause onClick={simulation.pause} disabled={!simulation.isPlaying} />
      <Step onClick={simulation.step} disabled={simulation.isPlaying} />
      <Reset onClick={simulation.reset} />
      <SpeedControl value={simulation.speed} onChange={simulation.setSpeed} />
      <ParameterControl
        name="rate"
        value={Number(simulation.parameters.rate)}
        onChange={(value) => simulation.setParameter("rate", value)}
      />
      <StateInspector state={simulation.state} />
      <EventLog events={simulation.events} />
      <Graph nodes={[{ id: "position", x: 80, y: 40 }]} />
    </MosaicProvider>
  );
}
```

## Component selection

| Component | Use it for |
| --- | --- |
| `Button` | A discrete user action |
| `Slider` | A continuous numeric input |
| `Toggle` | A boolean setting |
| `Dropdown` | Choosing one option |
| `Tabs` | Switching between related views |
| `Card` | A discrete content or control surface |
| `Tooltip` | Short contextual help |
| `Chart` | Numeric data over time, using Recharts children |
| `ChartLine` | A ready-to-use semantic line chart |
| `Graph` | Nodes and relationships |
| `Node` / `Edge` | Lightweight diagram primitives |
| `Timeline` | Ordered temporal or process stages |
| `Diagram` | A labeled diagram surface |
| `Particle` | An individual moving or physical entity |
| `Heatmap` | Matrix or intensity data |
| `Flow` | Ordered process steps |
| `Equation` | A labeled mathematical expression |
| `Heatmap` | Matrix or intensity data |
| `Play` / `Pause` | Simulation playback |
| `Step` | One deterministic simulation step |
| `Reset` | Restore initial state and parameters |
| `ParameterControl` | Expose a numeric simulation parameter |
| `StateInspector` | Teach or debug current state |
| `EventLog` | Display emitted simulation events |
| `Explanation` | Conceptual explanation |
| `Formula` | Mathematical expression |
| `CodeBlock` | Reference or executable code |
| `Quiz` | Learner assessment |
| `Hint` | Progressive guidance |
| `Question` | A learner-facing question |

Prefer semantic Mosaic components over manually recreating equivalent controls. Use Astryx-backed controls for standard UI, `Chart` for Recharts-backed chart content, and Mosaic-owned visual primitives for diagrams and domain-specific visuals. Do not import `framer-motion` or `@xyflow/react` directly for normal simulation interfaces. Add a new component only when the existing toolkit cannot express the interface.

D3 is intentionally not a dependency of the toolkit. Use it only for a concrete low-level scale or layout calculation that a future Mosaic-owned component needs; normal agent-built interfaces should use the semantic Mosaic APIs instead of raw D3.

## Animated simulation example

The engine remains deterministic while React receives new coordinates and Framer Motion transitions the particle between them:

```tsx
import type { SimulationController } from "@mosaic/ui";

function ProjectileView({ simulation }: { simulation: SimulationController }) {
  return (
    <>
      <Play onClick={simulation.play} disabled={simulation.isPlaying} />
      <Pause onClick={simulation.pause} disabled={!simulation.isPlaying} />
      <Step onClick={simulation.step} disabled={simulation.isPlaying} />
      <Reset onClick={simulation.reset} />
      <div className="stage">
        <Particle
          x={Number(simulation.state.x)}
          y={Number(simulation.state.y)}
          label="Projectile"
        />
      </div>
      <StateInspector state={simulation.state} />
      <EventLog events={simulation.events} />
    </>
  );
}
```

For relationship-based concepts, provide serializable nodes and edges. React Flow handles dragging, keyboard interaction, zoom, and viewport behavior internally:

```tsx
<Graph
  nodes={[
    { id: "leader", label: "Leader", x: 80, y: 80 },
    { id: "follower", label: "Follower", x: 260, y: 80 },
  ]}
  edges={[{ id: "heartbeat", source: "leader", target: "follower", label: "heartbeat" }]}
/>
```

## Agent contract

1. Use `@mosaic/simulation` for simulation behavior.
2. Use `@mosaic/ui` for presentation.
3. Never implement transitions, conditions, expressions, or event evaluation inside React components.
4. Prefer existing Mosaic components over custom equivalents.
5. Keep state immutable from the UI's perspective.
6. Pass `StepResult.events` to `EventLog`.
7. Use `StateInspector` for state debugging and teaching.
8. Add tests for new public components.
9. Keep components domain-agnostic and their props explicit.

The recommended composition is:

```text
SimulationEngine
      ↓
useSimulationController
      ↓
Play / Pause / Step / Reset
      ↓
StateInspector / EventLog / Chart / Graph
```
