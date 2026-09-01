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
const validateExpression = ajv.getSchema("https://mosaic.dev/schemas/simulation-spec-v0.1.schema.json#/$defs/Expression");

async function exampleNames(kind) {
  return readdir(path.join(directory, "..", "examples", "expressions", kind));
}

async function loadExample(kind, name) {
  const examplePath = path.join(directory, "..", "examples", "expressions", kind, name);
  return JSON.parse(await readFile(examplePath, "utf8"));
}

test("valid Expression examples conform to #/$defs/Expression", async () => {
  for (const name of await exampleNames("valid")) {
    const data = await loadExample("valid", name);
    for (const expression of data.expressions) {
      const isValid = validateExpression(expression);
      assert.equal(isValid, true, `Expected valid in ${name}: ${JSON.stringify(expression)} - Errors: ${JSON.stringify(validateExpression.errors)}`);
    }
  }
});

test("invalid Expression examples are rejected by #/$defs/Expression", async () => {
  for (const name of await exampleNames("invalid")) {
    const data = await loadExample("invalid", name);
    const expression = data.expression ?? data;
    const isValid = validateExpression(expression);
    assert.equal(isValid, false, `Expected invalid in ${name}: ${JSON.stringify(expression)}`);
  }
});

test("validates nested expression state.position + state.velocity * parameter.multiplier", () => {
  const expr = {
    type: "operation",
    operation: "add",
    operands: [
      {
        type: "state",
        path: ["position"]
      },
      {
        type: "operation",
        operation: "multiply",
        operands: [
          {
            type: "state",
            path: ["velocity"]
          },
          {
            "type": "parameter",
            "name": "multiplier"
          }
        ]
      }
    ]
  };

  assert.equal(validateExpression(expr), true);
});
