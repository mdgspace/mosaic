import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(directory, "..", "simulation-spec-v0.1.schema.json");
const schema = JSON.parse(await readFile(schemaPath, "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: true });
ajv.addSchema(schema);
const validateTransition = ajv.getSchema(
  "https://mosaic.dev/schemas/simulation-spec-v0.1.schema.json#/$defs/Transition",
);

async function exampleNames(kind) {
  return readdir(path.join(directory, "..", "examples", "transitions", kind));
}

async function loadExample(kind, name) {
  const examplePath = path.join(directory, "..", "examples", "transitions", kind, name);
  return JSON.parse(await readFile(examplePath, "utf8"));
}

test("valid Transition examples conform to #/$defs/Transition", async () => {
  for (const name of await exampleNames("valid")) {
    const data = await loadExample("valid", name);
    for (const transition of data.transitions) {
      const isValid = validateTransition(transition);
      assert.equal(
        isValid,
        true,
        `Expected valid in ${name}: ${JSON.stringify(transition)} - Errors: ${JSON.stringify(validateTransition.errors)}`,
      );
    }
  }
});

test("invalid Transition examples are rejected by #/$defs/Transition", async () => {
  for (const name of await exampleNames("invalid")) {
    const data = await loadExample("invalid", name);
    const transition = data.transition ?? data;
    const isValid = validateTransition(transition);
    assert.equal(isValid, false, `Expected invalid in ${name}: ${JSON.stringify(transition)}`);
  }
});
