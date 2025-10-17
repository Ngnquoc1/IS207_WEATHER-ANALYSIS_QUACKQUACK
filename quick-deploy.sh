#!/bin/bash

# Weather Dashboard - Quick Deploy Script
# This script deploys the Weather Dashboard using Docker Hub images

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

print_header "Weather Dashboard - Quick Deploy"

# Create docker-compose.yml
print_info "Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    image: dung317/weather-backend:latest
    container_name: weather-backend
    ports:
      - "8000:80"
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/api/weather/10.98/106.75"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: dung317/weather-frontend:latest
    container_name: weather-frontend
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: weather-proxy
    ports:
      - "80:80"
    volumes:
      - ./docker/nginx-proxy.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
EOF

print_success "docker-compose.yml created"

# Create nginx config
print_info "Creating nginx proxy configuration..."
mkdir -p docker
cat > docker/nginx-proxy.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:80;
    }

    upstream frontend {
        server frontend:80;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API routes with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Frontend routes
        location / {
            limit_req zone=general burst=50 nodelay;
            
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

print_success "nginx proxy configuration created"

# Pull images
print_info "Pulling latest images from Docker Hub..."
docker-compose pull

# Start services
print_info "Starting Weather Dashboard services..."
docker-compose up -d

# Wait for services
print_info "Waiting for services to be ready..."
sleep 10

# Check status
print_info "Checking service status..."
docker-compose ps

print_header "Deployment Complete!"
print_success "Weather Dashboard is now running!"

echo ""
echo "🌐 Access URLs:"
echo "  Main App:    http://localhost"
echo "  Backend API: http://localhost/api"
echo "  Direct Backend: http://localhost:8000"
echo "  Direct Frontend: http://localhost:3000"
echo ""

echo "📊 Useful commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart:       docker-compose restart"
echo "  Update:        docker-compose pull && docker-compose up -d"
echo ""

print_info "Happy weather tracking! 🌤️"
