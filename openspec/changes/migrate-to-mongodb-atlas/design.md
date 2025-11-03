# Migration to MongoDB Atlas - Design Document

## Context

The Weather Analysis Dashboard currently uses SQLite for data persistence. The application has three main entities:

1. Users (authentication, roles)
2. Stories (weather news from NewsAPI)
3. Personal Access Tokens (Laravel Sanctum)

The system is deployed via Docker containers and needs to scale for production use. User has created a MongoDB Atlas cluster and wants to migrate to cloud-hosted database.

### Current Architecture

- Database: SQLite (file-based, stored in Docker volume)
- ORM: Laravel Eloquent
- Models: User, Story
- Authentication: Laravel Sanctum
- Deployment: Docker Compose

### Constraints

- Must maintain API compatibility (no frontend changes)
- Free tier budget (MongoDB Atlas M0: 512MB)
- Minimal deployment complexity
- Zero downtime for future deployments
- User has already created Atlas cluster

## Goals / Non-Goals

### Goals

- ✅ Migrate from SQLite to MongoDB Atlas cloud database
- ✅ Maintain 100% API compatibility (no controller changes)
- ✅ Improve data persistence (survive container removal)
- ✅ Enable automatic backups
- ✅ Support future scaling
- ✅ Simplify deployment (fewer Docker services)
- ✅ Use MongoDB Atlas free tier

### Non-Goals

- ❌ Migrate existing SQLite data (fresh start acceptable)
- ❌ Change API endpoints or responses
- ❌ Modify authentication flow
- ❌ Add new features
- ❌ Optimize database performance beyond basic indexes
- ❌ Implement sharding or replication (Atlas handles this)

## Decisions

### Decision 1: Use MongoDB Atlas (Cloud) vs Self-Hosted MongoDB

**Chosen**: MongoDB Atlas (Cloud)

**Rationale**:

- User already created Atlas cluster
- Zero infrastructure management
- Free tier sufficient (512MB vs ~21MB estimated usage)
- Built-in backups, monitoring, security
- Simpler docker-compose.yml (no MongoDB container)
- Production-ready by default

**Alternatives Considered**:

1. **Self-hosted MongoDB in Docker**

   - ❌ Requires container management
   - ❌ Manual backup setup
   - ❌ Volume management complexity
   - ❌ No built-in monitoring

2. **Keep SQLite**
   - ❌ Not production-ready
   - ❌ Poor concurrency
   - ❌ Data loss risk

### Decision 2: mongodb/laravel-mongodb vs Jenssegers/laravel-mongodb

**Chosen**: `mongodb/laravel-mongodb` (official package)

**Rationale**:

- Official MongoDB package (maintained by MongoDB Inc.)
- Laravel 11 support
- Better long-term support
- Eloquent-compatible API
- Active development

**Alternatives**:

- `jenssegers/laravel-mongodb` - Community package, less maintained

### Decision 3: Connection String (DSN) vs Individual Parameters

**Chosen**: Connection String (DSN) approach

**Rationale**:

- Atlas provides connection string by default
- Simpler configuration (one environment variable)
- Includes all SSL/TLS settings
- Standard MongoDB URI format

**Configuration**:

```php
'mongodb' => [
    'driver' => 'mongodb',
    'dsn' => env('DB_URI'), // Full connection string
    'database' => env('DB_DATABASE', 'weather_db'),
],
```

### Decision 4: Data Migration Strategy

**Chosen**: Fresh database with seeded data (no migration)

**Rationale**:

- Minimal existing data (only test users/stories)
- Simpler implementation
- User can re-sync stories from NewsAPI
- No schema conversion complexity

**Alternatives**:

1. **Export SQLite → Import MongoDB**
   - ❌ Complex transformation logic
   - ❌ Not worth effort for small dataset
   - ❌ Risk of data corruption

### Decision 5: Model Architecture

**Chosen**: Keep Eloquent models, extend MongoDB classes

**Rationale**:

- Maintains existing codebase
- Controllers require zero changes
- Eloquent API compatibility
- Minimal refactoring

**Implementation**:

- User: `extends MongoDB\Laravel\Auth\User`
- Story: `extends MongoDB\Laravel\Eloquent\Model`
- Add `$connection = 'mongodb'` property
- Add `$collection` property

### Decision 6: MongoDB Indexes

**Chosen**: Let MongoDB auto-create indexes, add manual indexes later if needed

**Rationale**:

- Premature optimization
- Small dataset (<10K stories)
- Can add indexes in production based on actual query patterns

**Future indexes** (if performance issues):

- `users.username` (unique)
- `users.email` (unique)
- `stories.published_at` (descending)
- `stories.is_active` (filtering)

## Risks / Trade-offs

### Risk 1: Increased Latency

- **Risk**: Cloud database adds network latency (~10-30ms)
- **Impact**: Low (acceptable for this application)
- **Mitigation**:
  - Choose Atlas region close to deployment server
  - Enable caching for frequently accessed data
  - Monitor performance with Atlas dashboard

### Risk 2: Connection String Exposure

- **Risk**: MongoDB URI contains password in plain text
- **Impact**: High (security vulnerability)
- **Mitigation**:
  - Store in .env file (not committed to git)
  - Use Docker secrets in production
  - Rotate credentials regularly
  - Restrict IP whitelist

### Risk 3: Free Tier Limitations

- **Risk**: Exceeding 512MB storage limit
- **Impact**: Medium (service degradation)
- **Mitigation**:
  - Monitor storage usage in Atlas dashboard
  - Estimated usage: ~21MB (plenty of room)
  - Implement data retention policy for old stories
  - Easy upgrade path to paid tier if needed

### Risk 4: MongoDB Atlas Outage

- **Risk**: Atlas service downtime affects application
- **Impact**: High (application unavailable)
- **Mitigation**:
  - Atlas SLA: 99.995% uptime
  - Atlas handles redundancy/failover automatically
  - Monitor status: https://status.mongodb.com
  - Implement retry logic in entrypoint script

### Risk 5: Breaking API Compatibility

- **Risk**: MongoDB differences break existing API behavior
- **Impact**: High (frontend breaks)
- **Mitigation**:
  - Extensive testing of all endpoints
  - Eloquent API maintains compatibility
  - No controller code changes
  - Integration tests before deployment

## Migration Plan

### Phase 1: Local Development Setup

1. Install mongodb/laravel-mongodb package
2. Update models and configuration
3. Test locally with MongoDB Atlas
4. Verify all API endpoints work

### Phase 2: Docker Image Updates

1. Update Dockerfile with MongoDB extension
2. Build and test image locally
3. Update docker-compose.yml
4. Test with Atlas connection string

### Phase 3: Deployment

1. Push images to Docker Hub
2. Update production .env with Atlas URI
3. Deploy with docker-compose
4. Monitor logs and Atlas dashboard
5. Seed admin user
6. Verify authentication

### Phase 4: Validation

1. Test all authentication endpoints
2. Test stories CRUD operations
3. Verify data persistence
4. Check Atlas dashboard for data
5. Monitor performance metrics

### Rollback Plan

If migration fails:

1. Revert to old Docker image (sqlite version)
2. Restore SQLite volume from backup
3. Restart containers
4. Estimated rollback time: <5 minutes

## Open Questions

### Q1: MongoDB Atlas Region Selection

**Question**: Which Atlas region should be used?
**Recommendation**: Singapore or Tokyo (closest to Vietnam)
**Impact**: Affects latency by ~20-50ms

### Q2: IP Whitelist Configuration

**Question**: Should we whitelist specific IPs or use 0.0.0.0/0?
**Recommendation**:

- Development: 0.0.0.0/0 (allow all)
- Production: Specific server IPs only

### Q3: Database Name

**Question**: What should the MongoDB database be named?
**Recommendation**: `weather_db` (matches current convention)

### Q4: Connection Pool Size

**Question**: Should we configure connection pooling?
**Recommendation**: Use defaults for now, optimize if needed

### Q5: Sanctum Token Storage

**Question**: Does Sanctum work with MongoDB?
**Answer**: Yes, `personal_access_tokens` stored as MongoDB collection
**Verification**: Test login/logout thoroughly

## Performance Considerations

### Expected Performance

- **Reads**: 10-50ms (vs 1-5ms SQLite)
- **Writes**: 20-100ms (vs 5-10ms SQLite)
- **Acceptable**: Yes, for this application type

### Optimization Opportunities (Future)

1. Add indexes for frequently queried fields
2. Implement Redis caching layer
3. Use Atlas read replicas
4. Optimize query patterns with aggregation pipelines

## Security Checklist

- [ ] MongoDB Atlas cluster created with strong password
- [ ] IP whitelist configured appropriately
- [ ] SSL/TLS enabled (default in Atlas)
- [ ] Connection string stored in .env (not committed)
- [ ] Database user has minimum required permissions
- [ ] Regular credential rotation planned
- [ ] Network encryption verified
- [ ] Application-level authentication working

## Success Criteria

✅ **Migration is successful if:**

1. All API endpoints return correct responses
2. Authentication (login/logout) works
3. Stories CRUD operations work
4. Data persists in MongoDB Atlas (visible in dashboard)
5. Default admin user is seeded
6. Docker containers start without errors
7. Healthcheck passes
8. No performance degradation (< 100ms response times)

## Timeline Estimate

- MongoDB Atlas setup: 30 minutes (user completed)
- Code changes: 2-3 hours
- Docker updates: 1 hour
- Testing: 2 hours
- Deployment: 1 hour
- **Total**: 6-7 hours

## Lessons Learned

### Issue 1: MongoDB Primary Key (\_id vs id)

**Problem**: Laravel Eloquent defaults to using `id` as primary key with auto-increment. MongoDB uses `_id` with ObjectId, causing:

- Stories not being saved/retrieved correctly
- Token IDs being empty in Sanctum authentication
- Infinite recursion in `getKey()` method

**Solution**: Configure all MongoDB models with:

```php
protected $primaryKey = '_id';
public $incrementing = false;
protected $keyType = 'string';
```

**Models affected**:

- `User.php`
- `Story.php`
- `PersonalAccessToken.php`

**Files changed**:

- `backend/app/Models/User.php`
- `backend/app/Models/Story.php`
- `backend/app/Models/PersonalAccessToken.php`

### Issue 2: Story is_active Default Value

**Problem**: New stories created via API were not visible in list because:

- `StoryController::createStory()` didn't set `is_active` field
- `StoryController::getStories()` filters by `is_active = true`
- MongoDB doesn't have default values like SQL

**Solution**: Add explicit defaults in controller:

```php
'is_active' => $request->is_active ?? true,
'is_hot' => $request->is_hot ?? false,
```

**File changed**: `backend/app/Http/Controllers/StoryController.php`

### Issue 3: Laravel Sanctum with MongoDB

**Problem**: Sanctum's default `PersonalAccessToken` expects SQL database with `id` field.

**Solution**: Create custom `PersonalAccessToken` model that:

- Extends `Laravel\Sanctum\PersonalAccessToken`
- Uses `MongoDB\Laravel\Eloquent\DocumentModel` trait
- Overrides `performInsert()` to set `_id` after insertion
- Overrides `getKey()` and `getIdAttribute()` to return `_id`
- Overrides `findToken()` to query by `_id`

**File created**: `backend/app/Models/PersonalAccessToken.php`
**File modified**: `backend/app/Providers/AppServiceProvider.php`

### Issue 4: Session/Cache Drivers

**Problem**: `SESSION_DRIVER=database` and `CACHE_STORE=database` expected SQL PDO connection, causing "Call to a member function prepare() on null" errors.

**Solution**: Changed drivers to file-based:

```env
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

**Impact**: Acceptable for single-server deployment, may need Redis for multi-server scaling.

### Issue 5: URL-Encoded Password in Connection String

**Problem**: MongoDB Atlas password contained special character `@` that broke URI parsing, causing authentication failures.

**Solution**: Either:

1. Change password to avoid special characters, or
2. URL-encode special characters in connection string

**Recommendation**: Use passwords without special characters for simplicity.

### Issue 6: Laravel 12 Compatibility

**Problem**: `mongodb/laravel-mongodb` ^4.7 is not compatible with Laravel 12.

**Solution**: Downgraded Laravel framework from ^12.0 to ^11.0 in `composer.json`.

**File changed**: `backend/composer.json`
