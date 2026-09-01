import type { ReactNode } from "react";
import { Tab as AstryxTab, TabList } from "@astryxdesign/core/TabList";

export interface TabItem {
  value: string;
  label: string;
  panelId?: string;
  content?: ReactNode;
}

export interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
  layout?: "hug" | "fill";
  hasDivider?: boolean;
}

export function Tabs({ items, value, onValueChange, ...props }: TabsProps) {
  return (
    <TabList {...props} value={value} onChange={onValueChange} role="tablist">
      {items.map(({ value: itemValue, label, panelId }) => (
        <AstryxTab key={itemValue} value={itemValue} label={label} panelId={panelId} />
      ))}
    </TabList>
  );
}

export { AstryxTab as Tab };
