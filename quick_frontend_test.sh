#!/bin/bash

# Quick Frontend Test Script for Virtual Try-On App

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

clear

echo -e "${BOLD}${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         📱 VIRTUAL TRY-ON FRONTEND TESTING 📱            ║
║                                                           ║
║            React Native + Expo + TypeScript              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BOLD}${GREEN}🎯 READY TO TEST YOUR APPLE-INSPIRED MOBILE APP!${NC}"
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo ""
    echo -e "${YELLOW}📦 Please install Node.js first:${NC}"
    echo ""
    echo "1. Visit: https://nodejs.org/"
    echo "2. Download Node.js 18+ LTS version"
    echo "3. Run the installer"
    echo "4. Restart terminal and run this script again"
    echo ""
    echo -e "${BLUE}Alternative: brew install node${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Please run this from the project root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Project structure found${NC}"

# Navigate to frontend
cd frontend || exit 1

# Check package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Frontend package.json not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Frontend configuration found${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install || {
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    }
fi

echo -e "${GREEN}✓ Dependencies ready${NC}"

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️ Creating environment file...${NC}"
    cp .env.example .env 2>/dev/null || {
        echo "EXPO_PUBLIC_API_URL=http://localhost:8000" > .env
    }
fi

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# Display what user will see
echo -e "${BOLD}${CYAN}📱 YOUR VIRTUAL TRY-ON APP FEATURES:${NC}"
echo ""
echo -e "${BLUE}🔐 Authentication Flow:${NC}"
echo "   • Phone number input with validation"
echo "   • OTP verification (mocked for demo)"
echo "   • Automatic login state management"
echo ""
echo -e "${BLUE}📊 Dashboard Experience:${NC}" 
echo "   • Welcome screen with Apple-inspired design"
echo "   • Upload Photos button → Camera/Gallery"
echo "   • Generate Avatar button → AI processing"
echo ""
echo -e "${BLUE}🎨 UI/UX Excellence:${NC}"
echo "   • Apple Design Language throughout"
echo "   • Smooth animations and transitions"
echo "   • Responsive layout for all devices"
echo "   • Touch-optimized interactions"
echo ""

# Display testing instructions
echo -e "${BOLD}${CYAN}🚀 HOW TO START TESTING:${NC}"
echo ""
echo -e "${YELLOW}Step 1:${NC} Start the Expo server"
echo -e "${GREEN}  npx expo start${NC}"
echo ""
echo -e "${YELLOW}Step 2:${NC} Connect your device"
echo "  📱 Install 'Expo Go' from App Store/Google Play"
echo "  📷 Scan QR code that appears"
echo ""
echo -e "${YELLOW}Step 3:${NC} Test the app flow"
echo "  🔐 Try phone login: +1234567890"
echo "  📱 Enter mock OTP when prompted"
echo "  📊 Navigate through dashboard"
echo "  📸 Test photo upload features"
echo ""

# Display connection options
echo -e "${BOLD}${CYAN}📱 CONNECTION OPTIONS:${NC}"
echo ""
echo -e "${GREEN}Physical Device (Recommended):${NC}"
echo "  • Best experience with native features"
echo "  • Camera and gallery fully functional"
echo "  • Real touch interactions"
echo ""
echo -e "${GREEN}iOS Simulator:${NC}"
echo "  • Press 'i' when Expo starts"
echo "  • Requires Xcode installation"
echo ""
echo -e "${GREEN}Android Emulator:${NC}"
echo "  • Press 'a' when Expo starts"  
echo "  • Requires Android Studio"
echo ""
echo -e "${GREEN}Web Browser:${NC}"
echo "  • Press 'w' when Expo starts"
echo "  • Limited functionality (no camera)"
echo ""

# Testing checklist
echo -e "${BOLD}${CYAN}✅ TESTING CHECKLIST:${NC}"
echo ""
echo "□ Phone authentication works"
echo "□ Dashboard loads with two action cards"
echo "□ Upload Photos navigates correctly"
echo "□ Generate Avatar shows demo alert"
echo "□ UI feels smooth and responsive"
echo "□ Camera permissions work properly"
echo "□ Gallery selection functions"
echo "□ Logout and re-login works"
echo ""

# Final instructions
echo -e "${BOLD}${GREEN}🎯 READY TO LAUNCH YOUR APP!${NC}"
echo ""
echo -e "${YELLOW}Run this command to start:${NC}"
echo -e "${GREEN}npx expo start${NC}"
echo ""
echo -e "${BLUE}Your Virtual Try-On app will showcase:${NC}"
echo "✨ Beautiful Apple-inspired mobile interface"
echo "🔐 Complete authentication system" 
echo "📸 Photo management with camera integration"
echo "🤖 AI-ready avatar generation system"
echo "🎨 Production-ready user experience"
echo ""
echo -e "${BOLD}Ready to revolutionize virtual try-on experiences! 🚀${NC}"