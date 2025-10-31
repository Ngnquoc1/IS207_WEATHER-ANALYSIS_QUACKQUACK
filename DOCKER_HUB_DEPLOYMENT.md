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

4. **Default credentials:**
   - Admin: `admin@example.com` / `password`
   - Editor: `editor@example.com` / `password`

> 💾 **Data Persistence:** All your data (users, stories, settings) is automatically saved in Docker volumes and will persist across container restarts.

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
    volumes:
      - weather-db:/var/www/html/database
      - weather-storage:/var/www/html/storage
    restart: unless-stopped
    networks:
      - weather-network

  frontend:
    image: dung317/weather-frontend:latest
    container_name: weather-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - weather-network

  nginx:
    image: nginx:alpine
    container_name: weather-proxy
    ports:
      - "80:80"
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
    networks:
      - weather-network

networks:
  weather-network:
    driver: bridge

volumes:
  weather-db:
    driver: local
  weather-storage:
    driver: local
EOF

# Start the application
docker-compose up -d
```

### Using Individual Images

You can also run the containers individually with data persistence:

```bash
# Create volumes first
docker volume create weather-db
docker volume create weather-storage

# Run backend with volumes
docker run -d --name weather-backend \
  -p 8000:80 \
  -e APP_ENV=production \
  -e APP_DEBUG=false \
  -v weather-db:/var/www/html/database \
  -v weather-storage:/var/www/html/storage \
  dung317/weather-backend:latest

# Run frontend
docker run -d --name weather-frontend \
  -p 3000:80 \
  --link weather-backend:backend \
  dung317/weather-frontend:latest
```

> ⚠️ **Important:** Always use volumes (`-v`) to persist your data. Without volumes, all data will be lost when the container is removed.

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
- 💾 **Automatic data persistence** - Your data is saved even after container restart
- 🔄 **Auto-migrations** - Database schema is automatically set up on first run

### Data Management

**Your data is automatically persisted using Docker volumes:**

- `weather-db` - Stores the SQLite database with all users, stories, and settings
- `weather-storage` - Stores logs, cache, and uploaded files

**View your data volumes:**

```bash
docker volume ls | grep weather
```

**Backup your data:**

```bash
# Backup database
docker run --rm -v weather-db:/data -v $(pwd):/backup alpine tar czf /backup/weather-db-backup.tar.gz -C /data .

# Backup storage
docker run --rm -v weather-storage:/data -v $(pwd):/backup alpine tar czf /backup/weather-storage-backup.tar.gz -C /data .
```

**Restore from backup:**

```bash
# Restore database
docker run --rm -v weather-db:/data -v $(pwd):/backup alpine tar xzf /backup/weather-db-backup.tar.gz -C /data

# Restore storage
docker run --rm -v weather-storage:/data -v $(pwd):/backup alpine tar xzf /backup/weather-storage-backup.tar.gz -C /data
```

**Reset all data (start fresh):**

```bash
docker-compose down
docker volume rm weather-db weather-storage
docker-compose up -d
```

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
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Database issues:**

```bash
# Access database container
docker exec -it weather-backend bash

# Run migrations manually
php artisan migrate --force

# Check database
ls -la /var/www/html/database/
```

**Update to latest version:**

```bash
# Pull latest images
docker-compose pull

# Restart with new images (data is preserved)
docker-compose up -d
```

### Support

For issues or questions:

- Check Docker Hub: https://hub.docker.com/r/dung317/weather-backend
- Create an issue in the repository

---

**Happy Weather Tracking! 🌤️**
