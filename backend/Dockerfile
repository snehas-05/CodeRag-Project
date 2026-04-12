FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (curl for healthchecks, git for gitpython)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl git && \
    rm -rf /var/lib/apt/lists/*

# Create directories for model cache and repos
RUN mkdir -p /app/model_cache /app/repos /app/tests

# Copy requirements first for Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
