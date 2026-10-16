import type { ReactNode } from "react";
import { Button } from "@astryxdesign/core/Button";

export interface ContentProps { children?: ReactNode; title?: ReactNode; className?: string; }
export function Explanation({ children, title = "Explanation", className }: ContentProps) { return <section className={`mosaic-explanation ${className ?? ""}`}><h2>{title}</h2><div>{children}</div></section>; }
export function Hint({ children, title = "Hint", className }: ContentProps) { return <aside className={`mosaic-hint ${className ?? ""}`}><strong>{title}</strong><div>{children}</div></aside>; }
export function Question({ children, title = "Question", className }: ContentProps) { return <section className={`mosaic-question ${className ?? ""}`}><h2>{title}</h2><div>{children}</div></section>; }

export interface PredictionChoice { id: string; label: string; }
export interface PredictionFeedback { correct: boolean; title: string; message: ReactNode; }
export interface PredictionCheckProps {
  title?: ReactNode;
  prompt: ReactNode;
  choices: readonly PredictionChoice[];
  value?: string;
  onChange: (id: string) => void;
  feedback?: PredictionFeedback;
  hint?: ReactNode;
  continueLabel?: string;
  onContinue: () => void;
  className?: string;
}

/** A paced prediction interaction with explicit, constructive feedback before revealing the next simulation state. */
export function PredictionCheck({ title = "Before we continue", prompt, choices, value, onChange, feedback, hint, continueLabel = "Show what happens", onContinue, className }: PredictionCheckProps) {
  return (
    <section className={`mosaic-prediction-check ${className ?? ""}`}>
      <Question title={title}>
        <p>{prompt}</p>
        <div className="mosaic-prediction-choices" role="group" aria-label="Choose your prediction">
          {choices.map((choice) => <Button key={choice.id} label={choice.label} aria-pressed={value === choice.id} onClick={() => onChange(choice.id)} />)}
        </div>
        {hint && <Hint title="Need a hint?">{hint}</Hint>}
      </Question>
      {value && feedback && <div className={`mosaic-prediction-feedback ${feedback.correct ? "is-correct" : "is-incorrect"}`} role="status" aria-live="polite"><strong>{feedback.title}</strong><p>{feedback.message}</p></div>}
      <Button label={continueLabel} variant="primary" onClick={onContinue} isDisabled={!value} />
    </section>
  );
}

export interface LessonOutcomeProps {
  tone: "success" | "caution";
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** A semantic result panel that explains what happened and leaves a clear next action. */
export function LessonOutcome({ tone, title, children, actions, className }: LessonOutcomeProps) {
  return <section className={`mosaic-lesson-outcome is-${tone} ${className ?? ""}`} role="status" aria-live="polite"><h2>{title}</h2><div>{children}</div>{actions && <div className="mosaic-lesson-outcome-actions">{actions}</div>}</section>;
}

export interface FormulaProps { children?: ReactNode; expression?: ReactNode; label?: string; className?: string; }
export function Formula({ children, expression, label = "Formula", className }: FormulaProps) { return <div className={`mosaic-formula ${className ?? ""}`} aria-label={label}>{expression ?? children}</div>; }

export interface CodeBlockProps { code: string; language?: string; className?: string; }
export function CodeBlock({ code, language, className }: CodeBlockProps) { return <pre className={`mosaic-code-block ${className ?? ""}`} data-language={language}><code>{code}</code></pre>; }

export interface QuizOption { id: string; label: ReactNode; }
export interface QuizProps { question: ReactNode; options: readonly QuizOption[]; value?: string; onChange?: (id: string) => void; disabled?: boolean; className?: string; }
export function Quiz({ question, options, value, onChange, disabled = false, className }: QuizProps) {
  return <fieldset className={`mosaic-quiz ${className ?? ""}`} disabled={disabled}><legend>{question}</legend>{options.map((option) => <label key={option.id}><input type="radio" name="mosaic-quiz" value={option.id} checked={value === option.id} onChange={() => onChange?.(option.id)} />{option.label}</label>)}</fieldset>;
}
