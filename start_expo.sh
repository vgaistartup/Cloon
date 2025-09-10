#!/bin/bash

# Expo Server Startup Guide for Virtual Try-On App
# This script helps you start the Expo development server

echo "🚀 Virtual Try-On App - Expo Server Startup"
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BLUE}📱 Starting Expo Development Server...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    echo "Expected structure: ./frontend/package.json"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo ""
    echo -e "${YELLOW}📦 Please install Node.js first:${NC}"
    echo ""
    echo "Option 1 - Official installer:"
    echo "  1. Visit: https://nodejs.org/"
    echo "  2. Download Node.js 18+ LTS version"
    echo "  3. Run the installer"
    echo ""
    echo "Option 2 - Using Homebrew (macOS):"
    echo "  brew install node"
    echo ""
    echo "Option 3 - Using package manager (Linux):"
    echo "  # Ubuntu/Debian"
    echo "  sudo apt update && sudo apt install nodejs npm"
    echo ""
    echo "  # CentOS/RHEL"
    echo "  sudo yum install nodejs npm"
    echo ""
    echo -e "${BLUE}After installing Node.js, run this script again.${NC}"
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null && ! command -v npx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Expo CLI not found. Installing...${NC}"
    npm install -g @expo/cli
fi

# Navigate to frontend directory
cd frontend || {
    echo -e "${RED}❌ Cannot access frontend directory${NC}"
    exit 1
}

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install || {
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    }
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️  Creating .env file from example...${NC}"
    cp .env.example .env || {
        echo -e "${RED}❌ Failed to create .env file${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ .env file created${NC}"
fi

echo -e "${GREEN}✓ All prerequisites ready!${NC}"
echo ""
echo -e "${BOLD}${BLUE}🚀 Starting Expo Development Server...${NC}"
echo ""

# Start Expo server
if command -v expo &> /dev/null; then
    expo start
elif command -v npx &> /dev/null; then
    npx expo start
else
    echo -e "${RED}❌ Cannot start Expo server. Please install Expo CLI:${NC}"
    echo "npm install -g @expo/cli"
    exit 1
fi