#!/bin/bash

# Astro360 Frontend Startup Script
# This script starts the frontend development server

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 Starting Astro360 Frontend..."
echo "📁 Frontend Directory: ${SCRIPT_DIR}/astro_app/frontend"
echo ""

# Navigate to frontend directory
cd "${SCRIPT_DIR}/astro_app/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    npm install
    echo ""
fi

# Start the dev server
echo "🌐 Starting Vite dev server..."
npm run dev
