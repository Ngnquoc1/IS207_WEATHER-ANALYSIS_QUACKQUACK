## MODIFIED Requirements

### Requirement: User Login

The system SHALL authenticate users via username/password and issue a Sanctum bearer token stored in MongoDB.

#### Scenario: Successful login with valid credentials

- **GIVEN** a registered user with username "admin" and password "password123" in MongoDB
- **WHEN** the user POSTs to `/api/login` with valid credentials
- **THEN** a 200 response is returned
- **AND** response contains `success: true`, `access_token`, and user object
- **AND** user object includes `id`, `name`, `username`, `email`, `role`
- **AND** old tokens are revoked before issuing new token in MongoDB
- **AND** personal_access_tokens collection is updated in MongoDB

#### Scenario: Login fails with invalid credentials

- **GIVEN** an invalid username or password
- **WHEN** the user POSTs to `/api/login`
- **THEN** a 401 response is returned
- **AND** response contains `success: false` and error message

### Requirement: User Logout

The system SHALL revoke the current user's Sanctum bearer token from MongoDB.

#### Scenario: Successful logout

- **GIVEN** an authenticated user with valid Bearer token
- **WHEN** the user POSTs to `/api/logout` with Bearer token
- **THEN** a 200 response is returned
- **AND** response contains `success: true` and logout message
- **AND** the current access token is deleted from MongoDB personal_access_tokens collection

### Requirement: Get Current User Info

The system SHALL return the authenticated user's information from MongoDB.

#### Scenario: Retrieve user info with valid token

- **GIVEN** an authenticated user with valid Bearer token
- **WHEN** the user GETs `/api/me` with Bearer token
- **THEN** a 200 response is returned
- **AND** response contains user object with `id`, `name`, `username`, `email`, `role`
- **AND** user data is fetched from MongoDB users collection

### Requirement: Role-Based Access Control

The system SHALL enforce role-based permissions (admin, customer) using MongoDB stored user data.

#### Scenario: Admin can access admin-only endpoints

- **GIVEN** an authenticated user with role="admin" in MongoDB
- **WHEN** the user accesses admin-only endpoints (e.g., POST /api/stories)
- **THEN** access is granted
- **AND** role is verified from MongoDB users collection

#### Scenario: Customer cannot access admin endpoints

- **GIVEN** an authenticated user with role="customer" in MongoDB
- **WHEN** the user attempts to access admin-only endpoints
- **THEN** a 403 Forbidden response is returned

### Requirement: Token Management

The system SHALL manage personal access tokens in MongoDB with automatic expiration.

#### Scenario: Token validation

- **GIVEN** a valid Sanctum token in MongoDB personal_access_tokens collection
- **WHEN** the token is used in Authorization header
- **THEN** the request is authenticated successfully
- **AND** token is looked up in MongoDB

#### Scenario: Expired token rejection

- **GIVEN** an expired or revoked token
- **WHEN** the token is used
- **THEN** a 401 Unauthorized response is returned

## Database Schema

### MongoDB Collections

#### users collection

```json
{
  "_id": ObjectId,
  "name": String,
  "username": String (unique),
  "email": String (unique),
  "email_verified_at": Date (nullable),
  "password": String (hashed),
  "role": String (enum: "admin", "customer"),
  "remember_token": String (nullable),
  "created_at": Date,
  "updated_at": Date
}
```

#### personal_access_tokens collection

```json
{
  "_id": ObjectId,
  "tokenable_type": String ("App\\Models\\User"),
  "tokenable_id": ObjectId (references users._id),
  "name": String,
  "token": String (hashed, unique),
  "abilities": Array,
  "last_used_at": Date (nullable),
  "expires_at": Date (nullable),
  "created_at": Date,
  "updated_at": Date
}
```

## API Endpoints (Unchanged)

All authentication endpoints remain identical:

- POST /api/login
- POST /api/logout
- GET /api/me

Request/response formats unchanged.
