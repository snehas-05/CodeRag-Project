# CodeRAG — Phase 1: Foundation & Project Setup

## Folder Structure

```
CodeRag-Project/
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI app + /health endpoint + DB init
│   │   ├── config.py            ← pydantic-settings for all env vars
│   │   ├── database.py          ← SQLAlchemy engine, SessionLocal, Base
│   │   ├── models/
│   │   │   ├── __init__.py      ← imports both models for metadata registration
│   │   │   ├── user.py          ← User model (id, email, hashed_password, created_at)
│   │   │   └── query_history.py ← QueryHistory model (id, user_id FK, query, response, created_at)
│   │   ├── routes/
│   │   │   └── __init__.py      ← placeholder for Phase 4
│   │   ├── services/
│   │   │   └── __init__.py      ← placeholder for Phase 2 & 3
│   │   └── utils/
│   │       └── __init__.py      ← placeholder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── .gitkeep                 ← placeholder for Phase 5
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Files Created

| File | Purpose |
|------|---------|
| [docker-compose.yml](file:///d:/Code/CodeRag-Project/docker-compose.yml) | 4 services: MySQL 8.0, ChromaDB, Elasticsearch 8.13.0, FastAPI backend — all with health checks |
| [Dockerfile](file:///d:/Code/CodeRag-Project/backend/Dockerfile) | Python 3.11-slim, layer-cached pip install, runs uvicorn on port 8000 |
| [requirements.txt](file:///d:/Code/CodeRag-Project/backend/requirements.txt) | All pinned dependencies (fastapi 0.111.0, sqlalchemy 2.0.30, etc.) |
| [config.py](file:///d:/Code/CodeRag-Project/backend/app/config.py) | Loads 7 env vars via `pydantic-settings`, all have safe defaults |
| [database.py](file:///d:/Code/CodeRag-Project/backend/app/database.py) | SQLAlchemy `engine`, `SessionLocal`, and `Base` with `pool_pre_ping` |
| [user.py](file:///d:/Code/CodeRag-Project/backend/app/models/user.py) | `User` model — PK id, unique email, hashed_password, server-defaulted created_at |
| [query_history.py](file:///d:/Code/CodeRag-Project/backend/app/models/query_history.py) | `QueryHistory` model — PK id, FK user_id → users.id, Text query/response, created_at |
| [\_\_init\_\_.py](file:///d:/Code/CodeRag-Project/backend/app/models/__init__.py) | Imports `User` and `QueryHistory` so `Base.metadata` registers both tables |
| [main.py](file:///d:/Code/CodeRag-Project/backend/app/main.py) | FastAPI app with lifespan startup (`create_all`) and `GET /health` |
| [.env.example](file:///d:/Code/CodeRag-Project/.env.example) | Template for all required environment variables |
| [.gitignore](file:///d:/Code/CodeRag-Project/.gitignore) | Excludes .env, __pycache__, Docker volumes, model caches, node_modules |

---

## How to Run

```bash
cd d:\Code\CodeRag-Project

# 1. Copy the environment template
cp .env.example .env

# 2. Build and start all services
docker compose up --build
```

> [!NOTE]
> First launch will pull MySQL, ChromaDB, and Elasticsearch images (~2-3 GB total). The backend will wait for all three database services to pass their health checks before starting.

---

## Verification Steps

### 1. Health Endpoint

Open in browser or run:

```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{"status": "ok", "service": "coderag"}
```

---

### 2. Confirm MySQL Tables Were Created

```bash
docker exec -it coderag-project-mysql-1 mysql -u coderag_user -pcoderag_pass coderag -e "SHOW TABLES;"
```

**Expected output:**
```
+------------------+
| Tables_in_coderag|
+------------------+
| query_history    |
| users            |
+------------------+
```

---

### 3. Confirm ChromaDB Is Reachable

```bash
curl http://localhost:8001/api/v1/heartbeat
```

**Expected:** A JSON response with a nanosecond timestamp, e.g. `{"nanosecond heartbeat": 1712927...}`

---

### 4. Confirm Elasticsearch Is Reachable

```bash
curl http://localhost:9200
```

**Expected:** A JSON response containing `"cluster_name": "docker-cluster"` and `"version": {"number": "8.13.0", ...}`

---

## Self-Review Checklist

- [x] `docker-compose.yml` — 4 services, health checks on MySQL/ChromaDB/ES, backend `depends_on` all three with `condition: service_healthy`
- [x] `Dockerfile` — python:3.11-slim (non-Alpine), copies requirements.txt first, exposes 8000, runs uvicorn
- [x] `requirements.txt` — all 9 packages pinned to exact specified versions
- [x] `config.py` — all 7 env vars declared with defaults via `pydantic-settings`
- [x] `database.py` — exports `engine`, `SessionLocal`, `Base`
- [x] `models/user.py` — `User(id, email[unique], hashed_password, created_at[server_default])`
- [x] `models/query_history.py` — `QueryHistory(id, user_id[FK], query[Text], response[Text], created_at)`
- [x] `models/__init__.py` — imports both models for metadata registration
- [x] `main.py` — lifespan calls `create_all(bind=engine)`, `/health` returns `{"status":"ok","service":"coderag"}`
- [x] `.env.example` — every key from config.py has a corresponding entry
- [x] No circular imports — `main.py` → `database.py` → `config.py` (linear chain); models import only from `database.py`
