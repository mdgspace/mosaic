import type { ReactNode } from "react";

export interface ContentProps { children?: ReactNode; title?: ReactNode; className?: string; }
export function Explanation({ children, title = "Explanation", className }: ContentProps) { return <section className={`mosaic-explanation ${className ?? ""}`}><h2>{title}</h2><div>{children}</div></section>; }
export function Hint({ children, title = "Hint", className }: ContentProps) { return <aside className={`mosaic-hint ${className ?? ""}`}><strong>{title}</strong><div>{children}</div></aside>; }
export function Question({ children, title = "Question", className }: ContentProps) { return <section className={`mosaic-question ${className ?? ""}`}><h2>{title}</h2><div>{children}</div></section>; }

export interface FormulaProps { children?: ReactNode; expression?: ReactNode; label?: string; className?: string; }
export function Formula({ children, expression, label = "Formula", className }: FormulaProps) { return <div className={`mosaic-formula ${className ?? ""}`} aria-label={label}>{expression ?? children}</div>; }

export interface CodeBlockProps { code: string; language?: string; className?: string; }
export function CodeBlock({ code, language, className }: CodeBlockProps) { return <pre className={`mosaic-code-block ${className ?? ""}`} data-language={language}><code>{code}</code></pre>; }

export interface QuizOption { id: string; label: ReactNode; }
export interface QuizProps { question: ReactNode; options: readonly QuizOption[]; value?: string; onChange?: (id: string) => void; disabled?: boolean; className?: string; }
export function Quiz({ question, options, value, onChange, disabled = false, className }: QuizProps) {
  return <fieldset className={`mosaic-quiz ${className ?? ""}`} disabled={disabled}><legend>{question}</legend>{options.map((option) => <label key={option.id}><input type="radio" name="mosaic-quiz" value={option.id} checked={value === option.id} onChange={() => onChange?.(option.id)} />{option.label}</label>)}</fieldset>;
}
