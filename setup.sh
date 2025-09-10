#!/bin/bash

# Virtual Try-On App - Quick Start Script
# This script helps you get the full-stack app running quickly

echo "🚀 Virtual Try-On App - Quick Start"
echo "=================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    echo "✓ Python 3 found: $(python3 --version)"
else
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

# Check Node.js and npm
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo "✓ Node.js found: $(node --version)"
    echo "✓ npm found: $(npm --version)"
else
    echo "❌ Node.js or npm not found. Please install Node.js 18+"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "🔧 Setting up the project..."

# Setup backend
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created backend .env file"
fi

echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

cd ..

# Setup frontend
echo "📱 Setting up frontend..."
cd frontend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created frontend .env file"
fi

cd ..

# Install root dependencies
echo "📦 Installing workspace dependencies..."
npm install

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Option 1 - Start both frontend and backend together:"
echo "  npm run dev"
echo ""
echo "Option 2 - Start them separately:"
echo "  # Terminal 1 (Backend):"
echo "  cd backend"
echo "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "  # Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npx expo start"
echo ""
echo "📱 Mobile App:"
echo "  - Install Expo Go on your phone"
echo "  - Scan QR code when frontend starts"
echo "  - Or use iOS Simulator / Android Emulator"
echo ""
echo "🌐 API Documentation:"
echo "  - http://localhost:8000/docs"
echo ""
echo "🎯 Quick Test:"
echo "  - Health check: curl http://localhost:8000/health"