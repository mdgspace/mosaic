# Changelog

Unreleased — notes for maintainers

## 2026-10-16

- feat: add source-grounded lesson generation (`e0d9a9f`)
  - Added agent guidance and schema changes supporting source-backed lesson plans.
  - Note: `packages/schemas/lesson-plan-v0.1.schema.json` introduced — verify downstream consumers for compatibility.

- feat: improve guided lesson experience (`ab77de8`)
  - Added `apps/web/src/GradientDescentLesson.tsx` and UI tweaks.
  - Recommendation: smoke-test the lesson in the browser and add a small render test when possible.

- feat: add agent evaluation framework (`ccb97fa`)
  - Added `evaluation` prompts and scripts for automated assessment of generated lessons.
  - Added run instructions to `evaluation/README.md`.

- feat: add Mosaic agent layer (`004fdad`)
  - Initial `.mosaic/skills/*` and agent docs added.

### Actions taken

- Added run instructions to `evaluation/README.md` (how to run tests and the evaluator).
- Added this `CHANGELOG.md` and a `CONTRIBUTING.md` pointer for maintainers.

### Recommended next steps

- Consider creating a CI entry that runs `npm test --workspaces --if-present` and `npm run check` on PRs.
- Add a lightweight render test for `apps/web/src/GradientDescentLesson.tsx` in the `apps/web` test harness.
