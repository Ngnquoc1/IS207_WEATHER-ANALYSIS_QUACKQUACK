# Docker Deployment Guide

## 🐳 Docker Images Overview

This project uses Docker containers to deploy the Weather Analysis application with the following architecture:

- **Backend**: Laravel API server (PHP 8.2 + Nginx)
- **Frontend**: React application served by Nginx
- **Proxy**: Nginx reverse proxy for routing and CORS handling

## 📦 Available Images

- `dung317/weather-backend:latest` - Laravel API backend
- `dung317/weather-frontend:latest` - React frontend application

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd IS207_WEATHER-ANALYSIS_QUACKQUACK

# Quick deploy (pulls latest images and starts services)
./quick-deploy.sh
```

### Option 2: Manual Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Building and Pushing Images

### Build and Push Script

```bash
# Build both images and push to Docker Hub
./build-and-push.sh
```

### Manual Build Process

```bash
# Build backend image
cd backend
docker build -t dung317/weather-backend:latest .
docker push dung317/weather-backend:latest

# Build frontend image
cd ../frontend
docker build -t dung317/weather-frontend:latest .
docker push dung317/weather-frontend:latest
```

## 🌐 Service URLs

After deployment, the following endpoints are available:

- **Main Application**: http://localhost
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/health
- **Backend Direct**: http://localhost:8000
- **Frontend Direct**: http://localhost:3000

## 🔍 Troubleshooting

### Check Service Status

```bash
# View running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Common Issues

1. **Port Conflicts**: Make sure ports 80, 3000, and 8000 are not in use
2. **CORS Issues**: The nginx proxy handles CORS automatically
3. **Service Not Ready**: Wait for health checks to pass (up to 40 seconds)

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove images (optional)
docker rmi dung317/weather-backend:latest dung317/weather-frontend:latest

# Start fresh
./quick-deploy.sh
```

## 📋 Environment Variables

### Backend Environment

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=http://backend`

### Frontend Environment

- `REACT_APP_API_URL=/api`

## 🔒 Security Features

- CORS properly configured for cross-origin requests
- Rate limiting on API endpoints
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Health checks for all services

## 📊 Monitoring

### Health Checks

All services include health checks:

- **Backend**: Tests API endpoint `/api/weather/10.98/106.75`
- **Frontend**: Tests main page availability
- **Nginx**: Custom health endpoint at `/health`

### Logs

Logs are available for all services:

- Backend: Laravel logs + Nginx access/error logs
- Frontend: Nginx access/error logs
- Proxy: Nginx access/error logs

## 🚀 Production Deployment

For production deployment:

1. **Update image tags** in `docker-compose.yml` to specific versions
2. **Configure environment variables** for your production environment
3. **Set up SSL/TLS** certificates if needed
4. **Configure monitoring** and logging
5. **Set up backup** strategies for data persistence

## 📝 Development vs Production

### Development

- Frontend connects directly to `http://localhost:8000/api`
- Backend runs with debug mode enabled
- Hot reloading available

### Production

- Frontend connects through nginx proxy at `/api`
- Backend runs in production mode
- Optimized builds and caching
- Health checks and monitoring
