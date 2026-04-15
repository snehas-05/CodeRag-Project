# Phase 5: React Frontend - Complete Walkthrough

## Overview

This phase completes the CodeRAG application with a full-featured React frontend built with TypeScript, Tailwind CSS, and modern React patterns. The frontend integrates with the backend API (Phases 1-4) to provide:

- **Authentication**: Secure JWT-based login/registration
- **Real-time Chat**: SSE streaming for AI-powered code debugging
- **Session History**: Dashboard with pagination and search
- **Settings**: Repository ingestion, theme switching
- **Responsive Design**: Mobile-friendly with dark mode support

---

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API client layer
│   │   ├── client.ts           # Axios instance with JWT interceptor
│   │   ├── auth.ts             # Login/register endpoints
│   │   ├── query.ts            # SSE streaming + ingest
│   │   └── history.ts          # Session management
│   ├── store/
│   │   └── authStore.ts        # Zustand auth state
│   ├── hooks/
│   │   ├── useStream.ts        # SSE consumption hook
│   │   └── useHistory.ts       # React Query hooks
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── CodeBlock.tsx   # Syntax-highlighted code
│   │   │   ├── ConfidenceBadge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── chat/               # Chat-specific components
│   │   │   ├── ChatWindow.tsx  # Message list
│   │   │   ├── ChatInput.tsx   # Query input bar
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── DebugReport.tsx # Results renderer
│   │   │   └── StreamingStatus.tsx
│   │   └── layout/             # Layout components
│   │       ├── AppLayout.tsx
│   │       ├── Sidebar.tsx
│   │       └── Navbar.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ChatPage.tsx        # Main chat interface
│   │   ├── DashboardPage.tsx   # Session history
│   │   └── SettingsPage.tsx
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   ├── App.tsx                 # Router setup
│   ├── main.tsx                # Entry point with QueryClient
│   └── index.css               # Tailwind + custom CSS
├── public/
├── Dockerfile                  # Multi-stage build
├── nginx.conf                  # SPA routing + proxy
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind theme
├── postcss.config.js          # PostCSS config
├── tsconfig.json              # TypeScript config
├── index.html                 # HTML entry
├── package.json               # Dependencies
├── .env                       # Environment variables
└── .gitignore
```

---

## Key Architecture Patterns

### 1. **State Management Layers**

- **Zustand (Global Auth)**: In-memory user & token (no localStorage)
- **React Query**: Server-side state (history, sessions)
- **React Hooks**: Local component state (chat messages, forms)

### 2. **API Communication**

**Axios Instance** (`client.ts`)
```typescript
// Automatically adds JWT to all requests
// Handles 401 errors by logging out & redirecting
```

**Server-Sent Events** (`query.ts`)
```typescript
// Uses native fetch API (not axios) for streaming
// Handles partial line buffering
// Parses SSE format: "data: {...}"
```

### 3. **Component Hierarchy**

```
App (Router)
├── LoginPage / RegisterPage
├── ProtectedRoute
│   ├── AppLayout
│   │   ├── Sidebar (nav + recent sessions)
│   │   ├── Navbar (title + user info)
│   │   └── ChatPage / DashboardPage / SettingsPage
```

### 4. **Streaming Flow**

```
ChatInput.tsx
  ↓ (user submits query)
ChatPage.tsx
  ↓ (adds placeholder message)
useStream.ts
  ↓ (calls streamQuery)
query.ts (fetch SSE)
  ↓ (parse events)
  → "retrieving" → update status badge
  → "retrieved" → show chunk count
  → "analyzing" → analyzing message
  → "complete" → render DebugReport
  → "error" → show error toast
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Development Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` with HMR (hot module reloading).

### Build & Production

```bash
npm run build
npm run preview
```

Outputs optimized bundle to `dist/`.

### Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Database: MySQL on 3306
- ChromaDB: on 8001
- Elasticsearch: on 9200

---

## Critical Implementation Details

### ✅ SSE Streaming (Why Native Fetch?)

**axios cannot consume ReadableStream** — it buffers the entire response before resolving.
Use **native fetch** with `response.body.getReader()` for true streaming:

```typescript
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';  // ← Keep incomplete line
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6));
      onEvent(event);
    }
  }
}
```

### ✅ Auth Interceptor (Why `.getState()`?)

**Zustand hooks can't be called outside React components.** Use `.getState()` in interceptors:

```typescript
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.access_token;  // ← getState()
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### ✅ Auto-Scroll with useRef

```typescript
const endRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  endRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

// In JSX:
{messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
<div ref={endRef} />  // ← Scroll anchor
```

### ✅ Textarea Auto-Resize

```typescript
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = Math.min(
      textareaRef.current.scrollHeight,
      120  // max 5 rows
    ) + 'px';
  }
}, [query]);
```

### ✅ Collapsible Evidence

Evidence blocks in `DebugReport.tsx` default to collapsed state to prevent UI overwhelming:

```typescript
const [expandedEvidenceIndex, setExpandedEvidenceIndex] = useState<number | null>(null);

// Only expand one at a time
const toggleEvidence = (idx) => {
  setExpandedEvidenceIndex(expandedEvidenceIndex === idx ? null : idx);
};
```

### ✅ Dark Mode (Tailwind `class` Strategy)

**Must use `class` strategy**, not `media` — allows user toggle:

```javascript
// tailwind.config.js
darkMode: 'class'

// In SettingsPage.tsx
const toggleTheme = () => {
  document.documentElement.classList.add('dark');  // ← Add class to root
  localStorage.setItem('coderag_dark_mode', 'true');
};

// Use `dark:` utilities
<div className="bg-white dark:bg-gray-800">
```

### ✅ SPA Routing (nginx `try_files`)

**Without this, refreshing on `/dashboard` gives 404:**

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  
  location / {
    try_files $uri $uri/ /index.html;  # ← Route all to index.html
  }
}
```

### ✅ Multi-Stage Docker Build

Reduces final image from ~1.5GB (node:20) to ~50MB (nginx):

```dockerfile
FROM node:20-alpine AS builder
RUN npm ci && npm run build
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

## TypeScript Types

All types defined in `src/types/index.ts` — never inline in components:

```typescript
export interface DebugResult {
  root_cause: string | null;
  suggested_fix: string | null;
  evidence: EvidenceItem[];
  confidence: number;
  iterations: number;
  hypothesis_chain: string[];
  session_id: number;
}

export interface StreamEvent {
  status: "retrieving" | "retrieved" | "analyzing" | "complete" | "error";
  message?: string;
  chunks?: number;
  result?: DebugResult;
}
```

---

## Manual Testing Checklist

### 1. Authentication ✅

**Test Register:**
- [ ] Navigate to `/register`
- [ ] Enter email, password (8+ chars), confirm password
- [ ] Click Register → redirects to `/chat`
- [ ] User info appears in navbar

**Test Login:**
- [ ] Logout
- [ ] Navigate to `/login`
- [ ] Enter credentials
- [ ] Click Login → redirects to `/chat`

**Test 401 Handling:**
- [ ] Invalidate token manually (edit store)
- [ ] Make a query
- [ ] Should redirect to `/login` automatically

### 2. Chat Interface ✅

**Setup:**
- [ ] Go to Settings, ingest a repository
- [ ] Verify repo appears in dropdown on Chat page

**Test Streaming:**
- [ ] Type a debugging question
- [ ] Click Send (or Ctrl+Enter on Mac, Cmd+Enter on Linux)
- [ ] Observe status messages: "Fetching...", "Analyzing...", "Complete"
- [ ] Result renders with root cause, evidence, fix

**Test Evidence Expansion:**
- [ ] Result shows multiple evidence files
- [ ] Click evidence filename → expands code block
- [ ] Click again → collapses
- [ ] Click copy button → "Copied!" appears

**Test Confidence Badge:**
- [ ] High confidence (>80%) → green
- [ ] Medium confidence (60-79%) → yellow
- [ ] Low confidence (<60%) → red

### 3. Dashboard ✅

**Test Session List:**
- [ ] Navigate to Dashboard
- [ ] See all past queries
- [ ] Search for a keyword → filters list
- [ ] Pagination works if >10 items

**Test Session Loading:**
- [ ] Click a session card
- [ ] Redirects to `/chat?session={id}`
- [ ] Chat loads with that query & result

**Test Delete:**
- [ ] Click Delete on a session
- [ ] Confirm dialog
- [ ] Session removed from list

### 4. Settings ✅

**Test Repository Ingestion:**
- [ ] Enter GitHub URL: `https://github.com/owner/repo`
- [ ] Enter Repo ID: `my-project`
- [ ] Click Ingest
- [ ] Toast: "Repository ingested successfully"
- [ ] Repo appears in list

**Test Repository Removal:**
- [ ] Click trash icon on a repo
- [ ] Repo removed from list

**Test Theme Toggle:**
- [ ] Click dark/light toggle
- [ ] Entire app switches theme
- [ ] Refresh page → theme persists

### 5. Responsive Design ✅

**Mobile (320px width):**
- [ ] Hamburger menu appears
- [ ] Click hamburger → sidebar slides in
- [ ] Click nav item → sidebar closes
- [ ] Click overlay → sidebar closes

**Tablet (768px):**
- [ ] Sidebar always visible
- [ ] Hamburger hidden
- [ ] Layout adapts

**Desktop (1024px+):**
- [ ] Full sidebar + main content
- [ ] All components responsive

### 6. Error Handling ✅

**Test API Errors:**
- [ ] Try to query without a repo selected → error toast
- [ ] Send invalid query → error toast with message
- [ ] Send request with bad token → auto-redirect to login

**Test Network Errors:**
- [ ] Stop backend server
- [ ] Try to make query → error message shown
- [ ] Restart backend → queries work again

---

## Environment Variables

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:8000
```

**Docker Compose:**
```yaml
frontend:
  environment:
    - VITE_API_URL=http://localhost:8000
```

For production, replace with your backend URL:
```env
VITE_API_URL=https://api.example.com
```

---

## Browser DevTools

### Network Tab Insights

**Login Flow:**
```
POST /auth/login → 200 OK
{access_token, token_type, user_id, email}
```

**Query Stream:**
```
POST /query → 200 OK (Content-Type: text/event-stream)
data: {"status":"retrieving"}
data: {"status":"retrieved","chunks":5}
data: {"status":"analyzing"}
data: {"status":"complete","result":{...}}
```

**History:**
```
GET /history?page=1&page_size=10 → 200 OK
{items: [...], total: 47, page: 1, page_size: 10}
```

---

## Performance Optimizations

1. **Code Splitting**: Vite auto-chunks by route
2. **Cache Busting**: Assets in `nginx.conf` cached for 1 year
3. **React Query**: 30s stale time for history
4. **Lazy Evidence**: Collapsed by default (DOM reduction)
5. **Textarea Debounce**: Auto-resize on input (efficient re-renders)

---

## Deployment Checklist

**Before Push to Production:**

- [ ] Set `VITE_API_URL` to production backend
- [ ] Update nginx.conf proxy_pass to prod backend
- [ ] Remove `volumes: ./backend:/app` from docker-compose
- [ ] Set `restart: always` for services
- [ ] Add HTTPS + SSL certificates
- [ ] Set environment variables in CI/CD
- [ ] Run `npm run build` locally to test
- [ ] Test all auth flows with new URLs
- [ ] Monitor logs for errors: `docker logs -f coderag-frontend`

---

## Troubleshooting

### "Failed to fetch" on queries

**Cause**: Backend unreachable
**Fix**: Check `VITE_API_URL` environment variable, ensure backend is running

### Streaming stops midway

**Cause**: Connection timeout or proxy misconfiguration
**Fix**: Check nginx `proxy_read_timeout`, increase if >30s queries

### Dark mode not applying

**Cause**: `darkMode: 'class'` not set in config
**Fix**: Verify `tailwind.config.js` has `darkMode: 'class'`

### Sidebar overflow on mobile

**Cause**: Mobile viewport too small
**Fix**: Uses Tailwind breakpoints, should auto-adjust

### "Invalid token" after refresh

**Cause**: No localStorage persistence (by design)
**Fix**: Users must re-login after page refresh

---

## Next Steps (Future Phases)

1. **WebSocket Chat**: Replace SSE with full WS for bidirectional communication
2. **Collaborative Sessions**: Multiple users debugging same repo
3. **Custom Agents**: User-defined reasoning logic
4. **File Upload**: Direct code input without GitHub
5. **Mobile App**: React Native version
6. **Analytics**: Track query patterns, success rates
7. **API Documentation**: OpenAPI/Swagger integration

---

## Quick Reference Commands

```bash
# Development
npm run dev                # Start dev server on :5173
npm run build              # Production build
npm run preview            # Preview production build

# Docker
docker compose up --build  # Full stack
docker compose down        # Stop all services
docker logs -f frontend    # Stream frontend logs

# Cleanup
rm -rf node_modules
npm ci                     # Clean install from package-lock.json
```

---

Generated: **April 15, 2026**  
Framework: **React 18 + TypeScript + Tailwind CSS + Vite**  
API: **FastAPI Backend (Phase 1-4)**  
Deployment: **Docker + nginx**
