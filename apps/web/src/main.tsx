import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button, Card, ChartLine, Explanation, EventLog, Formula, Graph,
  MosaicProvider, ParameterControl, Particle, Pause, Play, Reset, SpeedControl,
  StateInspector, Step, useSimulationController,
} from "@mosaic/ui";
import { SimulationEngine } from "@mosaic/simulation";
import type { SimulationState } from "@mosaic/simulation";
import "./styles.css";
import "@mosaic/ui/styles.css";

function App() {
  const [engine] = useState(() => new SimulationEngine({
    initialState: { step: 0, value: 0 },
    parameters: [{ name: "rate", type: "number", value: 1 }],
    eventRules: [{ name: "tick", payload: { type: "state", path: ["step"] } }],
  }, {
    onStep: ({ state, parameters }): SimulationState => ({
      ...state,
      step: Number(state.step) + 1,
      value: Number(state.value) + Number(parameters.rate),
    }),
  }));
  const simulation = useSimulationController({ engine });
  const [history, setHistory] = useState(() => [{ step: 0, value: 0 }]);

  useEffect(() => {
    const point = { step: Number(simulation.state.step), value: Number(simulation.state.value) };
    setHistory((previous) => previous.at(-1)?.step === point.step ? previous : [...previous.slice(-19), point]);
  }, [simulation.state.step, simulation.state.value]);

  return (
    <main>
      <p className="eyebrow">Mosaic</p>
      <h1>Interactive learning, built to evolve.</h1>
      <p className="intro">
        A small simulation demonstrates the intended engine, toolkit, and
        educational-content boundary.
      </p>
      <Card>
        <div className="demo-header">
          <div>
            <h2>Step through a changing value</h2>
            <p>Adjust the rate, then observe the state update one step at a time.</p>
          </div>
          <strong>Step {String(simulation.state.step)}</strong>
        </div>
        <div className="demo-controls">
          <Play onClick={simulation.play} disabled={simulation.isPlaying} />
          <Pause onClick={simulation.pause} disabled={!simulation.isPlaying} />
          <Step onClick={simulation.step} disabled={simulation.isPlaying} />
          <Reset onClick={simulation.reset} />
        </div>
        <SpeedControl value={simulation.speed} onChange={simulation.setSpeed} />
        <ParameterControl
          name="rate"
          label="Rate"
          value={Number(simulation.parameters.rate)}
          min={0}
          max={5}
          step={0.5}
          onChange={(value) => simulation.setParameter("rate", value)}
        />
        <div className="demo-stage" aria-label="Animated simulation value">
          <Particle x={Number(simulation.state.value) * 24 + 12} y={48} label="Current value" />
        </div>
        <div className="demo-grid">
          <StateInspector state={simulation.state} />
          <EventLog events={simulation.events} />
        </div>
        <ChartLine data={history} dataKey="value" />
        <Graph
          width={360}
          height={120}
          nodes={[{ id: "state", label: "State", x: 90, y: 60 }, { id: "view", label: "UI", x: 270, y: 60 }]}
          edges={[{ source: "state", target: "view", label: "snapshot", animated: true }]}
        />
        <Explanation title="Why this structure matters">
          The engine owns behavior. Mosaic controls invoke the controller, and
          presentation components render its snapshots and events.
        </Explanation>
        <Formula expression="valueₙ₊₁ = valueₙ + rate" />
        <Button label="Toolkit components are ready" />
      </Card>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MosaicProvider>
      <App />
    </MosaicProvider>
  </StrictMode>,
);
