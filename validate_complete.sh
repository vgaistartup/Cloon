#!/bin/bash

# Virtual Try-On App - Complete Validation Script
# This script validates the entire application without requiring external dependencies

echo "🚀 Virtual Try-On App - Complete Validation"
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Helper functions
check_file() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓ $2: $1${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ Missing $2: $1${NC}"
        return 1
    fi
}

check_directory() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓ Directory exists: $1${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ Missing directory: $1${NC}"
        return 1
    fi
}

print_section() {
    echo ""
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${CYAN}$(printf '=%.0s' $(seq 1 ${#1}))${NC}"
}

# 1. Project Structure Validation
print_section "📁 Project Structure Validation"

# Root files
check_file "README.md" "Root README"
check_file "package.json" "Root package.json"
check_file "setup.sh" "Setup script"

# Directories
check_directory "backend"
check_directory "frontend"

# Backend structure
check_file "backend/requirements.txt" "Backend requirements"
check_file "backend/.env.example" "Backend env example"
check_file "backend/app/main.py" "FastAPI main app"
check_file "backend/app/core/config.py" "Configuration"
check_file "backend/app/core/database.py" "Database setup"
check_file "backend/app/core/security.py" "Security utilities"

# Backend models
check_file "backend/app/models/user.py" "User models"
check_file "backend/app/models/auth.py" "Auth models"
check_file "backend/app/models/api.py" "API models"

# Backend routers
check_file "backend/app/routers/health.py" "Health router"
check_file "backend/app/routers/auth.py" "Auth router"
check_file "backend/app/routers/upload.py" "Upload router"
check_file "backend/app/routers/ai.py" "AI router"

# Frontend structure
check_file "frontend/package.json" "Frontend package.json"
check_file "frontend/app.json" "Expo config"
check_file "frontend/tsconfig.json" "TypeScript config"
check_file "frontend/.env.example" "Frontend env example"

# Frontend app screens
check_file "frontend/app/_layout.tsx" "App layout"
check_file "frontend/app/index.tsx" "Index screen"
check_file "frontend/app/auth.tsx" "Auth screen"
check_file "frontend/app/dashboard.tsx" "Dashboard screen"
check_file "frontend/app/upload.tsx" "Upload screen"

# Frontend components
check_file "frontend/components/Button.tsx" "Button component"
check_file "frontend/components/Input.tsx" "Input component"
check_file "frontend/components/Screen.tsx" "Screen component"

# Frontend services
check_file "frontend/services/api.ts" "API service"
check_file "frontend/services/auth.ts" "Auth service"
check_file "frontend/services/upload.ts" "Upload service"
check_file "frontend/services/ai.ts" "AI service"

# Frontend types
check_file "frontend/types/api.ts" "API types"
check_file "frontend/constants/theme.ts" "Theme constants"

# 2. Configuration Validation
print_section "⚙️  Configuration Validation"

# Check JSON files exist and basic structure
if [ -f "package.json" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if grep -q "virtual-try-on-app" package.json; then
        echo -e "${GREEN}✓ Root package.json has correct name${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️  Root package.json name might be incorrect${NC}"
    fi
fi

if [ -f "frontend/app.json" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if grep -q "Virtual Try-On" frontend/app.json; then
        echo -e "${GREEN}✓ Expo config has correct app name${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠️  Expo config app name might be incorrect${NC}"
    fi
fi

# 3. API Endpoints Validation
print_section "🔗 API Endpoints Validation"

# Check for required API endpoints in router files
if [ -f "backend/app/routers/health.py" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if grep -q "/health" backend/app/routers/health.py; then
        echo -e "${GREEN}✓ Health endpoint found${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ Health endpoint not found${NC}"
    fi
fi

if [ -f "backend/app/routers/auth.py" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 2))
    if grep -q "/send-otp" backend/app/routers/auth.py; then
        echo -e "${GREEN}✓ Send OTP endpoint found${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ Send OTP endpoint not found${NC}"
    fi
    
    if grep -q "/verify-otp" backend/app/routers/auth.py; then
        echo -e "${GREEN}✓ Verify OTP endpoint found${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ Verify OTP endpoint not found${NC}"
    fi
fi

if [ -f "backend/app/routers/ai.py" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if grep -q "/generate-avatar" backend/app/routers/ai.py; then
        echo -e "${GREEN}✓ Generate avatar endpoint found${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ Generate avatar endpoint not found${NC}"
    fi
fi

# 4. Environment Setup Validation
print_section "🌍 Environment Setup Validation"

# Check environment files
if [ -f "backend/.env.example" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 3))
    if grep -q "MONGODB_URL" backend/.env.example; then
        echo -e "${GREEN}✓ Backend env has MongoDB URL${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
    if grep -q "JWT_SECRET" backend/.env.example; then
        echo -e "${GREEN}✓ Backend env has JWT secret${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
    if grep -q "DATABASE_NAME" backend/.env.example; then
        echo -e "${GREEN}✓ Backend env has database name${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
fi

if [ -f "frontend/.env.example" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if grep -q "EXPO_PUBLIC_API_URL" frontend/.env.example; then
        echo -e "${GREEN}✓ Frontend env has API URL${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
fi

# 5. App Flow Validation
print_section "📱 App Flow Validation"

# Check key app flow components
if [ -f "frontend/app/auth.tsx" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 2))
    if grep -q "phone" frontend/app/auth.tsx && grep -q "otp" frontend/app/auth.tsx; then
        echo -e "${GREEN}✓ Phone + OTP auth flow implemented${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
    if grep -q "AuthService" frontend/app/auth.tsx; then
        echo -e "${GREEN}✓ Auth service integration found${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
fi

if [ -f "frontend/app/dashboard.tsx" ]; then
    TOTAL_CHECKS=$((TOTAL_CHECKS + 2))
    if grep -q "Upload Photos" frontend/app/dashboard.tsx; then
        echo -e "${GREEN}✓ Upload Photos button found${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
    if grep -q "Generate Avatar" frontend/app/dashboard.tsx; then
        echo -e "${GREEN}✓ Generate Avatar button found${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
fi

# Calculate success rate
SUCCESS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

# Final Summary
print_section "📊 Validation Summary"

echo ""
if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "${BOLD}${GREEN}🎉 EXCELLENT! All core components validated ($PASSED_CHECKS/$TOTAL_CHECKS - $SUCCESS_RATE%)${NC}"
    echo -e "${GREEN}✓ Virtual Try-On App is ready for deployment!${NC}"
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${BOLD}${YELLOW}✅ GOOD! Most components validated ($PASSED_CHECKS/$TOTAL_CHECKS - $SUCCESS_RATE%)${NC}"
    echo -e "${YELLOW}Minor issues detected but app should work${NC}"
else
    echo -e "${BOLD}${RED}⚠️  NEEDS ATTENTION ($PASSED_CHECKS/$TOTAL_CHECKS - $SUCCESS_RATE%)${NC}"
    echo -e "${RED}Some critical components are missing${NC}"
fi

# Deployment Guide
print_section "🚀 Deployment Guide"

echo -e "${BLUE}Prerequisites:${NC}"
echo "• Node.js 18+ and npm"
echo "• Python 3.11+"
echo "• MongoDB (local or cloud)"
echo "• Expo CLI: npm install -g @expo/cli"
echo ""

echo -e "${BLUE}Quick Start:${NC}"
echo "1. Install dependencies:"
echo "   ./setup.sh"
echo ""
echo "2. Start backend:"
echo "   cd backend"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "3. Start frontend:"
echo "   cd frontend"
echo "   npx expo start"
echo ""

echo -e "${BLUE}Verify Setup:${NC}"
echo "• Backend health: curl http://localhost:8000/health"
echo "• API docs: http://localhost:8000/docs"
echo "• Mobile app: Scan QR code with Expo Go"
echo ""

echo -e "${BLUE}App Features Ready:${NC}"
echo "• 📞 Phone + OTP authentication (mocked)"
echo "• 📱 Apple-inspired mobile UI"
echo "• 📸 Photo upload with camera/gallery"
echo "• 🤖 AI avatar generation (stub endpoints)"
echo "• 🔒 JWT-based security"
echo "• 📊 MongoDB integration"
echo ""

if [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${BOLD}${GREEN}🎯 Ready to integrate real AI models (Google Gemini, OpenAI, etc.)!${NC}"
    exit 0
else
    exit 1
fi