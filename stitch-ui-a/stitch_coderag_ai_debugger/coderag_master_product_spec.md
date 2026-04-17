## MASTER PRODUCT SPEC: CodeRAG

### Overview
CodeRAG is a production-grade, AI-powered debugging assistant designed for high-pressure engineering environments. It uses RAG (Retrieval-Augmented Generation) and LangGraph to analyze large codebases and provide precise root-cause analysis and suggested fixes.

### Brand & Design System
- **Personality:** Calm, Intelligent, Precise, Fast, Trustworthy, Serious, Developer-first.
- **Aesthetic:** Dark-first, terminal-inspired, dense but breathable.
- **Typography:** Inter/DM Sans for UI; JetBrains Mono/Fira Code for code/metadata.
- **Colors:**
  - Background: #0a0f14
  - Surface: #0d1520
  - Accent: #00d4ff (Cyan)
- **Motion:** Purposeful and subtle (120ms-240ms). No bounce or playfulness.

### Architecture & Tech Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router v6.
- **State Management:** Zustand (Auth), React Query (Server State).
- **Communication:** Axios (REST), Native Fetch (SSE Streaming).
- **Key Components:** CodeBlock (Prism), ConfidenceBadge, DebugReport (Streaming Status).

### Core Features & Pages
1. **Auth:** Split-panel Login/Register with decorative terminal simulation.
2. **Chat (/chat):** Main debugging interface with live SSE streaming status indicators and structured Debug Reports (Root Cause, Evidence with code snippets, Suggested Fix).
3. **Dashboard (/dashboard):** Session history grid with search and confidence filtering.
4. **Settings (/settings):** Repository ingestion management and appearance (Dark/Light) toggles.

### Technical Constraints
- SSE streaming for real-time agent reasoning feedback.
- Strict TypeScript contracts for all API interactions.
- Accessible (WCAG AA), keyboard-navigable, and responsive (Desktop/Tablet/Mobile).
- Token-only Zustand storage (no localStorage for sensitive data).
