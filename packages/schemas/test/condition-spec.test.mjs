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
const validateCondition = ajv.getSchema(
  "https://mosaic.dev/schemas/simulation-spec-v0.1.schema.json#/$defs/Condition",
);

async function exampleNames(kind) {
  return readdir(path.join(directory, "..", "examples", "conditions", kind));
}

async function loadExample(kind, name) {
  const examplePath = path.join(directory, "..", "examples", "conditions", kind, name);
  return JSON.parse(await readFile(examplePath, "utf8"));
}

test("valid Condition examples conform to #/$defs/Condition", async () => {
  for (const name of await exampleNames("valid")) {
    const data = await loadExample("valid", name);
    for (const condition of data.conditions) {
      const isValid = validateCondition(condition);
      assert.equal(
        isValid,
        true,
        `Expected valid in ${name}: ${JSON.stringify(condition)} - Errors: ${JSON.stringify(validateCondition.errors)}`,
      );
    }
  }
});

test("invalid Condition examples are rejected by #/$defs/Condition", async () => {
  for (const name of await exampleNames("invalid")) {
    const data = await loadExample("invalid", name);
    const condition = data.condition ?? data;
    const isValid = validateCondition(condition);
    assert.equal(isValid, false, `Expected invalid in ${name}: ${JSON.stringify(condition)}`);
  }
});
