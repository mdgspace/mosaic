# GitHub Copilot Instructions — Mosaic

When operating in GitHub Copilot within the Mosaic repository, follow the architecture, conventions, and contracts established in the central agent guide.

## Essential Instructions

1. **Read the Central Guide**:
   * Review [AGENT_GUIDE.md](AGENT_GUIDE.md) for full context on architecture, component selection, simulation lifecycle, and workflows.

2. **Inspect Domain Skills**:
   Consult the corresponding skill files in `.mosaic/skills/`:
   * [Lesson Design](.mosaic/skills/lesson-design/SKILL.md) — Pedagogical goals, state/parameter separation, and interaction design.
   * [Simulation Engine](.mosaic/skills/simulation/SKILL.md) — Declarative specs, transitions, onStep escape hatch, conditions, and events.
   * [Visualization](.mosaic/skills/visualization/SKILL.md) — Choosing and using `ChartLine`, `Graph`, `Particle`, `Timeline`, `Heatmap`, `Diagram`, etc.
   * [Animation](.mosaic/skills/animation/SKILL.md) — Purposeful motion with `Particle` and `Animated`.
   * [Educational Toolkit](.mosaic/skills/education/SKILL.md) — Composing `Explanation`, `Formula`, `CodeBlock`, `Question`, `Hint`, and `Quiz`.

3. **Core Development Guidelines**:
   * **Local-First**: All simulations execute in the browser on `localhost` without external services.
   * **Engine Truth**: State, parameters, and transitions belong in `@mosaic/simulation`.
   * **Semantic Components**: Use `@mosaic/ui` components rather than raw lower-level UI, graph, or animation libraries.

4. **Verification**:
   * Run tests: `npm test --workspaces --if-present`
   * Run type checks: `npm run check`
   * Start dev server: `npm run dev:web`
