import { useState } from "react";
import {
  Button,
  ChartLine,
  CodeBlock,
  Diagram,
  Explanation,
  Formula,
  LessonOutcome,
  PredictionCheck,
  Quiz,
  Reset,
  StateInspector,
  useSimulationController,
} from "@mosaic/ui";
import { SimulationEngine } from "@mosaic/simulation";
import type { SimulationState, ValidatedSimulationSpec } from "@mosaic/simulation";

function buildGradientSpec(rate: number): ValidatedSimulationSpec {
  return {
    initialState: { x: 4, previousX: 4, stepCount: 0, status: "descending" },
    parameters: [{ name: "learningRate", type: "number", value: rate }],
  };
}

const code = `x = x - learning_rate * gradient_at(x)\n# For this bowl: gradient_at(x) = 2 * x`;

interface StepFeedback {
  previousX: number;
  nextX: number;
  previousLoss: number;
  nextLoss: number;
  prediction: "lower" | "higher";
  predictedCorrectly: boolean;
}

function createGradientEngine(rate: number) {
  return new SimulationEngine(buildGradientSpec(rate), {
    onStep: ({ state, parameters }): SimulationState => {
      if (String(state.status) !== "descending") return state;
      const x = Number(state.x);
      const nextX = x - Number(parameters.learningRate) * 2 * x;
      const previousLoss = x * x;
      const nextLoss = nextX * nextX;
      const stepCount = Number(state.stepCount) + 1;
      const overshot = nextLoss > previousLoss;
      const arrived = Math.abs(nextX) < 0.06;
      return { ...state, previousX: x, x: nextX, stepCount, status: overshot ? "overshot" : arrived ? "arrived" : "descending" };
    },
  });
}

const landscapeData = Array.from({ length: 51 }, (_, index) => {
  const position = -5 + index / 5;
  return { position: position.toFixed(2), loss: position * position };
});

export function GradientDescentLesson() {
  const [engine] = useState(() => createGradientEngine(0.18));
  const simulation = useSimulationController({ engine, initialSpeed: 1 });
  const [history, setHistory] = useState<Array<{ step: number; loss: number }>>([{ step: 0, loss: 16 }]);
  const [prediction, setPrediction] = useState<"lower" | "higher">();
  const [lastOutcome, setLastOutcome] = useState<StepFeedback>();
  const [quizAnswer, setQuizAnswer] = useState<string>();
  const x = Number(simulation.state.x);
  const previousX = Number(simulation.state.previousX);
  const stepCount = Number(simulation.state.stepCount);
  const loss = x * x;
  const status = String(simulation.state.status);
  const complete = status !== "descending";
  const graphX = Math.max(-5, Math.min(5, x));
  const graphPosition = graphX.toFixed(2);
  const graphData = [...landscapeData.filter((point) => point.position !== graphPosition), { position: graphPosition, loss: graphX * graphX }]
    .sort((left, right) => Number(left.position) - Number(right.position));
  const learningRate = Number(simulation.parameters.learningRate);
  const predictedX = x - learningRate * 2 * x;
  const predictedLoss = predictedX * predictedX;
  const predictionIsCorrect = prediction === "lower" ? predictedLoss < loss : prediction === "higher" ? predictedLoss > loss : false;

  const step = () => {
    const result = simulation.step();
    const nextX = Number(result.state.x);
    const nextLoss = nextX * nextX;
    setHistory((items) => [...items, { step: stepCount + 1, loss: nextLoss }]);
    setLastOutcome({ previousX: x, nextX, previousLoss: loss, nextLoss, prediction: prediction!, predictedCorrectly: predictionIsCorrect });
    setPrediction(undefined);
  };
  const reset = (nextRate = learningRate) => {
    simulation.reset();
    simulation.setParameter("learningRate", nextRate);
    setHistory([{ step: 0, loss: 16 }]);
    setPrediction(undefined);
    setLastOutcome(undefined);
  };
  const chooseRate = (nextRate: number) => {
    simulation.setParameter("learningRate", nextRate);
    setPrediction(undefined);
  };

  return (
    <main className="lesson-container gd-lesson">
      <header className="lesson-header">
        <p className="lesson-meta">A 5 minute lesson <span aria-hidden="true">·</span> No experience needed</p>
        <div className="title-block">
          <p className="eyebrow">MACHINE LEARNING, MADE VISIBLE</p>
          <h1>Find the <em>lowest point</em>.</h1>
          <p className="intro">Imagine standing in a foggy valley. You can feel which way the ground slopes, so you take a small step downhill.</p>
        </div>
        <div className="lesson-progress-wrap"><span className="progress-label">{complete ? "You made it" : stepCount ? "Your journey" : "A small idea, step by step"}</span><div className="lesson-progress"><span style={{ width: complete ? "100%" : `${Math.min(90, 12 + stepCount * 12)}%` }} /></div></div>
      </header>

      <Explanation className="opening-explanation" title="The idea">
        <p><strong>Gradient descent</strong> is a way to find a low point by checking the slope and repeatedly stepping downhill.</p>
        <p>Here, the bowl is described by <em>loss = x²</em>. Lower on the graph means a smaller loss, and the bottom is at x = 0.</p>
      </Explanation>

      <section className="gd-stage" aria-label="Gradient descent simulation">
        <div className="gd-stage-head"><div><p className="section-kicker">THE LOSS LANDSCAPE</p><h2>{status === "arrived" ? "We reached the bottom" : status === "overshot" ? "That step was too large" : "Follow the slope downhill"}</h2><p>Each step changes our position. Watch the dot move toward lower loss.</p></div><span className="gd-loss-pill">Loss <strong>{Number.isFinite(loss) ? loss.toFixed(2) : "—"}</strong></span></div>
        <Diagram title="Position and loss" className="gd-diagram">
          <p className="gd-chart-caption" id="landscape-caption">The curve shows loss at each position. The dot marks where we are now.</p>
          <ChartLine className="gd-landscape-chart" aria-label={`Loss landscape. Current position ${x.toFixed(2)} with loss ${loss.toFixed(2)}. Lowest loss is at position zero.`} data={graphData} dataKey="loss" xDataKey="position" xLabel="position (x)" showGrid showTooltip={false} height={300} referencePoint={{ x: graphPosition, y: loss, label: `Current position ${x.toFixed(2)}; loss ${loss.toFixed(2)}` }} stroke="#f3eee0" />
          <div className="gd-graph-legend"><span><i />Current position: x = {x.toFixed(2)} · loss = {loss.toFixed(2)}</span><span>Lowest loss: x = 0</span></div>
        </Diagram>

        {!complete && <>
          {lastOutcome && <div className={`gd-step-result ${lastOutcome.nextLoss < lastOutcome.previousLoss ? "is-improved" : "is-worse"}`} role="status" aria-live="polite">
            <strong>Step {stepCount}: {lastOutcome.nextLoss < lastOutcome.previousLoss ? "the loss went down" : "the loss went up"}.</strong>
            <p>Your prediction was {lastOutcome.predictedCorrectly ? "correct" : "not correct this time"}. We moved from x = {lastOutcome.previousX.toFixed(2)} to x = {lastOutcome.nextX.toFixed(2)}. Loss changed from {lastOutcome.previousLoss.toFixed(2)} to {lastOutcome.nextLoss.toFixed(2)}{lastOutcome.nextLoss < lastOutcome.previousLoss ? `, a decrease of ${(lastOutcome.previousLoss - lastOutcome.nextLoss).toFixed(2)}` : `, an increase of ${(lastOutcome.nextLoss - lastOutcome.previousLoss).toFixed(2)}`}.</p>
            <p>{lastOutcome.nextLoss < lastOutcome.previousLoss ? "We know this step helped because the loss is lower." : "The downhill direction was right, but the step was too large and jumped past the bottom. A smaller step should keep us closer."}</p>
          </div>}
          <PredictionCheck
            className="gd-prediction-check"
            title={stepCount ? "Before the next step" : "Before the first step"}
            prompt={<>At x = <strong>{x.toFixed(2)}</strong> with step size <strong>{learningRate.toFixed(2)}</strong>, what do you predict for the loss?</>}
            choices={[{ id: "lower", label: "It will go down" }, { id: "higher", label: "It will go up" }]}
            value={prediction}
            onChange={(value) => setPrediction(value as "lower" | "higher")}
            feedback={prediction ? {
              correct: predictionIsCorrect,
              title: predictionIsCorrect ? "Your prediction is right." : "That prediction doesn’t match this step.",
              message: predictionIsCorrect
                ? prediction === "lower" ? "This step size should move us to a lower part of the curve." : "This step is large enough to pass the bottom, so the loss should increase."
                : `With this step size, the landing position is x = ${predictedX.toFixed(2)} and the loss would ${predictedLoss < loss ? "decrease" : "increase"}. Reveal the step to compare your prediction.`,
            } : undefined}
            hint={<>Compare the step size with the distance to x = 0. A step can point downhill and still go too far.</>}
            continueLabel="Take the step and check"
            onContinue={step}
          />
          {stepCount > 0 && <div className="gd-rate-control"><p className="gd-rate-title">Try a different step size</p><div className="gd-presets">{[[0.05, "Small · 0.05"], [0.18, "Steady · 0.18"], [0.65, "Large · 0.65"], [1.05, "Very large · 1.05"]].map(([value, label]) => <button key={value} type="button" aria-pressed={learningRate === Number(value)} aria-label={`Use step size ${value}`} onClick={() => chooseRate(Number(value))}>{label}</button>)}</div><p>A step that is too large may cross the bottom and increase the loss.</p></div>}
        </>}

        {complete && status === "overshot" && <LessonOutcome tone="caution" className="gd-outcome" title="The loss increased because this step was too large." actions={<><Button label="Restart with a smaller step (0.18)" variant="primary" onClick={() => reset(0.18)} /><Button label="Restart with a tiny step (0.05)" onClick={() => reset(0.05)} /></>}>
          <p>We moved from x = {previousX.toFixed(2)} to x = {x.toFixed(2)}. The bottom is at x = 0, so this step crossed over it. Loss rose from {lastOutcome?.previousLoss.toFixed(2)} to {loss.toFixed(2)}. The direction pointed downhill, but the step size carried us too far.</p>
        </LessonOutcome>}
        {complete && status === "arrived" && <LessonOutcome tone="success" className="gd-outcome" title="We reached the bottom of this curve." actions={<Button label="Restart from the top of the hill" variant="primary" onClick={() => reset()} />}><p>After {stepCount} steps, x is close to zero and the loss is {loss.toFixed(3)}. Each earlier step lowered the loss.</p></LessonOutcome>}

        <div className="gd-loss-chart"><div><h3>Loss over steps</h3><p>Each dot shows how high the loss was. Lower is better.</p></div><ChartLine className="gd-history-chart" aria-label={`Loss over steps, currently ${loss.toFixed(2)} after ${stepCount} steps.`} data={history} dataKey="loss" xDataKey="step" xLabel="step" yLabel="loss" showGrid stroke="#ffc75e" /></div>
      </section>

      {complete && <section className="gd-wrap-up"><div><p className="section-kicker">THE UPDATE RULE</p><h2>Check the slope. Step the other way.</h2><p>“Gradient” is the slope at our current position. The step size controls how far we move each time.</p><Formula label="Gradient descent update rule" expression={<span>new position = old position − step size × slope</span>} /><CodeBlock code={code} language="python" /><p>For this bowl, the slope is <strong>2 × x</strong>. Other problems have different loss curves and slopes.</p><details className="gd-technical"><summary>Simulation state</summary><StateInspector state={simulation.state} /></details><Quiz question="Why can a very large step size cause trouble?" options={[{ id: "overshoot", label: "It can jump past the low point, so the loss may get larger." }, { id: "always", label: "A large step always finds the answer faster." }, { id: "slope", label: "It makes the slope disappear." }]} value={quizAnswer} onChange={setQuizAnswer} />{quizAnswer && <p className="gd-quiz-feedback">{quizAnswer === "overshoot" ? "Exactly. A step that is too large can overshoot the low point." : "Not quite. Think about what happens if each step crosses over the bottom."}</p>}</div></section>}
      {!complete && stepCount > 0 && <div className="gd-reset-row"><Reset label="Restart from x = 4" onClick={() => reset()} /></div>}
      <footer className="lesson-footer">GRADIENT DESCENT <span>·</span> FINDING A LOW POINT</footer>
    </main>
  );
}
