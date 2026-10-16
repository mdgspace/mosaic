# Educational Toolkit Skill

This skill guides AI agents in composing educational narrative, mathematical formulas, code blocks, inquiry questions, hints, and quizzes in Mosaic lessons using `@mosaic/ui`.

---

## 1. Educational Components Overview

Mosaic provides semantic components designed to surround the interactive simulation with structured pedagogical scaffolding:

| Component | Purpose | Typical Placement |
| --- | --- | --- |
| `<Explanation>` | Conceptual exposition, definitions, and mental models | Top of lesson or adjacent to simulation |
| `<Formula>` | Mathematical laws, governing equations, or recurrences | Next to relevant parameter controls |
| `<CodeBlock>` | Concrete code implementations or pseudocode | Alongside algorithmic simulations |
| `<Question>` | Active prediction questions before interacting | Right above the simulation stage |
| `<Hint>` | Scaffolding clues or progressive assistance | Inside or below the interaction area |
| `<Quiz>` | Assessment checking understanding and dispelling misconceptions | At the conclusion of the lesson |

---

## 2. Component API Reference

### 2.1. `<Explanation>`

Provides a styled section with a header and structured body content.

```tsx
import { Explanation } from "@mosaic/ui";

<Explanation title="Why Does Momentum Accelerate Convergence?">
  <p>
    Standard gradient descent can oscillate wildly in narrow valleys. By adding a
    fraction of the previous step's update vector (momentum), oscillations are damped
    along perpendicular directions while velocity accumulates along the gradient path.
  </p>
</Explanation>
```

#### Props:
* `title?: ReactNode` (Default: `"Explanation"`)
* `children?: ReactNode`
* `className?: string`

---

### 2.2. `<Formula>`

Renders a mathematical equation with an accessible label and clear visual hierarchy.

```tsx
import { Formula } from "@mosaic/ui";

<Formula
  label="Gradient Descent with Momentum Update Rule"
  expression="v_{t} = \gamma v_{t-1} + \eta \nabla L(\theta_{t})"
/>
```

#### Props:
* `expression?: ReactNode`
* `children?: ReactNode` (fallback if `expression` not supplied)
* `label?: string` (Default: `"Formula"`)
* `className?: string`

---

### 2.3. `<CodeBlock>`

Displays syntax-highlighted or structured pseudocode for algorithmic concepts.

```tsx
import { CodeBlock } from "@mosaic/ui";

const binarySearchCode = `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`;

<CodeBlock code={binarySearchCode} language="typescript" />
```

#### Props:
* `code: string`
* `language?: string`
* `className?: string`

---

### 2.4. `<Question>`

Encourages active learning by prompting the learner to make a prediction before manipulating parameters.

```tsx
import { Question } from "@mosaic/ui";

<Question title="Prediction Challenge">
  <p>
    If you double the initial launch velocity \(v_0\) while keeping the launch angle at 45°,
    how much will the maximum horizontal range increase?
  </p>
</Question>
```

#### Props:
* `title?: ReactNode` (Default: `"Question"`)
* `children?: ReactNode`
* `className?: string`

---

### 2.5. `<Hint>`

Provides contextual scaffolding without giving away answers immediately.

```tsx
import { Hint } from "@mosaic/ui";

<Hint title="Think About Kinetic Energy">
  Recall that projectile range \(R = \frac{v_0^2 \sin(2\theta)}{g}\). Notice the exponent on \(v_0\).
</Hint>
```

#### Props:
* `title?: ReactNode` (Default: `"Hint"`)
* `children?: ReactNode`
* `className?: string`

---

### 2.6. `<Quiz>`

Assesses learner understanding at the end of a lesson.

```tsx
import { useState } from "react";
import { Quiz } from "@mosaic/ui";
import type { QuizOption } from "@mosaic/ui";

function LessonAssessment() {
  const [selectedOption, setSelectedOption] = useState<string | undefined>();

  const options: QuizOption[] = [
    { id: "2x", label: "The range doubles (2x)" },
    { id: "4x", label: "The range quadruples (4x)" },
    { id: "unchanged", label: "The range remains the same" },
  ];

  return (
    <div>
      <Quiz
        question="What happens to the range when initial velocity is doubled?"
        options={options}
        value={selectedOption}
        onChange={setSelectedOption}
      />
      {selectedOption === "4x" && (
        <p className="success-feedback">Correct! Range is proportional to the square of velocity (\(v_0^2\)).</p>
      )}
      {selectedOption && selectedOption !== "4x" && (
        <p className="hint-feedback">Not quite. Look at the \(v_0^2\) term in the formula above.</p>
      )}
    </div>
  );
}
```

#### Props:
* `question: ReactNode`
* `options: readonly QuizOption[]` (`{ id: string, label: ReactNode }`)
* `value?: string`
* `onChange?: (id: string) => void`
* `disabled?: boolean`
* `className?: string`

---

## 3. Instructional Composition Patterns

### Pattern A: Algorithmic Walkthrough (e.g. Sorting, Graph Traversal)
```text
Relatable task / opening          -> Make the problem useful before naming the algorithm
<Explanation>                     -> Establish intuition and needed vocabulary
<Question> + one clear action     -> Predict before a consequential step
Primary visual                    -> Reveal a state change and explain its cause
<Formula> / <CodeBlock>           -> Add after the behavior makes them useful
<Quiz>                            -> Check transfer of the core idea
```

### Pattern B: Physical / Mathematical Discovery (e.g. Physics, ML Convergence)
```text
Concrete observation              -> Start with a visible or familiar phenomenon
<Explanation>                     -> Explain only what is needed to explore it
Primary visual + one action       -> Reveal a meaningful change at a readable pace
<Question> + feedback             -> Ask what will happen and explain the result
<Formula>                          -> Name the relationship after intuition develops
<Quiz>                             -> Assess reasoning about the demonstrated effect
```

---

## 4. Key Rules for Agents

1. **Do Not Overcrowd**: Choose 2-4 educational components that directly support the objective. Do not force every component into every lesson.
2. **Promote Prediction Before Outcomes**: Place a focused `<Question>` before the outcome it asks about, at the point when the learner has enough context to reason.
3. **Immediate Feedback**: When learners answer a `<Quiz>`, provide targeted feedback that explains *why* an answer is correct or incorrect.

## 5. Beginner-first sequencing

Assume zero prior knowledge unless the prompt says otherwise. Start with a concrete, relatable problem or question, then establish the intuition before introducing terms, formulas, code, or controls. Explain prerequisite ideas in plain language before relying on them. Reveal one new idea at a time, using short explanations near the visual they explain.

At each point, make it possible for the learner to tell what they are seeing, what changed, why it changed, and what to do next. Keep one primary visual and one clear next action in focus. Ask a prediction before meaningful outcomes; respond with immediate, constructive feedback and let the learner continue without penalty. Use labels, shapes, and text alongside color.

Introduce educational components as they become useful, not all at once. A formula or code sample can wait until the learner has seen the behavior it explains. Keep state inspectors, event logs, and implementation details in a collapsed “explore” area unless the current learning objective needs them. Finish with a clear takeaway and a knowledge check that tests the objective, explains wrong answers helpfully, and points back to the relevant explanation.

These are principles, not a fixed sequence of components. Choose a narrative and representation appropriate to the subject. Prioritize conceptual clarity over component count, and keep the explanation, visual labels, simulation behavior, and assessment consistent.

