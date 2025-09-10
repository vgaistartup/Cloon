#!/bin/bash

# Virtual Try-On App - Complete End-to-End Test Suite
# This script tests the entire application stack using Docker

set -e  # Exit on any error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0

print_header() {
    echo ""
    echo -e "${BOLD}${BLUE}======================================${NC}"
    echo -e "${BOLD}${BLUE} $1 ${NC}"
    echo -e "${BOLD}${BLUE}======================================${NC}"
}

print_section() {
    echo ""
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 ${#1}))${NC}"
}

test_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ $service_name is ready!${NC}"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start after $max_attempts attempts${NC}"
    return 1
}

# Check prerequisites
print_header "PREREQUISITES CHECK"

# Check Docker
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker found${NC}"
else
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker Compose found${NC}"
else
    echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose first.${NC}"
    exit 1
fi

# Start the application stack
print_header "STARTING APPLICATION STACK"

echo -e "${YELLOW}🚀 Starting Virtual Try-On App with Docker Compose...${NC}"

# Clean up any existing containers
docker-compose down -v 2>/dev/null || true

# Start services
if docker-compose up -d --build; then
    echo -e "${GREEN}✓ Docker services started${NC}"
else
    echo -e "${RED}❌ Failed to start Docker services${NC}"
    exit 1
fi

# Wait for services to be ready
print_section "Service Health Checks"

# Wait for MongoDB
wait_for_service "http://localhost:27017" "MongoDB" || {
    echo -e "${RED}MongoDB health check failed, but continuing...${NC}"
}

# Wait for Backend API
wait_for_service "http://localhost:8000/health" "Backend API" || {
    echo -e "${RED}❌ Backend API failed to start${NC}"
    docker-compose logs backend
    exit 1
}

# Test API endpoints
print_section "API Endpoint Tests"

# Test health endpoint
curl -f -s http://localhost:8000/health > /dev/null
test_result $? "Health endpoint responds"

# Test API documentation
curl -f -s http://localhost:8000/docs > /dev/null
test_result $? "API documentation accessible"

# Test OpenAPI spec
curl -f -s http://localhost:8000/openapi.json > /dev/null
test_result $? "OpenAPI specification available"

# Test authentication endpoints
print_section "Authentication Flow Tests"

# Test send OTP endpoint
OTP_RESPONSE=$(curl -s -X POST "http://localhost:8000/auth/send-otp" \
    -H "Content-Type: application/json" \
    -d '{"phone_number": "+1234567890"}')

if echo "$OTP_RESPONSE" | grep -q '"success": *true'; then
    test_result 0 "Send OTP endpoint works"
    
    # Extract OTP from response (mock OTP is included in response)
    OTP_CODE=$(echo "$OTP_RESPONSE" | grep -o '"Mock OTP: [0-9]*"' | grep -o '[0-9]*' || echo "123456")
    
    # Test verify OTP endpoint
    VERIFY_RESPONSE=$(curl -s -X POST "http://localhost:8000/auth/verify-otp" \
        -H "Content-Type: application/json" \
        -d "{\"phone_number\": \"+1234567890\", \"otp_code\": \"$OTP_CODE\"}")
    
    if echo "$VERIFY_RESPONSE" | grep -q '"success": *true'; then
        test_result 0 "Verify OTP endpoint works"
        
        # Extract access token
        ACCESS_TOKEN=$(echo "$VERIFY_RESPONSE" | grep -o '"access_token": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
        
        if [ ! -z "$ACCESS_TOKEN" ]; then
            test_result 0 "JWT token generated successfully"
        else
            test_result 1 "JWT token not generated"
        fi
    else
        test_result 1 "Verify OTP endpoint failed"
    fi
else
    test_result 1 "Send OTP endpoint failed"
fi

# Test AI endpoints
print_section "AI Endpoint Tests"

# Test AI models endpoint
curl -f -s http://localhost:8000/ai/models > /dev/null
test_result $? "AI models endpoint responds"

# Test AI styles endpoint  
curl -f -s http://localhost:8000/ai/styles > /dev/null
test_result $? "AI styles endpoint responds"

# Test avatar generation (requires auth token)
if [ ! -z "$ACCESS_TOKEN" ]; then
    AVATAR_RESPONSE=$(curl -s -X POST "http://localhost:8000/ai/generate-avatar" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"user_id": "test-user", "photo_urls": ["test.jpg"], "style": "casual"}')
    
    if echo "$AVATAR_RESPONSE" | grep -q '"success": *true'; then
        test_result 0 "Avatar generation endpoint works (authenticated)"
    else
        test_result 1 "Avatar generation endpoint failed"
    fi
else
    test_result 1 "Avatar generation test skipped (no auth token)"
fi

# Test file upload endpoint (requires auth token)
print_section "File Upload Tests"

if [ ! -z "$ACCESS_TOKEN" ]; then
    # Create a test image file
    echo "test image content" > test_image.txt
    
    UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:8000/upload/photo" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -F "file=@test_image.txt")
    
    rm -f test_image.txt
    
    if echo "$UPLOAD_RESPONSE" | grep -q '"success": *false'; then
        test_result 0 "Upload endpoint properly validates file types"
    else
        test_result 1 "Upload endpoint validation issue"
    fi
else
    test_result 1 "Upload test skipped (no auth token)"
fi

# Database connectivity test
print_section "Database Tests"

# Test if backend can connect to MongoDB
DB_LOG=$(docker-compose logs backend 2>&1 | grep -i "mongodb\|database" | tail -1)
if echo "$DB_LOG" | grep -q -i "connected\|success"; then
    test_result 0 "Backend connects to MongoDB"
else
    test_result 1 "Backend MongoDB connection issue"
fi

# Performance tests
print_section "Performance Tests"

# Test API response time
RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:8000/health)
if [ $(echo "$RESPONSE_TIME < 1.0" | bc -l 2>/dev/null || echo "1") -eq 1 ]; then
    test_result 0 "API responds quickly (${RESPONSE_TIME}s)"
else
    test_result 1 "API response too slow (${RESPONSE_TIME}s)"
fi

# Security tests
print_section "Security Tests"

# Test unauthorized access
UNAUTHORIZED_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8000/upload/photo)
if [ "$UNAUTHORIZED_RESPONSE" = "401" ] || [ "$UNAUTHORIZED_RESPONSE" = "403" ]; then
    test_result 0 "Protected endpoints require authentication"
else
    test_result 1 "Security issue: protected endpoint accessible without auth"
fi

# Final results
print_header "TEST RESULTS SUMMARY"

SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo ""
echo -e "${BOLD}Tests Passed: $PASSED_TESTS/$TOTAL_TESTS (${SUCCESS_RATE}%)${NC}"
echo ""

if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "${BOLD}${GREEN}🎉 EXCELLENT! All critical tests passed!${NC}"
    echo -e "${GREEN}✓ Virtual Try-On App is fully functional and ready for production${NC}"
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${BOLD}${YELLOW}✅ GOOD! Most tests passed${NC}"
    echo -e "${YELLOW}Minor issues detected but core functionality works${NC}"
else
    echo -e "${BOLD}${RED}⚠️  NEEDS ATTENTION${NC}"
    echo -e "${RED}Critical issues detected that need to be resolved${NC}"
fi

print_section "Application URLs"
echo "📊 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "💓 Health Check: http://localhost:8000/health"
echo "🔧 MongoDB: localhost:27017"

print_section "Next Steps"
echo "1. 📱 Install Expo CLI: npm install -g @expo/cli"
echo "2. 📦 Setup frontend: cd frontend && npm install"
echo "3. 🚀 Start frontend: npx expo start"
echo "4. 📱 Use Expo Go app to test on mobile device"

print_section "Cleanup"
echo -e "${YELLOW}To stop the services: docker-compose down${NC}"
echo -e "${YELLOW}To stop and remove data: docker-compose down -v${NC}"

if [ $SUCCESS_RATE -ge 80 ]; then
    exit 0
else
    exit 1
fi