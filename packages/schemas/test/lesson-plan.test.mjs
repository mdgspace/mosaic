import assert from "node:assert/strict";
import test from "node:test";
import { validateLessonPlan } from "../scripts/validate-lesson-plan.mjs";

function samplePlan() {
  const sourceRefs = [{ sourceId: "course-notes", section: "Core idea" }];
  return {
    version: "0.1",
    metadata: { id: "sample-topic", title: "A sample lesson", summary: "Learn one key idea." },
    sources: [{ id: "course-notes", path: "course-notes.md", sections: ["Core idea"] }],
    audience: "A beginner with no prior knowledge.",
    prerequisites: [],
    objectives: [{ id: "objective-1", outcome: "Explain the core idea.", sourceRefs }],
    misconceptions: [],
    stages: [{ id: "stage-1", objectiveRefs: ["objective-1"], teachingPurpose: "Build a useful mental model.", learnerText: "Here is a concrete example.", visual: { mosaicComponent: "ChartLine", purpose: "Show the relationship changing.", stateMapping: ["position -> x", "outcome -> y"] }, learnerAction: { type: "predict", label: "Predict the next change", prompt: "What happens next?", choices: ["It rises", "It falls"] }, outcomeExplanation: "The result follows from the relationship.", nextAction: "Try a second example.", sourceRefs }],
    assessment: [{ objectiveRefs: ["objective-1"], question: "Which explanation fits?", options: [{ id: "a", label: "The supported explanation." }, { id: "b", label: "A misconception." }], correctOptionId: "a", correctFeedback: "That matches the lesson.", retryFeedback: "Review the example and try again." }],
    simulation: { needed: true, stateFields: ["position"], parameters: [], invariants: ["The state remains finite."], edgeCases: ["The stopping condition is reached."] },
  };
}

test("lesson plan requires source-backed objectives, stages, and aligned assessment", () => {
  assert.deepEqual(validateLessonPlan(samplePlan()), []);
});

test("lesson plan rejects broken source and objective references", () => {
  const plan = samplePlan();
  plan.stages[0].objectiveRefs = ["missing-objective"];
  plan.objectives[0].sourceRefs[0].section = "missing-section";
  const errors = validateLessonPlan(plan);
  assert.ok(errors.some((error) => error.includes("unknown objective")));
  assert.ok(errors.some((error) => error.includes("unknown section")));
});

test("every objective must be taught and checked", () => {
  const plan = samplePlan();
  plan.assessment[0].objectiveRefs = [];
  const errors = validateLessonPlan(plan);
  assert.ok(errors.some((error) => error.includes("not checked by the assessment")));
});
