#!/bin/bash

# Weather Dashboard - Docker Hub Build and Push Script
# This script builds and pushes Docker images to Docker Hub

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="username"  # Change this to your Docker Hub username
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

# Check if user is logged in to Docker Hub
if ! docker pull hello-world > /dev/null 2>&1; then
    print_error "You are not logged in to Docker Hub. Please run: docker login"
    exit 1
fi

print_header "Building and Pushing Weather Dashboard to Docker Hub"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Step 1: Build Backend Image
print_info "Building backend image..."
docker build -t ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${VERSION} ${SCRIPT_DIR}/backend
if [ $? -eq 0 ]; then
    print_success "Backend image built successfully"
else
    print_error "Failed to build backend image"
    exit 1
fi

# Step 2: Build Frontend Image
print_info "Building frontend image..."
docker build -t ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${VERSION} ${SCRIPT_DIR}/frontend
if [ $? -eq 0 ]; then
    print_success "Frontend image built successfully"
else
    print_error "Failed to build frontend image"
    exit 1
fi

# Step 3: Push Backend Image
print_info "Pushing backend image to Docker Hub..."
docker push ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${VERSION}
if [ $? -eq 0 ]; then
    print_success "Backend image pushed successfully"
else
    print_error "Failed to push backend image"
    exit 1
fi

# Step 4: Push Frontend Image
print_info "Pushing frontend image to Docker Hub..."
docker push ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${VERSION}
if [ $? -eq 0 ]; then
    print_success "Frontend image pushed successfully"
else
    print_error "Failed to push frontend image"
    exit 1
fi

# Step 5: Create and push multi-arch images (optional)
print_info "Creating multi-architecture images..."
docker buildx create --use --name weather-builder 2>/dev/null || true

# Backend multi-arch
print_info "Building multi-arch backend image..."
docker buildx build --platform linux/amd64,linux/arm64 \
    -t ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${VERSION} \
    --push ${SCRIPT_DIR}/backend

# Frontend multi-arch
print_info "Building multi-arch frontend image..."
docker buildx build --platform linux/amd64,linux/arm64 \
    -t ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${VERSION} \
    --push ${SCRIPT_DIR}/frontend

print_header "Deployment Summary"
print_success "All images have been built and pushed to Docker Hub!"
echo ""
echo "Images available at:"
echo "  Backend:  https://hub.docker.com/r/${DOCKER_USERNAME}/${BACKEND_IMAGE}"
echo "  Frontend: https://hub.docker.com/r/${DOCKER_USERNAME}/${FRONTEND_IMAGE}"
echo ""
echo "To deploy using these images:"
echo "  1. Clone this repository on your server"
echo "  2. Run: docker-compose up -d"
echo "  3. Access your app at: http://localhost"
echo ""
print_info "Happy deploying! 🚀"
