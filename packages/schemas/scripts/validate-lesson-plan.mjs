#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";
import schema from "../lesson-plan-v0.1.schema.json" with { type: "json" };

const validateSchema = new Ajv2020({ allErrors: true, strict: true }).compile(schema);

export function validateLessonPlan(plan) {
  const errors = [];
  if (!validateSchema(plan)) errors.push(...(validateSchema.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message}`));
  if (!plan || typeof plan !== "object") return errors;

  const sources = new Map((plan.sources ?? []).map((source) => [source.id, source]));
  const objectives = new Set((plan.objectives ?? []).map((objective) => objective.id));
  const seen = new Set();
  for (const source of plan.sources ?? []) addUnique(seen, source.id, "source", errors);
  seen.clear();
  for (const objective of plan.objectives ?? []) addUnique(seen, objective.id, "objective", errors);
  seen.clear();
  for (const stage of plan.stages ?? []) {
    addUnique(seen, stage.id, "stage", errors);
    validateObjectiveRefs(stage.objectiveRefs, objectives, `stage ${stage.id}`, errors);
    validateSourceRefs(stage.sourceRefs, sources, `stage ${stage.id}`, errors);
  }
  const objectivesInStages = new Set((plan.stages ?? []).flatMap((stage) => stage.objectiveRefs ?? []));
  const objectivesInAssessment = new Set();
  for (const item of plan.assessment ?? []) {
    validateObjectiveRefs(item.objectiveRefs, objectives, "assessment item", errors);
    for (const id of item.objectiveRefs ?? []) objectivesInAssessment.add(id);
    const matches = (item.options ?? []).filter((option) => option.id === item.correctOptionId).length;
    if (matches !== 1) errors.push(`assessment correctOptionId '${item.correctOptionId}' must identify exactly one option`);
  }
  for (const objective of objectives) {
    if (!objectivesInStages.has(objective)) errors.push(`objective '${objective}' is not taught by any stage`);
    if (!objectivesInAssessment.has(objective)) errors.push(`objective '${objective}' is not checked by the assessment`);
  }
  for (const objective of plan.objectives ?? []) validateSourceRefs(objective.sourceRefs, sources, `objective ${objective.id}`, errors);
  for (const item of plan.misconceptions ?? []) validateSourceRefs(item.sourceRefs, sources, "misconception", errors);
  return errors;
}

function addUnique(seen, id, kind, errors) {
  if (seen.has(id)) errors.push(`duplicate ${kind} id '${id}'`);
  seen.add(id);
}

function validateObjectiveRefs(refs = [], objectives, owner, errors) {
  for (const id of refs) if (!objectives.has(id)) errors.push(`${owner} references unknown objective '${id}'`);
}

function validateSourceRefs(refs = [], sources, owner, errors) {
  for (const ref of refs) {
    const source = sources.get(ref.sourceId);
    if (!source) errors.push(`${owner} references unknown source '${ref.sourceId}'`);
    else if (!source.sections.includes(ref.section)) errors.push(`${owner} references unknown section '${ref.section}' in source '${ref.sourceId}'`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const target = path.resolve(process.argv[2] ?? "");
  if (!process.argv[2] || !fs.existsSync(target)) {
    console.error("Usage: node packages/schemas/scripts/validate-lesson-plan.mjs path/to/lesson-plan.json");
    process.exit(2);
  }
  const plan = JSON.parse(fs.readFileSync(target, "utf8"));
  const errors = validateLessonPlan(plan);
  if (errors.length) {
    console.error(`Lesson plan is invalid (${errors.length} issue${errors.length === 1 ? "" : "s"}):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(`Lesson plan is structurally valid: ${path.relative(process.cwd(), target)}`);
}
