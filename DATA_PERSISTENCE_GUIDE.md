# Data Persistence Guide

## Overview

This guide explains how data persistence works when deploying the Weather Dashboard from Docker Hub images.

## ✅ What's Implemented

### 1. **Automatic Data Persistence**

All user data is automatically saved in Docker volumes:

- `weather-db` - SQLite database containing users, stories, and settings
- `weather-storage` - Application logs, cache, and uploaded files

### 2. **Auto-Migration on Startup**

When the backend container starts for the first time, it automatically:

- Creates the SQLite database if it doesn't exist
- Runs all database migrations
- Seeds default users (admin and editor accounts)
- Sets up proper file permissions

### 3. **Data Survives Container Lifecycle**

Your data persists through:

- Container restarts (`docker-compose restart`)
- Container stops/starts (`docker-compose down` → `docker-compose up`)
- Image updates (`docker-compose pull` → `docker-compose up -d`)

## 🚀 How to Use

### Quick Start

```bash
# Clone and deploy
git clone <your-repo>
cd IS207_WEATHER-ANALYSIS_QUACKQUACK
docker-compose up -d
```

That's it! The system will:

1. Pull images from Docker Hub
2. Create persistent volumes
3. Initialize the database
4. Start all services

### Access the Application

- **Main App:** http://localhost
- **Backend API:** http://localhost:8000
- **Frontend:** http://localhost:3000

### Default Login

- Admin: `admin@example.com` / `password`
- Editor: `editor@example.com` / `password`

## 📊 Data Management

### View Volumes

```bash
docker volume ls | grep weather
```

### Backup Database

```bash
# Backup to current directory
docker run --rm \
  -v weather-db:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/weather-db-backup.tar.gz -C /data .
```

### Backup Storage

```bash
# Backup to current directory
docker run --rm \
  -v weather-storage:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/weather-storage-backup.tar.gz -C /data .
```

### Restore Database

```bash
docker run --rm \
  -v weather-db:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/weather-db-backup.tar.gz -C /data
```

### Restore Storage

```bash
docker run --rm \
  -v weather-storage:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/weather-storage-backup.tar.gz -C /data
```

### Start Fresh (Reset All Data)

```bash
docker-compose down
docker volume rm weather-db weather-storage
docker-compose up -d
```

## 🔍 Inspect Database

### Access Database Container

```bash
docker exec -it weather-backend bash
```

### Check Database File

```bash
ls -la /var/www/html/database/database.sqlite
```

### Run Migrations Manually (if needed)

```bash
docker exec -it weather-backend php artisan migrate --force
```

### View Database Tables

```bash
docker exec -it weather-backend php artisan tinker
# In tinker:
\DB::table('users')->count()
\DB::table('stories')->count()
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs -f backend

# Check specific issues
docker exec -it weather-backend ls -la /var/www/html/database/
```

### Database Permissions Error

```bash
# Fix permissions inside container
docker exec -it weather-backend chown -R www-data:www-data /var/www/html/database
docker exec -it weather-backend chmod -R 775 /var/www/html/database
```

### Migration Errors

```bash
# Clear cache and retry
docker exec -it weather-backend php artisan config:clear
docker exec -it weather-backend php artisan migrate:fresh --force
```

### Lost Data After Container Removal

If you used `docker-compose down -v`, the volumes were also deleted. To avoid this:

```bash
# Use this to stop without removing volumes
docker-compose down

# NOT this (removes volumes)
docker-compose down -v  # ⚠️ DANGER: Deletes all data!
```

## 📝 Technical Details

### How It Works

#### 1. Entrypoint Script

Located at `backend/docker/entrypoint.sh`, this script runs on every container start:

```bash
- Creates database directory
- Creates SQLite file if missing
- Sets proper permissions
- Generates application key
- Runs migrations
- Seeds default users (if needed)
- Starts supervisor (nginx + php-fpm)
```

#### 2. Docker Volumes

Defined in `docker-compose.yml`:

```yaml
volumes:
  weather-db:
    driver: local
  weather-storage:
    driver: local
```

#### 3. Volume Mounts

Backend service mounts these volumes:

```yaml
volumes:
  - weather-db:/var/www/html/database
  - weather-storage:/var/www/html/storage
```

## 🎯 Best Practices

### 1. Regular Backups

Schedule automated backups of your volumes:

```bash
# Example cron job (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh
```

### 2. Update Safely

Always pull new images without removing volumes:

```bash
docker-compose pull
docker-compose up -d
# Data is preserved!
```

### 3. Monitor Storage

Check volume sizes periodically:

```bash
docker system df -v
```

### 4. Secure Your Data

- Change default passwords immediately after first login
- Keep backups in a secure location
- Use environment variables for sensitive config

## 🔗 Related Documentation

- [DOCKER_HUB_DEPLOYMENT.md](DOCKER_HUB_DEPLOYMENT.md) - Full deployment guide
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Local development setup
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Advanced Docker configuration

## 💡 FAQ

**Q: Will my data be lost if I update the Docker images?**  
A: No! Data is stored in Docker volumes, separate from the containers.

**Q: Can I use a different database like MySQL?**  
A: Yes! Update the `docker-compose.yml` to add a MySQL service and configure the backend environment variables.

**Q: Where is the data physically stored on my machine?**  
A: Docker manages this. Use `docker volume inspect weather-db` to see the actual path.

**Q: Can multiple people use the same deployment and create their own data?**  
A: Yes! Each deployment has its own isolated volumes. Anyone running your Docker images will have their own local database that persists independently.

**Q: How much disk space do the volumes use?**  
A: Initially very small (~1-2 MB). It grows as you add stories and data.

---

**Need help?** Check the troubleshooting section or create an issue on GitHub.
