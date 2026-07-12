#!/bin/bash

set -e

echo "=== Installing Python Dependencies ==="
pip install -r requirements.txt

echo "=== Frontend already built locally, skipping build ==="

echo "=== Starting Backend Server ==="
cd backend
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}