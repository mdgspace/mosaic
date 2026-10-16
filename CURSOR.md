# Cursor Rules — Mosaic

When operating in Cursor within the Mosaic codebase, adhere to the architecture, conventions, and contracts defined in the central agent guide.

## Essential Instructions

1. **Central Guide**:
   * Refer to [AGENT_GUIDE.md](AGENT_GUIDE.md) for full details on Mosaic architecture, component selection, simulation rules, and lesson creation.

2. **Domain Skills**:
   Inspect the relevant skill in `.mosaic/skills/` when generating or editing specific areas:
   * [Lesson Design](.mosaic/skills/lesson-design/SKILL.md) — Pedagogical flow, state/parameter separation, and interaction models.
   * [Simulation Engine](.mosaic/skills/simulation/SKILL.md) — Declarative specs, transitions, onStep escape hatch, expressions, and event rules.
   * [Visualization](.mosaic/skills/visualization/SKILL.md) — Semantic visualization primitives (`ChartLine`, `Graph`, `Particle`, `Timeline`, etc.).
   * [Animation](.mosaic/skills/animation/SKILL.md) — Pedagogical motion with `Particle` and `Animated`.
   * [Educational Toolkit](.mosaic/skills/education/SKILL.md) — Educational containers (`Explanation`, `Formula`, `Quiz`, etc.).

3. **Key Rules**:
   * Mosaic is a local-first client-side framework. Do not build backend services or external LLM callers for lesson execution.
   * Do not duplicate simulation state in React component state. Keep `SimulationEngine` as the single source of truth.
   * Always prefer `@mosaic/ui` semantic components over raw third-party visualization/motion libraries.

4. **Verification**:
   * Run workspace tests: `npm test --workspaces --if-present`
   * Run type check: `npm run check`
   * Run dev server: `npm run dev:web`
