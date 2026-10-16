# Mosaic Agent Evaluation Rubric

Use this 100-point rubric to assess generated Mosaic lessons. The rubric evaluates both the simulation and the experience of learning through it. The CLI evaluator reports objective structural signals only; it does not assign a teaching-quality score. Complete the learner-experience categories by reviewing the lesson as a first-time learner.

## Summary scorecard

| Category | Points |
| --- | ---: |
| **A. Simulation correctness and engine compliance** | **20** |
| **B. Mosaic toolkit and API use** | **15** |
| **C. Learner experience and instructional design** | **30** |
| **D. Visual clarity and interaction** | **15** |
| **E. Technical quality and code hygiene** | **20** |
| **Total** | **100** |

The weights changed from the previous rubric (A 25, B 20, C 20, D 15, E 20). Simulation and toolkit compliance remain important, while 10 points move to learner experience because API usage alone does not show that a beginner can understand a lesson.

## A. Simulation correctness and engine compliance (20)

- **Engine is the source of truth (5):** dynamic simulation state evolves through `SimulationEngine` and is read through the controller. React state holds only presentation state and does not duplicate simulation history unnecessarily.
- **State separation (4):** dynamic state, configured parameters, immutable lesson data, and React-only presentation state are distinguishable.
- **Transitions and `onStep` discipline (5):** use declarative transitions when they reasonably express the operation; retain `onStep` for computations that do not fit well in the declarative API. Do not force a risky rewrite merely to remove a callback.
- **Determinism and reset behavior (3):** repeated runs and resets produce predictable results, including parameter behavior.
- **Events (3):** meaningful milestones use event rules where appropriate and reflect the resulting engine state.

## B. Mosaic toolkit and API use (15)

- **Semantic components (6):** choose Mosaic controls, educational components, and visual components that fit the learning task; do not use components just to increase their count.
- **Abstraction boundary (4):** keep low-level visualization or animation libraries behind Mosaic abstractions except where a real capability gap requires a fallback.
- **Control fit (3):** expose actions and parameters that support the current learner task. Playback controls, speed, and tuning controls need not all be prominent in every lesson.
- **Educational components (2):** use Mosaic educational components where they add meaning and sequence them when they become relevant.

## C. Learner experience and instructional design (30)

- **Beginner comprehension and prerequisites (6):** assume no prior knowledge unless stated. Define prerequisites plainly before relying on them; use familiar examples where useful.
- **Opening and intuition (4):** begin with a relatable problem, question, or concrete scenario. Build intuition before leading with terminology, formulas, code, or controls.
- **Narrative continuity and progression (5):** reveal one main idea at a time. Transitions explain what changed, why it changed, and how it follows from the previous stage.
- **Prediction and feedback (5):** ask a focused prediction before a meaningful outcome; give immediate, kind, concept-specific feedback for correct and incorrect responses.
- **Next action and learner agency (3):** at every point, the next action is clear, appropriately paced, and not obscured by competing controls.
- **Quiz alignment (4):** the final knowledge check tests the stated learning objective through reasoning or transfer, provides useful feedback, and offers a way to revisit related teaching.
- **Conclusion (3):** end by naming the takeaway and connecting it to the demonstrated experience.

## D. Visual clarity and interaction (15)

- **Visual focus and cognitive load (5):** one dominant visual supports one main teaching objective; optional or advanced material does not compete with the initial experience.
- **Meaningful state and causal explanation (5):** target, active range, changed elements, and outcomes are legible. Explanations connect visual changes to their cause. Color is supported by labels, shapes, or other cues.
- **Pacing, responsiveness, and accessibility (5):** important explanations do not autoplay away; interaction works on narrow screens and includes usable labels and reduced-motion handling where relevant.

## E. Technical quality and code hygiene (20)

- **Local-first and client-side operation (5):** the lesson runs without a backend, external runtime, or API key.
- **Type safety (5):** documented TypeScript checks pass without unsafe suppression.
- **Build and tests (5):** documented builds and applicable tests pass.
- **Maintainability (5):** no unrelated complexity, stale code, console noise, or undocumented dependency changes.

## Mathematical and simulation correctness

Check accuracy across categories A, C, and D. Ensure the visual quantity being shown is labeled correctly and does not get conflated with a complexity or rate claim. For Binary Search, for example, the candidate count falls by about half per comparison, while the number of comparisons grows logarithmically with the starting list size. Assess whether the simulation, explanation, labels, and quiz agree.

## Score interpretation

| Score | Rating | Guidance |
| ---: | --- | --- |
| 90–100 | Exemplary | Suitable as a reference lesson |
| 80–89 | Proficient | Minor refinement may help |
| 65–79 | Developing | Rework the weakest instructional or technical areas |
| Below 65 | Unsatisfactory | Revisit the lesson objective and implementation |

## Automated versus human review

Run `node evaluation/scripts/evaluate-lesson.mjs [path]` for structural checks such as engine imports, controls, semantic component names, educational component presence, and optional disclosure markers. These checks can detect presence or absence; they cannot determine whether an opening is relatable, an explanation is understandable, a prediction is well timed, a visual is calm, or feedback teaches. Do not report the CLI output as a learner-experience score. Use a human walkthrough against categories C and D.
