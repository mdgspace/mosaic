import { StrictMode, useState } from "react";
import type { FormEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  CodeBlock,
  Diagram,
  EventLog,
  Explanation,
  Formula,
  Hint,
  MosaicProvider,
  Question,
  Quiz,
  Reset,
  StateInspector,
  useSimulationController,
} from "@mosaic/ui";
import { SimulationEngine } from "@mosaic/simulation";
import type { SimulationState, ValidatedSimulationSpec } from "@mosaic/simulation";
import { GradientDescentLesson } from "./GradientDescentLesson";
import "./styles.css";
import "@mosaic/ui/styles.css";

const SORTED_ARRAY: readonly number[] = [3, 8, 15, 23, 38, 49, 62, 77, 85, 94];

const binarySearchCode = `function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }

  return -1;
}`;

function buildSimulationSpec(initialTarget: number): ValidatedSimulationSpec {
  return {
    initialState: {
      stepCount: 0,
      low: 0,
      high: SORTED_ARRAY.length - 1,
      mid: Math.floor((SORTED_ARRAY.length - 1) / 2),
      status: "searching",
      remaining: SORTED_ARRAY.length,
      lastAction: "Every number is still a possible answer.",
      comparisonResult: "pending",
    },
    parameters: [{ name: "target", type: "number", value: initialTarget }],
    eventRules: [
      {
        name: "target_found",
        condition: {
          expression: {
            type: "operation",
            operation: "equal",
            operands: [
              { type: "state", path: ["status"] },
              { type: "literal", value: "found" },
            ],
          },
        },
        payload: { type: "state", path: ["mid"] },
      },
      {
        name: "target_not_found",
        condition: {
          expression: {
            type: "operation",
            operation: "equal",
            operands: [
              { type: "state", path: ["status"] },
              { type: "literal", value: "not_found" },
            ],
          },
        },
        payload: { type: "state", path: ["stepCount"] },
      },
    ],
  };
}

type Prediction = "smaller" | "same" | "larger";

function BinarySearchLesson() {
  const [engine] = useState(() => new SimulationEngine(buildSimulationSpec(77), {
    // The branch-and-bound search loop is intentionally kept as the engine's
    // escape hatch: it selects an array element and updates several related fields.
    onStep: ({ state, parameters }): SimulationState => {
      const target = Number(parameters.target);
      const low = Number(state.low);
      const high = Number(state.high);
      const stepCount = Number(state.stepCount) + 1;

      if (String(state.status) !== "searching") return state;
      if (low > high) {
        return {
          ...state,
          stepCount,
          status: "not_found",
          remaining: 0,
          comparisonResult: "not_found",
          lastAction: `The range is empty, so ${target} is not in this list.`,
        };
      }

      const mid = Math.floor((low + high) / 2);
      const middleValue = SORTED_ARRAY[mid];
      if (middleValue === target) {
        return {
          ...state,
          stepCount,
          mid,
          status: "found",
          remaining: 1,
          comparisonResult: "equal",
          lastAction: `${middleValue} is the target. We found it after ${stepCount} ${stepCount === 1 ? "comparison" : "comparisons"}.`,
        };
      }

      if (middleValue < target) {
        const nextLow = mid + 1;
        const remaining = Math.max(0, high - nextLow + 1);
        return {
          ...state,
          stepCount,
          low: nextLow,
          mid,
          status: remaining === 0 ? "not_found" : "searching",
          remaining,
          comparisonResult: "less",
          lastAction: `${middleValue} is smaller than ${target}. Because the list is sorted, every number to its left is smaller too. We can remove those numbers and keep the right side.`,
        };
      }

      const nextHigh = mid - 1;
      const remaining = Math.max(0, nextHigh - low + 1);
      return {
        ...state,
        stepCount,
        high: nextHigh,
        mid,
        status: remaining === 0 ? "not_found" : "searching",
        remaining,
        comparisonResult: "greater",
        lastAction: `${middleValue} is larger than ${target}. Because the list is sorted, every number to its right is larger too. We can remove those numbers and keep the left side.`,
      };
    },
  }));
  const simulation = useSimulationController({ engine, initialSpeed: 1 });
  const [started, setStarted] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | undefined>();
  const low = Number(simulation.state.low);
  const high = Number(simulation.state.high);
  const target = Number(simulation.parameters.target);
  const status = String(simulation.state.status);
  const nextMid = low <= high ? Math.floor((low + high) / 2) : -1;
  const nextValue = nextMid >= 0 ? SORTED_ARRAY[nextMid] : undefined;
  const finished = status !== "searching";
  const expectedPrediction: Prediction | null = nextValue === undefined
    ? null
    : nextValue < target ? "larger" : nextValue > target ? "smaller" : "same";
  const correctPrediction = prediction !== null && prediction === expectedPrediction;

  const selectTarget = (newTarget: number) => {
    simulation.reset();
    simulation.setParameter("target", newTarget);
    setPrediction(null);
    setStarted(true);
  };

  const advance = () => {
    setPrediction(null);
    simulation.step();
  };

  return (
    <main className="lesson-container">
      <header className="lesson-header">
        <p className="lesson-meta">A 4 minute lesson <span aria-hidden="true">·</span> No experience needed</p>
        <div className="title-block">
          <p className="eyebrow">ALGORITHMS, MADE VISIBLE</p>
          <h1 id="lesson">Find a number<br />by <em>halving</em>.</h1>
          <p className="intro">Imagine looking for a name in an alphabetized phone book. Do you scan every name, or use the order to skip ahead?</p>
        </div>
        <div className="lesson-progress-wrap" aria-label={finished ? "Lesson complete" : started ? `Comparison ${Number(simulation.state.stepCount) + 1}` : "Lesson not started"}>
          <span className="progress-label">{finished ? "You made it" : started ? "Your journey" : "A small idea, step by step"}</span>
          <div className="lesson-progress"><span style={{ width: finished ? "100%" : started ? `${Math.min(90, 18 + Number(simulation.state.stepCount) * 24)}%` : "8%" }} /></div>
        </div>
      </header>

      <Explanation className="opening-explanation" title="The idea">
        <p><strong>Binary search</strong> finds something in an ordered list by checking the middle, then setting aside the half that cannot contain the answer.</p>
        <p>“Sorted” means the numbers are arranged from smallest to largest. That order is what makes skipping safe.</p>
      </Explanation>

      <section className="search-stage" aria-label="Binary search simulation">
        <div className="stage-heading">
          <div>
            <p className="section-kicker">THE NUMBER LINE</p>
            <h2>{!started ? "Here is our sorted list" : finished ? (status === "found" ? "We found it" : "The list has no match") : "Let’s look in the middle"}</h2>
            <p>{!started ? "The numbers go from smallest to largest, left to right." : `We are looking for ${target}. Follow the highlighted numbers and the range label.`}</p>
          </div>
          <span className={`status-pill ${finished && status === "found" ? "status-found" : finished ? "status-absent" : ""}`}>
            {finished ? status === "found" ? "Found" : "Not in this list" : started ? `Comparison ${Number(simulation.state.stepCount) + 1}` : "Ready"}
          </span>
        </div>

        <Diagram title="Sorted list of numbers" className="array-diagram">
        <div className="array-board">
          <div className="array-track" role="list" aria-label="Sorted values">
            {SORTED_ARRAY.map((value, index) => {
              const eliminated = started && (index < low || index > high);
              const middleToCompare = started && !finished && index === nextMid && prediction === null;
              const lastCompared = started && index === Number(simulation.state.mid) && Number(simulation.state.stepCount) > 0;
              const found = status === "found" && index === Number(simulation.state.mid);
              return (
                <div key={index} role="listitem" aria-label={`Value ${value}, position ${index + 1}${found ? ", target found" : middleToCompare ? ", middle to compare" : lastCompared ? ", already checked" : ""}`} className={`array-cell ${eliminated ? "cell-eliminated" : ""} ${middleToCompare ? "cell-mid" : ""} ${lastCompared ? "cell-compared" : ""} ${found ? "cell-found" : ""}`}>
                  <div className="cell-label">{found ? "FOUND" : middleToCompare ? "MID" : lastCompared ? "DONE" : ""}</div>
                  <span className="cell-value">{value}</span>
                  <span className="cell-index">#{index + 1}</span>
                  {index === low && started && !finished && <span className="boundary boundary-low">LEFT</span>}
                  {index === high && started && !finished && <span className="boundary boundary-high">RIGHT</span>}
                </div>
              );
            })}
          </div>
          <div className="board-key" aria-label="Visual key">
            <span><i className="key-dot key-range" />Still possible</span>
            {started && <><span><i className="key-dot key-middle" />Middle to compare</span><span><i className="key-dot key-out" />Ruled out</span></>}
          </div>
          <div className="target-line"><span>WE’RE LOOKING FOR</span><strong>{target}</strong><span className="range-count">{started ? `${Number(simulation.state.remaining)} possible ${Number(simulation.state.remaining) === 1 ? "place" : "places"}` : "10 possible places"}</span></div>
        </div>
        </Diagram>

        {!started ? (
          <div className="guided-action intro-action">
            <p>We’ll find <strong>77</strong> together. First, make a guess about the middle.</p>
            <Button label="Let’s find a number" variant="primary" onClick={() => setStarted(true)} />
          </div>
        ) : !finished ? (
          <div className="guided-action">
            {prediction === null ? (
              <Question title="Before we compare" className="prediction-question">
                <p>The middle number is <strong>{nextValue}</strong>. Our target is <strong>{target}</strong>. Where might the target be?</p>
                <div className="prediction-options" role="group" aria-label="Predict where the target is">
                  <Button label="In the smaller numbers" onClick={() => setPrediction("smaller")} />
                  <Button label="At the middle" onClick={() => setPrediction("same")} />
                  <Button label="In the larger numbers" onClick={() => setPrediction("larger")} />
                </div>
                <Hint title="Need a hint?">Because the list is sorted, compare the middle number with the target. If the middle is too small, the answer must be somewhere larger.</Hint>
              </Question>
            ) : (
              <div className={`prediction-feedback ${correctPrediction ? "feedback-correct" : "feedback-gentle"}`} role="status" aria-live="polite">
                <div><strong>{correctPrediction ? "That’s right." : "Good try. Here’s the clue."}</strong>
                  <p>{nextValue === target
                    ? `The middle is ${target}, so we have found the target.`
                    : nextValue! < target
                      ? `${nextValue} is smaller than ${target}. Since the numbers increase from left to right, the target can only be farther to the right.`
                      : `${nextValue} is larger than ${target}. Since the numbers increase from left to right, the target can only be farther to the left.`}</p>
                </div>
                <Button label="Show me" variant="primary" onClick={advance} />
              </div>
            )}
            {Number(simulation.state.stepCount) > 0 && <p className="last-action"><span className="action-marker" aria-hidden="true">↳</span>{String(simulation.state.lastAction)}</p>}
          </div>
        ) : (
          <div className={`guided-action result-action ${status === "found" ? "feedback-correct" : "feedback-gentle"}`} aria-live="polite">
            <Explanation title={status === "found" ? "Why it worked" : "Why the search stopped"}>
              <p>{status === "found"
                ? `We found ${target} at position ${Number(simulation.state.mid) + 1} after ${Number(simulation.state.stepCount)} comparisons. Each comparison used the sorted order to rule out a whole section.`
                : `Each comparison ruled out every number on one side. The possible range became empty, so ${target} cannot be in this list.`}</p>
            </Explanation>
            <div className="practice-row">
              <span>Try it yourself with:</span>
              {[15, 50].map((value) => <Button key={value} label={value === 50 ? "50 (not in the list)" : String(value)} onClick={() => selectTarget(value)} />)}
              <Reset onClick={() => selectTarget(77)} label="Start over" />
            </div>
          </div>
        )}
      </section>

      {finished && (
        <section className="wrap-up" aria-label="Lesson wrap up">
          <div className="complexity-note">
            <p className="section-kicker">ZOOMING OUT</p>
            <h2>Each check cuts the possibilities about in half.</h2>
            <p>For 10 numbers, we need only a few checks. For 1,000 numbers, we need about 10. The number of candidates shrinks quickly; the number of checks grows slowly.</p>
            <Formula label="Candidates remaining after k checks" expression={<span>about <strong>n ÷ 2<sup>k</sup></strong> candidates remain</span>} />
            <p className="formula-caption">That slow growth in checks is called <strong>O(log n)</strong>. Here, <em>n</em> is the starting list size. The formula describes checks needed, not the candidates left after each check.</p>
          </div>
          <div className="quiz-card">
            <p className="section-kicker">A QUICK REFLECTION</p>
            <h2>Why can we skip numbers after checking the middle?</h2>
            <Quiz question="Choose the best explanation" options={[
              { id: "order", label: "The list is sorted, so the middle tells us which side cannot contain the target." },
              { id: "luck", label: "The middle number is usually the answer." },
              { id: "every_other", label: "We check every other number until the answer appears." },
            ]} value={quizAnswer} onChange={setQuizAnswer} />
            {quizAnswer && <div className={`quiz-feedback ${quizAnswer === "order" ? "is-correct" : "is-retry"}`} role="status">
              <strong>{quizAnswer === "order" ? "Exactly." : "Not quite. Think about what the order tells us."}</strong>
              <p>{quizAnswer === "order" ? "The sorted order lets one comparison rule out an entire side safely." : "If a middle number is smaller than the target, every number to its left is smaller too. Sorting gives each comparison meaning."}</p>
            </div>}
            <a className="revisit-link" href="#lesson">Revisit the search above</a>
          </div>
        </section>
      )}

      <details className="explore-drawer">
        <summary>Explore the implementation and simulation details</summary>
        <div className="explore-content">
          <section><h2>The algorithm</h2><p>This is the same repeated middle check you just tried.</p><CodeBlock code={binarySearchCode} language="typescript" /></section>
          <section><h2>Simulation state</h2><StateInspector state={simulation.state} /></section>
          <section><h2>Milestones</h2><EventLog events={simulation.events} emptyMessage="Find or rule out a target to see a milestone." /></section>
        </div>
      </details>
      <footer className="lesson-footer">BINARY SEARCH <span>·</span> FINDING THINGS IN ORDER</footer>
    </main>
  );
}

function MosaicApp() {
  const [activeLesson, setActiveLesson] = useState<"binary-search" | "gradient-descent">("binary-search");
  const [learningPrompt, setLearningPrompt] = useState("");
  const [promptMessage, setPromptMessage] = useState("");

  const chooseFromPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const request = learningPrompt.toLowerCase();
    if (/gradient|descent|slope|learning rate|optimization|loss/.test(request)) {
      setActiveLesson("gradient-descent");
      setPromptMessage("Gradient Descent is a match. Let’s learn it step by step.");
    } else if (/binary|search|sorted|find a number|middle/.test(request)) {
      setActiveLesson("binary-search");
      setPromptMessage("Binary Search is a match. Let’s learn it step by step.");
    } else {
      setPromptMessage("That topic isn’t in this demo yet. Ask your Mosaic coding agent to create a lesson for it.");
    }
  };

  return (
    <>
      <nav className="site-nav" aria-label="Mosaic lessons">
        <a className="site-brand" href="#top" aria-label="Mosaic learning home">mosaic<span>learn by seeing</span></a>
        <div className="lesson-nav-links" role="group" aria-label="Choose a lesson">
          <button type="button" className={activeLesson === "binary-search" ? "is-active" : ""} aria-pressed={activeLesson === "binary-search"} onClick={() => setActiveLesson("binary-search")}>Binary Search</button>
          <button type="button" className={activeLesson === "gradient-descent" ? "is-active" : ""} aria-pressed={activeLesson === "gradient-descent"} onClick={() => setActiveLesson("gradient-descent")}>Gradient Descent</button>
        </div>
      </nav>
      <form className="learning-prompt" onSubmit={chooseFromPrompt}>
        <label htmlFor="learning-request">What would you like to learn?</label>
        <div><input id="learning-request" value={learningPrompt} onChange={(event) => setLearningPrompt(event.target.value)} placeholder="Try “gradient descent” or “binary search”" />
          <button type="submit">Find a lesson</button>
        </div>
        <p aria-live="polite">{promptMessage || "Describe a topic and I’ll find the closest included lesson."}</p>
      </form>
      {activeLesson === "binary-search" ? <BinarySearchLesson /> : <GradientDescentLesson />}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><MosaicProvider mode="light"><MosaicApp /></MosaicProvider></StrictMode>,
);
