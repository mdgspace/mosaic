import type { ReactNode } from "react";
import { Button, Slider } from "@astryxdesign/core";
import type { EmittedEvent, SimulationState } from "@mosaic/simulation";

export interface SimulationActionProps { onClick: () => void; disabled?: boolean; label?: string; }
export function Play({ onClick, disabled = false, label = "Play" }: SimulationActionProps) { return <Button label={label} variant="primary" onClick={onClick} isDisabled={disabled} />; }
export function Pause({ onClick, disabled = false, label = "Pause" }: SimulationActionProps) { return <Button label={label} onClick={onClick} isDisabled={disabled} />; }
export function Step({ onClick, disabled = false, label = "Step" }: SimulationActionProps) { return <Button label={label} onClick={onClick} isDisabled={disabled} />; }
export function Reset({ onClick, disabled = false, label = "Reset" }: SimulationActionProps) { return <Button label={label} variant="ghost" onClick={onClick} isDisabled={disabled} />; }

export interface SpeedControlProps { value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; label?: string; disabled?: boolean; }
export function SpeedControl({ value, onChange, min = 0.25, max = 4, step = 0.25, label = "Playback speed", disabled = false }: SpeedControlProps) {
  return <Slider label={label} value={value} onChange={onChange} min={min} max={max} step={step} valueDisplay="text" isDisabled={disabled} formatValue={(speed) => `${speed}x`} />;
}

export interface ParameterControlProps { name: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; label?: string; disabled?: boolean; }
export function ParameterControl({ name, value, onChange, min, max, step, label = name, disabled = false }: ParameterControlProps) {
  return <Slider label={label} value={value} onChange={onChange} min={min} max={max} step={step} valueDisplay="text" isDisabled={disabled} />;
}

export interface EventLogProps { events: readonly EmittedEvent[]; emptyMessage?: ReactNode; className?: string; }
export function EventLog({ events, emptyMessage = "No events yet", className }: EventLogProps) {
  return <section className={`mosaic-event-log ${className ?? ""}`} aria-label="Event log"><ul>{events.length === 0 ? <li>{emptyMessage}</li> : events.map((event, index) => <li key={`${event.name}-${index}`}><strong>{event.name}</strong>{event.payload !== undefined && <code>{JSON.stringify(event.payload)}</code>}</li>)}</ul></section>;
}

export interface StateInspectorProps { state: SimulationState; title?: string; className?: string; }
export function StateInspector({ state, title = "State", className }: StateInspectorProps) {
  return <section className={`mosaic-state-inspector ${className ?? ""}`} aria-label={title}><h2>{title}</h2><pre>{JSON.stringify(state, null, 2)}</pre></section>;
}
