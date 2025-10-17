# Weather Dashboard - Quick Deploy from Docker Hub

## 🚀 One-Click Deployment

Deploy the Weather Analysis Dashboard using pre-built Docker images from Docker Hub.

### Prerequisites

- Docker and Docker Compose installed
- Internet connection

### Quick Start

1. **Clone this repository:**

   ```bash
   git clone https://github.com/your-username/weather-dashboard.git
   cd weather-dashboard
   ```

2. **Deploy with one command:**

   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Main app: http://localhost
   - Backend API: http://localhost/api
   - Direct backend: http://localhost:8000
   - Direct frontend: http://localhost:3000

### Alternative: Deploy without cloning

If you just want to run the containers without cloning the repository:

```bash
# Create a directory
mkdir weather-dashboard
cd weather-dashboard

# Create docker-compose.yml
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

  frontend:
    image: dung317/weather-frontend:latest
    container_name: weather-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: weather-proxy
    ports:
      - "80:80"
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
EOF

# Start the application
docker-compose up -d
```

### Using Individual Images

You can also run the containers individually:

```bash
# Run backend
docker run -d --name weather-backend \
  -p 8000:80 \
  -e APP_ENV=production \
  -e APP_DEBUG=false \
  dung317/weather-backend:latest

# Run frontend
docker run -d --name weather-frontend \
  -p 3000:80 \
  --link weather-backend:backend \
  dung317/weather-frontend:latest
```

### Docker Hub Images

- **Backend**: https://hub.docker.com/r/dung317/weather-backend
- **Frontend**: https://hub.docker.com/r/dung317/weather-frontend

### Features

- 🌤️ Real-time weather data
- 📊 Interactive charts and forecasts
- 🔍 Location search and comparison
- 🌙 Dark/Light theme toggle
- 📱 Responsive design
- 🚀 Fast deployment with Docker

### Troubleshooting

**Port already in use:**

```bash
# Check what's using the port
lsof -i :80
# Kill the process or use different ports
```

**Container won't start:**

```bash
# Check logs
docker-compose logs -f
```

**Update to latest version:**

```bash
docker-compose pull
docker-compose up -d
```

### Support

For issues or questions:

- Check Docker Hub: https://hub.docker.com/r/dung317/weather-backend
- Create an issue in the repository

---

**Happy Weather Tracking! 🌤️**
