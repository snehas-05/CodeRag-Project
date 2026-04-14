# Phase 4: Backend API & Authentication

This walkthrough details the implementation of Phase 4 of the CodeRAG app, focusing on establishing the backend APIs and authentication mechanisms using FastAPI, JSON Web Tokens (JWT), passlib, and Server-Sent Events (SSE) for streaming completions to the frontend.

## Summary of Changes

* **Schemas (`backend/app/schemas/`)**:
    * Created `auth_schemas.py` to validate `RegisterRequest`, `LoginRequest`, and provide the `TokenResponse` model format. Includes minimum password length validations via pydantic.
    * Created `query_schemas.py` to handle repository `IngestRequest`, `QueryRequest`, structured `EvidenceItem`, and `QueryResponse` validations.
    * Created `history_schemas.py` implementing `HistoryItem` and the paginated list models `HistoryListResponse`.

* **Services (`backend/app/services/auth_service.py`)**:
    * Defined core authentication functions including `get_db()`, `hash_password()`, `verify_password()`, `create_access_token()`, and `get_current_user` dependencies.
    * Setup `OAuth2PasswordBearer` scheme correctly bound to `/auth/login`.

* **Routes (`backend/app/routes/`)**:
    * Created `auth.py`: Provides user registration and authentication logic, assigning HS256 JWTs.
    * Created `query.py`: Implemented `/ingest` background ingestion logic using `asyncio.to_thread` and the `/query` streaming endpoint pushing events correctly utilizing `StreamingResponse`. Uses predefined model functions `run_agent()` and `retrieve_context()`.
    * Created `history.py`: Built CRUD endpoints to fetch paginated past queries specific to the current logged-in user, plus an endpoint to delete session queries based on unique IDs.

* **Configuration & Wiring**:
    * Updated `backend/app/main.py` adding all route decorators (`auth.router`, `query.router`, `history.router`).
    * Added `CORSMiddleware` in `main.py` explicitly allowing Vite's dev server (`http://localhost:5173`).
    * Modified `.env.example` configurations adjusting `JWT_ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=1440`, and `SECRET_KEY=your-super-secret-key-change-in-production`.

* **Dependencies & Tests**:
    * Appended missing requirements to `backend/requirements.txt`: `python-multipart` and `email-validator`.
    * Created `backend/tests/test_phase4.py` writing standard flow unit tests relying on FastAPI `TestClient` for `/auth/register` and `/auth/login`.

## Verification Steps
1. Navigate to the backend directory and ensure all dependencies are resolved by running:
```bash
pip install -r requirements.txt
```
2. Start up the backend API locally via Uvicorn:
```bash
uvicorn app.main:app --reload
```
3. Using an interactive API platform (like Postman or simply FastAPI Docs), navigate to `/docs`.
4. Test out the endpoints:
    * Try `POST /auth/register` and input a random test email. Ensure you get a `200 OK` response with a bearer token.
    * Run `POST /auth/login` to exchange credentials for a token successfully.
    * Run `pytest backend/tests/test_phase4.py` inside the Python environment to ensure functional flow validation on the backend APIs.
