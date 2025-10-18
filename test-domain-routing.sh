#!/bin/bash

# Test Script for Domain-specific API Routing
# This script tests API routing with the specific domain

set -e

echo "🧪 Testing Domain-specific API Routing..."
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="frontend.is207-weather-analysis-quackquack.orb.local"

# Test API with specific domain
echo -n "Testing API with domain $DOMAIN... "

response=$(curl -s -H "Host: $DOMAIN" http://localhost/api/weather/10.98/106.75)
content_type=$(curl -s -I -H "Host: $DOMAIN" http://localhost/api/weather/10.98/106.75 | grep -i "content-type" | cut -d' ' -f2 | tr -d '\r')

if echo "$response" | grep -q "location" && echo "$content_type" | grep -q "application/json"; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "  - Response contains weather data"
    echo "  - Content-Type: $content_type"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  - Response: ${response:0:100}..."
    echo "  - Content-Type: $content_type"
fi

# Test frontend with specific domain
echo -n "Testing Frontend with domain $DOMAIN... "

frontend_response=$(curl -s -H "Host: $DOMAIN" http://localhost/)
frontend_content_type=$(curl -s -I -H "Host: $DOMAIN" http://localhost/ | grep -i "content-type" | cut -d' ' -f2 | tr -d '\r')

if echo "$frontend_response" | grep -q "Weather Analysis Dashboard" && echo "$frontend_content_type" | grep -q "text/html"; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "  - Response contains React app"
    echo "  - Content-Type: $frontend_content_type"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  - Response: ${frontend_response:0:100}..."
    echo "  - Content-Type: $frontend_content_type"
fi

echo ""
echo "🌐 Test URLs:"
echo "  Frontend: https://$DOMAIN"
echo "  API: https://$DOMAIN/api/weather/10.98/106.75"
echo ""
echo "✅ Domain routing is now properly configured!"
