#!/bin/bash

# Quick Deploy Script
# This script pulls the latest images and starts the services

set -e  # Exit on any error

echo "🚀 Starting quick deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Pull latest images
print_status "Pulling latest images..."
docker-compose pull

# Start services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check service status
print_status "Checking service status..."
docker-compose ps

# Test endpoints
print_status "Testing endpoints..."

# Test backend
if curl -f http://localhost/api/weather/10.98/106.75 > /dev/null 2>&1; then
    print_status "✅ Backend API is responding"
else
    print_warning "⚠️  Backend API might not be ready yet"
fi

# Test frontend
if curl -f http://localhost > /dev/null 2>&1; then
    print_status "✅ Frontend is responding"
else
    print_warning "⚠️  Frontend might not be ready yet"
fi

# Test nginx proxy
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_status "✅ Nginx proxy is responding"
else
    print_warning "⚠️  Nginx proxy might not be ready yet"
fi

print_status "🎉 Deployment completed!"
print_status "🌐 Application is available at: http://localhost"
print_status "📊 Backend API is available at: http://localhost/api"
print_status "🔍 Health check: http://localhost/health"

echo ""
print_status "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  View service status: docker-compose ps"