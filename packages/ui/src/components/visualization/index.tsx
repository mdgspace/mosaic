import { useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Background as FlowBackground, Controls, Handle, Position, ReactFlow, useEdgesState, useNodesState, type Edge as FlowEdge, type Node as FlowNode, type NodeChange } from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";

export interface MotionTransition {
  duration?: number;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
  spring?: boolean;
}

function motionTransition({ duration = 0.35, easing = "easeInOut", spring = false }: MotionTransition = {}) {
  return spring ? { type: "spring" as const, stiffness: 260, damping: 24 } : { duration, ease: easing };
}

export interface AnimatedProps extends MotionTransition {
  children?: ReactNode;
  visible?: boolean;
  className?: string;
}

/** Provides semantic enter, exit, and presence animation without exposing Framer Motion. */
export function Animated({ children, visible = true, className, ...transition }: AnimatedProps) {
  return <AnimatePresence><>{visible && <motion.div className={className} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={motionTransition(transition)}>{children}</motion.div>}</></AnimatePresence>;
}

export interface ChartProps {
  children?: ReactNode;
  height?: number | string;
  className?: string;
  "aria-label"?: string;
}

export interface ChartLineProps {
  data: readonly Record<string, number | string>[];
  dataKey: string;
  stroke?: string;
}

/** A responsive chart surface for Recharts content. */
export function Chart({ children, height = 280, className, "aria-label": ariaLabel }: ChartProps) {
  return (
    <div className={`mosaic-chart ${className ?? ""}`} style={{ height }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
    </div>
  );
}

/** A semantic line chart that keeps Recharts implementation details internal. */
export function ChartLine({ data, dataKey, stroke = "var(--color-accent)" }: ChartLineProps) {
  return (
    <Chart height={180}>
      <LineChart data={data}>
        <Line dataKey={dataKey} type="monotone" stroke={stroke} />
        <RechartsTooltip />
      </LineChart>
    </Chart>
  );
}

export interface GraphNode {
  id: string;
  label?: ReactNode;
  x: number;
  y: number;
  radius?: number;
  opacity?: number;
  selected?: boolean;
}

export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  label?: ReactNode;
  animated?: boolean;
}

export interface GraphProps {
  nodes: readonly GraphNode[];
  edges?: readonly GraphEdge[];
  width?: number;
  height?: number;
  className?: string;
  interactive?: boolean;
  onNodesChange?: (nodes: readonly GraphNode[]) => void;
  selectedNodeId?: string;
  onNodeSelect?: (id: string) => void;
}

/** Renders an interactive node-and-edge graph backed by React Flow. */
export function Graph({ nodes, edges = [], width = 640, height = 360, className, interactive = true, onNodesChange, selectedNodeId, onNodeSelect }: GraphProps) {
  const flowNodes: FlowNode[] = nodes.map(({ id, label, x, y, radius, opacity, selected }) => ({ id, position: { x, y }, data: { label: label ?? id, radius, opacity }, selected: selected ?? id === selectedNodeId, type: "mosaic", draggable: interactive }));
  const flowEdges: FlowEdge[] = edges
    .filter((edge) => nodes.some((node) => node.id === edge.source) && nodes.some((node) => node.id === edge.target))
    .map((edge, index) => ({ id: edge.id ?? `${edge.source}-${edge.target}-${index}`, source: edge.source, target: edge.target, label: edge.label, animated: edge.animated }));
  return <InteractiveGraph nodes={flowNodes} edges={flowEdges} width={width} height={height} className={className} interactive={interactive} onNodesChange={onNodesChange} onNodeSelect={onNodeSelect} />;
}

function InteractiveGraph({ nodes: initialNodes, edges: initialEdges, width, height, className, interactive, onNodesChange, onNodeSelect }: { nodes: FlowNode[]; edges: FlowEdge[]; width: number; height: number; className?: string; interactive: boolean; onNodesChange?: (nodes: readonly GraphNode[]) => void; onNodeSelect?: (id: string) => void; }) {
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const inputKey = JSON.stringify(initialNodes.map((node) => [node.id, node.position.x, node.position.y]));
  const edgeKey = JSON.stringify(initialEdges.map((edge) => [edge.id, edge.source, edge.target, edge.label]));
  useEffect(() => setNodes(initialNodes), [inputKey, initialNodes, setNodes]);
  useEffect(() => setEdges(initialEdges), [edgeKey, initialEdges, setEdges]);
  const handleChange = (changes: NodeChange[]) => {
    handleNodesChange(changes);
    if (onNodesChange) {
      const changed = changes.filter((change): change is Extract<NodeChange, { type: "position" }> => change.type === "position" && change.position !== undefined);
      onNodesChange(changed.map((change) => ({ id: change.id, x: change.position!.x, y: change.position!.y })));
    }
  };
  return <div className={`mosaic-graph ${className ?? ""}`} style={{ width, height }} role="group" aria-label={`Graph with nodes ${initialNodes.map((node) => node.id).join(", ")}`} data-node-ids={initialNodes.map((node) => node.id).join(",")} data-edge-ids={initialEdges.map((edge) => edge.id).join(",")}><ReactFlow nodes={nodes} edges={edges} nodeTypes={{ mosaic: MosaicFlowNode }} onNodesChange={handleChange} onNodeClick={(_, node) => onNodeSelect?.(node.id)} nodesDraggable={interactive} nodesConnectable={false} fitView><FlowBackground /><Controls /></ReactFlow></div>;
}

function MosaicFlowNode({ data, selected }: { data: { label: ReactNode; opacity?: number }; selected?: boolean }) {
  return <motion.div className="mosaic-flow-node" initial={false} animate={{ scale: selected ? 1.06 : 1, opacity: data.opacity ?? 1 }} transition={motionTransition({ spring: selected })}><Handle type="target" position={Position.Left} /><span>{data.label}</span><Handle type="source" position={Position.Right} /></motion.div>;
}

export function Node({ id, label, x, y, radius = 24, opacity = 1, selected = false }: GraphNode) {
  return (
    <motion.g className="mosaic-node" data-node-id={id} initial={false} animate={{ scale: selected ? 1.06 : 1, opacity }} transition={motionTransition({ spring: selected })} style={{ transformOrigin: `${x}px ${y}px` }}>
      <circle cx={x} cy={y} r={radius} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central">{label ?? id}</text>
    </motion.g>
  );
}

export interface EdgeProps {
  source: Pick<GraphNode, "x" | "y">;
  target: Pick<GraphNode, "x" | "y">;
  label?: ReactNode;
  animated?: boolean;
}

export function Edge({ source, target, label, animated = false }: EdgeProps) {
  const labelX = (source.x + target.x) / 2;
  const labelY = (source.y + target.y) / 2;
  return (
    <g className="mosaic-edge">
      <motion.line x1={source.x} y1={source.y} x2={target.x} y2={target.y} initial={false} animate={{ opacity: animated ? [0.45, 1, 0.45] : 1 }} transition={animated ? { duration: 1.2, repeat: Infinity } : undefined} />
      {label && <text x={labelX} y={labelY} textAnchor="middle">{label}</text>}
    </g>
  );
}

export interface TimelineItem { id: string; label: ReactNode; description?: ReactNode; active?: boolean; }
export interface TimelineProps { items: readonly TimelineItem[]; className?: string; }

export function Timeline({ items, className }: TimelineProps) {
  return <ol className={`mosaic-timeline ${className ?? ""}`}>{items.map((item) => (
    <motion.li key={item.id} layout className={item.active ? "is-active" : undefined}>
      <span className="mosaic-timeline-marker" aria-hidden="true" />
      <div><strong>{item.label}</strong>{item.description && <p>{item.description}</p>}</div>
    </motion.li>
  ))}</ol>;
}

export interface DiagramProps { children?: ReactNode; title?: string; className?: string; }
export function Diagram({ children, title, className }: DiagramProps) {
  return <section className={`mosaic-diagram ${className ?? ""}`} aria-label={title}>{title && <h2>{title}</h2>}{children}</section>;
}

export interface ParticleProps extends MotionTransition { x: number; y: number; radius?: number; color?: string; label?: string; opacity?: number; scale?: number; style?: CSSProperties; }
export function Particle({ x, y, radius = 6, color = "var(--color-accent)", label, opacity = 1, scale = 1, style, ...transition }: ParticleProps) {
  return <motion.span className="mosaic-particle" title={label} aria-label={label} initial={{ opacity: 0, scale: 0.8 }} animate={{ left: x, top: y, opacity, scale }} transition={motionTransition({ spring: true, ...transition })} style={{ width: radius * 2, height: radius * 2, background: color, ...style }} />;
}

export interface FlowProps { steps: readonly ReactNode[]; activeIndex?: number; className?: string; }
export function Flow({ steps, activeIndex = -1, className }: FlowProps) {
  return <ol className={`mosaic-flow ${className ?? ""}`}>{steps.map((step, index) => <motion.li layout key={index} className={index === activeIndex ? "is-active" : undefined}>{step}</motion.li>)}</ol>;
}

export interface HeatmapProps { values: readonly (readonly number[])[]; min?: number; max?: number; labels?: readonly string[]; className?: string; }
export function Heatmap({ values, min = 0, max = 1, labels, className }: HeatmapProps) {
  const range = max - min || 1;
  return <div className={`mosaic-heatmap ${className ?? ""}`} role="grid" aria-label="Heatmap">{values.map((row, y) => row.map((value, x) => {
    const intensity = Math.max(0, Math.min(1, (value - min) / range));
    return <span key={`${x}-${y}`} role="gridcell" aria-label={labels?.[x] ? `${labels[x]}: ${value}` : String(value)} style={{ opacity: 0.25 + intensity * 0.75 }} />;
  }))}</div>;
}

export interface EquationProps { expression: ReactNode; label?: string; className?: string; }
export function Equation({ expression, label, className }: EquationProps) {
  return <div className={`mosaic-equation ${className ?? ""}`} aria-label={label}>{expression}</div>;
}
