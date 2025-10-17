#!/bin/bash

# Weather Dashboard Setup Script
# This script automates the setup process for both backend and frontend

echo "=================================================="
echo "  Weather Analysis Dashboard - Setup Script"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if running on Windows (Git Bash)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    print_info "Detected Windows environment"
fi

# Step 1: Backend Setup
echo ""
print_info "Setting up Laravel Backend..."
echo ""

if [ -d "backend" ]; then
    cd backend
    
    # Check if composer is installed
    if ! command -v composer &> /dev/null; then
        print_error "Composer is not installed. Please install Composer first."
        exit 1
    fi
    
    print_info "Installing Composer dependencies..."
    composer install
    
    if [ $? -eq 0 ]; then
        print_success "Composer dependencies installed"
    else
        print_error "Failed to install Composer dependencies"
        exit 1
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_info "Creating .env file..."
        cp .env.example .env
        print_success ".env file created"
    else
        print_info ".env file already exists"
    fi
    
    # Generate application key
    print_info "Generating application key..."
    php artisan key:generate
    print_success "Application key generated"
    
    # Install Guzzle
    print_info "Installing Guzzle HTTP client..."
    composer require guzzlehttp/guzzle
    print_success "Guzzle installed"
    
    # Clear cache
    print_info "Clearing Laravel cache..."
    php artisan config:clear
    php artisan cache:clear
    print_success "Cache cleared"
    
    cd ..
    print_success "Backend setup completed!"
else
    print_error "Backend directory not found!"
    exit 1
fi

# Step 2: Frontend Setup
echo ""
print_info "Setting up React Frontend..."
echo ""

if [ -d "frontend" ]; then
    cd frontend
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    print_info "Installing npm dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "npm dependencies installed"
    else
        print_error "Failed to install npm dependencies"
        exit 1
    fi
    
    cd ..
    print_success "Frontend setup completed!"
else
    print_error "Frontend directory not found!"
    exit 1
fi

# Final instructions
echo ""
echo "=================================================="
print_success "Setup completed successfully!"
echo "=================================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the Laravel backend:"
echo "   cd backend"
echo "   php artisan serve"
echo ""
echo "2. In a new terminal, start the React frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "The application will be available at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:8000"
echo ""
print_info "Happy coding! 🌤️"
echo ""
