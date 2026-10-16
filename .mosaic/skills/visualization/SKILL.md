# Visualization Skill

This skill provides a detailed reference for choosing and implementing visual components in Mosaic lessons using `@mosaic/ui`.

---

## 1. Visualization Philosophy & Abstraction Hierarchy

Mosaic establishes a clear hierarchy for rendering visuals:

```text
1. Default: Semantic Mosaic Components (@mosaic/ui)
   └── <ChartLine>, <Graph>, <Particle>, <Timeline>, <Flow>, <Heatmap>, <Equation>, <Node>, <Edge>
       ↓ (Only if functionality cannot be expressed by semantic components)
2. Fallback: Custom Composition with Low-Level Primitives
   └── <Chart> with raw Recharts children / <Diagram> with custom SVG/Canvas elements
```

### Core Principles
* **Prefer Semantic Abstractions**: Always reach for `@mosaic/ui` components first. They encapsulate internal layout, responsive sizing, accessible roles, and theme tokens.
* **Simulation-Driven Data**: Prefer simple serializable simulation-driven data. Use `ReactNode` only where the component API explicitly supports rich React content (such as labels or formatted equation nodes).
* **Fallback Rule**: Do not import `@xyflow/react`, `recharts`, or `framer-motion` directly for standard lesson views. Use raw low-level libraries only when a specialized requirement (such as a dual-Y-axis chart, custom physics canvas, or non-standard graph layout) genuinely cannot be represented by Mosaic's built-in components.

### Make the visual teach

Assume a first-time learner. Keep one primary visual in focus and explain its labels and state changes in plain language nearby. A learner should be able to tell what they are looking at, what changed, why it changed, and what action comes next without inferring the lesson from color or motion alone. Pair color with text, shape, position, or another clear cue. Animate only when motion clarifies a meaningful change, and let learners control the pace around important explanations. Detailed charts, raw state, logs, and implementation views belong in secondary or optional areas unless they directly answer the current question.

---

## 2. Component Catalog & API Reference

### 2.1. `ChartLine` (Default) & `Chart` (Fallback)

* **`<ChartLine>` (Default Semantic Component)**: Plug-and-play line chart for continuous functions, loss curves, and time series.
  ```tsx
  import { ChartLine } from "@mosaic/ui";

  const history = [
    { step: 0, value: 10 },
    { step: 1, value: 25 },
    { step: 2, value: 40 },
  ];

  <ChartLine data={history} dataKey="value" stroke="var(--color-accent)" />
  ```
  For a plotted function, use `xDataKey`, domains, labels, and an optional `referencePoint` for the current simulation position. Keep chart rendering inside this component; lesson code should provide data and state rather than hand-drawing SVG paths.
  ```tsx
  <ChartLine
    data={curvePoints}
    dataKey="loss"
    xDataKey="position"
    xDomain={[-5, 5]}
    yDomain={[0, 25]}
    xLabel="position"
    yLabel="loss"
    showGrid
    referencePoint={{ x: currentX, y: currentLoss }}
  />
  ```
  **Props**:
  * `data: readonly Record<string, number | string>[]`
  * `dataKey: string`
  * `stroke?: string` (Default: `"var(--color-accent)"`)
  * `height?: number`, `className?: string`, `aria-label?: string`
  * `xDataKey?: string`, `xDomain?: [number, number]`, `yDomain?: [number, number]`
  * `xLabel?: string`, `yLabel?: string`, `showGrid?: boolean`
  * `referencePoint?: { x: number, y: number, label?: string }`

* **`<Chart>` (Fallback for Custom Recharts Composition)**: A responsive container for advanced chart layouts requiring multiple lines, axes, or custom tooltips not covered by `<ChartLine>`.
  ```tsx
  import { Chart } from "@mosaic/ui";
  import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

  // Use only as a fallback when multiple series or specialized axes are required
  <Chart height={240} aria-label="Multi-series convergence plot">
    <LineChart data={history}>
      <XAxis dataKey="step" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="actual" stroke="var(--color-accent)" />
      <Line type="monotone" dataKey="target" stroke="var(--color-neutral)" />
    </LineChart>
  </Chart>
  ```
  **Props**:
  * `children?: ReactNode`
  * `height?: number | string` (Default: `280`)
  * `className?: string`
  * `"aria-label"?: string`

---

### 2.2. `Graph`

Use for: Interactive network topologies, distributed systems (e.g. Raft consensus), state machines, data flow graphs, and trees.

```tsx
import { Graph } from "@mosaic/ui";
import type { GraphNode, GraphEdge } from "@mosaic/ui";

const nodes: GraphNode[] = [
  { id: "leader", label: "Leader (Term 2)", x: 100, y: 80, selected: true },
  { id: "follower-1", label: "Follower A", x: 300, y: 40 },
  { id: "follower-2", label: "Follower B", x: 300, y: 140 },
];

const edges: GraphEdge[] = [
  { id: "e1", source: "leader", target: "follower-1", label: "AppendEntries", animated: true },
  { id: "e2", source: "leader", target: "follower-2", label: "AppendEntries", animated: true },
];

<Graph
  nodes={nodes}
  edges={edges}
  width={600}
  height={300}
  interactive={true}
  onNodeSelect={(id) => console.log("Selected node:", id)}
/>
```

#### Node & Edge Data Contracts
* **`GraphNode`**: `{ id: string, label?: ReactNode, x: number, y: number, radius?: number, opacity?: number, selected?: boolean }`
* **`GraphEdge`**: `{ id?: string, source: string, target: string, label?: ReactNode, animated?: boolean }`
* **`GraphProps`**: `nodes`, `edges?`, `width?`, `height?`, `interactive?`, `onNodesChange?`, `selectedNodeId?`, `onNodeSelect?`, `className?`

---

### 2.3. `Node` & `Edge` (Standalone Diagram Primitives)

Use for: Lightweight SVG-level nodes and connections inside custom diagrams.

```tsx
import { Node, Edge } from "@mosaic/ui";

<svg width={400} height={200} className="diagram-surface">
  <Edge
    source={{ x: 50, y: 100 }}
    target={{ x: 250, y: 100 }}
    label="flow"
    animated={true}
  />
  <Node id="n1" label="Input" x={50} y={100} radius={20} />
  <Node id="n2" label="Output" x={250} y={100} radius={20} selected={true} />
</svg>
```

---

### 2.4. `Particle`

Use for: Physical simulation entities (projectiles, moving packets, vehicles, molecules, pointers).

* Smoothly glides between coordinates using spring or duration-based physics.

```tsx
import { Particle } from "@mosaic/ui";

<div style={{ position: "relative", width: 400, height: 200, background: "var(--color-surface-sunken)" }}>
  <Particle
    x={Number(simulation.state.x)}
    y={Number(simulation.state.y)}
    radius={8}
    color="var(--color-accent)"
    label="Projectile"
    spring={true}
  />
</div>
```

**Props**:
* `x: number`, `y: number`
* `radius?: number` (Default: `6`), `color?: string`, `label?: string`, `opacity?: number`, `scale?: number`, `style?: CSSProperties`
* `spring?: boolean`, `duration?: number`, `easing?: "linear" | "easeIn" | "easeOut" | "easeInOut"`

---

### 2.5. `Timeline`

Use for: Discrete stages, execution logs, algorithmic milestones, protocol phases, and historical progression.

```tsx
import { Timeline } from "@mosaic/ui";
import type { TimelineItem } from "@mosaic/ui";

const items: TimelineItem[] = [
  { id: "1", label: "1. Handshake SYN", description: "Client sends initial sequence number", active: true },
  { id: "2", label: "2. Server SYN-ACK", description: "Server acknowledges and responds", active: false },
  { id: "3", label: "3. Client ACK", description: "Connection established", active: false },
];

<Timeline items={items} />
```

---

### 2.6. `Flow`

Use for: Linear process pipelines, algorithm steps, queue processing, or data transformations.

```tsx
import { Flow } from "@mosaic/ui";

const steps = [
  "Raw Data Ingestion",
  "Tokenization & Normalization",
  "Embedding Generation",
  "Vector Index Lookup",
];

<Flow steps={steps} activeIndex={Number(simulation.state.currentStepIndex)} />
```

**Props**:
* `steps: readonly ReactNode[]`
* `activeIndex?: number` (Default: `-1`)
* `className?: string`

---

### 2.7. `Heatmap`

Use for: 2D spatial intensity grids, attention matrices, memory representations, distance tables, or probability matrices.

```tsx
import { Heatmap } from "@mosaic/ui";

const matrix = [
  [0.1, 0.4, 0.9],
  [0.3, 0.8, 0.2],
  [0.7, 0.1, 0.5],
];

<Heatmap
  values={matrix}
  min={0}
  max={1}
  labels={["Col 1", "Col 2", "Col 3"]}
/>
```

**Props**:
* `values: readonly (readonly number[])[]`
* `min?: number` (Default: `0`), `max?: number` (Default: `1`)
* `labels?: readonly string[]`
* `className?: string`

---

### 2.8. `Diagram`

Use for: Semantic container for complex or composed visual layouts, providing consistent borders, typography, and accessibility roles.

```tsx
import { Diagram, Node } from "@mosaic/ui";

<Diagram title="Memory Hierarchy" className="system-diagram">
  <svg width={300} height={150}>
    <Node id="l1" label="L1 Cache (64KB)" x={150} y={30} />
    <Node id="l2" label="L2 Cache (512KB)" x={150} y={80} />
    <Node id="ram" label="Main Memory (16GB)" x={150} y={130} />
  </svg>
</Diagram>
```

**Props**:
* `children?: ReactNode`
* `title?: string`
* `className?: string`

---

### 2.9. `Equation`

Use for: Mathematical expressions rendered within the visual stage.

```tsx
import { Equation } from "@mosaic/ui";

<Equation
  label="Newton's Second Law"
  expression={<span>F = m &middot; a</span>}
/>
```

**Props**:
* `expression: ReactNode`
* `label?: string`
* `className?: string`

---

## 3. Decision Matrix: Selecting the Right Visualization

```text
Is your data ...
├── Continuous numbers / time series?
│   └── Default: <ChartLine> (Use <Chart> with Recharts only if multi-series fallback needed)
├── Nodes, interconnected entities, or state transitions?
│   └── Default: <Graph> (interactive) or <Node>/<Edge> (static SVG)
├── A moving point or physical entity in 2D coordinates?
│   └── Default: <Particle>
├── An ordered list of historical milestones?
│   └── Default: <Timeline>
├── An ordered sequence of execution steps / stages?
│   └── Default: <Flow>
├── A 2D grid of numeric intensities / table matrix?
│   └── Default: <Heatmap>
└── A standalone formula or diagram container?
    └── Default: <Equation> or <Diagram>
```

---

## 4. Custom SVG / Canvas Fallback Guidelines

If the educational concept requires an ad-hoc custom visualization (such as a specialized wave interference pattern, 3D projection, or fractal simulation) that cannot be constructed from Mosaic primitives:

1. Wrap the custom visualization inside `<Diagram title="...">` for semantic containment and accessibility.
2. Render using pure standard React SVG elements (`<svg>`, `<circle>`, `<path>`, `<rect>`) or HTML5 `<canvas>`.
3. Drive rendering strictly from the `SimulationState` snapshot provided by `useSimulationController`.
4. Keep rendering pure and side-effect free.
