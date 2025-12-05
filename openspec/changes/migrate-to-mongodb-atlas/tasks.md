# Implementation Tasks

## 1. MongoDB Atlas Setup (Manual)

- [x] 1.1 Create MongoDB Atlas account
- [x] 1.2 Create free M0 cluster (user confirmed cluster exists)
- [ ] 1.3 Configure database user (username/password)
- [ ] 1.4 Configure network access (IP whitelist: 0.0.0.0/0 for testing)
- [ ] 1.5 Get MongoDB Atlas connection string
- [ ] 1.6 Test connection with mongosh or Compass

## 2. Update Backend Dependencies

- [x] 2.1 Add `mongodb/laravel-mongodb` to backend/composer.json
- [x] 2.2 Set version constraint: `"mongodb/laravel-mongodb": "^4.7"`
- [x] 2.3 Run `composer install` locally to verify

## 3. Update Dockerfile for MongoDB Support

- [x] 3.1 Add MongoDB PHP extension installation to backend/Dockerfile
- [x] 3.2 Install system dependencies: `openssl-dev autoconf g++ make`
- [x] 3.3 Run `pecl install mongodb-1.19.0`
- [x] 3.4 Enable extension: `docker-php-ext-enable mongodb`
- [x] 3.5 Test Docker build locally

## 4. Configure Laravel Database

- [x] 4.1 Add MongoDB connection to backend/config/database.php
- [x] 4.2 Configure DSN-based connection (connection string)
- [x] 4.3 Set default connection to 'mongodb'
- [x] 4.4 Add appName option: 'WeatherAnalysisDashboard'

## 5. Update User Model

- [x] 5.1 Change User model to extend `MongoDB\Laravel\Auth\User`
- [x] 5.2 Add `protected $connection = 'mongodb'`
- [x] 5.3 Add `protected $collection = 'users'`
- [x] 5.4 Keep all existing methods (isAdmin, isCustomer)
- [x] 5.5 Keep existing fillable, hidden, casts
- [x] 5.6 Configure MongoDB primary key (\_id)

## 6. Update Story Model

- [x] 6.1 Change Story model to extend `MongoDB\Laravel\Eloquent\Model`
- [x] 6.2 Add `protected $connection = 'mongodb'`
- [x] 6.3 Add `protected $collection = 'stories'`
- [x] 6.4 Keep all existing methods and relationships
- [x] 6.5 Keep existing fillable, casts
- [x] 6.6 Configure MongoDB primary key (\_id)

## 6.5 Create PersonalAccessToken Model

- [x] 6.5.1 Create custom PersonalAccessToken extending Sanctum
- [x] 6.5.2 Add MongoDB DocumentModel trait
- [x] 6.5.3 Override performInsert() for \_id handling
- [x] 6.5.4 Override getKey() and getIdAttribute()
- [x] 6.5.5 Override findToken() for MongoDB \_id
- [x] 6.5.6 Configure in AppServiceProvider

## 7. Update Docker Compose

- [x] 7.1 Remove mongodb service from docker-compose.yml
- [x] 7.2 Remove weather-mongodb-data volume
- [x] 7.3 Remove weather-mongodb-config volume
- [x] 7.4 Add DB_URI environment variable to backend service
- [x] 7.5 Remove mongodb dependency from backend service
- [x] 7.6 Keep weather-storage volume (for logs, cache)

## 8. Update Entrypoint Script

- [x] 8.1 Remove SQLite database creation section
- [x] 8.2 Add MongoDB Atlas connection check with retry logic
- [x] 8.3 Test connection using: `DB::connection()->command(['ping' => 1])`
- [x] 8.4 Add clear error messages for connection failures
- [x] 8.5 Keep seeding logic for default users
- [x] 8.6 Add check to avoid duplicate seeding

## 9. Update Environment Configuration

- [x] 9.1 Create .env.example with MongoDB Atlas variables
- [x] 9.2 Add DB_CONNECTION=mongodb
- [x] 9.3 Add DB_URI placeholder with example Atlas connection string
- [x] 9.4 Update .gitignore to include .env (protect credentials)
- [x] 9.5 Document required environment variables in README

## 10. Update Documentation

- [x] 10.1 Update README.md with MongoDB Atlas setup instructions
- [x] 10.2 Add "MongoDB Atlas Configuration" section
- [ ] 10.3 Update DATA_PERSISTENCE_GUIDE.md
- [ ] 10.4 Update DOCKER_DEPLOYMENT.md
- [ ] 10.5 Add troubleshooting section for connection issues

## 11. Testing

- [x] 11.1 Build new Docker image locally
- [x] 11.2 Test authentication endpoints (POST /api/login)
- [x] 11.3 Test user info endpoint (GET /api/me)
- [x] 11.4 Test stories CRUD (GET, POST, PUT, DELETE /api/stories)
- [x] 11.5 Test stories pagination and filtering
- [x] 11.6 Test role-based authorization (admin vs customer)
- [x] 11.7 Verify default admin user is seeded
- [x] 11.8 Test weather endpoints (no database interaction, should work)

## 11.5 Bug Fixes

- [x] 11.5.1 Fix Story model missing \_id primary key config
- [x] 11.5.2 Fix User model missing \_id primary key config
- [x] 11.5.3 Fix StoryController missing is_active default
- [x] 11.5.4 Fix PersonalAccessToken \_id insertion
- [x] 11.5.5 Fix session/cache drivers (database -> file)

## 12. Build and Deploy

- [ ] 12.1 Update build-and-push.sh if needed
- [ ] 12.2 Build backend image: `docker build -t dung317/weather-backend:latest backend/`
- [ ] 12.3 Test image locally with Atlas connection
- [ ] 12.4 Push to Docker Hub: `docker push dung317/weather-backend:latest`
- [ ] 12.5 Update frontend image if needed (no changes expected)
- [ ] 12.6 Test deployment with docker-compose

## 13. Validation

- [ ] 13.1 Verify all API endpoints return correct responses
- [ ] 13.2 Check MongoDB Atlas dashboard for data
- [ ] 13.3 Verify users collection has admin user
- [ ] 13.4 Verify stories can be created and retrieved
- [ ] 13.5 Check Docker logs for errors
- [ ] 13.6 Verify healthcheck passes
- [ ] 13.7 Test deployment on clean server

## 14. Archive Change

- [ ] 14.1 Complete all tasks above
- [ ] 14.2 Update task checkboxes to [x]
- [ ] 14.3 Run `openspec validate migrate-to-mongodb-atlas --strict`
- [ ] 14.4 Archive change: `openspec archive migrate-to-mongodb-atlas --yes`
- [ ] 14.5 Verify specs are updated
- [ ] 14.6 Commit changes to git
