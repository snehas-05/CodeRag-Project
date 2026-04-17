#!/bin/bash

# CodeRAG Verification Script
set -e

echo "🔍 Verifying CodeRAG Health..."

echo "1. Checking Docker containers..."
if ! docker compose ps | grep -q "Up"; then
    echo "❌ Error: No services appear to be running. Run 'make up' or './scripts/setup.sh' first."
    exit 1
fi

echo "2. Checking Backend API (/health)..."
# Wait up to 30 seconds for backend to be ready if it's starting
MAX_RETRIES=15
COUNT=0
until $(curl --output /dev/null --silent --head --fail http://localhost:8000/health); do
    printf '.'
    sleep 2
    COUNT=$((COUNT+1))
    if [ $COUNT -eq $MAX_RETRIES ]; then
        echo "❌ Backend health check failed after 30s."
        exit 1
    fi
done
echo "✅ Backend is healthy."

echo "3. Checking Frontend UI..."
if curl --output /dev/null --silent --head --fail http://localhost:3000; then
    echo "✅ Frontend is reachable at http://localhost:3000"
else
    echo "⚠️ Frontend UI not detected on port 3000. It may still be initializing or running on a different port."
fi

echo "4. Checking Vector DB (ChromaDB)..."
if curl --output /dev/null --silent --head --fail http://localhost:8001/api/v1/heartbeat; then
    echo "✅ ChromaDB is responsive."
else
    echo "⚠️ ChromaDB not responsive on port 8001."
fi

echo "5. Checking Search Engine (Elasticsearch)..."
if curl --output /dev/null --silent --head --fail http://localhost:9200; then
    echo "✅ Elasticsearch is responsive."
else
    echo "⚠️ Elasticsearch not responsive on port 9200."
fi

echo "✨ All checks complete. CodeRAG is ready!"
