import type { ComponentProps } from "react";
import { Selector } from "@astryxdesign/core/Selector";

export type DropdownOption = string | { value: string; label?: string; disabled?: boolean };

export interface DropdownProps extends Omit<ComponentProps<typeof Selector>, "options" | "value" | "onChange" | "hasClear"> {
  options: DropdownOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  hasClear?: false;
}

export function Dropdown({ options, value, onValueChange, ...props }: DropdownProps) {
  return <Selector {...props} options={options} value={value} onChange={onValueChange} />;
}
