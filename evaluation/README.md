# Mosaic Agent Evaluation Framework

The **Mosaic Agent Evaluation Framework** provides a standardized benchmark suite and scoring methodology for evaluating whether AI coding agents (such as Codex, Claude Code, Cursor, and Copilot) can successfully generate interactive educational lessons in Mosaic.

---

## 1. Overview & Principles

* **Benchmark Prompts**: Standardized prompts describing *only* the learning goals and user interaction (without leaking Mosaic component or API names).
* **Two-Stage Evaluation**:
  1. **Automated Static Checks**: Validates architectural compliance, `@mosaic/simulation` and `@mosaic/ui` usage, and checks for raw library leakage using `evaluate-lesson.mjs`.
  2. **Standardized Rubric Scoring**: A 100-point rubric evaluating simulation correctness, educational accuracy, visual hierarchy, and code quality.
* **Local-First & Tool-Agnostic**: Independent of any specific LLM harness or cloud service.
* **Source-grounded plans**: When source material is supplied, require a validated plan tracing objectives, stages, and assessment to source sections before implementation. See `.mosaic/skills/lesson-generation/SKILL.md`.

---

## 2. Directory Structure

```text
evaluation/
├── README.md                           # Evaluation workflow guide
├── rubric.md                           # Standardized 100-point rubric
├── prompts/                            # Unbiased benchmark prompts
│   ├── binary-search.md                # Binary Search algorithm lesson
│   ├── projectile-motion.md            # 2D Kinematics / Physics lesson
│   ├── gradient-descent.md             # Optimization / ML convergence lesson
│   └── tcp-handshake.md                # Networking / Protocol state machine lesson
└── scripts/
    └── evaluate-lesson.mjs             # Static CLI evaluator
```

---

## 3. Step-by-Step Evaluation Workflow

Follow this repeatable process when benchmarking an agent:

```text
1. Select Benchmark Prompt (evaluation/prompts/*.md)
       ↓
2. Provide Prompt and education sources to AI Coding Agent (with AGENT_GUIDE.md & .mosaic/skills/)
       ↓
3. Have the agent write and validate lesson-plan.json, then generate the lesson
       ↓
4. Verify TypeScript Compilation & Builds (npm run check && npm run build)
       ↓
5. Run Automated Static Evaluator (node evaluation/scripts/evaluate-lesson.mjs)
       ↓
6. Run & Interact Locally in Browser (npm run dev:web)
       ↓
7. Score Against 100-Point Rubric (evaluation/rubric.md) with a first-time learner walkthrough
       ↓
8. Record Score & Compare Across Agents/Prompts
```

### Detailed Steps:

### Step 1: Select a Benchmark Prompt
Choose one of the four prompts in `evaluation/prompts/`:
* `binary-search.md`
* `projectile-motion.md`
* `gradient-descent.md`
* `tcp-handshake.md`

### Step 2: Feed Prompt to Agent
Provide the prompt text to your AI coding agent. Ensure the agent environment has access to:
* `AGENT_GUIDE.md`
* `CODEX.md` / `CLAUDE.md` / `CURSOR.md` / `COPILOT.md`
* `.mosaic/skills/`

### Step 3: Local Verification & Automated Evaluation
Run the automated verification commands from the repository root:

```bash
# 1. Run type checks and build
npm run check
npm run build

# 2. Run the automated static lesson evaluator
node evaluation/scripts/evaluate-lesson.mjs apps/web/src/main.tsx

# 3. Test the evaluator's structural reporting
node --test evaluation/scripts/evaluate-lesson.test.mjs
```

### Step 4: Run Locally in Browser
Start the local Vite development server and interact with the lesson:

```bash
npm run dev:web
```
Open `http://localhost:5173` to test playback, stepping, parameter tuning, prediction challenges, and quizzes.

### Step 5: Score with Rubric
Open `evaluation/rubric.md` and assess the implementation against five categories (100 points total):
* **A. Simulation Correctness (20 pts)**: Engine source of truth, state separation, declarative transitions and appropriate `onStep` use.
* **B. Mosaic Toolkit & API Use (15 pts)**: Appropriate semantic components and controls, no unnecessary raw library leaks.
* **C. Learner Experience (30 pts)**: Beginner prerequisites, relatable opening, progressive narrative, prediction feedback, clear next action, aligned quiz, and conclusion.
* **D. Visual & Interaction Quality (15 pts)**: One clear visual focus, explained state changes, accessible cues, pace, and responsive layout.
* **E. Technical Quality (20 pts)**: Type safety, tests/builds, local-first operation, and maintainability.

The rubric weights changed from the earlier version to give learner experience 30 points. The evaluator reports structural presence only; a human reviewer decides whether the lesson teaches well. Review the lesson from the perspective of someone who has never encountered the subject.

---

## 4. Evaluator CLI Reference

Run the evaluator against any lesson file:

```bash
# Evaluate the default web app lesson (apps/web/src/main.tsx)
node evaluation/scripts/evaluate-lesson.mjs

# Evaluate a specific lesson file
node evaluation/scripts/evaluate-lesson.mjs path/to/lesson.tsx
```

