#!/bin/bash

# Virtual Try-On App - Start Expo Server (SDK 53 Compatible)

# Set Node.js path
export PATH="/Users/vikash/VTO/node-v18.18.0-darwin-x64/bin:$PATH"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}🚀 Starting Virtual Try-On App (SDK 53.0.0)${NC}"
echo ""

# Navigate to frontend
cd frontend || {
    echo "❌ Cannot find frontend directory"
    exit 1
}

# Kill any existing processes
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
pkill -f "expo\|metro" 2>/dev/null || true

# Clear any caches
echo -e "${YELLOW}🗑️ Clearing Metro cache...${NC}"
rm -rf .expo node_modules/.cache 2>/dev/null || true

# Start Expo server
echo -e "${GREEN}📱 Starting Expo development server...${NC}"
echo ""
echo -e "${BOLD}Now compatible with your Expo Go SDK 53.0.0!${NC}"
echo ""

# Start with --clear flag and auto-accept port changes
echo "Y" | npx expo start --clear --port 8082