# Authentication Specification

## Purpose
Provide secure authentication and authorization for the Weather Analysis Dashboard using Laravel Sanctum token-based authentication.

## ADDED Requirements

### Requirement: User Login
The system SHALL authenticate users via username/password and issue a Sanctum bearer token.

#### Scenario: Successful login with valid credentials
- **GIVEN** a registered user with username "admin" and password "password123"
- **WHEN** the user POSTs to `/api/login` with valid credentials
- **THEN** a 200 response is returned
- **AND** response contains `success: true`, `access_token`, and user object
- **AND** user object includes `id`, `name`, `username`, `email`, `role`
- **AND** old tokens are revoked before issuing new token

#### Scenario: Login fails with invalid credentials
- **GIVEN** a user provides invalid username or password
- **WHEN** the user POSTs to `/api/login`
- **THEN** a 422 validation error is returned
- **AND** no token is issued

#### Scenario: Login with missing fields
- **GIVEN** username or password is missing from request
- **WHEN** the user POSTs to `/api/login`
- **THEN** a 422 validation error is returned

### Requirement: User Logout
The system SHALL allow authenticated users to logout and revoke their current token.

#### Scenario: Successful logout
- **GIVEN** an authenticated user with valid token
- **WHEN** the user POSTs to `/api/logout` with Bearer token
- **THEN** a 200 response is returned
- **AND** the current access token is deleted
- **AND** response contains `success: true`

#### Scenario: Logout without authentication
- **GIVEN** an unauthenticated request
- **WHEN** POST to `/api/logout` without Bearer token
- **THEN** a 401 Unauthenticated error is returned

### Requirement: Get Current User
The system SHALL return current authenticated user details.

#### Scenario: Get user info with valid token
- **GIVEN** an authenticated user
- **WHEN** the user GETs `/api/me` with Bearer token
- **THEN** a 200 response is returned
- **AND** response contains user object with id, name, username, email, role

#### Scenario: Get user info without token
- **GIVEN** an unauthenticated request
- **WHEN** GET to `/api/me` without Bearer token
- **THEN** a 401 Unauthenticated error is returned

### Requirement: Role-Based Access Control
The system MUST enforce role-based authorization for admin endpoints.

#### Scenario: Admin accesses admin endpoints
- **GIVEN** an authenticated user with role="admin"
- **WHEN** the admin makes requests to admin-only endpoints
- **THEN** the request is allowed

#### Scenario: Regular user attempts admin endpoints
- **GIVEN** an authenticated user with role="customer"
- **WHEN** the user makes requests to admin-only endpoints
- **THEN** a 403 Forbidden error is returned

### Requirement: Token Management
The system SHALL use Laravel Sanctum for token-based authentication.

#### Scenario: Token in Authorization header
- **GIVEN** a valid Sanctum token
- **WHEN** request includes header `Authorization: Bearer {token}`
- **THEN** the user is authenticated

#### Scenario: Expired or invalid token
- **GIVEN** an invalid or non-existent token
- **WHEN** request includes invalid Bearer token
- **THEN** a 401 Unauthenticated error is returned

## API Endpoints

### POST /api/login
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "string (required)",
    "password": "string (required)"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "user": {
      "id": 1,
      "name": "Admin User",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "access_token": "1|...",
    "token_type": "Bearer"
  }
  ```

### POST /api/logout
- **Access**: Protected (auth:sanctum)
- **Headers**: `Authorization: Bearer {token}`
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Successfully logged out"
  }
  ```

### GET /api/me
- **Access**: Protected (auth:sanctum)
- **Headers**: `Authorization: Bearer {token}`
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "name": "Admin User",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
  ```

## Database Schema

### users table
- `id`: Primary key
- `name`: String
- `username`: String, unique
- `email`: String, unique
- `password`: Hashed string
- `role`: Enum (admin, customer)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### personal_access_tokens table (Sanctum)
- Managed by Laravel Sanctum
- Stores access tokens for authenticated users

