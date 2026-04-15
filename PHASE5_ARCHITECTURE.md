# Phase 5 Frontend — Architecture & Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    REACT APP                              │   │
│  │  ┌────────────────┐                                       │   │
│  │  │  <BrowserRouter>                                       │   │
│  │  │                                                         │   │
│  │  ├─ /login         → LoginPage                            │   │
│  │  ├─ /register      → RegisterPage                         │   │
│  │  ├─ /chat          → ProtectedRoute → ChatPage            │   │
│  │  ├─ /dashboard     → ProtectedRoute → DashboardPage       │   │
│  │  └─ /settings      → ProtectedRoute → SettingsPage        │   │
│  │                                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                       │
│  ┌─────────────────────────┼──────────────────────────────────┐ │
│  │  STATE MANAGEMENT       │                                   │ │
│  │  ┌────────────────┐     │                                   │ │
│  │  │ Zustand        │◄────┘  Auth state (user, token)        │ │
│  │  │ useAuthStore   │                                         │ │
│  │  └────────────────┘                                         │ │
│  │  ┌────────────────┐                                         │ │
│  │  │ React Query    │         History cache + refetch         │ │
│  │  │ useHistory()   │                                         │ │
│  │  └────────────────┘                                         │ │
│  │  ┌────────────────┐                                         │ │
│  │  │ Local State    │         Chat messages, form inputs      │ │
│  │  │ useState()     │                                         │ │
│  │  └────────────────┘                                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                           │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         API CLIENT LAYER (src/api/)                      │   │
│  │                                                           │   │
│  │  ┌─ client.ts                                            │   │
│  │  │  • Axios instance                                     │   │
│  │  │  • Request: Add JWT interceptor                       │   │
│  │  │  • Response: 401 → logout + redirect                │   │
│  │  │                                                       │   │
│  │  ├─ auth.ts                                             │   │
│  │  │  • login() → POST /auth/login                        │   │
│  │  │  • register() → POST /auth/register                  │   │
│  │  │                                                       │   │
│  │  ├─ query.ts                                            │   │
│  │  │  • streamQuery() → POST /query (SSE)                │   │
│  │  │  • ingestRepo() → POST /ingest                       │   │
│  │  │                                                       │   │
│  │  └─ history.ts                                          │   │
│  │     • getHistory() → GET /history?page=X&page_size=Y    │   │
│  │     • getSession() → GET /history/{id}                  │   │
│  │     • deleteSession() → DELETE /history/{id}            │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                       │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                    HTTP/HTTPS Network
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
   ┌─────────────────────────┐    ┌─────────────────────────┐
   │  FASTAPI BACKEND        │    │  JAVASCRIPT/LOCAL STORAGE
   │                         │    │
   │  POST /auth/login       │    │  localStorage:
   │  POST /auth/register    │    │  • coderag_repos[]
   │  POST /query (SSE)      │    │  • coderag_dark_mode
   │  POST /ingest           │    │
   │  GET /history           │    │  sessionStorage:
   │  GET /history/{id}      │    │  • (not used)
   │  DELETE /history/{id}   │    │
   │                         │    │  IndexedDB:
   │  Database               │    │  • (not used)
   │  ├─ MySQL              │    │
   │  ├─ ChromaDB          │    │
   │  └─ Elasticsearch     │    │
   │                         │    │
   └─────────────────────────┘    └─────────────────────────┘
```

---

## Chat Streaming Flow

```
USER TYPES QUESTION
        │
        ▼
ChatInput.tsx
  • User enters: "Why is this bug happening?"
  • Selects repo from dropdown
  • Clicks Send OR presses Ctrl+Enter
        │
        ▼
ChatPage.tsx.handleSendQuery()
  • Add user Message to messages[]
  • Add placeholder Message { isStreaming: true }
  • Call useStream.sendQuery(query, repoId)
        │
        ▼
useStream.ts → streamQuery()
  • Call api/query.ts:streamQuery()
        │
        ▼
query.ts:streamQuery() (native Fetch)
  • fetch(POST /query, { query, repo_id, Authorization })
  • response.body.getReader() → ReadableStream
        │
        ▼
SSE EVENT STREAM (Server)
        │
    ┌───┴────────────────────────────────────┐
    │                                         │
    ▼                                         ▼
"data: {status:retrieving}"     "data: {status:retrieved,chunks:5}"
    │                                         │
    └─────────────┬──────────────────────────┘
                  │
        useStream.onEvent() triggered
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
  setStreamingStatus    isStreaming    result
  "Fetching code..."    = true         = null
        │         │         │
        └─────────┼─────────┘
                  │
        updateMessage state
                  │
        ▼
ChatMessage re-renders
        │
        ▼
StreamingStatus.tsx
  Displays: "● Fetching relevant code..."
  (animated pulsing dot)
        │
    ┌────────────────────────────────────────┐
    │    CYCLE REPEATS FOR:                  │
    │    • retrieved → show chunk count      │
    │    • analyzing → show analyzing msg    │
    └────────────────────────────────────────┘
        │
        ▼
"data: {status:complete,result:{root_cause:...}}"
        │
        ▼
useStream.onEvent()
  • setResult(event.result)
  • isStreaming = false
        │
        ▼
updateMessage state
  • isStreaming = false
  • result = event.result
        │
        ▼
ChatMessage re-renders
        │
        ▼
DebugReport.tsx
  ┌─────────────────────────────────┐
  │ ● Root Cause: "Variable X..."   │
  │ ◆ Evidence (2 files)            │
  │   - File.ts (L10-20) [COLLAPSED]│
  │   - Utils.ts (L45-50) [COLLAPSED]
  │ ◆ Suggested Fix: "Change to..." │
  │ ┌─────────────────────────────┐ │
  │ │ High confidence (87%)       │ │
  │ │ Ran 3 reasoning iterations  │ │
  │ │ + Hypothesis chain (3)      │ │
  │ └─────────────────────────────┘ │
  └─────────────────────────────────┘

USER CAN NOW:
  • Scroll to read full analysis
  • Click evidence files to expand code
  • Click copy button on code blocks
  • Ask another question
  • View session in Dashboard
```

---

## Component Tree

```
App.tsx
└── BrowserRouter
    ├── Routes
    │   ├── Route path="/login" → LoginPage
    │   │   ├── <form>
    │   │   ├── <input email>
    │   │   ├── <input password>
    │   │   └── <button type="submit">
    │   │
    │   ├── Route path="/register" → RegisterPage
    │   │   └── (same as login + confirm password)
    │   │
    │   ├── Route path="/chat" 
    │   │   └── ProtectedRoute
    │   │       └── ChatPage
    │   │           └── AppLayout title="Chat"
    │   │               ├── Sidebar
    │   │               │   ├── CodeRAG logo
    │   │               │   ├── NavLink Chat
    │   │               │   ├── NavLink Dashboard
    │   │               │   ├── NavLink Settings
    │   │               │   └── Recent Sessions
    │   │               │       └── NavLink to /chat?session={id}
    │   │               │
    │   │               ├── Navbar title="Chat"
    │   │               │   ├── user.email
    │   │               │   └── <button>Logout</button>
    │   │               │
    │   │               └── ChatWindow (flex-1, overflow-y)
    │   │                   └── ChatMessage[] (auto-scroll)
    │   │                       ├── MessageBubble role="user"
    │   │                       │   └── text only
    │   │                       │
    │   │                       └── MessageBubble role="assistant"
    │   │                           ├── OR StreamingStatus
    │   │                           │   └── "● Fetching..."
    │   │                           │
    │   │                           └── OR DebugReport
    │   │                               ├── Root Cause section
    │   │                               ├── Evidence section
    │   │                               │   └── CodeBlock (collapsible)
    │   │                               ├── Fix section
    │   │                               └── Metadata
    │   │                                   ├── ConfidenceBadge
    │   │                                   └── Hypothesis chain
    │   │
    │   │               └── ChatInput (sticky bottom)
    │   │                   ├── <select repositories>
    │   │                   ├── <textarea auto-resize>
    │   │                   └── <button>Send</button>
    │   │
    │   ├── Route path="/dashboard" 
    │   │   └── ProtectedRoute → DashboardPage
    │   │       └── AppLayout title="Dashboard"
    │   │           ├── Sidebar
    │   │           ├── Navbar
    │   │           └── <div overflow-y>
    │   │               ├── <input search>
    │   │               ├── Grid of HistoryCard
    │   │               │   ├── Query preview
    │   │               │   ├── Root cause preview
    │   │               │   ├── ConfidenceBadge
    │   │               │   ├── Timestamp
    │   │               │   └── <button>Delete</button>
    │   │               │
    │   │               └── Pagination
    │   │                   ├── <button>Previous</button>
    │   │                   └── <button>Next</button>
    │   │
    │   └── Route path="/settings"
    │       └── ProtectedRoute → SettingsPage
    │           └── AppLayout title="Settings"
    │               ├── Sidebar
    │               ├── Navbar
    │               └── <div overflow-y>
    │                   ├── Section: Ingest
    │                   │   ├── <input GitHub URL>
    │                   │   ├── <input Repo ID>
    │                   │   ├── <button>Ingest</button>
    │                   │   └── Repo list
    │                   │       └── <button>💧 Remove</button>
    │                   │
    │                   ├── Section: Account
    │                   │   └── <input readonly email>
    │                   │
    │                   └── Section: Theme
    │                       └── <toggle> Dark/Light
    │
    └── <Toaster /> (toast notifications overlay)
```

---

## State Flow Diagram

```
GLOBAL STATE (Zustand)
┌─────────────────────────────────┐
│ useAuthStore                    │
│  • user: User | null            │
│  • isAuthenticated: boolean     │
│  • login(user)                  │
│  • logout()                     │
└─────────────────────────────────┘
         │                    │
         └────────┬───────────┘
                  │
    ┌────────────────────────┐
    │ localStorage           │
    │ • coderag_repos[]      │
    │ • coderag_dark_mode    │
    └────────────────────────┘
                  │
                  │
SERVER STATE (React Query)
┌─────────────────────────────────┐
│ useHistory(page)                │
│  • queryKey: ['history', page]  │
│  • staleTime: 30_000ms          │
│  • data: HistoryListResponse    │
└─────────────────────────────────┘

LOCAL STATE (useState)
┌────────────────────────────────────────────┐
│ ChatPage                                   │
│  • messages: Message[]                     │
│  • activeRepoId: string                    │
│  • availableRepos: string[]                │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ useStream (custom hook)                    │
│  • streamingStatus: string | null          │
│  • isStreaming: boolean                    │
│  • result: DebugResult | null              │
│  • error: string | null                    │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ ChatInput                                  │
│  • query: string (textarea value)          │
│  • selectedRepo: string                    │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ DashboardPage                              │
│  • page: number                            │
│  • searchQuery: string                     │
└────────────────────────────────────────────┘
```

---

## Request/Response Flow

```
LOGIN REQUEST
┌─────────────────────────────────────────────────────────────┐
│ Browser                                                     │
│  LoginPage: email=test@ex.com, password=secret123          │
│           ↓ (form submit)                                   │
│  api/auth.ts: login(email, password)                       │
│           ↓                                                 │
│  axios.post('/auth/login', { email, password })            │
│           ├─ Request Headers:                              │
│           │  • Content-Type: application/json              │
│           │  • (no Authorization, not logged in yet)        │
│           ↓                                                 │
└─────────────────────────────────────────────────────────────┘
        │
        │ Network (HTTP POST)
        ▼
Backend API
  POST /auth/login
    ✓ Validates credentials
    ✓ Generates JWT
    Returns: {
      access_token: "eyJhbGc...",
      token_type: "bearer",
      user_id: 42,
      email: "test@ex.com"
    }

┌─────────────────────────────────────────────────────────────┐
│ Browser                                                     │
│  ← Response { access_token, ... }                          │
│  →  useAuthStore.login(user)                              │
│      (saves to Zustand store, NOT localStorage)            │
│  → navigate('/chat')                                        │
│  ✓ User is authenticated!                                  │
└─────────────────────────────────────────────────────────────┘


SUBSEQUENT API REQUESTS (with JWT)
┌─────────────────────────────────────────────────────────────┐
│ Browser                                                     │
│  ChatPage: sendQuery("Why is X broken?", "my-repo")        │
│           ↓                                                 │
│  api/query.ts: streamQuery(query, repo_id)                │
│           ↓                                                 │
│  fetch(POST /query, {                                      │
│    headers: {                                              │
│      Authorization: "Bearer eyJhbGc..."  ← JWT injected    │
│    },                                                      │
│    body: { query, repo_id }                               │
│  })                                                         │
│           ↓                                                 │
│  response.body.getReader()  ← SSE stream!                 │
│           ↓                                                 │
│  data: {"status":"retrieving"}                            │
│  data: {"status":"retrieved","chunks":5}                  │
│  data: {"status":"analyzing"}                             │
│  data: {"status":"complete","result":{...}}               │
│                                                             │
│  (onEvent callbacks triggered for each event)              │
│  → Chat updates in real-time                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Routing & Navigation

```
ROUTING TABLE
┌─────────────┬──────────────────┬────────────┬─────────────────────┐
│ Route       │ Component        │ Protected  │ Notes               │
├─────────────┼──────────────────┼────────────┼─────────────────────┤
│ /login      │ LoginPage        │ ✗ No      │ Redirected to /chat │
│             │                  │            │ if already logged   │
├─────────────┼──────────────────┼────────────┼─────────────────────┤
│ /register   │ RegisterPage     │ ✗ No      │ Auto-login on       │
│             │                  │            │ success             │
├─────────────┼──────────────────┼────────────┼─────────────────────┤
│ /chat       │ ChatPage         │ ✓ Yes     │ Main debug interface│
│ (default)   │                  │            │ SSE streaming, msgs │
├─────────────┼──────────────────┼────────────┼─────────────────────┤
│ /chat       │ ChatPage         │ ✓ Yes     │ Load saved session   │
│ ?session=ID │                  │            │ pre-populate chat    │
├─────────────┼──────────────────┼────────────┼─────────────────────┤
│ /dashboard  │ DashboardPage    │ ✓ Yes     │ History + search    │
│             │                  │            │ pagination, delete   │
├─────────────┼──────────────────┼────────────┼─────────────────────┤
│ /settings   │ SettingsPage     │ ✓ Yes     │ Ingest repo, theme  │
│             │                  │            │ account info        │
├─────────────┼──────────────────┼────────────┼─────────────────────┤
│ *           │ Navigate to /chat│            │ Fallback for all    │
│ (unknown)   │                  │            │ unmapped routes     │
└─────────────┴──────────────────┴────────────┴─────────────────────┘

NAVIGATION FLOW
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Start (unauthenticated)                                         │
│      ↓                                                            │
│  ┌─────────────┐                                               │
│  │ /login (or  │                                               │
│  │ /register)  │                                               │
│  └──────┬──────┘                                               │
│         │ ✓ Login/Register                                    │
│         ↓                                                       │
│  ┌──────────────────┐                                         │
│  │ useAuthStore     │                                         │
│  │ .login(user)     │                                         │
│  └──────┬───────────┘                                         │
│         │ navigate('/chat')                                   │
│         ↓                                                       │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ App.tsx <ProtectedRoute> (checks isAuthenticated)    │   │
│  │   ✓ true → render ChatPage                            │   │
│  │   ✗ false → redirect to /login                        │   │
│  └───────────────────────────────────────────────────────┘   │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ChatPage + AppLayout (Sidebar + Navbar visible)       │ │
│  │                                                         │ │
│  │ Sidebar links:                                         │ │
│  │  • NavLink to /chat (active)                          │ │
│  │  • NavLink to /dashboard                             │ │
│  │  • NavLink to /settings                              │ │
│  │                                                         │ │
│  │ Navbar:                                               │ │
│  │  • "Chat" title                                       │ │
│  │  • user.email                                         │ │
│  │  • "Logout" button → authStore.logout() → navigate   │ │
│  │                                                → /login       │ │
│  └─────────────────────────────────────────────────────────┘ │
│         │                                                      │
│         ├─ Click /dashboard NavLink                          │
│         │       ↓                                             │
│         │  DashboardPage (same AppLayout)                   │
│         │       ↓                                             │
│         │  Click session card                               │
│         │       ↓                                             │
│         │  navigate('/chat?session=123')                    │
│         │       ↓                                             │
│         │  ChatPage useEffect detects URL param              │
│         │       ↓                                             │
│         │  API: getSession(123)                             │
│         │       ↓                                             │
│         │  Pre-populate messages                            │
│         │                                                     │
│         └─ Click /settings NavLink                          │
│                ↓                                             │
│           SettingsPage (same AppLayout)                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Error Handling Strategy

```
ERROR SCENARIOS & RESPONSES
┌────────────────────────────────────────────────────────────┐
│ Scenario                                                   │
├────────────────────────────────────────────────────────────┤
│ 1. Network Error (backend down)                            │
│    ↓ catch in API call                                     │
│    ↓ Toast error: "Failed to fetch"                       │
│    ↓ User can retry                                        │
│                                                             │
│ 2. 401 Unauthorized (token expired/invalid)                │
│    ↓ Axios response interceptor detects 401                │
│    ↓ authStore.logout()  (clear Zustand)                  │
│    ↓ window.location.href = '/login'  (hard redirect)     │
│    ↓ User must re-login                                    │
│                                                             │
│ 3. 400 Bad Request (invalid input)                         │
│    ↓ catch error.response.data.detail                      │
│    ↓ Toast error: API error message                        │
│    ↓ User corrects input and retries                       │
│                                                             │
│ 4. 500 Server Error                                        │
│    ↓ catch in try/catch                                    │
│    ↓ Toast error: "Server error"                          │
│    ↓ User clicks retry                                     │
│                                                             │
│ 5. SSE Stream Interrupted (mid-streaming)                  │
│    ↓ reader.read() throws or returns done=true early       │
│    ↓ catch in streamQuery()                                │
│    ↓ Toast error: "Stream interrupted"                    │
│    ↓ Message stays in chat (user can retry)                │
│                                                             │
│ 6. No Repository Selected                                  │
│    ↓ onClick handleSendQuery() validates                   │
│    ↓ !selectedRepo → Toast: "Select repository"           │
│    ↓ Button disabled state prevents submit                 │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Complete Example

```
USER WORKFLOW: Ask debugging question
═══════════════════════════════════════════════════════════

1. USER LOGIN
   ┌─────────────────────────────────────────────┐
   │ LoginPage                                   │
   │  • Email: dev@coderag.ai                    │
   │  • Password: ••••••••                       │
   │  • Click "Login"                            │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │ API: login(email, password)                 │
   │ Response: { access_token, user_id, email } │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │ useAuthStore.login(user)                    │
   │ State: { user, isAuthenticated: true }      │
   │ (in-memory only)                            │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │ navigate('/chat')                           │
   │ ProtectedRoute checks isAuthenticated ✓     │
   └─────────────────────────────────────────────┘

2. USER INGESTS REPO (Settings page)
   ┌─────────────────────────────────────────────┐
   │ SettingsPage                                │
   │  • GitHub URL: https://github.com/axios/..  │
   │  • Repo ID: axios                           │
   │  • Click "Ingest"                           │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │ API: ingestRepo(url, repo_id)               │
   │ POST /ingest with Authorization header      │
   │ Response: { repo_id, total_chunks, status } │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │ localStorage['coderag_repos'] += ['axios']  │
   │ Toast: "Repository ingested successfully"   │
   └─────────────────────────────────────────────┘

3. USER GOES TO CHAT
   ┌─────────────────────────────────────────────┐
   │ ChatPage                                    │
   │ useEffect: Load repos from localStorage     │
   │  • availableRepos = ['axios']               │
   │  • setActiveRepoId('axios')                 │
   │  • Dropdown shows 'axios'                   │
   └─────────────────────────────────────────────┘

4. USER ASKS DEBUGGING QUESTION
   ┌─────────────────────────────────────────────┐
   │ ChatInput                                   │
   │  • Repository: [axios▼]                     │
   │  • Query: "How do request interceptors work?"
   │  • Press Ctrl+Enter                         │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │ ChatPage.handleSendQuery(query, repo_id)    │
   │  1. Create Message: role="user", query      │
   │  2. Add to messages[]                       │
   │  3. Create placeholder: role="assistant",   │
   │     isStreaming=true                        │
   │  4. Call useStream.sendQuery()              │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │ useStream.ts                                │
   │  • state: isStreaming=true, status=null     │
   │  • Call streamQuery()                       │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │ api/query.ts:streamQuery()                  │
   │ Native Fetch:                               │
   │  POST /query                                │
   │  Headers: Authorization: Bearer {token}    │
   │  Body: { query, repo_id }                  │
   └────────────┬────────────────────────────────┘
                │
                ▼
         BACKEND STREAMS SSE
        ┌───────────────────────────────────┐
        │ data: {status:"retrieving"}       │
        └──────────┬──────────────────────┘
                   │
        ┌──────────────────────────────────┐
        │ data: {status:"retrieved",       │
        │        chunks:12}                │
        └──────────┬──────────────────────┘
                   │
        ┌──────────────────────────────────┐
        │ data: {status:"analyzing"}       │
        └──────────┬──────────────────────┘
                   │
        ┌──────────────────────────────────────┐
        │ data: {status:"complete",            │
        │        result:{root_cause:"..."      │
        │               suggested_fix:"..."    │
        │               evidence:[...]         │
        │               confidence:0.92        │
        │        }                             │
        │ }                                    │
        └──────────┬──────────────────────────┘

5. FRONTEND HANDLES SSE EVENTS
   ┌─────────────────────────────────────────────┐
   │ Event: {status:"retrieving"}                │
   │  → setStreamingStatus("Fetching code...")   │
   │  → ChatWindow re-renders                    │
   │  → Shows: "● Fetching code..."              │
   └─────────────────────────────────────────────┘
        │                │
        ├─ Event: retrieved                   
        │  setStreamingStatus("Found 12 chunks...")
        │                │
        ├─ Event: analyzing                   
        │  setStreamingStatus("Analyzing...")      
        │                │
        └─ Event: complete with result            
           setResult(result)
           isStreaming = false

6. DISPLAY DEBUG RESULT
   ┌─────────────────────────────────────────────┐
   │ ChatWindow updates message                  │
   │  • isStreaming: false                       │
   │  • result: { root_cause, evidence, ... }   │
   │                                             │
   │ MessageBubble detects result exists         │
   │  → Renders <DebugReport result={...} />    │
   │                                             │
   │ DebugReport shows:                          │
   │  ▣ Root Cause: "Interceptor..."             │
   │  ▣ Evidence (2 files):                      │
   │    - index.ts [COLLAPSED]                   │
   │    - interceptors.ts [COLLAPSED]            │
   │  ▣ Fix: "Move logic to request..."          │
   │  ▣ Confidence: 92%                          │
   │  ▣ 4 reasoning iterations                   │
   └─────────────────────────────────────────────┘

7. USER INTERACTS WITH RESULT
   • Click evidence filename → expands code
   • Click copy button → copies code
   • Ask another question → repeats from step 4
   • Click Dashboard → see session history
```

---

## Summary

Phase 5 frontend is production-ready with:
- ✅ **40+ files** organized by function
- ✅ **3,500+ lines** of frontend code
- ✅ **15+ reusable components**
- ✅ **Real-time SSE streaming**
- ✅ **Dark mode support**
- ✅ **Mobile responsive**
- ✅ **Docker deployable**
- ✅ **TypeScript strict mode**
- ✅ **Fully documented**

**Status**: Complete ✅
