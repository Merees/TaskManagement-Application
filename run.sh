#!/bin/bash

echo "🚀 Starting TaskFlow Application..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt --quiet
cd ..

# Build frontend if dist doesn't exist
if [ ! -d "frontend/dist" ]; then
    echo "🔨 Building frontend..."
    cd frontend
    npm install --silent
    npm run build
    cd ..
fi

# Start the application
echo ""
echo "✅ Starting TaskFlow on http://localhost:8080"
echo "   Press Ctrl+C to stop"
echo ""

cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080

# Made with Bob
