#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * Mosaic Lesson Static Evaluator
 *
 * Performs objective architectural, toolkit, and compliance checks on AI-generated lessons.
 * Does not attempt to score subjective educational or visual quality.
 */

const targetPath = process.argv[2] || path.join("apps", "web", "src", "main.tsx");
const resolvedPath = path.resolve(process.cwd(), targetPath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`\nError: Lesson source file not found at: ${resolvedPath}\n`);
  console.error("Usage: node evaluation/scripts/evaluate-lesson.mjs [path-to-lesson.tsx]\n");
  process.exit(1);
}

const sourceCode = fs.readFileSync(resolvedPath, "utf-8");

console.log("\n==================================================");
console.log("Mosaic Lesson Static Evaluation");
console.log("==================================================");
console.log(`Target: ${path.relative(process.cwd(), resolvedPath)}\n`);

const results = {
  architecture: [],
  toolkit: [],
  education: [],
  learnerExperience: [],
  warnings: [],
  criticalErrors: [],
};

// 1. Architecture Checks
const importsSimulation = /from\s+["']@mosaic\/simulation["']/.test(sourceCode);
const importsUI = /from\s+["']@mosaic\/ui["']/.test(sourceCode);
const usesSimulationEngine = /new\s+SimulationEngine\s*\(/.test(sourceCode);
const usesController = /useSimulationController\s*\(/.test(sourceCode);
const usesOnStep = /\bonStep\s*:/.test(sourceCode);
const usesDeclarativeTransitions = /\btransitions\s*:/.test(sourceCode);
const usesEventRules = /\beventRules\s*:/.test(sourceCode);

if (importsSimulation) {
  results.architecture.push("✓ @mosaic/simulation imported");
} else {
  results.criticalErrors.push("✗ @mosaic/simulation is not imported");
}

if (importsUI) {
  results.architecture.push("✓ @mosaic/ui imported");
} else {
  results.criticalErrors.push("✗ @mosaic/ui is not imported");
}

if (usesSimulationEngine) {
  results.architecture.push("✓ SimulationEngine instantiated");
} else {
  results.criticalErrors.push("✗ SimulationEngine not detected");
}

if (usesController) {
  results.architecture.push("✓ useSimulationController hook detected");
} else {
  results.warnings.push("⚠ useSimulationController not detected; ensure React is wired to engine");
}

if (usesDeclarativeTransitions) {
  results.architecture.push("✓ Declarative transitions detected in spec");
}

if (usesEventRules) {
  results.architecture.push("✓ Declarative eventRules detected in spec");
}

if (usesOnStep) {
  results.warnings.push("⚠ onStep callback detected: review that it remains a suitable escape hatch for this simulation logic");
}

// 2. Third-Party Raw Leakage Checks (Default vs Fallback audit)
const rawRecharts = /from\s+["']recharts["']/.test(sourceCode);
const rawReactFlow = /from\s+["']@xyflow\/react["']/.test(sourceCode);
const rawFramerMotion = /from\s+["']framer-motion["']/.test(sourceCode);
const rawD3 = /from\s+["']d3["']|from\s+["']d3-/.test(sourceCode);

if (rawRecharts) {
  results.warnings.push("⚠ Direct 'recharts' import detected: ensure <ChartLine> or standard Mosaic components are used unless custom fallback is needed");
}

if (rawReactFlow) {
  results.warnings.push("⚠ Direct '@xyflow/react' import detected: prefer <Graph> from @mosaic/ui");
}

if (rawFramerMotion) {
  results.warnings.push("⚠ Direct 'framer-motion' import detected: prefer <Particle> or <Animated> from @mosaic/ui");
}

if (rawD3) {
  results.warnings.push("⚠ Direct 'd3' import detected: prefer Mosaic semantic visualizations");
}

if (!rawRecharts && !rawReactFlow && !rawFramerMotion && !rawD3) {
  results.toolkit.push("✓ No raw third-party visualization/animation library imports");
}

// 3. UI and Simulation Controls Checks
const simControls = ["Play", "Pause", "Step", "Reset", "SpeedControl", "ParameterControl", "StateInspector", "EventLog"];
const foundControls = simControls.filter((c) => new RegExp(`\\b${c}\\b`).test(sourceCode));

if (foundControls.length >= 3) {
  results.toolkit.push(`✓ Simulation controls detected (${foundControls.join(", ")})`);
} else {
  results.warnings.push(`⚠ Few simulation controls found (${foundControls.join(", ") || "none"})`);
}

// 4. Visualization Components Checks
const visualComponents = ["ChartLine", "Chart", "Graph", "Node", "Edge", "Timeline", "Diagram", "Particle", "Flow", "Heatmap", "Equation"];
const foundVisuals = visualComponents.filter((c) => new RegExp(`\\b${c}\\b`).test(sourceCode));

if (foundVisuals.length > 0) {
  results.toolkit.push(`✓ Mosaic visualization components detected (${foundVisuals.join(", ")})`);
} else {
  results.warnings.push("⚠ No standard Mosaic visualization components detected");
}

// 5. Educational Components Checks
const eduComponents = ["Explanation", "Formula", "CodeBlock", "Question", "Hint", "Quiz", "PredictionCheck", "LessonOutcome"];
const foundEdu = eduComponents.filter((c) => new RegExp(`\\b${c}\\b`).test(sourceCode));

for (const comp of eduComponents) {
  if (foundEdu.includes(comp)) {
    results.education.push(`✓ <${comp}> detected`);
  } else {
    results.education.push(`- <${comp}> not present`);
  }
}

// Structural learner-experience signals only. Presence checks cannot judge
// whether content is understandable, well timed, or pedagogically effective.
const explanationCount = (sourceCode.match(/<Explanation\b/g) || []).length;
const questionCount = (sourceCode.match(/<(?:Question|PredictionCheck)\b/g) || []).length;
const hintCount = (sourceCode.match(/<Hint\b/g) || []).length;
const quizCount = (sourceCode.match(/<Quiz\b/g) || []).length;
const hasOptionalDisclosure = /<details\b/.test(sourceCode);
const hasLiveFeedbackRegion = /aria-live\s*=/.test(sourceCode);
results.learnerExperience.push(`Explanations: ${explanationCount}; prediction/question components: ${questionCount}; hints: ${hintCount}; quizzes: ${quizCount}`);
results.learnerExperience.push(`${hasOptionalDisclosure ? "✓" : "-"} Optional disclosure section detected`);
results.learnerExperience.push(`${hasLiveFeedbackRegion ? "✓" : "-"} Live feedback region detected`);

// Print Results
console.log("Architecture");
console.log("------------");
results.architecture.forEach((msg) => console.log(msg));
if (results.criticalErrors.length > 0) {
  results.criticalErrors.forEach((msg) => console.log(msg));
}

console.log("\nToolkit & Visuals");
console.log("-----------------");
results.toolkit.forEach((msg) => console.log(msg));

console.log("\nEducational Scaffolding");
console.log("-----------------------");
results.education.forEach((msg) => console.log(msg));

console.log("\nLearner Experience (Structural Signals Only)");
console.log("---------------------------------------------");
results.learnerExperience.forEach((msg) => console.log(msg));

if (results.warnings.length > 0) {
  console.log("\nNotices & Potential Anti-Patterns");
  console.log("---------------------------------");
  results.warnings.forEach((msg) => console.log(msg));
}

console.log("\nManual Rubric Checklist (See evaluation/rubric.md)");
console.log("---------------------------------------------------");
console.log("[ ] A. Simulation Correctness: State separation, declarative transitions vs onStep");
console.log("[ ] B. Toolkit Usage: Semantic Mosaic components used effectively");
console.log("[ ] C. Educational Correctness: Mathematical explanation accurately reflects visuals");
console.log("[ ] C. Learner Experience: Beginner opening, progressive disclosure, useful predictions and feedback, aligned quiz");
console.log("[ ] D. Visual & Interaction: Clear visual focus, meaningful state distinction, clear next action, responsive access");
console.log("[ ] E. Technical Quality: Zero console errors, clean local execution");
console.log("Note: structural signals do not score teaching quality; review categories C and D manually.");

console.log("\n==================================================");
if (results.criticalErrors.length > 0) {
  console.log("Status: FAILED (Critical architectural requirements missing)");
  console.log("==================================================\n");
  process.exit(1);
} else if (results.warnings.length > 0) {
  console.log("Status: PASSED WITH ADVISORIES (Proceed to manual rubric review)");
  console.log("==================================================\n");
  process.exit(0);
} else {
  console.log("Status: PASSED (Clean structural evaluation)");
  console.log("==================================================\n");
  process.exit(0);
}

