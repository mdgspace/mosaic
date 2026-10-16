# `@mosaic/schemas`

`simulation-spec-v0.1.schema.json` is the source of truth for Mosaic's
SimulationSpec v0.1 contract. Consumers should validate documents against this
JSON Schema rather than defining parallel TypeScript or Python models.

`lesson-plan-v0.1.schema.json` defines the intermediate plan that agents create
when turning supplied education sources into lessons. It records source
sections, learner objectives, misconceptions, teaching stages, assessment
links, and simulation edge cases. The companion validator also checks
cross-references and requires each objective to be taught and assessed.
Structural validation cannot prove that a source supports a claim; the agent
must read and reason about the referenced material.

Run its example validation suite from the repository root:

```bash
npm run test --workspace @mosaic/schemas
```

Validate a generated plan from the repository root:

```bash
node packages/schemas/scripts/validate-lesson-plan.mjs path/to/lesson-plan.json
```

The valid examples demonstrate Binary Search and Gradient Descent. The invalid
examples guard the required top-level fields, parameter/value type correlation,
the controlled action vocabulary, and the object-only initial state.
