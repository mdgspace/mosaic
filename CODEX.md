# Codex Agent Instructions — Mosaic

When operating within the Mosaic project, follow the architecture, conventions, and contracts established in the central agent guide.

## Essential Instructions

1. **Read the Central Guide First**:
   * Review [AGENT_GUIDE.md](AGENT_GUIDE.md) for architectural rules, component selection tables, simulation contracts, and workflows.

2. **Inspect Domain Skills**:
   For in-depth guidelines on specific tasks, consult the relevant skill in `.mosaic/skills/`:
   * [Lesson Design](.mosaic/skills/lesson-design/SKILL.md) — Learning objectives, state/parameter planning, and pedagogical flow.
   * [Simulation Engine](.mosaic/skills/simulation/SKILL.md) — Spec definition, state, expressions, transitions, onStep escape hatch, and event rules.
   * [Visualization](.mosaic/skills/visualization/SKILL.md) — Using `ChartLine`, `Graph`, `Particle`, `Timeline`, `Heatmap`, `Diagram`, etc.
   * [Animation](.mosaic/skills/animation/SKILL.md) — Pedagogical motion with `Particle`, `Animated`, and transitions.
   * [Educational Toolkit](.mosaic/skills/education/SKILL.md) — Composing `Explanation`, `Formula`, `CodeBlock`, `Question`, `Hint`, and `Quiz`.

3. **Core Principles**:
   * **Local-First & Client-Side**: No backend server or LLM service is needed to run lessons.
   * **Single Source of Truth**: `@mosaic/simulation` owns simulation state; `@mosaic/ui` handles presentation.
   * **Semantic Components**: Use `@mosaic/ui` abstractions rather than raw third-party visualization or animation libraries.

4. **Validation & Verification**:
   * Run tests: `npm test --workspaces --if-present`
   * Run type checks: `npm run check`
   * Start dev server: `npm run dev:web`
