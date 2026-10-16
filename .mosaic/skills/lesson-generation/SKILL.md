# Lesson Generation from Education Sources

Use this skill whenever an agent is asked to turn supplied course notes, articles, transcripts, or reference documents into a Mosaic lesson.

## Goal

The agent owns the iteration. The user should be able to provide a topic and source material, then receive a fact-grounded, working, beginner-friendly lesson without having to debug missing visual states, unclear feedback, or broken controls themselves.

Mosaic does not include an in-app LLM runtime. This workflow is for the connected coding agent that reads the user's sources and creates lesson code in the repository. Do not claim that the in-app topic finder generates lessons.

## Required workflow

1. **Read all provided sources before writing lesson copy.** Record their paths, useful section headings, stated prerequisites, key claims, worked examples, and limitations. Treat source material as the authority for lesson facts. If sources disagree or omit a needed fact, flag it for the user or keep the claim out; do not silently fill the gap from memory.
2. **Create a lesson plan before implementation.** Write `lesson-plan.json` beside the generated lesson. Follow `packages/schemas/lesson-plan-v0.1.schema.json`. Map every objective to at least one teaching stage and one assessment item. Add source references to every objective, teaching stage, and misconception correction. The plan is a reasoning and traceability artifact, not learner-facing UI.
3. **Validate the plan.** Run `node packages/schemas/scripts/validate-lesson-plan.mjs path/to/lesson-plan.json`. Fix schema, source-reference, and objective-coverage errors before generating components.
4. **Choose the teaching experience from the subject.** Select a concrete opening, mental model, simulation or static explanation, and visualization that match the source and objective. Do not copy the Binary Search or Gradient Descent sequence just because it exists in the app.
5. **Generate with Mosaic's reusable API.** Prefer `PredictionCheck` for a prediction with constructive feedback and a gated reveal, `LessonOutcome` for explained success/caution states, Mosaic educational components for narration and checks, and semantic visuals such as `ChartLine`, `Graph`, `Particle`, `Flow`, `Timeline`, or `Diagram`. Do not hand-draw chart SVGs in a lesson. If the toolkit cannot express a real pedagogical need, extend the toolkit abstraction once, then use it from the lesson.
6. **Keep simulation, parameters, and presentation separate.** `SimulationEngine` owns evolving values. Parameters own adjustable values. React state should hold only presentation state such as the learner's prediction or quiz selection. Use declarative transitions when they fit; use `onStep` for algorithmic or mathematical logic that is not clear or safe to express declaratively.
7. **Check complete learner paths.** Verify correct and incorrect predictions, hints, one-step progression, repeated steps, reset after success and failure, small and large parameter choices, boundaries, and stopping conditions. Every outcome states what changed, why it changed, whether the learner's prediction matched, and the next action.
8. **Review the built page.** Run type check and build, the plan validator, lesson evaluator, and relevant package tests. If a browser is available, inspect desktop and narrow mobile layouts and interact through both success and failure paths. Fix issues before handing the work back; report visual verification as outstanding only when the environment prevents it.

## Authoring constraints

- Preserve the meaning of source material; paraphrase for clarity and cite source sections in the plan.
- Make claims, equations, labels, simulation behavior, predictions, outcomes, and quiz feedback agree.
- Ask the learner to predict the result of a meaningful step before revealing it. Feedback must identify correctness and explain the causal reason, not just say “right” or “try again.”
- A parameter experiment that fails must explain the measured result and provide a specific recovery action. Avoid bare “reset,” “start again,” and “try again” messages.
- Keep one primary visual and one primary action in focus. Make a changing value visible with a label as well as color or motion.
- Introduce controls when they help test the objective. Explain what their values do in learner language.
- Keep advanced code, state, logs, and implementation details optional.
- Use a readable system sans-serif, comfortable body text, strong contrast, responsive container sizing, focus styles, and reduced-motion behavior.
- Do not report static checks as proof of teaching quality. Use the rubric's human review categories after automated validation.

## Completion report

Report source files read, objectives created, lesson files generated, plan-validator/evaluator/check/build results, browser paths reviewed, and any source gaps. Do not ask the user to repair issues the agent can resolve from the provided material and repository context.
