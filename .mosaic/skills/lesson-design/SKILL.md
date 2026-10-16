# Lesson Design Skill

This skill guides AI agents in planning, structuring, and scoping interactive educational lessons in Mosaic before implementing code.

---

## 1. Defining the Learning Objective

When the request includes course notes or other education sources, use the [lesson-generation skill](../lesson-generation/SKILL.md) first. Record source sections for objectives, explanations, and assessment in a validated lesson plan before implementing the lesson. Do not treat an existing lesson as the default template for another topic.

Before writing code or defining specs, articulate the **single core mental model** the learner should build.

### Bad vs Good Objectives
* **Bad**: *"Show projectile motion with buttons and sliders."* (Focuses on mechanics, not understanding.)
* **Good**: *"Help the learner discover why a 45° launch angle maximizes horizontal range in vacuum projectile motion, and observe how air resistance shifts the optimal angle lower."* (Focuses on discovery, intuition, and cause-and-effect.)

### Core Questions to Answer
1. What non-intuitive truth or dynamic relationship is hard to understand with static text alone?
2. What misconception should the simulation actively dispel?
3. What is the minimum state needed to demonstrate this phenomenon?

---

## 2. The Mosaic Pedagogical Arc

Every Mosaic lesson should guide the learner through a progression suited to its subject. Use this as a set of possible moves, not a mandatory five-stage template:

```text
1. Concrete Opening     (<Explanation>, an appropriate example)
   └── Establish a relatable problem and explain any needed prerequisite.
       ↓
2. Intuition            (short explanation and a useful visual)
   └── Build an initial mental model before introducing formal terms.
       ↓
3. Guided Experience    (one primary visual and one next action)
   └── Reveal meaningful changes at the learner's pace and explain their cause.
       ↓
4. Prediction & Feedback (<Question>, <Hint>)
   └── Prompt before an important outcome and give constructive feedback.
       ↓
5. Conclusion            (<Explanation>, <Formula> or <CodeBlock> if timely, <Quiz>)
   └── Name the idea, connect details, and check understanding.
```

> **Note**: Not every lesson requires all components. Choose components that directly support the learning goal without cluttering the screen.

Assume zero prior knowledge unless specified. Introduce one idea at a time and make each stage answer: What am I looking at? What just happened? Why did it happen? Was my prediction correct? What should I do next? Keep debugging and implementation detail optional. For an incorrect prediction or a failed parameter experiment, show the observed result, explain its cause, and offer a concrete retry or recovery action. These principles apply across subjects, but do not force one subject's story, sequence, or visualization onto another.

---

## 3. Simulation vs. Static Explanation Boundary

Do not build a dynamic simulation for concepts that are purely descriptive. Use simulations when:

| Scenario | Use Simulation? | Recommended Approach |
| --- | :---: | --- |
| Dynamic state evolution over time | **Yes** | `SimulationEngine` + `<ChartLine>` or `<Particle>` |
| Algorithmic step-by-step state changes | **Yes** | `SimulationEngine` + `<Timeline>` / `<Flow>` / `<Graph>` |
| Parameter sensitivity & tuning | **Yes** | `SimulationEngine` + `<ParameterControl>` + live visual feedback |
| Static structural definitions | **No** | `<Explanation>` + `<Diagram>` + `<Equation>` |
| Fixed taxonomy or reference table | **No** | `<Explanation>` + `<Card>` + `<CodeBlock>` |

---

## 4. Planning State, Parameters, and Static Data

To ensure clean architecture and avoid bad design habits, strictly distinguish among:

1. **Simulation State (`SimulationState`)**:
   * Minimal dynamic variables that evolve step-by-step during simulation execution (e.g., coordinates `x`/`y`, pointer indices `low`/`high`, velocity `vx`/`vy`, step counter `t`).
   * Managed exclusively by `SimulationEngine`.
2. **Learner-Adjustable Parameters (`ValidatedParameter`)**:
   * Variables exposed to the learner for hypothesis testing via `<ParameterControl>` or `<Slider>` (e.g., `targetValue`, `learningRate`, `gravity`, `launchAngle`).
   * Registered in `spec.parameters` and updated via `simulation.setParameter(name, value)`.
3. **Static Lesson Data**:
   * Fixed constants or sample datasets that do not change dynamically during stepping (e.g., a static array of elements `[3, 8, 15, 24, 42, 57, 68, 91]`, constant physical properties, or fixed node coordinate tables).
   * Kept in standard JavaScript constants outside the simulation loop or in spec configuration.

---

## 5. Walkthrough: From User Prompt to Lesson Plan

Use the following topic-specific example only to illustrate planning decisions. It is not a template for other subjects; choose a different narrative and visual representation when the topic calls for it.

### User Request
> *"Create an interactive lesson explaining how binary search narrows a sorted array."*

### Agent Planning Process

1. **Learning Objective**: Understand that binary search halves the search space at each comparison, achieving logarithmic time complexity $O(\log n)$.
2. **State Identification (Dynamic Simulation State)**:
   * `low`: index of lower search bound (number).
   * `high`: index of upper search bound (number).
   * `mid`: calculated midpoint index (number).
   * `status`: `"searching"` | `"found"` | `"not_found"`.
   * `comparisons`: count of comparisons executed (number).
3. **Learner-Adjustable Parameters**:
   * `target`: number to search for (e.g. `42`), adjustable via `<ParameterControl>`.
4. **Static Lesson Data**:
   * `values`: fixed sorted array `[3, 8, 15, 24, 42, 57, 68, 91]`.
5. **Visual Mapping**:
   * Array visualization with highlighted pointers $\rightarrow$ `<Flow>` or composed nodes in `<Diagram>`.
   * Timeline of comparisons $\rightarrow$ `<Timeline>`.
   * Event emissions on midpoint check $\rightarrow$ `<EventLog>`.
6. **Educational Scaffolding**:
   * Intro narrative $\rightarrow$ `<Explanation title="Divide and Conquer">`.
   * Recurrence formula $\rightarrow$ `<Formula expression="T(n) = T(n/2) + O(1)" />`.
   * Active question $\rightarrow$ `<Question title="Predict Steps">How many comparisons will be needed at most for 8 items?</Question>`.
   * Scaffolding $\rightarrow$ `<Hint>Think about how many times you can halve 8 before reaching 1.</Hint>`.
   * Checkpoint $\rightarrow$ `<Quiz question="What is the maximum number of comparisons for 1,024 items?" options={[{ id: "a", label: "10" }, { id: "b", label: "512" }, { id: "c", label: "1024" }]} />`.

---

## 6. Avoiding Unnecessary Complexity

* **Keep State Minimal**: Only store variables required for transition logic and visualization.
* **Keep Transitions Pure**: Do not introduce non-deterministic timers, external network calls, or random seed instability in simulation specs.
* **One Core Idea Per Lesson**: If a topic has multiple sub-concepts, focus on the primary mechanism first or separate them using `<Tabs>`.
