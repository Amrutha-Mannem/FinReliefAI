#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

echo "=== Installing Python Dependencies ==="
pip install -r requirements.txt

echo "=== Building Frontend ==="
if [ -f "frontend/package.json" ]; then
    cd frontend
    
    # Install Node dependencies
    npm install
    
    # Build using npm run (this finds vite correctly)
    npm run build
    
    cd ..
else
    echo "Frontend package.json not found, skipping build."
fi

echo "=== Starting Backend Server ==="
cd backend

# Use exec to replace the shell process with uvicorn
# This ensures logs are visible and the process doesn't exit
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}