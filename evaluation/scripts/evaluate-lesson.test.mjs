import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const evaluatorSource = fs.readFileSync(path.join(scriptDirectory, "evaluate-lesson.mjs"), "utf8");
const lessonSource = fs.readFileSync(path.join(repositoryRoot, "apps/web/src/main.tsx"), "utf8");

test("lesson source and evaluator expose structural signals without grading teaching quality", () => {
  assert.match(evaluatorSource, /Structural learner-experience signals only/);
  assert.match(evaluatorSource, /Optional disclosure section detected/);
  assert.match(evaluatorSource, /Live feedback region detected/);
  assert.match(evaluatorSource, /PredictionCheck/);
  assert.match(evaluatorSource, /LessonOutcome/);
  assert.match(evaluatorSource, /do not score teaching quality/);
  assert.match(lessonSource, /<Question\b/);
  assert.match(lessonSource, /<Hint\b/);
  assert.match(lessonSource, /<Quiz\b/);
  assert.match(lessonSource, /<details\b/);
  assert.match(lessonSource, /aria-live\s*=/);
});
