#!/bin/bash

# Astro360 Backend Startup Script
# This script sets the correct PYTHONPATH and starts the backend server

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set PYTHONPATH to include the project root
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH}"

echo "🚀 Starting Astro360 Backend..."
echo "📁 Project Root: ${SCRIPT_DIR}"
echo "🐍 PYTHONPATH: ${PYTHONPATH}"
echo ""

# Navigate to backend directory and start the server
cd "${SCRIPT_DIR}/astro_app/backend"
python3 main.py
