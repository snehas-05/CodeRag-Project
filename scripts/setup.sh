#!/bin/bash

# CodeRAG Setup Script
set -e

echo "🚀 Starting CodeRAG Setup..."

# 1. Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker and try again."
    exit 1
fi

# 2. Environment Configuration
echo "⚙️ Configuring environment..."
if [ -f ".env" ]; then
    echo "✅ Found existing .env file."
elif [ -f ".env.local" ]; then
    echo "✅ Found existing .env.local file. Copying to .env..."
    cp .env.local .env
elif [ -f ".env.example" ]; then
    echo "⚠️ No .env or .env.local found. Initializing from .env.example..."
    cp .env.example .env
else
    echo "❌ Error: No environment configuration found (.env, .env.local, or .env.example)."
    echo "Please create a .env file before proceeding."
    exit 1
fi

# 3. Pull and Build
echo "📦 Pulling images and building services..."
docker compose pull
docker compose build

# 4. Starting
echo "🆙 Starting services..."
docker compose up -d

echo "📊 Services list:"
docker compose ps

echo "✨ Setup complete! Run './scripts/verify.sh' to check health."
