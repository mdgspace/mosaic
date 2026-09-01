MOSAIC
AI-Powered Interactive Learning Engine
PRD — Development Plan, Resources & Workflow
Project Type: Open Source
Status: Initial Development Draft
1. Summary
Mosaic is an open-source AI-powered harness that converts a user's learning request into an interactive learning
experience. The AI analyzes the concept, creates a learning/simulation plan, and generates an experience by
combining pre-built Mosaic components, simulation engines, design systems, and custom-generated HTML/SVG/JS
when required.
The goal is to make learning interactive and experimental rather than purely explanatory.
2. Context
Many concepts in CS, mathematics, science, and engineering are difficult to understand through text or static
diagrams alone. Existing interactive simulations are generally built manually for specific concepts, making them
time-consuming to create.
Mosaic aims to provide infrastructure for an AI agent to generate these experiences dynamically, without limiting the
platform to one domain such as distributed systems.
3. Basic Flow
• #1. User Input: Natural-language learning request.
• #2. Learning Analysis: Identify concept, objective, prerequisites, variables, and interaction model.
• #3. Simulation Planning: Decide what should be visualized and manipulated.
• #4. Component Selection: Check the Mosaic toolkit for suitable components.
• #5. Design Selection: Choose an appropriate visual style/design system.
• #6. Composition: Combine selected components.
• #7. Custom Generation: Compose primitives or generate custom HTML/CSS/SVG/JS when needed.
• #8. Validation: Check structure, compatibility, runtime issues, security, and design compliance.
• #9. Rendering: Render the validated experience in a sandbox.
• #10. Interaction: Let the learner change parameters, run simulations, observe outcomes, and ask follow-up
questions.
4. Core Architecture
USER
↓
User Prompt
↓
AI Agent
↓
Learning + Simulation Planning
↓
Component / Style Selection
↓
■■■■■■■■■■■■■■■■■■■■■■■■ ■
▼ ▼
Mosaic Toolkit Custom Generator
■ ■
■■■■■■■■■■■■■■■■■■■■■■■
▼
Simulation Spec
↓
Validator
↓
Sandbox
↓
Interactive HTML
5. Tech Stack
• Frontend — React + TypeScript: application UI, component toolkit, interactive experiences, and state
management.
• Visualization — React Flow: nodes, edges, networks, and system diagrams.
• Visualization — D3.js: charts, graphs, and custom data visualizations.
• SVG / Canvas: custom visualizations when standard components are insufficient.
• Framer Motion: UI and simulation animations.
• Backend — Python + FastAPI: AI orchestration, API layer, simulation logic, component registry, and validation.
• WebSockets: continuous simulation/event streaming where required.
• Storage: initially no persistent database for core simulation runtime; PostgreSQL and Redis can be introduced
later.
• AI: LLM-agnostic architecture; possible providers include OpenAI, Claude, Gemini, or local/open-source models.
• Code execution: sandboxed iframe or isolated runtime for custom generated HTML/JS.
6. Mosaic Toolkit
UI Components
• Button
• Slider
• Toggle
• Dropdown
• Tabs
• Card
• Tooltip
Visualization Components
• Graph
• Chart
• Node
• Edge
• Timeline
• Diagram• Particle
• Flow
• Heatmap
• Equation
Simulation Components
• Play
• Pause
• Step
• Reset
• Speed Control
• Parameter Control
• Event Log
• State Inspector
Educational Components
• Explanation
• Formula
• Code Block
• Quiz
• Hint
• Question
7. Design System
Mosaic will maintain a reusable design system so AI-generated experiences have a consistent identity without
becoming visually repetitive.
• Brand colors
• Typography
• Spacing
• Border radius and shadows
• Icons and motion guidelines
• Design tokens
Multiple visual styles can exist within the brand system, such as Technical, Editorial, Playful, Analytical, and Minimal.
The AI can choose an appropriate combination based on the subject.
8. Resources / Libraries
RequirementResource / LibraryPurpose
UIReactInteractive application
Type safetyTypeScriptMaintainable component system
Graph simulationsReact FlowNodes, edges, network diagramsRequirementResource / LibraryPurpose
Data visualizationD3.jsCharts and custom visualizations
AnimationFramer MotionUI/simulation animation
BackendFastAPIAPI + AI orchestration
Real-timeWebSocketsSimulation event streaming
Custom visualsSVG / CanvasFlexible generated visualizations
StylingTailwind CSS / CSSDesign system implementation
AILLM APIPlanning + generation
ValidationPydantic / JSON SchemaValidate simulation specifications
ExecutionSandboxed iframe / isolated runtimeSafe custom HTML execution
DevelopmentGit + GitHubOpen-source workflow
9. AI Harness / Tool Interface
The AI should not receive unrestricted access to the codebase. Mosaic will expose controlled tools that the agent can
call.
AI Agent
get_components()
get_design_system()
create_node()
create_edge()
create_chart()
create_slider()
create_timeline()
create_animation()
run_simulation()
validate_simulation()
The AI selects and combines these capabilities. If the toolkit is insufficient, it falls back to custom generation.
10. Simulation Specification
The AI should ideally create an intermediate structured representation before rendering. This separates AI reasoning
from the rendering engine.
{
"title": "Gradient Descent",
"objective": "Understand learning rate",
"components": ["lossGraph", "movingPoint", "slider"],
"parameters": {"learningRate": 0.1},
"interactions": ["changeLearningRate", "step", "reset"]
}
11. Custom HTML Generation
The toolkit should not become a hard restriction. If the AI determines that an existing component is insufficient, it can
generate custom HTML, CSS, SVG, or JavaScript. Custom output should execute inside a sandbox.
12. Security
• Restrict filesystem access.
• Restrict arbitrary network requests.
• Restrict sensitive browser APIs.• Restrict external script execution where possible.
• Validate generated code before execution.
• Run custom generated experiences in an isolated environment.
13. Initial Proof of Concept
• Raft / Leader Election: graph, nodes, messages, state transitions, failure simulation.
• Gradient Descent: mathematical graph, sliders, animation, numerical state.
• Binary Search: array visualization and step-by-step interaction.
• TCP Handshake: network flow, messages, timeline.
• Projectile Motion: physics animation and parameter manipulation.
14. Development Workflow
Phase 1 — Research & Architecture
• Explore interactive-learning platforms.
• Explore AI agent/harness frameworks.
• Explore interactive HTML generation approaches.
• Finalize component architecture and design-system structure.
• Define the Simulation Specification.
Phase 2 — Toolkit
Build reusable UI, visualization, simulation-control components and design tokens.
Phase 3 — Simulation Engine
Implement simulation state, event system, rendering, animation, controls, reset and replay behavior.
Phase 4 — AI Harness
Prompt → Learning Plan → Simulation Plan → Component Selection → Simulation Spec → Validation →
Rendering
Phase 5 — Custom Generation
Add fallback support for AI-generated HTML, SVG, Canvas, and JavaScript inside a sandbox.
Phase 6 — Proof of Concept
Integrate and test the 3–5 diverse example simulations.
Phase 7 — Open Source
Prepare README, contribution guide, issue templates, component documentation, simulation templates,
development setup, and beginner-friendly issues.
15. Development Philosophy
Mosaic follows a component-first + AI-orchestration approach. Developers build reusable primitives; the AI learns
the available tools and composes them into new experiences. This makes the system scalable and suitable for
open-source contributions.
16. Learning Outcomes
• AI agent/harness development• LLM tool calling and prompt engineering
• React + TypeScript
• Data visualization and simulation architecture
• WebSockets and FastAPI
• SVG/Canvas
• Design systems
• Sandboxed code execution
• Open-source development
17. Timeline
WeekFocusMain Deliverables
1FoundationArchitecture, research, repo setup, design system, initial components
2Simulation EngineState, events, rendering, animation, controls
3AI HarnessPrompt processing, planning, component selection, simulation spec
4Integration + POCCustom HTML fallback, sandboxing, examples, testing, docs
18. Future Enhancements
• Adaptive Learning: adapt simulations based on learner behavior.
• RAG: use trusted educational/reference material to improve factual accuracy.
• Persistent Experiences: save and revisit simulations.
• Community Library: publish and discover simulations and components.
• AI-generated Components: propose reusable components when new patterns recur.
• Multi-agent Architecture: potentially separate Learning, Simulation Designer, Component, and Validator agents
if the MVP demonstrates a need.
19. Final Goal
MVP goal: A user can describe something they want to learn, and Mosaic can turn that request into a functional
interactive experience.
Long-term goal: Build an open-source engine where AI can create interactive learning experiences for almost any
technical concept.