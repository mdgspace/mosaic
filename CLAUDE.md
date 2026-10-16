# Claude Code Instructions — Mosaic

When operating in the Mosaic repository, follow the architecture, conventions, and contracts established in the central agent guide.

## Essential Instructions

1. **Read the Central Guide First**:
   * Review [AGENT_GUIDE.md](AGENT_GUIDE.md) for architectural rules, component selection tables, simulation contracts, and workflows.

2. **Inspect Domain Skills**:
   For in-depth guidelines on specific tasks, consult the relevant skill in `.mosaic/skills/`:
   * [Lesson Design](.mosaic/skills/lesson-design/SKILL.md) — Pedagogical structure, state/parameter separation, and interaction planning.
   * [Simulation Engine](.mosaic/skills/simulation/SKILL.md) — State, parameters, expressions, transitions, onStep escape hatch, and event rules.
   * [Visualization](.mosaic/skills/visualization/SKILL.md) — Using `ChartLine`, `Graph`, `Particle`, `Timeline`, `Heatmap`, `Diagram`, etc.
   * [Animation](.mosaic/skills/animation/SKILL.md) — Meaningful motion and UI transitions.
   * [Educational Toolkit](.mosaic/skills/education/SKILL.md) — Scaffolding with `Explanation`, `Formula`, `CodeBlock`, `Question`, `Hint`, and `Quiz`.

3. **Core Development Guidelines**:
   * **Local-First & Client-Side**: Lessons run in the browser without requiring a backend server.
   * **Single Source of Truth**: The simulation engine (`@mosaic/simulation`) owns state; `@mosaic/ui` handles rendering.
   * **Semantic Components**: Prefer `@mosaic/ui` components over direct lower-level libraries (`framer-motion`, `@xyflow/react`, `recharts`, `d3`).

4. **Verification Commands**:
   * Tests: `npm test --workspaces --if-present`
   * Type checks: `npm run check`
   * Dev server: `npm run dev:web`
