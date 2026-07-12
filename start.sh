#!/bin/bash

set -e  # Exit on any error

echo "=== Starting FinReliefAI Deployment ==="

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Build frontend
if [ -f "frontend/package.json" ]; then
    echo "Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Start server
echo "Starting server on port $PORT..."
cd backend
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}