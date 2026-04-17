```markdown
<div align="center">

<img src="https://img.shields.io/badge/CodeRAG-AI%20Powered-blueviolet?style=for-the-badge&logo=openai&logoColor=white" alt="CodeRAG" />

# CodeRAG

### Debug Smarter. Understand Faster. Build Better.

**An AI-powered repository intelligence platform that transforms any GitHub codebase into a searchable, queryable knowledge base — powered by RAG, LangGraph, and Gemini.**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## The Problem

Large codebases are black boxes. You join a new team, inherit a legacy project, or debug a production issue — and you're lost in hundreds of files with no map.

**CodeRAG changes that.** Point it at any GitHub repository, and it becomes a living, queryable intelligence layer. Ask it anything. Get precise, context-aware answers with source references — in real time.

---

## What You Can Do

```
"Explain this repository's architecture"
"Which files handle authentication?"
"Why is the payment module failing?"
"What database ORM does this project use?"
"Trace the request lifecycle from API to DB"
```

---

## Feature Overview

| Category | Features |
|---|---|
| **Repository Ingestion** | Clone & index any public GitHub repo, chunking + vector embedding pipeline |
| **AI Debugger** | Natural language queries, root cause analysis, architecture explanation |
| **Search** | Hybrid search: vector similarity (ChromaDB) + keyword (Elasticsearch) |
| **Streaming** | Real-time token-by-token response streaming |
| **Analytics** | Session history, query logs, confidence scoring reports |
| **Auth** | JWT-based registration, login, protected routes |
| **UI** | Premium dark dashboard, responsive, modern design |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub Repository                    │
└────────────────────────┬────────────────────────────────┘
                         │ Ingestion
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Chunking + Embedding Pipeline               │
│         (Sentence Transformers / LangChain)              │
└───────────┬──────────────────────────┬──────────────────┘
            │                          │
            ▼                          ▼
   ┌─────────────────┐       ┌──────────────────┐
   │    ChromaDB     │       │  Elasticsearch   │
   │ Vector Storage  │       │   Code Search    │
   └────────┬────────┘       └────────┬─────────┘
            │                         │
            └───────────┬─────────────┘
                        │ Hybrid Retrieval
                        ▼
          ┌─────────────────────────┐
          │  FastAPI + LangGraph    │
          │   Reasoning Workflow    │
          └────────────┬────────────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │     Google Gemini       │
          │    LLM Reasoning        │
          └────────────┬────────────┘
                       │ Streaming Response
                       ▼
          ┌─────────────────────────┐
          │    React Frontend       │
          │   (Real-time Output)    │
          └─────────────────────────┘
```

---

## Tech Stack

### Frontend
- **React.js** + **TypeScript** — component-driven UI
- **Tailwind CSS** — utility-first styling
- **Zustand** — lightweight state management
- **Vite** — fast dev server & bundler

### Backend
- **FastAPI** — high-performance async API
- **LangGraph** — agentic reasoning workflows
- **LangChain** — LLM orchestration layer
- **Uvicorn** — ASGI server

### Databases & Search
- **MySQL** — user accounts, sessions, query history
- **ChromaDB** — vector embeddings for semantic search
- **Elasticsearch** — full-text code indexing & retrieval

### AI / LLM
- **Google Gemini API** — reasoning & response generation
- **Sentence Transformers** — local embedding models

### DevOps
- **Docker Compose** — one-command infrastructure setup

---

## Project Structure

```
CodeRAG/
├── backend/
│   ├── app/
│   │   ├── api/           # Route handlers
│   │   ├── core/          # Auth, config, security
│   │   ├── models/        # DB models
│   │   ├── services/      # Business logic
│   │   │   ├── ingestion/ # Repo cloning & chunking
│   │   │   ├── retrieval/ # ChromaDB + ES hybrid search
│   │   │   └── reasoning/ # LangGraph + Gemini workflows
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Dashboard, Debugger, Settings
│   │   ├── store/         # Zustand state
│   │   └── api/           # API client
│   ├── package.json
│   └── vite.config.ts
│
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

Make sure the following are installed on your machine:

- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

---

### Step 1 — Start Infrastructure

Spin up MySQL, ChromaDB, and Elasticsearch with a single command:

```bash
docker compose up mysql chromadb elasticsearch
```

| Service | Port |
|---|---|
| MySQL | `3307` |
| ChromaDB | `8001` |
| Elasticsearch | `9200` |

---

### Step 2 — Configure Environment

Create a `.env` file inside the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_jwt_secret_key

MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DB=coderag
```

> Get your Gemini API key at [aistudio.google.com](https://aistudio.google.com)

---

### Step 3 — Run the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows
# source .venv/bin/activate        # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

---

### Step 4 — Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173`

---

## Usage Guide

### 1. Register & Login
Create an account and sign in to access your personal workspace.

### 2. Ingest a Repository
Navigate to **Settings → Repository Command Center**.

```
Repository URL:      https://github.com/username/repo-name
Context Identifier:  my-project
```

Click **Initialize Synchronization** and wait for indexing to complete.

### 3. Query the Debugger
Go to the **AI Debugger** workspace and start asking:

```
> Explain the overall architecture of this repository
> Which files are responsible for user authentication?
> Why might the payment service be throwing a 500 error?
> What is the data flow from the API layer to the database?
```

Each response includes:
- **Confidence score** — how well the retrieved context matched your query
- **Source references** — which files informed the answer
- **Streaming output** — real-time token-by-token generation

---

## Security

| Feature | Implementation |
|---|---|
| Authentication | JWT (JSON Web Tokens) |
| Route Protection | Token-based middleware |
| Session Handling | Secure persistent sessions |
| API Security | Protected endpoints, CORS configuration |

---

## Roadmap

- [ ] Multi-repository support (query across multiple codebases)
- [ ] GitHub OAuth login
- [ ] Team collaboration & shared workspaces
- [ ] PDF export for debug reports
- [ ] Private repository support via GitHub token
- [ ] AWS / GCP deployment guide
- [ ] Fine-tuned local model support (Ollama / LLaMA)

---

## Contributing

Contributions are welcome and appreciated.

```bash
# Fork → Clone → Branch → Improve → PR
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

Please open an issue first for major changes.

---

## Author

**Sneha Singhania**
B.Tech CSE · AI Builder · Full Stack Developer

---

<div align="center">

If CodeRAG helped you, consider giving it a ⭐ on GitHub — it helps more developers discover the project.

**CodeRAG — where every repository becomes an answered question.**

</div>
```

---
