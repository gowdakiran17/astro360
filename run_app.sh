#!/bin/bash

# Astro360 Master Startup Script
# This script starts both backend and frontend servers

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🌟 Starting Astro360 Application..."
echo "📁 Project Root: ${SCRIPT_DIR}"
echo ""
echo "This will start both backend and frontend servers."
echo "Press Ctrl+C in each terminal to stop the servers."
echo ""

# Make scripts executable
chmod +x "${SCRIPT_DIR}/run_backend.sh"
chmod +x "${SCRIPT_DIR}/run_frontend.sh"

# Check if we're on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use osascript to open new Terminal tabs
    echo "🍎 Detected macOS - opening servers in new Terminal tabs..."
    
    # Start backend in new tab
    osascript -e "tell application \"Terminal\" to do script \"cd '${SCRIPT_DIR}' && ./run_backend.sh\""
    
    # Wait a moment for backend to start
    sleep 2
    
    # Start frontend in new tab
    osascript -e "tell application \"Terminal\" to do script \"cd '${SCRIPT_DIR}' && ./run_frontend.sh\""
    
    echo "✅ Servers starting in new Terminal tabs!"
    echo ""
    echo "Backend: http://localhost:8000"
    echo "Frontend: http://localhost:5173 (or check the frontend terminal for the actual port)"
    
else
    # Linux or other - provide manual instructions
    echo "🐧 Please run these commands in separate terminal windows:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd ${SCRIPT_DIR}"
    echo "  ./run_backend.sh"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd ${SCRIPT_DIR}"
    echo "  ./run_frontend.sh"
fi
