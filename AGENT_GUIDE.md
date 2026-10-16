# Mosaic Agent Guide

This document is the primary specification and architectural contract for AI coding agents (such as Codex, Claude Code, Cursor, and Copilot) working within the Mosaic codebase.

Read this guide to understand Mosaic's identity, system architecture, component libraries, simulation lifecycle, and design rules before creating or modifying interactive educational lessons.

---

## 1. Mosaic Identity

**Mosaic** is a local-first, agent-compatible framework for generating rich, interactive educational experiences.

Key tenets:
* **Existing AI Coding Agent as Control Plane**: Mosaic is **not** a standalone LLM runtime or backend server. The AI coding harness in which you are running (e.g. Codex, Claude Code, Cursor, Copilot) acts as the control plane. You read the user request, plan the pedagogical arc, write the simulation spec and React interface using Mosaic's toolkit, and verify the result.
* **Local-First & Client-Side**: Lessons run entirely in the user's browser on `localhost`. There is no cloud backend, external database, or remote execution service required for running generated simulations.
* **Declarative Simulation Engine**: State evolution, deterministic transitions, mathematical expressions, conditions, and event rules are owned by `@mosaic/simulation` and validated by `@mosaic/schemas`.
* **Semantic Toolkit**: Presentation, controls, visualizations, animations, and pedagogical scaffolding are provided by `@mosaic/ui`.

### Learner experience contract

Treat each lesson as a guided explanation for a learner who may be entirely new to the subject. Unless the prompt names prerequisites, assume zero prior knowledge. Begin with a relatable question, problem, or concrete scenario; build intuition before naming formal terms or showing equations. Introduce one new idea at a time and make each transition explain what just changed, why it changed, and what the learner should do next.

Keep one primary visual focus and one clear next action at each moment. Explain visual states and causal changes in nearby plain language; never rely on color alone. Ask learners to predict meaningful outcomes before revealing them, then give immediate, constructive feedback. Introduce formulas, code, controls, and advanced details only when they answer a question the learner has encountered. Put state inspection, event logs, and implementation detail in optional areas unless they directly support the current learning objective. End with a meaningful conclusion and a knowledge check aligned with the idea taught.

Use these as domain-independent principles, not a required lesson template. A networking lesson, a physics lesson, and an algorithm lesson need different stories and visuals. Prefer conceptual clarity over component count. Animation should make a meaningful change easier to follow. Keep narrative, visual labels, simulation behavior, explanations, and quiz feedback consistent with one another.

---

## 2. Core Architecture

```text
User Request
     ↓
Existing AI Harness (Codex / Claude Code / Cursor / Copilot)
     ↓
Mosaic Agent Layer (AGENT_GUIDE.md, Platform Adapters, Skills)
     ↓
Mosaic Toolkit (@mosaic/ui)
     ↓
Simulation Engine (@mosaic/simulation + @mosaic/schemas)
     ↓
Generated Educational Lesson (React + TypeScript)
     ↓
Local Browser / Localhost (Vite Dev Server)
```

### Layer Responsibilities

| Layer | Package / Location | Responsibility |
| --- | --- | --- |
| **Agent Layer** | `AGENT_GUIDE.md`, `.mosaic/skills/` | Teaches the AI agent how to design lessons, formulate simulation specs, pick semantic UI components, and verify code. |
| **Schema Layer** | `@mosaic/schemas` (`packages/schemas`) | Source of truth JSON schemas for simulation specifications and source-grounded lesson plans, plus structural validation. |
| **Simulation Engine** | `@mosaic/simulation` (`packages/simulation`) | Framework-independent state manager. Evaluates expressions, executes sequential transitions, evaluates event rules, guarantees atomic step commits, and handles reset/parameter updates. |
| **Mosaic Toolkit** | `@mosaic/ui` (`packages/ui`) | React components for UI controls, data visualizations (ChartLine, Graph, Particle, Timeline, Heatmap, Diagram), motion primitives (Particle, Animated), simulation controls (Play, Pause, Step, Reset, ParameterControl), and educational containers (Explanation, Formula, CodeBlock, Question, Hint, Quiz). |
| **Lesson Application** | `apps/web` (`apps/web/src/main.tsx`) | Host React application running under Vite where interactive lessons are composed and rendered. |

---

## 3. Recommended Agent Workflow

When generating or extending an interactive educational lesson from supplied education material, first use the [Lesson Generation Skill](.mosaic/skills/lesson-generation/SKILL.md). It requires a source map and a validated `lesson-plan.json` before implementation, so objectives, explanations, interactions, and assessment stay traceable to the provided material. This is a workflow for the connected coding agent; Mosaic does not run an LLM or generate lessons inside the app.

Then follow these 12 steps:

1. **Understand the Learner and Objective**: Assume zero prior knowledge unless specified. Identify the core mental model, prerequisite ideas, and likely misconception.
2. **Start from a Concrete Problem**: Choose a relatable question, situation, or observation that makes the concept useful before introducing terminology.
3. **Plan Progressive Reveals**: Introduce one idea at a time. For every stage, decide what the learner sees, what just happened, why it happened, and the next action.
4. **Identify Simulation State**: Define minimal numeric/structured dynamic variables that evolve over time (e.g., `{ x: 0, y: 0, vx: 10, vy: 20, t: 0 }`).
5. **Identify User-Controllable Parameters**: Define variables that the learner can manipulate to test hypotheses (e.g., `gravity`, `launchAngle`, `initialVelocity`). Keep static datasets separate.
6. **Formulate Declarative Transitions & Event Rules**: Define state update rules (via `@mosaic/simulation` transitions) and boundary conditions (event rules for thresholds or milestones).
7. **Select the Primary Visual**: Choose the clearest Mosaic semantic visual and make it the focus. Explain its labels and meaningful changes; use text or shapes as well as color.
8. **Plan Prediction and Feedback**: Ask a focused prediction before an important outcome and provide immediate, supportive reasoning afterward.
9. **Choose Educational Components**: Use only the components that serve the current stage. Prefer `PredictionCheck` for a prediction with immediate feedback and a gated reveal, and `LessonOutcome` for explained success or recovery states.
10. **Connect One Clear Action**: Instantiate `SimulationEngine` and bridge it to React using `useSimulationController`. Put the relevant next action first; keep extra controls secondary until useful.
11. **Conclude, Assess, and Verify**: Summarize the mental model, assess it with constructive feedback, and ensure visuals, explanations, transitions, labels, and quiz answers agree.
12. **Run and Inspect**: Build and serve via `npm run dev:web`; verify interactions and determinism, and prefer semantic `@mosaic/ui` components over low-level imports.

---

## 4. Component Selection Rules

Always prefer high-level `@mosaic/ui` semantic components over ad-hoc HTML elements or lower-level library imports:

### Visualization Components

| Learner Need / Data Shape | Mosaic Component | Description & Props |
| --- | --- | --- |
| **Numerical trend / Time series (Default)** | `<ChartLine>` | Semantic line chart. `<ChartLine data={history} dataKey="value" stroke="..." />` |
| **Custom / Multi-Series Chart (Fallback)** | `<Chart>` | Responsive Recharts container for advanced multi-axis layouts. |
| **Network / System nodes & edges** | `<Graph>` | Interactive node-edge network backed by React Flow. `<Graph nodes={nodes} edges={edges} />` |
| **Diagram primitives (standalone)** | `<Node>`, `<Edge>` | SVG-level node and directed connection with optional animated pulses. |
| **Physical entity / Moving object** | `<Particle>` | Animated point with coordinate interpolation. `<Particle x={x} y={y} label="..." />` |
| **Process sequence / Stages** | `<Flow>` | Ordered sequence of process cards with active highlighting. `<Flow steps={[...]} activeIndex={i} />` |
| **Chronological / Milestone list** | `<Timeline>` | Ordered milestones with active stage indicators. `<Timeline items={[...]} />` |
| **2D Grid / Spatial intensity matrix** | `<Heatmap>` | Matrix of numeric intensities. `<Heatmap values={matrix} min={0} max={1} />` |
| **Labeled Diagram Container** | `<Diagram>` | Semantic wrapper for complex visual layouts. `<Diagram title="...">...</Diagram>` |
| **Mathematical Expression** | `<Equation>` | Labeled math layout container. `<Equation expression="..." />` |

### Educational Components

| Pedagogical Function | Mosaic Component | Description & Props |
| --- | --- | --- |
| **Conceptual narrative** | `<Explanation>` | Section with structured title and explanatory body text. `<Explanation title="...">...</Explanation>` |
| **Mathematical formula** | `<Formula>` | Formatted mathematical law or relationship. `<Formula expression="y = mx + b" />` |
| **Code or algorithm sample** | `<CodeBlock>` | Formatted code listing with language tag. `<CodeBlock code={code} language="ts" />` |
| **Inquiry / Thought prompt** | `<Question>` | Prompt encouraging the learner to predict behavior before interacting. |
| **Progressive scaffolding** | `<Hint>` | Contextual tip or collapsible guidance. `<Hint title="Hint">...</Hint>` |
| **Assessment / Checkpoint** | `<Quiz>` | Single-choice knowledge check with interactive option selection. `<Quiz question="..." options={[...]} />` |
| **Prediction / Outcome** | `<PredictionCheck>`, `<LessonOutcome>` | Gives reasoning about a prediction and presents an explained success or recovery state with clear next actions. |

### Simulation & UI Controls

| Control Function | Mosaic Component | Description & Usage |
| --- | --- | --- |
| **Playback controls** | `<Play>`, `<Pause>`, `<Step>`, `<Reset>` | Standardized simulation action buttons hooked to `useSimulationController`. |
| **Playback speed** | `<SpeedControl>` | Slider controlling simulation step frequency (0.25x to 4x). |
| **Parameter manipulation** | `<ParameterControl>` | Slider bound to a named simulation parameter (`simulation.setParameter`). |
| **State inspection** | `<StateInspector>` | Debugging and educational view rendering the active `SimulationState` snapshot. |
| **Event log** | `<EventLog>` | Displays events emitted by the simulation engine during steps. |
| **Generic UI Controls** | `<Button>`, `<Slider>`, `<Toggle>`, `<Dropdown>`, `<Tabs>`, `<Card>`, `<Tooltip>` | Design-system compliant widgets from `@mosaic/ui`. |
| **Animated Wrapper** | `<Animated>` | Semantic enter/exit transition wrapper. |

---

## 5. Simulation Engine Rules

The simulation engine is the **single source of truth** for simulation state.

### 1. State Separation
* **Simulation State** (`SimulationState`): Dynamic data modified during simulation steps (e.g., position, velocity, iterations, queue).
* **Parameters** (`ParameterValues`): User-adjustable configuration constants (e.g., gravity, friction, learning rate, target).
* **Static Lesson Data**: Fixed constant context (e.g., fixed sorted dataset arrays, constant physics tables).
* **React State**: Only stores UI-specific presentation state (e.g., selected tab, quiz choice, chart history accumulation). **Never duplicate simulation state in separate React `useState` variables.**

### 2. Declarative Transitions vs. Escape Hatch
* **Default**: Use declarative `spec.transitions` (with arithmetic and comparison operations).
* **Escape Hatch (`onStep`)**: Use `SimulationEngineOptions.onStep` strictly when the computation cannot reasonably be represented declaratively (e.g. non-linear differential solvers, trigonometry, or custom string algorithms). Do not move ordinary logic to callbacks for convenience.

### 3. Composition Pattern
Instantiate the engine once in the component using React state or ref initializer, and wire it with `useSimulationController`:

```tsx
import { useState } from "react";
import { SimulationEngine } from "@mosaic/simulation";
import type { ValidatedSimulationSpec } from "@mosaic/simulation";
import {
  MosaicProvider,
  Play,
  Pause,
  Step,
  Reset,
  SpeedControl,
  ParameterControl,
  StateInspector,
  EventLog,
  useSimulationController,
} from "@mosaic/ui";

const spec: ValidatedSimulationSpec = {
  initialState: { position: 0, velocity: 2 },
  parameters: [
    { name: "acceleration", type: "number", value: 1 },
  ],
  transitions: [
    {
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
    },
  ],
  eventRules: [
    {
      name: "threshold_reached",
      condition: {
        expression: {
          type: "operation",
          operation: "greater_than_or_equal",
          operands: [
            { type: "state", path: ["position"] },
            { type: "literal", value: 100 },
          ],
        },
      },
      payload: { type: "state", path: ["position"] },
    },
  ],
};

export function LessonSimulation() {
  const [engine] = useState(() => new SimulationEngine(spec));
  const simulation = useSimulationController({ engine });

  return (
    <MosaicProvider>
      <div className="controls">
        <Play onClick={simulation.play} disabled={simulation.isPlaying} />
        <Pause onClick={simulation.pause} disabled={!simulation.isPlaying} />
        <Step onClick={simulation.step} disabled={simulation.isPlaying} />
        <Reset onClick={simulation.reset} />
        <SpeedControl value={simulation.speed} onChange={simulation.setSpeed} />
        <ParameterControl
          name="acceleration"
          label="Acceleration"
          value={Number(simulation.parameters.acceleration)}
          min={0}
          max={5}
          step={0.5}
          onChange={(val) => simulation.setParameter("acceleration", val)}
        />
      </div>
      <StateInspector state={simulation.state} />
      <EventLog events={simulation.events} />
    </MosaicProvider>
  );
}
```

### 4. Step Semantics & Atomicity
* **Sequential Transitions**: Declared transitions execute sequentially. Later transitions observe the working state produced by earlier transitions.
* **Intra-Transition Snapshot**: Within a single transition, all update expressions evaluate against the **pre-transition snapshot**.
* **Post-Transition EventRules**: Event rules are evaluated against the final state after all transitions complete.
* **Atomic Step Commit**: If any transition or event evaluation throws an error, the working state is discarded and the engine state remains unmodified.

---

## 6. Visualization & Animation Rules

### Abstraction Hierarchy
1. **Default**: Prefer `@mosaic/ui` semantic components (`ChartLine`, `Graph`, `Particle`, `Timeline`, `Flow`, `Heatmap`, `Diagram`, `Equation`, `Node`, `Edge`).
2. **Fallback**: Use raw Recharts (inside `<Chart>`), React Flow, or Framer Motion only when the required behavior genuinely cannot be expressed through current Mosaic abstractions.
3. **D3 is not a direct dependency**. Keep mathematical calculations pure in TypeScript; render using Mosaic SVG/DOM components.

### Purposeful Animation
* Animation must clarify **spatial motion** (e.g. projectile flying across coordinates via `<Particle x={...} y={...} />`), **state changes** (e.g. active node highlighting in `<Graph>`), or **temporal sequence** (e.g. advancing `<Timeline>` or `<Flow>`).
* Avoid continuous distracting background oscillations or unprompted layout shifts.

---

## 7. Educational Design Rules

Design the lesson as a guided journey appropriate to the subject, not as a fixed component sequence. Give each stage one teaching objective. Assume zero prior knowledge unless specified, begin with a concrete problem, establish intuition before formal terms, and reveal one new idea at a time. Keep one visual focus and one clear next action. Explain meaningful visual changes and their causes in words. Ask predictions before important outcomes and respond with immediate, constructive feedback. Introduce advanced material progressively, keep developer/debug details optional, and end with a clear takeaway and an aligned knowledge check.

Preserve Mosaic's semantic-component approach, but prefer conceptual clarity over component count. Use animation to explain a meaningful change. Keep the simulation, labels, explanation, and quiz consistent. These principles apply across domains; choose the narrative and representation that fit each subject.

---

## 8. Local Development & Verification

When developing, verifying, or testing lessons in this repository, use the following commands:

```bash
# 1. Run all workspace tests (schemas, simulation, ui)
npm test --workspaces --if-present

# 2. Run TypeScript type checks across all workspaces
npm run check

# 3. Build all workspace packages
npm run build

# 4. Start the local development web server
npm run dev:web
```

---

## 9. Specialized Skills Index

For detailed guidelines on specific sub-domains, inspect the corresponding skill files in `.mosaic/skills/`:

* [Lesson Design Skill](.mosaic/skills/lesson-design/SKILL.md) — How to plan learning objectives, cognitive scaffolding, and interaction models.
* [Lesson Generation Skill](.mosaic/skills/lesson-generation/SKILL.md) — How to ground generated lessons in supplied education sources, validate objective coverage, and review learner paths.
* [Simulation Engine Skill](.mosaic/skills/simulation/SKILL.md) — Full API reference for specs, expressions, transitions, events, and engine execution.
* [Visualization Skill](.mosaic/skills/visualization/SKILL.md) — Detailed catalog and usage examples for all visual components.
* [Animation Skill](.mosaic/skills/animation/SKILL.md) — Guidelines and APIs for purposeful motion and transitions.
* [Education Skill](.mosaic/skills/education/SKILL.md) — How to compose narrative, formulas, code, questions, hints, and quizzes.
