#!/bin/bash

# Weather Dashboard - Deploy from Docker Hub Script
# This script deploys the Weather Dashboard using images from Docker Hub

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="dungnq2"  # Change this to your Docker Hub username
BACKEND_IMAGE="weather-backend"
FRONTEND_IMAGE="weather-frontend"
VERSION="latest"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_header "Deploying Weather Dashboard from Docker Hub"

# Step 1: Pull latest images
print_info "Pulling latest images from Docker Hub..."
docker pull ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${VERSION}
docker pull ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${VERSION}

if [ $? -eq 0 ]; then
    print_success "Images pulled successfully"
else
    print_error "Failed to pull images"
    exit 1
fi

# Step 2: Stop existing containers
print_info "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Step 3: Start services
print_info "Starting Weather Dashboard services..."
docker-compose up -d

if [ $? -eq 0 ]; then
    print_success "Services started successfully"
else
    print_error "Failed to start services"
    exit 1
fi

# Step 4: Wait for services to be healthy
print_info "Waiting for services to be healthy..."
sleep 10

# Check service health
print_info "Checking service health..."
if docker-compose ps | grep -q "Up (healthy)"; then
    print_success "All services are healthy"
else
    print_info "Services are starting up..."
fi

# Step 5: Show deployment status
print_header "Deployment Status"
docker-compose ps

print_header "Access Information"
echo "🌐 Application URL: http://localhost"
echo "🔧 Backend API: http://localhost/api"
echo "🎨 Frontend: http://localhost"
echo ""
echo "📊 Service Status:"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  Proxy:    http://localhost:80"
echo ""

# Step 6: Test API endpoint
print_info "Testing API endpoint..."
if curl -s http://localhost/api/weather/10.98/106.75 > /dev/null; then
    print_success "API is responding correctly"
else
    print_error "API test failed"
fi

print_header "Deployment Complete!"
print_success "Weather Dashboard is now running!"
echo ""
print_header "Default Login Credentials"
echo "  👤 Admin:  admin@example.com / password"
echo "  ✏️  Editor: editor@example.com / password"
echo ""
print_header "Data Persistence"
echo "  💾 Your data is automatically saved in Docker volumes:"
echo "     - weather-db (database)"
echo "     - weather-storage (logs, cache, uploads)"
echo "  🔄 Data persists even after container restart or update"
echo ""
echo "Useful commands:"
echo "  View logs:       docker-compose logs -f"
echo "  Stop services:   docker-compose down"
echo "  Restart:         docker-compose restart"
echo "  Update images:   ./deploy-from-hub.sh"
echo "  View volumes:    docker volume ls | grep weather"
echo "  Backup data:     See DOCKER_HUB_DEPLOYMENT.md"
echo ""
print_info "Happy weather tracking! 🌤️"
