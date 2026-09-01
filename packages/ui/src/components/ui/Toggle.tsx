import type { ComponentProps } from "react";
import { Switch } from "@astryxdesign/core/Switch";

export interface ToggleProps extends Omit<ComponentProps<typeof Switch>, "value" | "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Toggle({ checked, onCheckedChange, ...props }: ToggleProps) {
  return <Switch {...props} value={checked} onChange={(next) => onCheckedChange?.(next)} />;
}
