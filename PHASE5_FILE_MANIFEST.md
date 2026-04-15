# Phase 5 Frontend — Complete File Manifest

## Directory Structure & File Descriptions

### Root Configuration Files

```
frontend/
├── package.json                 # NPM dependencies, scripts (dev, build, preview)
├── tsconfig.json               # TypeScript strict mode config
├── tsconfig.node.json          # TypeScript for vite.config.ts  
├── vite.config.ts              # Vite dev server + build setup
├── tailwind.config.js          # Tailwind theme, dark mode: 'class'
├── postcss.config.js           # PostCSS plugins (tailwind, autoprefixer)
├── index.html                  # HTML entry point, mounts #root div
├── .env                        # VITE_API_URL=http://localhost:8000
├── .gitignore                  # Ignore node_modules, dist, .env
├── Dockerfile                  # Multi-stage: builder → nginx
├── nginx.conf                  # SPA routing, backend proxy
└── README.md                   # Frontend documentation

[root project]
├── docker-compose.yml          # UPDATED: added frontend service
├── PHASE5_WALKTHROUGH.md       # 500+ line comprehensive guide
├── PHASE5_SUMMARY.md           # Executive summary of Phase 5
└── QUICK_START_FRONTEND.md     # 5-minute quick start
```

---

## Source Files (src/)

### API Layer (`src/api/`)

#### `client.ts` (28 lines)
- Axios instance with base URL from `import.meta.env.VITE_API_URL`
- Request interceptor: adds JWT token from Zustand
- Response interceptor: handles 401 by logging out + redirecting to /login
- **Used by**: All API calls

#### `auth.ts` (22 lines)
- `register(email, password)` → POST /auth/register
- `login(email, password)` → POST /auth/login
- Returns User object with access_token, user_id, email
- **Used by**: LoginPage, RegisterPage

#### `query.ts` (51 lines)
- `ingestRepo(github_url, repo_id)` → POST /ingest
- `streamQuery(query, repo_id, onEvent)` → POST /query with native Fetch SSE
  - Handles ReadableStream with TextDecoder
  - Parses SSE format: "data: {...}"
  - Calls onEvent callback for each event (retrieving, retrieved, analyzing, complete, error)
  - **Critically important**: Uses native fetch, not axios
- **Used by**: ChatPage, SettingsPage

#### `history.ts` (18 lines)
- `getHistory(page, pageSize)` → GET /history?page=X&page_size=Y
- `getSession(id)` → GET /history/{id}
- `deleteSession(id)` → DELETE /history/{id}
- Returns HistoryListResponse or HistoryItem
- **Used by**: DashboardPage, ChatPage, Sidebar

---

### State Management (`src/store/`)

#### `authStore.ts` (15 lines)
- Zustand store: `useAuthStore`
- State: `user` (User | null), `isAuthenticated` (boolean)
- Actions: `login(user)`, `logout()`
- **Critical**: No localStorage (Claude.ai compatibility)
- **Used by**: All pages, API interceptor, ProtectedRoute

---

### Custom Hooks (`src/hooks/`)

#### `useStream.ts` (56 lines)
- Manages streaming lifecycle for queries
- Returns: `{ streamingStatus, isStreaming, result, error, sendQuery, reset }`
- `sendQuery(query, repoId)`:
  - Sets isStreaming=true, clears previous result
  - Calls `streamQuery()` from api/query.ts
  - Handles events: retrieving → retrieved → analyzing → complete/error
  - Updates streamingStatus with live messages
- **Used by**: ChatPage

#### `useHistory.ts` (20 lines)
- React Query hooks for session data
- `useHistory(page)`: useQuery with 30s staleTime
- `useDeleteSession()`: useMutation with cache invalidation
- **Used by**: DashboardPage, Sidebar, ChatPage

---

### UI Components (`src/components/ui/`)

#### `ProtectedRoute.tsx` (11 lines)
- Guard component: checks `isAuthenticated` from store
- Redirects to /login if not authenticated
- Returns children if authenticated
- **Wraps**: ChatPage, DashboardPage, SettingsPage in App.tsx

#### `CodeBlock.tsx` (46 lines)
- Syntax-highlighted code using prism-react-renderer
- Theme: vsDark
- Copy button in top-right → navigator.clipboard.writeText()
- Shows "Copied!" for 2 seconds after click
- Props: `code` (string), `language` (string)
- **Used by**: DebugReport (evidence code display)

#### `ConfidenceBadge.tsx` (21 lines)
- Colored pill badge for confidence score (0.0 - 1.0)
- \>= 0.8: green "High confidence (84%)"
- 0.6-0.79: yellow "Medium confidence (72%)"
- < 0.6: red "Low confidence (45%)"
- Props: `confidence` (number)
- **Used by**: DebugReport, HistoryCard (Dashboard)

#### `Spinner.tsx` (20 lines)
- SVG spinner with animate-spin
- Sizes: sm (w-4), md (w-6), lg (w-8)
- Props: `size?: 'sm' | 'md' | 'lg'`
- **Used by**: LoginPage, RegisterPage, SettingsPage (loading states)

---

### Chat Components (`src/components/chat/`)

#### `StreamingStatus.tsx` (11 lines)
- Displays streaming status with animated pulsing dot
- Shows message like "Fetching relevant code..."
- Only renders when isStreaming=true
- Uses Tailwind animate-pulse
- Props: `message` (string | null)
- **Used by**: MessageBubble during streaming

#### `DebugReport.tsx` (102 lines)
- Renders complete DebugResult object
- Sections:
  - Root Cause: bug icon + red callout
  - Evidence: file icons, collapsible code blocks
  - Suggested Fix: wrench icon + green callout
  - Metadata: confidence badge + iteration count + collapsible hypothesis chain
- State: expandedEvidenceIndex (only 1 expanded at a time)
- Props: `result` (DebugResult)
- **Used by**: MessageBubble (assistant messages)

#### `MessageBubble.tsx` (23 lines)
- Single message in chat
- If role="user": right-aligned, blue background
- If role="assistant": left-aligned, gray background
- Shows StreamingStatus if isStreaming=true
- Shows DebugReport if result exists
- Props: `message` (Message)
- **Used by**: ChatWindow

#### `ChatWindow.tsx` (30 lines)
- Renders message list with auto-scroll
- useRef on end div → scrollIntoView({ behavior: 'smooth' })
- Scrolls whenever messages array changes
- Empty state: terminal icon + "Ask a debugging question to get started."
- Props: `messages` (Message[])
- **Used by**: ChatPage

#### `ChatInput.tsx` (66 lines)
- Bottom input bar with repository dropdown + textarea + send button
- Textarea auto-resizes (max 5 rows / 120px)
- Repo select dropdown populated from availableRepos
- Submit on: Ctrl+Enter (Linux) or Cmd+Enter (Mac)
- Plain Enter: adds newline (no submit)
- Disabled when: isLoading=true or empty query or no repo selected
- Props: `onSendQuery`, `isLoading`, `availableRepos`
- **Used by**: ChatPage

---

### Layout Components (`src/components/layout/`)

#### `Navbar.tsx` (26 lines)
- Top bar with page title, user email, logout button
- User email from `useAuthStore`
- Logout calls `authStore.logout()` + navigate('/login')
- Props: `title` (string)
- **Used by**: AppLayout

#### `Sidebar.tsx` (77 lines)
- Left sidebar with CodeRAG logo + navigation + recent sessions
- Navigation: Chat, Dashboard, Settings (NavLink with active highlighting)
- Recent Sessions: last 5 from useHistory().data
- Mobile: hamburger menu (Menu icon on md:hidden)
- Toggle: click hamburger → sidebar slides in/out with transform
- Mobile overlay: dark bg-black/50 dismisses sidebar
- Props: none (gets data from hooks)
- **Used by**: AppLayout

#### `AppLayout.tsx` (17 lines)
- Main layout wrapper: flex layout with Sidebar + main area
- Top: Navbar
- Middle: children (page content, flex-1, overflow-y-auto)
- Props: `children` (ReactNode), `title` (string)
- **Wraps**: All protected pages (ChatPage, DashboardPage, SettingsPage)

---

### Pages (`src/pages/`)

#### `LoginPage.tsx` (56 lines)
- Centered card layout
- Email + password inputs
- Submit calls `login(email, password)` → `authStore.login(user)` → navigate('/chat')
- Shows error toast on failure (bad credentials)
- Loading state on button (Spinner + "Logging in...")
- Link to Register page
- **Route**: /login (public)

#### `RegisterPage.tsx` (68 lines)
- Centered card layout (same as LoginPage)
- Email + password + confirmPassword inputs
- Client-side validation:
  - Password >= 8 characters
  - Passwords match
- Submit: `register()` → `login()` → `authStore.login()` → navigate('/chat')
- Shows error toast on failure
- Link to Login page
- **Route**: /register (public)

#### `ChatPage.tsx` (69 lines)
- Main debug chat interface
- State: messages[], activeRepoId, availableRepos
- useEffect 1: Load repos from localStorage, populate dropdown
- useEffect 2: If ?session={id} in URL, fetch session + pre-populate messages
- handleSendQuery:
  - Add user message to messages[]
  - Add placeholder assistant message (isStreaming=true)
  - Call useStream.sendQuery()
  - Update placeholder with result when complete
- Layout: AppLayout + ChatWindow + ChatInput
- **Route**: /chat (protected)

#### `DashboardPage.tsx` (118 lines)
- Session history with grid + search + pagination
- Search input filters sessions by query text (client-side)
- Grid: HistoryCard components (inline), 3-column on lg, 2 on md, 1 on sm
- HistoryCard shows:
  - Query truncated to 80 chars
  - Root cause preview (120 chars)
  - Confidence badge
  - Timestamp
  - Delete button (with confirmation)
- Pagination: Previous/Next buttons (disabled at edges)
- Empty state: "No debugging sessions yet..."
- **Route**: /dashboard (protected)

#### `SettingsPage.tsx` (129 lines)
- Three sections: Ingest Repository, Account, Theme
- Ingest Repository:
  - GitHub URL input + Repo ID input
  - "Ingest" button → calls ingestRepo() → adds to localStorage → toast
  - Ingested repos list with remove buttons (trash icon)
- Account:
  - Read-only email display from user store
- Theme:
  - Dark/Light toggle button (Moon/Sun icons)
  - Toggles `dark` class on document.documentElement
  - Persists to localStorage['coderag_dark_mode']
- **Route**: /settings (protected)

---

### Types (`src/types/`)

#### `index.ts` (68 lines)
- All shared TypeScript interfaces in one place
- Interfaces:
  - `User`: user_id, email, access_token
  - `EvidenceItem`: file_path, start_line, end_line, content, name
  - `DebugResult`: root_cause, suggested_fix, evidence[], confidence, iterations, hypothesis_chain[], session_id
  - `StreamEvent`: status, message, chunks, result, session_id
  - `Message`: id, role, content, result, timestamp, isStreaming
  - `HistoryItem`: id, query, response, created_at
  - `HistoryListResponse`: items, total, page, page_size
  - `IngestRequest`: github_url, repo_id
  - `IngestResponse`: repo_id, total_chunks, status
- **Imported by**: All components, pages, hooks

---

### Entry Points

#### `App.tsx` (28 lines)
- BrowserRouter + Routes setup
- Public routes: /login, /register
- Protected routes: /chat (ProtectedRoute), /dashboard, /settings
- Fallback: * → Navigate to /chat
- **Imported by**: main.tsx

#### `main.tsx` (14 lines)
- React.StrictMode wrapper
- QueryClientProvider (React Query setup)
- App component
- Toaster (react-hot-toast notifications)
- Mounts to #root div
- **Entry point**: index.html script tag

#### `index.css` (36 lines)
- Tailwind imports: @tailwind base, components, utilities
- Custom CSS variables (brand colors)
- Animations: fadeIn
- Utilities: line-clamp-2
- **Imported by**: main.tsx

---

## File Count Summary

### By Category
- **Configuration**: 8 files (package.json, tsconfig, vite, tailwind, nginx, docker, etc.)
- **API Layer**: 4 files (client, auth, query, history)
- **UI Components**: 4 files (ProtectedRoute, CodeBlock, ConfidenceBadge, Spinner)
- **Chat Components**: 5 files (StreamingStatus, DebugReport, MessageBubble, ChatWindow, ChatInput)
- **Layout Components**: 3 files (Navbar, Sidebar, AppLayout)
- **Pages**: 5 files (Login, Register, Chat, Dashboard, Settings)
- **State**: 1 file (authStore)
- **Hooks**: 2 files (useStream, useHistory)
- **Types**: 1 file (index.ts)
- **Entry**: 3 files (App.tsx, main.tsx, index.css)
- **Documentation**: 4 files (README.md, PHASE5_WALKTHROUGH.md, PHASE5_SUMMARY.md, QUICK_START_FRONTEND.md)
- **Root Config**: 1 file (docker-compose.yml UPDATED)

**Total**: 40+ files ✅

---

## Lines of Code

| Category | Files | Est. Lines | Notes |
|----------|-------|-----------|-------|
| API Layer | 4 | 120 | Slim, focused endpoints |
| Components (UI) | 4 | 120 | Reusable elements |
| Components (Chat) | 5 | 240 | Complex streaming logic |
| Components (Layout) | 3 | 120 | Navigation + structure |
| Pages | 5 | 350 | Form handling + state |
| Store | 1 | 15 | Minimal Zustand |
| Hooks | 2 | 75 | Custom logic |
| Types | 1 | 68 | Shared interfaces |
| Entry/CSS | 3 | 70 | Setup files |
| Config | 8 | ~100 | Build/dev config |
| **Total** | **40+** | **~1,280** | Frontend code |

+ **Documentation**: 3,500+ lines (walkthroughs, readmes, guides)
+ **Config Files**: package.json, docker files, nginx, etc.

---

## Dependency Tree

```
main.tsx
├── <QueryClientProvider>
│   └── App.tsx
│       ├── <BrowserRouter>
│       │   └── <Routes>
│       │       ├── LoginPage
│       │       │   ├── useAuthStore
│       │       │   └── api/auth.ts
│       │       ├── RegisterPage
│       │       │   ├── useAuthStore
│       │       │   └── api/auth.ts
│       │       └── <ProtectedRoute>
│       │           ├── ChatPage
│       │           ├── DashboardPage
│       │           └── SettingsPage
└── <Toaster>
```

---

## Build Artifacts

### Development
- Generated: `node_modules/` (~500MB)
- Watched: src/ changes
- Hot reload: instant browser update

### Production
- Input: src/ + public/
- Build: `npm run build`
- Output: `dist/` (~200KB gzipped)
  - dist/index.html
  - dist/assets/main.*.js (minified + chunked)
  - dist/assets/style.*.css (Tailwind + index.css)
  - dist/favicon.svg

### Docker
- Build: `Dockerfile` (multi-stage)
- Builder: node:20-alpine (npm install + build)
- Final: nginx:alpine (dist/ served)
- Size: ~50MB

---

## Key Patterns Used

1. **Component Composition**: Small, focused components
2. **Prop Drilling**: AppLayout → Navbar/Sidebar
3. **Context Hooks**: useAuthStore via Zustand
4. **Custom Hooks**: useStream, useHistory
5. **React Query**: Server state caching + invalidation
6. **Protected Routes**: ProtectedRoute wrapper
7. **Responsive Tailwind**: sm, md, lg breakpoints
8. **Dark Mode**: `dark:` utilities with `class` strategy
9. **Error Handling**: Toast notifications via react-hot-toast
10. **TypeScript**: Strict mode throughout

---

## What's NOT Included (By Design)

- ❌ localStorage for tokens (in-memory Zustand only)
- ❌ Redux/MobX (Zustand is simpler)
- ❌ Server-side rendering (Vite SPA)
- ❌ Jest/Vitest tests (can add in Phase 6)
- ❌ Storybook (can add in Phase 6)
- ❌ Internationalization (English only)
- ❌ WebSockets (SSE for now)

---

## Next Changes Likely Needed

1. Production API URL in `.env`
2. SSL certificates in nginx
3. Rate limiting middleware
4. Analytics/logging
5. Error reporting (Sentry)
6. Performance monitoring

---

**Manifest Generated**: April 15, 2026  
**Framework**: React 18 + TypeScript  
**All files provided**: ✅ Ready to deploy
