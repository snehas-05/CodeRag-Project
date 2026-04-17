# CodeRAG 2026

Next-generation AI-powered codebase intelligence. CodeRAG uses zero-trust workload identity to securely analyze your repositories and solve complex bugs in seconds.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` with your actual API endpoint.*

### Development

Run the local development server:
```bash
npm run dev
```

### Production

Build for production:
```bash
npm run build
```

The output will be in the `dist` folder.

## 📁 Project Structure

```text
src/
├── api/            # Axios client, auth, query, and history services
├── components/     # UI, Layout, and Chat-specific components
├── hooks/          # Custom React & React Query hooks (useStream, useHistory)
├── pages/          # Application views (Auth, Chat, Dashboard, Settings)
├── store/          # Zustand state management (authStore)
├── App.tsx         # Main routing and layout integration
├── main.tsx        # Application entry point
└── index.css       # Tailwind directives and global theme tokens
```

## 🛠 Tech Stack

- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Data Fetching:** React Query & Axios
- **Streaming:** Native Fetch + SSE
- **Icons:** Lucide React
- **Auth:** JWT + Multi-tenant Workload Identity
