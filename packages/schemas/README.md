# `@mosaic/schemas`

`simulation-spec-v0.1.schema.json` is the source of truth for Mosaic's
SimulationSpec v0.1 contract. Consumers should validate documents against this
JSON Schema rather than defining parallel TypeScript or Python models.

Run its example validation suite from the repository root:

```bash
npm run test --workspace @mosaic/schemas
```

The valid examples demonstrate Binary Search and Gradient Descent. The invalid
examples guard the required top-level fields, parameter/value type correlation,
the controlled action vocabulary, and the object-only initial state.
