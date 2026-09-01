import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import * as toolkit from "../dist/index.js";

for (const name of [
  "Button",
  "Card",
  "Slider",
  "Toggle",
  "Dropdown",
  "Tabs",
  "Tooltip",
  "MosaicProvider",
  "useSimulationController",
  "Chart",
  "Graph",
  "Node",
  "Edge",
  "Timeline",
  "Diagram",
  "Particle",
  "Flow",
  "Heatmap",
  "Equation",
  "Play",
  "Pause",
  "Step",
  "Reset",
  "SpeedControl",
  "ParameterControl",
  "EventLog",
  "StateInspector",
  "Explanation",
  "Formula",
  "CodeBlock",
  "Quiz",
  "Hint",
  "Question",
]) {
  assert.equal(typeof toolkit[name], "function", `${name} is a component or hook`);
}

const markup = renderToStaticMarkup(
  toolkit.Diagram({
    title: "Gradient descent",
    children: toolkit.Explanation({ children: "Adjust the learning rate." }),
  }),
);
assert.match(markup, /Gradient descent/);
assert.match(markup, /Adjust the learning rate/);

const dataMarkup = renderToStaticMarkup(
  toolkit.StateInspector({ state: { step: 2 } }),
);
assert.match(dataMarkup, /step/);
assert.match(dataMarkup, /2/);

const step = toolkit.Step({ onClick: () => {} });
assert.equal(step.props.onClick instanceof Function, true);
for (const Control of [toolkit.Play, toolkit.Pause, toolkit.Reset]) {
  assert.equal(Control({ onClick: () => {} }).props.onClick instanceof Function, true);
}

const particleMarkup = renderToStaticMarkup(
  toolkit.Particle({ x: 12, y: 24, opacity: 0.5, duration: 0.2, easing: "easeOut" }),
);
assert.match(particleMarkup, /mosaic-particle/);
const animatedMarkup = renderToStaticMarkup(
  toolkit.Animated({ children: "appears", duration: 0.2 }),
);
assert.match(animatedMarkup, /appears/);
assert.equal("LineChart" in toolkit, false);

const visualizationMarkup = renderToStaticMarkup(
  toolkit.Graph({
    nodes: [{ id: "a", x: 10, y: 10 }, { id: "b", x: 50, y: 10 }],
    edges: [{ source: "a", target: "b" }],
  }),
);
assert.match(visualizationMarkup, /data-node-ids="a,b"/);
assert.match(visualizationMarkup, /data-edge-ids="a-b-0"/);
assert.match(visualizationMarkup, /data-testid="rf__node-a"/);

const eventMarkup = renderToStaticMarkup(
  toolkit.EventLog({ events: [{ name: "threshold", payload: { value: 3 } }] }),
);
assert.match(eventMarkup, /threshold/);
assert.match(eventMarkup, /value/);

const quizMarkup = renderToStaticMarkup(
  toolkit.Quiz({
    question: "Which value is larger?",
    options: [{ id: "a", label: "One" }, { id: "b", label: "Two" }],
  }),
);
assert.match(quizMarkup, /Which value is larger\?/);
assert.match(quizMarkup, /Two/);

console.log("@mosaic/ui public API smoke test passed");
