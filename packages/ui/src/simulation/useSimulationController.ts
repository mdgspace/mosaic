import { useCallback, useEffect, useRef, useState } from "react";
import type { EmittedEvent, JsonValue, SimulationEngine, SimulationState, StepResult } from "@mosaic/simulation";

export interface UseSimulationControllerOptions { engine: SimulationEngine; initialSpeed?: number; }

export interface SimulationController {
  state: SimulationState;
  parameters: Readonly<Record<string, JsonValue>>;
  lastStep: StepResult | null;
  events: readonly EmittedEvent[];
  isPlaying: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
  setParameter: (name: string, value: JsonValue) => void;
  step: () => StepResult;
  reset: () => void;
}

export function useSimulationController({ engine, initialSpeed = 1 }: UseSimulationControllerOptions): SimulationController {
  const engineRef = useRef(engine);
  const [state, setState] = useState(() => engine.getState());
  const [parameters, setParameters] = useState(() => engine.getParameters());
  const [lastStep, setLastStep] = useState<StepResult | null>(null);
  const [events, setEvents] = useState<readonly EmittedEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);

  const step = useCallback(() => {
    const result = engineRef.current.step();
    setState(result.state);
    setLastStep(result);
    if (result.events.length > 0) setEvents((previous) => [...previous, ...result.events]);
    return result;
  }, []);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  const setParameter = useCallback((name: string, value: JsonValue) => {
    engineRef.current.dispatch({ type: "set_parameter", target: name, parameters: { value } });
    setParameters(engineRef.current.getParameters());
  }, []);

  const reset = useCallback(() => {
    engineRef.current.dispatch({ type: "reset" });
    setState(engineRef.current.getState());
    setParameters(engineRef.current.getParameters());
    setLastStep(null);
    setEvents([]);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(step, 1000 / Math.max(speed, 0.01));
    return () => window.clearInterval(interval);
  }, [isPlaying, speed, step]);

  return { state, parameters, lastStep, events, isPlaying, speed, play, pause, setSpeed, setParameter, step, reset };
}
