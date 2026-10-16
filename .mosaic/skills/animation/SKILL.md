# Animation Skill

This skill provides guidelines and technical specifications for incorporating animations into Mosaic lessons using `@mosaic/ui`.

---

## 1. Animation Philosophy & Abstraction Hierarchy

Mosaic establishes a clear hierarchy for animations:

```text
1. Default: Pre-wrapped Semantic Animation Primitives (@mosaic/ui)
   └── <Particle> coordinate interpolation, <Animated> enter/exit, animated <Edge> pulses, <Flow>/<Timeline> layout transitions
       ↓ (Only if behavior cannot be expressed by semantic components)
2. Fallback: Custom Motion Wrappers or Canvas Render Loops
   └── Targeted CSS transitions or specialized Canvas animation driven by simulation state
```

### Core Principles
* **Pedagogical Motion over Decoration**: In Mosaic, animation visually links learner actions and parameter adjustments to physical or algorithmic consequences.
* **Spatial Continuity**: Coordinate interpolation prevents abrupt jumps between simulation steps.
* **Encapsulated Dependencies**: Pre-wrapped components handle motion internally without requiring direct imports of `framer-motion` in lesson code.
* **Avoid Decorative Distractions**: Do not introduce spinning icons, pulsing background effects, or unprompted layout jitter.

---

## 2. Animation Abstraction & Motion Contracts

### 2.1. MotionTransition Configuration

Components accepting motion transitions support the `MotionTransition` interface:

```ts
export interface MotionTransition {
  duration?: number; // Duration in seconds (default: 0.35)
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut"; // Easing curve (default: "easeInOut")
  spring?: boolean; // When true, uses spring dynamics (stiffness: 260, damping: 24)
}
```

---

## 3. Animated Primitives & Components

### 3.1. `<Particle>`: Coordinate & Scale Interpolation

`<Particle>` is the primary component for moving entities in coordinate space (e.g., projectiles, packets, vehicles, molecules, pointers).

* When `x` and `y` props update upon each simulation step, `<Particle>` smoothly glides to the new position.

```tsx
import { Particle } from "@mosaic/ui";

<div style={{ position: "relative", width: 400, height: 200 }}>
  <Particle
    x={Number(simulation.state.x)}
    y={Number(simulation.state.y)}
    radius={8}
    color="var(--color-accent)"
    label="Electron"
    spring={true} // Uses physical spring dynamics
  />
</div>
```

**Props**:
* `x: number` — Horizontal position in pixels.
* `y: number` — Vertical position in pixels.
* `radius?: number` — Radius in pixels (default: `6`).
* `color?: string` — Background color (default: `"var(--color-accent)"`).
* `label?: string` — Accessible label/tooltip.
* `opacity?: number` — Alpha opacity (default: `1`).
* `scale?: number` — Scale multiplier (default: `1`).
* `style?: CSSProperties` — Additional inline styles.
* `spring?: boolean`, `duration?: number`, `easing?: string` — Motion timing.

---

### 3.2. `<Animated>`: Semantic Enter/Exit & Presence

Use `<Animated>` to smoothly reveal or dismiss feedback, explanation callouts, or conditional alerts when simulation conditions trigger.

```tsx
import { Animated, Hint } from "@mosaic/ui";

<Animated visible={simulation.state.status === "collision_detected"} spring={true}>
  <Hint title="Collision Alert">
    The particle velocity exceeded the container threshold!
  </Hint>
</Animated>
```

**Props**:
* `visible?: boolean` — Controls presence and enter/exit transition (default: `true`).
* `children?: ReactNode` — Content to animate.
* `className?: string`
* `spring?: boolean`, `duration?: number`, `easing?: string` — Motion timing.

---

### 3.3. Animated Edges in `<Graph>` and `<Edge>`

Use `animated={true}` to indicate message transmission, network packets in transit, or active data pipelines.

```tsx
import { Graph, Edge } from "@mosaic/ui";

// Inside an interactive Graph:
<Graph
  nodes={[
    { id: "sender", label: "Client", x: 50, y: 100 },
    { id: "receiver", label: "Server", x: 250, y: 100 },
  ]}
  edges={[
    {
      id: "packet-1",
      source: "sender",
      target: "receiver",
      label: "SYN (Seq=0)",
      animated: simulation.isPlaying, // Dashed pulse while playback is active
    },
  ]}
/>

// Standalone SVG Edge:
<svg width={300} height={100}>
  <Edge
    source={{ x: 30, y: 50 }}
    target={{ x: 270, y: 50 }}
    label="Stream"
    animated={true}
  />
</svg>
```

---

### 3.4. Layout Transitions in `<Flow>` & `<Timeline>`

`<Flow>` and `<Timeline>` utilize layout animations so that active step indicators and list items transition smoothly as the simulation progresses through steps:

```tsx
import { Flow } from "@mosaic/ui";

<Flow
  steps={[
    "1. Initialize bounds [low=0, high=N-1]",
    "2. Calculate mid = (low + high) / 2",
    "3. Compare array[mid] with target",
    "4. Adjust bounds or terminate",
  ]}
  activeIndex={Number(simulation.state.activeStep)}
/>
```

---

## 4. Best Practices Checklist for Agents

* [x] **Match playback speed**: When the user increases `<SpeedControl>`, interval timing scales proportionally.
* [x] **Prefer spring physics for physical systems**: Set `spring={true}` on `<Particle>` for mechanics, trajectories, and gravity simulations.
* [x] **Avoid visual clutter**: Only animate elements representing the active focus of the simulation step.
* [x] **No ad-hoc animation timers**: Drive coordinate updates from the `SimulationState` snapshot, not unmanaged `requestAnimationFrame` loops in React components.
