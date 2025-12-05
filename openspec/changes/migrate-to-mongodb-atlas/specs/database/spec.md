# Database Capability Specification

## Purpose

Define data persistence patterns and requirements for the Weather Analysis Dashboard using MongoDB Atlas cloud database.

## ADDED Requirements

### Requirement: MongoDB Atlas Connection

The system SHALL connect to MongoDB Atlas cloud database using secure connection string.

#### Scenario: Successful connection on startup

- **GIVEN** valid MongoDB Atlas connection string in environment
- **WHEN** backend container starts
- **THEN** connection to MongoDB Atlas is established
- **AND** SSL/TLS encryption is used
- **AND** connection is tested with ping command
- **AND** startup logs show "MongoDB Atlas connected successfully"

#### Scenario: Connection failure handling

- **GIVEN** invalid or unreachable MongoDB Atlas cluster
- **WHEN** backend container starts
- **THEN** connection is retried up to 10 times with 3-second intervals
- **AND** clear error message is logged after max retries
- **AND** container exits with error code if connection fails

#### Scenario: Connection string format

- **GIVEN** MongoDB Atlas cluster is ready
- **WHEN** configuring the application
- **THEN** connection string SHALL follow format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
- **AND** connection string is stored in DB_URI environment variable
- **AND** credentials are not committed to version control

### Requirement: Data Persistence

The system SHALL persist all application data in MongoDB Atlas cloud.

#### Scenario: Data survives container restart

- **GIVEN** data stored in MongoDB Atlas
- **WHEN** Docker containers are restarted or removed
- **THEN** all data remains accessible
- **AND** no data is lost
- **AND** application reconnects to same dataset

#### Scenario: Multiple containers share data

- **GIVEN** multiple backend instances (scaling scenario)
- **WHEN** containers connect to MongoDB Atlas
- **THEN** all containers access the same data
- **AND** concurrent operations are handled correctly

### Requirement: Default Data Seeding

The system SHALL seed default admin user on first deployment.

#### Scenario: First-time deployment

- **GIVEN** empty MongoDB database
- **WHEN** backend container starts for the first time
- **THEN** default admin user is created with credentials: username "admin", password "password123", role "admin"
- **AND** admin user is stored in users collection

#### Scenario: Prevent duplicate seeding

- **GIVEN** admin user already exists in MongoDB
- **WHEN** backend container restarts
- **THEN** seeding is skipped
- **AND** no duplicate users are created
- **AND** log shows "Admin user already exists"

### Requirement: Environment Configuration

The system SHALL configure database connection via environment variables.

#### Scenario: Required environment variables

- **GIVEN** deployment configuration
- **WHEN** starting the application
- **THEN** the following environment variables SHALL be set: `DB_CONNECTION=mongodb` (required), `DB_URI=<connection-string>` (required), `DB_DATABASE=weather_db` (optional, default: weather_db)

#### Scenario: Missing configuration handling

- **GIVEN** DB_URI environment variable is not set
- **WHEN** backend container starts
- **THEN** connection fails with clear error message
- **AND** startup logs indicate missing configuration

### Requirement: Connection Security

The system SHALL ensure secure database connections.

#### Scenario: SSL/TLS encryption enforced

- **GIVEN** MongoDB Atlas connection
- **WHEN** data is transmitted
- **THEN** all traffic is encrypted via SSL/TLS
- **AND** MongoDB Atlas certificates are validated

#### Scenario: Authentication required

- **GIVEN** MongoDB Atlas cluster
- **WHEN** attempting to connect
- **THEN** valid username and password are required
- **AND** connection is rejected without authentication

#### Scenario: IP whitelist (optional)

- **GIVEN** MongoDB Atlas network access configuration
- **WHEN** backend attempts to connect
- **THEN** connection is allowed only from whitelisted IPs
- **AND** 0.0.0.0/0 (allow all) is acceptable for development

### Requirement: Data Model Support

The system SHALL support Eloquent ORM operations on MongoDB collections.

#### Scenario: Create document

- **GIVEN** a MongoDB-backed Eloquent model
- **WHEN** `Model::create($data)` is called
- **THEN** document is inserted into MongoDB collection
- **AND** `_id` (ObjectId) is auto-generated
- **AND** timestamps (created_at, updated_at) are added

#### Scenario: Query documents

- **GIVEN** documents exist in MongoDB collection
- **WHEN** `Model::where()->get()` is called
- **THEN** documents are retrieved and converted to Eloquent models
- **AND** query results are identical to traditional SQL Eloquent behavior

#### Scenario: Update document

- **GIVEN** an existing document in MongoDB
- **WHEN** `$model->update($data)` is called
- **THEN** document is updated in MongoDB
- **AND** `updated_at` timestamp is refreshed

#### Scenario: Delete document

- **GIVEN** an existing document in MongoDB
- **WHEN** `$model->delete()` is called
- **THEN** document is removed from MongoDB
- **AND** soft deletes work if configured

### Requirement: Performance Monitoring

The system SHALL provide visibility into database performance.

#### Scenario: Connection health logging

- **GIVEN** MongoDB Atlas connection is active
- **WHEN** backend container starts
- **THEN** connection status is logged
- **AND** connection time is measured

#### Scenario: MongoDB Atlas dashboard

- **GIVEN** MongoDB Atlas cluster is deployed
- **WHEN** accessing Atlas web dashboard
- **THEN** real-time metrics are available: storage usage, connection count, query performance, network traffic

### Requirement: MongoDB Primary Key Configuration

All Eloquent models SHALL be configured to use MongoDB's `_id` field as the primary key.

#### Scenario: Model primary key configuration

- **GIVEN** a MongoDB-backed Eloquent model
- **WHEN** the model is defined
- **THEN** it SHALL include the following properties: `protected $primaryKey = '_id'`, `public $incrementing = false`, `protected $keyType = 'string'`
- **AND** the `_id` field is auto-generated as ObjectId on creation
- **AND** Eloquent operations correctly use `_id` instead of `id`

#### Scenario: Model save with \_id generation

- **GIVEN** a new model instance
- **WHEN** `$model->save()` or `Model::create()` is called
- **THEN** MongoDB generates ObjectId for `_id`
- **AND** the model's `_id` attribute is set after insertion
- **AND** subsequent operations use the correct `_id` value

#### Scenario: Token generation with ObjectId

- **GIVEN** Laravel Sanctum PersonalAccessToken model
- **WHEN** creating a new token via `createToken()`
- **THEN** token format is `{ObjectId}|{plainTextToken}`
- **AND** token lookup uses `_id` field correctly
- **AND** authentication works with MongoDB-stored tokens

## Technical Details

### MongoDB Collections

- `users` - User accounts and authentication
- `stories` - Weather news stories
- `personal_access_tokens` - API tokens (Sanctum)
- `cache` - Application cache (optional)
- `jobs` - Queue jobs (optional)
- `sessions` - User sessions (optional)

### Connection Configuration

```php
// config/database.php
'mongodb' => [
    'driver' => 'mongodb',
    'dsn' => env('DB_URI'),
    'database' => env('DB_DATABASE', 'weather_db'),
    'options' => [
        'appName' => 'WeatherAnalysisDashboard',
    ],
],
```

### Model Configuration Pattern

```php
use MongoDB\Laravel\Eloquent\Model;

class ExampleModel extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'collection_name';

    // MongoDB primary key configuration (REQUIRED)
    protected $primaryKey = '_id';
    public $incrementing = false;
    protected $keyType = 'string';

    // Standard Eloquent properties work
    protected $fillable = [...];
    protected $casts = [...];
}
```

### Environment Variables

```bash
# MongoDB Atlas Connection
DB_CONNECTION=mongodb
DB_URI=mongodb+srv://user:pass@cluster.mongodb.net/weather_db?retryWrites=true&w=majority
DB_DATABASE=weather_db
```

### Error Handling

- Connection failures: Retry with exponential backoff
- Query errors: Log and return appropriate HTTP status
- Timeout errors: Configure timeout in connection options
- Authentication errors: Clear error message with troubleshooting steps

## Dependencies

- PHP extension: `mongodb` (via pecl)
- Composer package: `mongodb/laravel-mongodb` ^4.7
- External service: MongoDB Atlas (M0 free tier)
