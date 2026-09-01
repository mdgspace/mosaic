import type { ReactNode } from "react";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

export interface MosaicProviderProps {
  children: ReactNode;
  mode?: "system" | "light" | "dark";
}

export function MosaicProvider({ children, mode = "system" }: MosaicProviderProps) {
  return <Theme theme={neutralTheme} mode={mode}>{children}</Theme>;
}
