# CodeRAG Frontend — Phase 5

A complete React + TypeScript frontend for the CodeRAG AI-powered code debugging platform. Provides real-time chat interface, session history, and settings management.

## Quick Start

### Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` with hot module reloading.

### Production Build

```bash
npm run build
npm run preview
```

### Docker

```bash
docker compose up --build
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:8000`.

---

## Features

✅ **Authentication**
- User registration and login with JWT tokens
- Secure password validation (8+ characters)
- Auto-logout on 401 response

✅ **Real-Time Chat**
- Server-Sent Events (SSE) streaming
- Live status indicators: "Fetching...", "Analyzing...", "Complete"
- Syntax-highlighted code blocks with copy button

✅ **Debug Results**
- Root cause analysis display
- Evidence file references with inline code preview
- Suggested fixes with high/medium/low confidence badges
- Collapsible hypothesis chain

✅ **Session Dashboard**
- View all past debugging sessions
- Search by query text
- Pagination support
- Delete sessions

✅ **Repository Management**
- Ingest GitHub repositories
- Select repository for each query
- Remove repositories from list

✅ **Settings**
- Dark/light mode toggle
- Account information
- Repository management
- Persistent theme preference

✅ **Responsive Design**
- Mobile sidebar with hamburger menu
- Tablet-optimized layout
- Desktop full-width view
- Dark mode support throughout

---

## Architecture

### Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with dark mode
- **Routing**: React Router v6
- **State**: Zustand (auth) + React Query (server state)
- **API**: Axios client + native Fetch for SSE
- **UI Components**: lucide-react icons
- **Code Highlighting**: prism-react-renderer
- **Notifications**: react-hot-toast
- **Build**: Vite + TypeScript

### Key Patterns

**State Management:**
- `useAuthStore` (Zustand): JWT token & user info (in-memory only)
- `useHistory()` (React Query): Session data with 30s cache
- Local React state: Chat messages, form inputs

**API Communication:**
- Axios instance with JWT interceptor
- Native Fetch for SSE streaming (axios can't handle streams)
- Automatic 401 redirect to /login

**Component Structure:**
```
App (Router) → ProtectedRoute → AppLayout (Sidebar + Navbar) → Pages
```

---

## Environment Setup

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

For production, replace with your backend URL:
```env
VITE_API_URL=https://api.example.com
```

---

## File Organization

```
src/
├── api/                  # API endpoints
│   ├── client.ts        # Axios + interceptors
│   ├── auth.ts          # Login/register
│   ├── query.ts         # Streaming + ingest
│   └── history.ts       # Sessions
├── store/
│   └── authStore.ts     # Zustand auth
├── hooks/
│   ├── useStream.ts     # SSE consumer
│   └── useHistory.ts    # React Query wrapper
├── components/
│   ├── ui/              # Reusable UI
│   ├── chat/            # Chat components
│   └── layout/          # Page layout
├── pages/               # Route pages
├── types/               # TypeScript interfaces
├── App.tsx              # Router
├── main.tsx             # Entry + React Query setup
└── index.css            # Tailwind + globals
```

---

## Important Implementation Notes

### SSE Streaming

Uses native Fetch API (not axios) because axios buffers entire responses:

```typescript
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';  // Keep incomplete line
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const event = JSON.parse(line.slice(6));
      onEvent(event);
    }
  }
}
```

### Auth Interceptor

Uses `.getState()` (not hook call) because hooks can't be called outside React:

```typescript
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Auto-Scroll

Uses `useRef` to anchor the last message and scroll to it smoothly:

```typescript
const endRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  endRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

### Collapsible Evidence

Evidence blocks default to collapsed to prevent massive UI:

```typescript
const [expandedEvidenceIndex, setExpandedEvidenceIndex] = useState<number | null>(null);
```

### Dark Mode

Uses `darkMode: 'class'` (not 'media') for user toggle:

```javascript
// tailwind.config.js
darkMode: 'class'

// Then use dark: utilities
<div className="bg-white dark:bg-gray-800" />
```

### SPA Routing

nginx must fallback all routes to `/index.html`:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Testing Checklist

### ✅ Authentication
- [ ] Register with valid email/password
- [ ] Auto-login and redirect to /chat
- [ ] Login with existing credentials
- [ ] Logout button works
- [ ] Auto-redirect on 401

### ✅ Chat
- [ ] Select repository from dropdown
- [ ] Type and send query
- [ ] Watch streaming status updates
- [ ] Result displays with evidence
- [ ] Click evidence to expand/collapse code
- [ ] Copy button works on code blocks

### ✅ Dashboard
- [ ] View all past sessions
- [ ] Search filters sessions
- [ ] Pagination works
- [ ] Click session → loads in chat
- [ ] Delete session works

### ✅ Settings
- [ ] Ingest repository with GitHub URL
- [ ] Repo appears in list
- [ ] Remove repo works
- [ ] Toggle dark mode
- [ ] Theme persists after refresh

### ✅ Responsive
- [ ] Hamburger menu on mobile
- [ ] Sidebar collapse/expand
- [ ] Mobile viewport fits
- [ ] Tablet layout adapts
- [ ] Desktop full-featured

---

## Performance

- **Code Splitting**: Vite auto-chunks by route
- **Image Optimization**: Assets cached 1 year in nginx
- **React Query**: 30s cache for history
- **Lazy Collapse**: Evidence blocks collapsed by default
- **Docker**: Multi-stage build reduces image ~97x

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Failed to fetch" on query | Backend unreachable | Check `VITE_API_URL`, start backend |
| Streaming stops | Connection timeout | Check nginx proxy_read_timeout |
| Dark mode broken | Missing `darkMode: 'class'` | Update tailwind.config.js |
| 404 on refresh | No SPA fallback | Verify nginx try_files rule |
| Can't login after refresh | No token storage | Re-login (expected by design) |

---

## Manual Testing Commands

```bash
# Dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Full Docker stack
docker compose up --build

# View frontend logs
docker logs -f coderag-frontend

# View full stack logs
docker compose logs -f
```

---

## Contributing

1. Components must have TypeScript types
2. All types defined in `src/types/index.ts`
3. Use Tailwind utilities, avoid inline styles
4. Test on mobile: `npm run dev`, then visit with phone on network
5. Follow existing code style

---

## License

Part of CodeRAG project. See main README.md.

---

**Ready to use!** Start with `npm install && npm run dev` 🚀
