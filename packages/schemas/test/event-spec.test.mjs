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
const validateEventRule = ajv.getSchema(
  "https://mosaic.dev/schemas/simulation-spec-v0.1.schema.json#/$defs/EventRule",
);

async function exampleNames(kind) {
  return readdir(path.join(directory, "..", "examples", "events", kind));
}

async function loadExample(kind, name) {
  const examplePath = path.join(directory, "..", "examples", "events", kind, name);
  return JSON.parse(await readFile(examplePath, "utf8"));
}

test("valid EventRule examples conform to #/$defs/EventRule", async () => {
  for (const name of await exampleNames("valid")) {
    const data = await loadExample("valid", name);
    for (const event of data.events) {
      const isValid = validateEventRule(event);
      assert.equal(
        isValid,
        true,
        `Expected valid in ${name}: ${JSON.stringify(event)} - Errors: ${JSON.stringify(validateEventRule.errors)}`,
      );
    }
  }
});

test("invalid EventRule examples are rejected by #/$defs/EventRule", async () => {
  for (const name of await exampleNames("invalid")) {
    const data = await loadExample("invalid", name);
    const event = data.event ?? data;
    const isValid = validateEventRule(event);
    assert.equal(isValid, false, `Expected invalid in ${name}: ${JSON.stringify(event)}`);
  }
});
