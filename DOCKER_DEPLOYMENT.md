# Weather Dashboard - Docker Hub Deployment

This guide explains how to deploy the Weather Analysis Dashboard using Docker images from Docker Hub.

## 🐳 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Internet connection to pull images from Docker Hub

### Deploy from Docker Hub

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/weather-dashboard.git
   cd weather-dashboard
   ```

2. **Deploy using Docker Hub images:**

   ```bash
   chmod +x deploy-from-hub.sh
   ./deploy-from-hub.sh
   ```

3. **Access the application:**
   - Main app: http://localhost
   - Backend API: http://localhost/api
   - Direct backend: http://localhost:8000
   - Direct frontend: http://localhost:3000

## 🔧 Manual Deployment

### Using Docker Compose

1. **Pull and start services:**

   ```bash
   docker-compose up -d
   ```

2. **Check status:**

   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Using Docker Commands

1. **Pull images:**

   ```bash
   docker pull dungnq2/weather-backend:latest
   docker pull dungnq2/weather-frontend:latest
   ```

2. **Run backend:**

   ```bash
   docker run -d --name weather-backend \
     -p 8000:80 \
     -e APP_ENV=production \
     -e APP_DEBUG=false \
     dungnq2/weather-backend:latest
   ```

3. **Run frontend:**
   ```bash
   docker run -d --name weather-frontend \
     -p 3000:80 \
     --link weather-backend:backend \
     dungnq2/weather-frontend:latest
   ```

## 📊 Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │────│   Frontend      │────│   Backend       │
│   (Port 80)     │    │   (Port 3000)   │    │   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔍 Health Checks

The containers include health checks:

- **Backend**: `curl -f http://localhost/api/weather/10.98/106.75`
- **Frontend**: `curl -f http://localhost`

Check health status:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 📝 Environment Variables

### Backend Environment

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY=base64:your-app-key-here`

### Frontend Environment

- `NODE_ENV=production`

## 🚀 Scaling

### Scale Frontend

```bash
docker-compose up -d --scale frontend=3
```

### Load Balancer Configuration

Update `docker/nginx-proxy.conf` to add multiple backend instances:

```nginx
upstream backend {
    server backend:80;
    server backend2:80;
    server backend3:80;
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use:**

   ```bash
   # Check what's using the port
   lsof -i :80
   # Kill the process
   kill -9 <PID>
   ```

2. **Container won't start:**

   ```bash
   # Check logs
   docker-compose logs backend
   docker-compose logs frontend
   ```

3. **API not responding:**

   ```bash
   # Test API directly
   curl http://localhost/api/weather/10.98/106.75
   ```

4. **Frontend can't connect to backend:**
   - Check if backend container is running
   - Verify network connectivity
   - Check CORS configuration

### Debug Commands

```bash
# Enter container
docker-compose exec backend bash
docker-compose exec frontend sh

# Check container resources
docker stats

# Inspect container
docker inspect weather-backend

# Check network
docker network ls
docker network inspect weather-network
```

## 🔄 Updates

### Update to Latest Version

```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d
```

### Rollback

```bash
# Use specific version
docker-compose down
docker-compose up -d --image dungnq2/weather-backend:v1.0.0
```

## 📈 Monitoring

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Metrics

```bash
# Container stats
docker stats

# Resource usage
docker system df
```

## 🔒 Security

### Production Security Checklist

- [ ] Use HTTPS (SSL certificates)
- [ ] Set strong APP_KEY
- [ ] Configure firewall
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

### SSL Configuration

1. Obtain SSL certificates
2. Update `docker/nginx-proxy.conf`:
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /etc/nginx/ssl/cert.pem;
       ssl_certificate_key /etc/nginx/ssl/key.pem;
       # ... rest of config
   }
   ```

## 📞 Support

For issues or questions:

1. Check the logs: `docker-compose logs -f`
2. Verify configuration
3. Check Docker Hub images: https://hub.docker.com/r/dungnq2/weather-backend
4. Create an issue in the repository

---

**Happy Weather Tracking! 🌤️**
