# `@mosaic/simulation`

This package provides a framework-independent state foundation for a validated
Mosaic SimulationSpec. It owns current state and parameter values, while
rendering and domain behavior remain outside the engine.

`step` delegates to an optional trusted TypeScript callback. The engine does
not evaluate strings or execute generated code.

```bash
npm run test --workspace @mosaic/simulation
```
