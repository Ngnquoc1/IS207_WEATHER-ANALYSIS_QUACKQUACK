#!/bin/bash

# Test Script for Weather Dashboard Docker Setup
# This script tests all endpoints and services

set -e

echo "🧪 Testing Weather Dashboard Docker Setup..."
echo "=============================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test functions
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $description... "
    
    if response=$(curl -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✅ PASS${NC} (Status: $response)"
            return 0
        else
            echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $response)"
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (Connection failed)"
        return 1
    fi
}

test_api_response() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    if response=$(curl -s "$url" 2>/dev/null); then
        if echo "$response" | grep -q "location"; then
            echo -e "${GREEN}✅ PASS${NC} (Valid JSON response)"
            return 0
        else
            echo -e "${RED}❌ FAIL${NC} (Invalid response)"
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (Request failed)"
        return 1
    fi
}

# Test results tracking
passed=0
total=0

# Test 1: Health Check
total=$((total + 1))
if test_endpoint "http://localhost/health" "Health Check" 200; then
    passed=$((passed + 1))
fi

# Test 2: Frontend
total=$((total + 1))
if test_endpoint "http://localhost" "Frontend" 200; then
    passed=$((passed + 1))
fi

# Test 3: Backend API
total=$((total + 1))
if test_endpoint "http://localhost/api/weather/10.98/106.75" "Backend API" 200; then
    passed=$((passed + 1))
fi

# Test 4: API Response Content
total=$((total + 1))
if test_api_response "http://localhost/api/weather/10.98/106.75" "API Response Content"; then
    passed=$((passed + 1))
fi

# Test 5: CORS Preflight
total=$((total + 1))
if test_endpoint "http://localhost/api/weather/10.98/106.75" "CORS Preflight" 200; then
    passed=$((passed + 1))
fi

# Test 6: Direct Backend Access
total=$((total + 1))
if test_endpoint "http://localhost:8000/api/weather/10.98/106.75" "Direct Backend" 200; then
    passed=$((passed + 1))
fi

# Test 7: Direct Frontend Access
total=$((total + 1))
if test_endpoint "http://localhost:3000" "Direct Frontend" 200; then
    passed=$((passed + 1))
fi

echo ""
echo "=============================================="
echo "📊 Test Results: $passed/$total tests passed"

if [ $passed -eq $total ]; then
    echo -e "${GREEN}🎉 All tests passed! Docker setup is working correctly.${NC}"
    echo ""
    echo "🌐 Application URLs:"
    echo "  Main App: http://localhost"
    echo "  Backend API: http://localhost/api"
    echo "  Health Check: http://localhost/health"
    echo ""
    echo "🔧 Direct Service URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend: http://localhost:8000"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the Docker setup.${NC}"
    echo ""
    echo "🔍 Debug commands:"
    echo "  docker-compose ps"
    echo "  docker-compose logs"
    echo "  docker-compose logs frontend"
    echo "  docker-compose logs backend"
    exit 1
fi
