# Mosaic Agent Evaluation Rubric

This 100-point rubric provides a standardized evaluation standard for assessing AI-generated Mosaic interactive educational lessons.

---

## Summary Scorecard

| Category | Description | Points |
| :--- | :--- | :---: |
| **A. Simulation Correctness & Engine Compliance** | Source of truth, state separation, declarative transitions vs `onStep` escape hatch, atomicity, determinism | **25** |
| **B. Mosaic Toolkit & API Usage** | Proper use of `@mosaic/ui`, component selection, avoidance of raw library leakage | **20** |
| **C. Educational Design & Correctness** | Pedagogical arc, conceptual progression, accuracy of mathematical explanations, active prediction, knowledge checks | **20** |
| **D. Visual & Interaction Quality** | Purposeful visualization, responsive layout, meaningful animation, telemetry feedback, clear pointers | **15** |
| **E. Technical Quality & Code Hygiene** | TypeScript cleanliness, local-first compliance, zero external dependencies, no console errors, clean builds | **20** |
| **Total** | | **100** |

---

## Category Details & Grading Criteria

---

### A. Simulation Correctness & Engine Compliance (25 Points)

Evaluates whether the lesson treats `@mosaic/simulation` as the authoritative, deterministic foundation for state evolution.

#### Criteria & Point Breakdown:
1. **Single Source of Truth (6 pts)**: State is owned by `SimulationEngine` and accessed via `useSimulationController`. Simulation state is not duplicated in React component state.
2. **Clean Tripartite State Separation (5 pts)**:
   * Dynamic variables are kept in `SimulationState`.
   * User-adjustable settings are registered in `spec.parameters`.
   * Static constants/datasets are kept as immutable constants outside state.
3. **Declarative Transitions vs. Escape Hatch Discipline (7 pts)**:
   * Uses declarative `spec.transitions` (with arithmetic and comparison operations) when behavior can be represented in AST form.
   * Uses `SimulationEngineOptions.onStep` **strictly as an escape hatch** for non-linear mathematics, trigonometry, or unsupported data-structure operations.
   * *Penalty*: Deduct up to 5 points if ordinary arithmetic or state assignments are moved into `onStep` simply for developer convenience.
4. **Deterministic & Atomic Execution (4 pts)**:
   * Stepping, resetting, and parameter updates produce predictable, repeatable outcomes.
   * Step execution is atomic; failed evaluations or errors never commit partial mutations.
5. **Event Rule Integration (3 pts)**:
   * Declarative `eventRules` emit milestone events (`found`, `threshold_reached`, etc.) into `StepResult.events`.

#### Grading Thresholds:
* **Full Credit (22–25 pts)**: Engine is fully compliant, clean state separation, declarative transitions used where possible, `onStep` used only where strictly necessary, atomic reset and step.
* **Partial Credit (12–21 pts)**: Engine is used but ordinary state logic is unnecessarily placed inside `onStep`, or minor state duplication exists in React state.
* **Failure (0–11 pts)**: Engine bypassed entirely; state maintained solely in React hooks; non-deterministic execution; simulation state mutates asynchronously outside the controller.

---

### B. Mosaic Toolkit & API Usage (20 Points)

Evaluates adherence to Mosaic's semantic component abstraction and avoidance of raw third-party library leakage.

#### Criteria & Point Breakdown:
1. **Semantic Component Selection (8 pts)**:
   * Selects appropriate `@mosaic/ui` components based on data shape (e.g. `ChartLine`, `Graph`, `Particle`, `Timeline`, `Flow`, `Heatmap`, `Equation`, `Diagram`).
2. **Simulation Controls Integration (5 pts)**:
   * Uses standardized controls (`Play`, `Pause`, `Step`, `Reset`, `SpeedControl`, `ParameterControl`) wired directly to controller methods.
3. **Educational Component Composition (4 pts)**:
   * Composes `Explanation`, `Formula`, `CodeBlock`, `Question`, `Hint`, and `Quiz` to frame the experience.
4. **Abstraction Boundary Adherence (3 pts)**:
   * Does NOT import `recharts`, `@xyflow/react`, `framer-motion`, or `d3` directly into normal lesson views unless a specialized fallback is genuinely required.

#### Grading Thresholds:
* **Full Credit (18–20 pts)**: Flawless use of Mosaic semantic primitives for UI, visualization, animation, and education with no unneeded raw library imports.
* **Partial Credit (10–17 pts)**: Uses Mosaic components for most elements but imports lower-level libraries (e.g. raw Recharts or Framer Motion) where Mosaic primitives already exist.
* **Failure (0–9 pts)**: Ignores `@mosaic/ui` and implements custom ad-hoc controls, charts, and buttons with raw HTML/CSS.

---

### C. Educational Design & Correctness (20 Points)

Evaluates the pedagogical effectiveness, instructional scaffolding, and factual accuracy of the lesson.

#### Criteria & Point Breakdown:
1. **Pedagogical Arc & Scaffolding (5 pts)**:
   * Follows a structured sequence: Concept Intro $\rightarrow$ Governing Rule $\rightarrow$ Interactive Experiment $\rightarrow$ Active Reasoning $\rightarrow$ Assessment.
2. **Active Inquiry / Prediction Challenge (5 pts)**:
   * Gives the learner an opportunity to predict the next step, branch, or parameter outcome before executing it.
3. **Factual & Mathematical Accuracy (5 pts)**:
   * Mathematical explanations and complexity claims accurately reflect what the simulation actually demonstrates.
   * *Critical Check*: Visual labels must be accurate. For example, a chart showing remaining search candidates should not be labeled "O(log n)" if the plotted curve represents exponential reduction $N/2^k$ over linear steps $k$; the distinction between algorithm complexity and plotted telemetry must be mathematically precise.
4. **Knowledge Check & Feedback (5 pts)**:
   * Includes a `Quiz` that tests core conceptual understanding (not trivial trivia) with constructive, explanatory feedback for right and wrong answers.

#### Grading Thresholds:
* **Full Credit (18–20 pts)**: Excellent pedagogical arc, engaging prediction prompt, mathematically rigorous explanation matching the visuals, effective quiz.
* **Partial Credit (10–17 pts)**: Good interaction but missing prediction step, or explanations are slightly inaccurate/vague regarding complexity derivation.
* **Failure (0–9 pts)**: Purely explanatory text with disconnected controls, misleading or incorrect mathematical explanations, no active learning checks.

---

### D. Visual & Interaction Quality (15 Points)

Evaluates the visual hierarchy, layout responsiveness, animation purposefulness, and clarity of state indicators.

#### Criteria & Point Breakdown:
1. **Visual Clarity & Telemetry (5 pts)**:
   * Key entities, pointers (e.g. `low`/`mid`/`high`, current coordinates, active node), and status badges are immediately legible.
   * Eliminated vs. active states are clearly differentiated.
2. **Purposeful Animation (5 pts)**:
   * Motion connects cause and effect (e.g. smooth coordinate glide via `Particle`, presence reveals via `Animated`, edge pulses).
   * No distracting or unprompted decorative animations.
3. **Responsive Layout & Visual Hierarchy (5 pts)**:
   * Clean card layout, structured spacing, readable typography, and usable on different viewport sizes.

#### Grading Thresholds:
* **Full Credit (13–15 pts)**: Visually polished, crystal-clear pointers and state markers, purposeful smooth animations, well-proportioned layout.
* **Partial Credit (8–12 pts)**: Functional visualization but slightly cramped layout, lack of distinct visual markers, or animation that is too fast/slow.
* **Failure (0–7 pts)**: Broken layout, visual overlaps, missing pointer indicators, or excessive chaotic motion.

---

### E. Technical Quality & Code Hygiene (20 Points)

Evaluates code structure, type safety, local-first integrity, and adherence to repository build standards.

#### Criteria & Point Breakdown:
1. **Local-First & Client-Side Integrity (5 pts)**:
   * Completely self-contained; requires no backend server, API keys, or cloud LLM runtime to run in the browser.
2. **TypeScript Type Safety (5 pts)**:
   * Compiles cleanly with `tsc --noEmit` across workspaces with zero type errors and no unsafe `any` casting.
3. **Build & Test Compatibility (5 pts)**:
   * Passes `npm test --workspaces --if-present` and `npm run build` without failures.
4. **Code Cleanliness & Maintainability (5 pts)**:
   * Modular structure, clear comments where helpful, no unused dead code or lingering debug logs.

#### Grading Thresholds:
* **Full Credit (18–20 pts)**: Zero type errors, clean builds, zero backend dependencies, modular and maintainable TypeScript.
* **Partial Credit (10–17 pts)**: Runs locally but requires minor type suppression, or has minor code duplication.
* **Failure (0–9 pts)**: Fails TypeScript type checking, breaks the build, or attempts to introduce external cloud/backend dependencies.

---

## Overall Evaluation Scoring Scale

| Total Score | Rating | Verdict | Action Required |
| :---: | :---: | :---: | :--- |
| **90 – 100** | **Exemplary** | Ready for production inclusion | None; serve as gold standard example. |
| **80 – 89** | **Proficient** | Acceptable quality | Minor polish on visualization or declarative transitions. |
| **65 – 79** | **Developing** | Needs refinement | Revise state separation, reduce `onStep` overuse, or improve scaffolding. |
| **< 65** | **Unsatisfactory** | Rejected | Re-prompt agent with focus on AGENT_GUIDE.md and relevant skills. |

