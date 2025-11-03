# Migrate from SQLite to MongoDB Atlas

## Why

The project currently uses SQLite as a file-based database stored in Docker volumes. This creates several limitations for production deployments:

1. **Data persistence issues** - Data tied to Docker volumes, difficult to backup/restore
2. **Scalability limitations** - SQLite not designed for concurrent access or large datasets
3. **Cloud deployment friction** - File-based storage incompatible with modern cloud architectures
4. **No built-in redundancy** - Single point of failure, no automatic backups
5. **Limited query capabilities** - Poor support for complex aggregations and analytics

MongoDB Atlas solves these issues by providing:

- Fully managed cloud database (zero infrastructure)
- Automatic daily backups with point-in-time recovery
- Free tier (512MB) sufficient for project needs (~21MB estimated usage)
- Built-in security (SSL/TLS, IP whitelist, authentication)
- Excellent JSON/document support for weather API data
- Real-time performance monitoring dashboard
- 99.995% SLA for high availability

User has already created MongoDB Atlas cluster and is ready to migrate.

## What Changes

- **BREAKING**: Database engine changed from SQLite to MongoDB Atlas

  - All data models now use MongoDB document model
  - Connection string-based configuration replaces file path
  - No migration path for existing SQLite data (fresh start)

- **ADDED**: New dependency `mongodb/laravel-mongodb` package

  - Provides MongoDB driver for Laravel
  - Eloquent-compatible MongoDB models
  - Maintains existing API contracts (no controller changes)

- **MODIFIED**: Authentication capability

  - User model extends MongoDB Eloquent model
  - Personal access tokens stored in MongoDB
  - Sessions stored in MongoDB
  - Login/logout functionality unchanged (API compatible)

- **MODIFIED**: Stories capability

  - Story model extends MongoDB Eloquent model
  - CRUD operations remain identical
  - Pagination, filtering, search unchanged (API compatible)

- **ADDED**: New database capability spec

  - Documents MongoDB Atlas connection requirements
  - Defines data persistence patterns
  - Specifies index strategies for performance

- **CHANGED**: Docker infrastructure

  - Remove MongoDB container (using Atlas cloud)
  - Remove database volume (data on cloud)
  - Add MongoDB URI environment variable
  - Simplified deployment (fewer services)

- **CHANGED**: Backend Dockerfile

  - Add MongoDB PHP extension (pecl install mongodb)
  - Install MongoDB dependencies
  - Configure SSL for Atlas connections

- **CHANGED**: Entrypoint script
  - Remove SQLite database file creation
  - Add MongoDB Atlas connection health check
  - Remove migrations (MongoDB is schemaless)
  - Seed default users on first run

## Impact

### Affected Specs

- `specs/auth/spec.md` - MODIFIED (data storage layer only)
- `specs/stories/spec.md` - MODIFIED (data storage layer only)
- `specs/database/spec.md` - ADDED (new capability)

### Affected Code

- `backend/composer.json` - Add mongodb/laravel-mongodb dependency
- `backend/config/database.php` - Add MongoDB connection config
- `backend/app/Models/User.php` - Extend MongoDB model
- `backend/app/Models/Story.php` - Extend MongoDB model
- `backend/Dockerfile` - Install MongoDB PHP extension
- `backend/docker/entrypoint.sh` - Update database setup logic
- `docker-compose.yml` - Remove MongoDB service, add Atlas URI
- `.env.example` - Add MongoDB Atlas connection variables

### API Compatibility

- ✅ **NO BREAKING CHANGES to API endpoints**
- ✅ All controllers remain unchanged
- ✅ All API responses remain identical
- ✅ Authentication flow unchanged
- ✅ Sanctum tokens work identically

### Data Migration

- ⚠️ **No automatic migration from SQLite to MongoDB**
- Fresh database with seeded admin user
- Stories must be re-created via NewsAPI sync
- Recommended approach: Clean deployment

### Performance Impact

- ⏱️ Slightly increased latency (~10-30ms) due to cloud connection
- ⚡ Improved query performance for complex aggregations
- 📊 Better scalability for large datasets
- 💾 No impact on Docker container size (+50MB for MongoDB extension)

### Security Improvements

- 🔒 SSL/TLS encryption in transit (MongoDB Atlas)
- 🔐 Strong authentication (username/password)
- 🌐 IP whitelist capability
- 📦 Secrets managed via environment variables
- 🔑 No database file in Docker volumes
