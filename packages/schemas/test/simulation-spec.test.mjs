import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(directory, "..", "simulation-spec-v0.1.schema.json");
const schema = JSON.parse(await readFile(schemaPath, "utf8"));
const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);

async function exampleNames(kind) {
  return readdir(path.join(directory, "..", "examples", kind));
}

async function loadExample(kind, name) {
  const examplePath = path.join(directory, "..", "examples", kind, name);
  return JSON.parse(await readFile(examplePath, "utf8"));
}

test("valid SimulationSpec examples conform to v0.1", async () => {
  for (const name of await exampleNames("valid")) {
    assert.equal(validate(await loadExample("valid", name)), true, name);
  }
});

test("invalid SimulationSpec examples are rejected by v0.1", async () => {
  for (const name of await exampleNames("invalid")) {
    assert.equal(validate(await loadExample("invalid", name)), false, name);
  }
});
