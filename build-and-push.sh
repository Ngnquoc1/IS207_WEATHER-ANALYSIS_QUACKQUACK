#!/bin/bash

# Build and Push Docker Images Script
# This script builds both backend and frontend images and pushes them to Docker Hub

set -e  # Exit on any error

echo "🚀 Starting Docker build and push process..."

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

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username:"; then
    print_warning "You are not logged in to Docker Hub. Please run 'docker login' first."
    read -p "Do you want to login now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker login
    else
        print_error "Cannot proceed without Docker Hub login."
        exit 1
    fi
fi

# Build Backend Image
print_status "Building backend image..."
cd backend
docker build -t dung317/weather-backend:latest .
if [ $? -eq 0 ]; then
    print_status "✅ Backend image built successfully"
else
    print_error "❌ Backend image build failed"
    exit 1
fi

# Build Frontend Image
print_status "Building frontend image..."
cd ../frontend
docker build -t dung317/weather-frontend:latest .
if [ $? -eq 0 ]; then
    print_status "✅ Frontend image built successfully"
else
    print_error "❌ Frontend image build failed"
    exit 1
fi

# Push Backend Image
print_status "Pushing backend image to Docker Hub..."
docker push dung317/weather-backend:latest
if [ $? -eq 0 ]; then
    print_status "✅ Backend image pushed successfully"
else
    print_error "❌ Backend image push failed"
    exit 1
fi

# Push Frontend Image
print_status "Pushing frontend image to Docker Hub..."
docker push dung317/weather-frontend:latest
if [ $? -eq 0 ]; then
    print_status "✅ Frontend image pushed successfully"
else
    print_error "❌ Frontend image push failed"
    exit 1
fi

# Return to project root
cd ..

print_status "🎉 All images built and pushed successfully!"
echo ""
print_status "New in this build:"
echo "  ✅ Auto-migration on container start"
echo "  ✅ Data persistence with Docker volumes"
echo "  ✅ Automatic database initialization"
echo ""
print_status "You can now deploy using: docker-compose up -d"
print_status "Or pull and run on any server with:"
echo "  docker pull dung317/weather-backend:latest"
echo "  docker pull dung317/weather-frontend:latest"
echo ""
print_status "💾 Don't forget: Data is automatically persisted in Docker volumes!"