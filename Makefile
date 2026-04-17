# ── CodeRAG Project Management ────────────────────────────────────

.PHONY: up down restart build logs ps health test clean help

# Default target
help:
	@echo "CodeRAG Management Commands:"
	@echo "  make up       - Start all services in detached mode"
	@echo "  make down     - Stop all services"
	@echo "  make restart  - Restart all services"
	@echo "  make build    - Build or rebuild services"
	@echo "  make logs     - Follow logs from all services"
	@echo "  make ps       - List running services and their status"
	@echo "  make health   - Run a quick health check on backend and frontend"
	@echo "  make test     - Run backend test suite (Phase 2, 3, 4)"
	@echo "  make clean    - Stop services and remove volumes (Factory Reset)"

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

health:
	@echo "Checking Backend Health..."
	@curl -f http://localhost:8000/health || (echo "Backend is UNHEALTHY" && exit 1)
	@echo "\nChecking Frontend Availability..."
	@curl -f http://localhost:3000 || (echo "Frontend is UNREACHABLE" && exit 1)
	@echo "\nAll systems nominal."

test:
	docker compose exec backend pytest tests/test_phase2.py tests/test_phase3.py tests/test_phase4.py

clean:
	docker compose down -v
