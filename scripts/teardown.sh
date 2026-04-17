#!/bin/bash

# CodeRAG Teardown Script
set -e

echo "🛑 Stopping CodeRAG services..."

# Gracefully stop containers
docker compose stop

echo "🧹 Removing containers..."
docker compose down

echo "✅ Teardown complete. To remove data volumes as well, run 'make clean'."
