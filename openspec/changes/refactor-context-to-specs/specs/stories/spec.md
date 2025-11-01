# Stories Feature Specification

## Purpose

Allow users to view weather-related news stories, and admins to manage story content sourced from NewsAPI.

## ADDED Requirements

### Requirement: View Paginated Stories

The system SHALL allow authenticated users to view paginated, active stories.

#### Scenario: Get all stories with default pagination

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories` with Bearer token
- **THEN** a 200 response is returned
- **AND** response includes paginated stories (10 per page by default)
- **AND** only stories with `is_active=true` are returned
- **AND** stories are ordered by created_at descending

#### Scenario: Custom pagination

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories?per_page=20&page=2`
- **THEN** page 2 with 20 stories per page is returned

#### Scenario: Filter by category

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories?filter=warning`
- **THEN** only stories with `category=warning` are returned

#### Scenario: Filter by hot stories

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories?filter=hot`
- **THEN** only stories with `is_hot=true` are returned

#### Scenario: Unauthenticated access denied

- **GIVEN** a non-authenticated user
- **WHEN** GET request to `/api/stories`
- **THEN** a 401 Unauthenticated error is returned

### Requirement: View Hot Stories

The system SHALL provide a dedicated endpoint for hot stories.

#### Scenario: Get hot stories with default limit

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories/hot`
- **THEN** 5 most recent hot stories are returned
- **AND** only stories with `is_hot=true` and `is_active=true` are returned

#### Scenario: Custom limit for hot stories

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories/hot?limit=10`
- **THEN** 10 most recent hot stories are returned

### Requirement: Search News from NewsAPI (Admin Only)

The system SHALL allow admins to search news articles from NewsAPI.

#### Scenario: Admin searches news by keyword

- **GIVEN** an authenticated admin user
- **WHEN** GET request to `/api/stories/search?keyword=flood&language=vi`
- **THEN** a 200 response is returned
- **AND** response includes articles from NewsAPI
- **AND** articles are sorted by publishedAt descending

#### Scenario: Non-admin attempts to search news

- **GIVEN** an authenticated non-admin user
- **WHEN** GET request to `/api/stories/search`
- **THEN** a 403 Forbidden error is returned

#### Scenario: NewsAPI error handling

- **GIVEN** NewsAPI is unavailable or returns error
- **WHEN** search request is made
- **THEN** a 500 error is returned
- **AND** error message is logged
- **AND** user-friendly error message is returned

### Requirement: Create Story (Admin Only)

The system SHALL allow admins to save selected news articles as stories.

#### Scenario: Admin creates story successfully

- **GIVEN** an authenticated admin user
- **WHEN** POST request to `/api/stories` with valid story data
- **THEN** a 201 response is returned
- **AND** story is saved with `created_by` = current user ID
- **AND** story is returned in response

#### Scenario: Validation errors on story creation

- **GIVEN** invalid data (e.g., missing title, invalid URL)
- **WHEN** POST request to `/api/stories`
- **THEN** a 422 validation error is returned
- **AND** specific field errors are included

#### Scenario: Non-admin attempts to create story

- **GIVEN** an authenticated non-admin user
- **WHEN** POST request to `/api/stories`
- **THEN** a 403 Forbidden error is returned

### Requirement: Check Stories Existence (Admin Only)

The system SHALL allow admins to check which story URLs already exist in database.

#### Scenario: Check multiple URLs for duplicates

- **GIVEN** an authenticated admin user
- **WHEN** POST request to `/api/stories/check` with array of URLs
- **THEN** a 200 response is returned
- **AND** response includes array of existing URLs in database
- **AND** response excludes non-existing URLs

### Requirement: Update Story (Admin Only)

The system SHALL allow admins to update story properties.

#### Scenario: Admin updates story hot status

- **GIVEN** an authenticated admin user and existing story ID
- **WHEN** PUT request to `/api/stories/{id}` with `is_hot=true`
- **THEN** story is updated
- **AND** updated story is returned

#### Scenario: Admin updates story category

- **GIVEN** an authenticated admin user
- **WHEN** PUT request to `/api/stories/{id}` with `category=warning`
- **THEN** story category is updated to warning

#### Scenario: Invalid category value

- **GIVEN** category value not in [warning, info, normal]
- **WHEN** PUT request to `/api/stories/{id}`
- **THEN** a 422 validation error is returned

#### Scenario: Non-admin attempts to update story

- **GIVEN** an authenticated non-admin user
- **WHEN** PUT request to `/api/stories/{id}`
- **THEN** a 403 Forbidden error is returned

### Requirement: Update Story Hot Status (Admin Only)

The system SHALL provide dedicated endpoint to update hot status.

#### Scenario: Admin marks story as hot

- **GIVEN** an authenticated admin user
- **WHEN** PUT request to `/api/stories/{id}/status` with `is_hot=true`
- **THEN** story `is_hot` is set to true
- **AND** updated story is returned

#### Scenario: Admin unmarks story as hot

- **GIVEN** an authenticated admin user with hot story
- **WHEN** PUT request to `/api/stories/{id}/status` with `is_hot=false`
- **THEN** story `is_hot` is set to false

### Requirement: Delete Story (Admin Only)

The system SHALL allow admins to delete stories.

#### Scenario: Admin deletes story

- **GIVEN** an authenticated admin user and existing story ID
- **WHEN** DELETE request to `/api/stories/{id}`
- **THEN** story is deleted from database
- **AND** success message is returned

#### Scenario: Story not found

- **GIVEN** non-existent story ID
- **WHEN** DELETE request to `/api/stories/{id}`
- **THEN** a 404 error is returned

#### Scenario: Non-admin attempts to delete story

- **GIVEN** an authenticated non-admin user
- **WHEN** DELETE request to `/api/stories/{id}`
- **THEN** a 403 Forbidden error is returned

### Requirement: Get Story Statistics (Admin Only)

The system SHALL provide statistics about stories.

#### Scenario: Admin gets story statistics

- **GIVEN** an authenticated admin user
- **WHEN** GET request to `/api/stories/statistics`
- **THEN** a 200 response is returned
- **AND** response includes total count, hot count, and category counts
- **AND** counts only include active stories

## API Endpoints

### GET /api/stories

- **Access**: Protected (auth:sanctum)
- **Query Parameters**:
  - `per_page`: Items per page (default: 10)
  - `page`: Page number (default: 1)
  - `filter`: Filter by 'hot', 'warning', 'info', 'normal', or null for all
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "stories": [
      {
        "id": 1,
        "title": "Flood warning in southern region",
        "description": "Heavy rain expected...",
        "url": "https://newsapi.org/article/...",
        "image_url": "https://...",
        "author": "John Doe",
        "source": "VNExpress",
        "published_at": "2025-11-01T10:00:00Z",
        "category": "warning",
        "location": "Ho Chi Minh City",
        "is_hot": true,
        "created_at": "2025-11-01T11:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 45,
      "last_page": 5,
      "from": 1,
      "to": 10
    }
  }
  ```

### GET /api/stories/hot

- **Access**: Protected (auth:sanctum)
- **Query Parameters**:
  - `limit`: Number of stories (default: 5)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "stories": [ ... ]
  }
  ```

### GET /api/stories/search (Admin)

- **Access**: Protected (auth:sanctum + role:admin)
- **Query Parameters**:
  - `keyword`: Search term (required)
  - `language`: Language code (optional, default: 'vi')
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "articles": [
      {
        "title": "...",
        "description": "...",
        "url": "...",
        "urlToImage": "...",
        "author": "...",
        "source": { "name": "..." },
        "publishedAt": "..."
      }
    ]
  }
  ```

### POST /api/stories (Admin)

- **Access**: Protected (auth:sanctum + role:admin)
- **Request Body**:
  ```json
  {
    "title": "string (required)",
    "description": "string (optional)",
    "url": "string (required, URL)",
    "image_url": "string (optional, URL)",
    "author": "string (optional)",
    "source": "string (optional)",
    "published_at": "date (optional)",
    "category": "warning|info|normal (optional, default: normal)",
    "location": "string (optional)"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "story": { ... }
  }
  ```

### POST /api/stories/check (Admin)

- **Access**: Protected (auth:sanctum + role:admin)
- **Request Body**:
  ```json
  {
    "urls": ["url1", "url2", "url3"]
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "existing_urls": ["url1", "url3"]
  }
  ```

### PUT /api/stories/{id} (Admin)

- **Access**: Protected (auth:sanctum + role:admin)
- **Request Body**:
  ```json
  {
    "is_hot": "boolean (optional)",
    "category": "warning|info|normal (optional)"
  }
  ```

### PUT /api/stories/{id}/status (Admin)

- **Access**: Protected (auth:sanctum + role:admin)
- **Request Body**:
  ```json
  {
    "is_hot": "boolean (required)"
  }
  ```

### DELETE /api/stories/{id} (Admin)

- **Access**: Protected (auth:sanctum + role:admin)

### GET /api/stories/statistics (Admin)

- **Access**: Protected (auth:sanctum + role:admin)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "statistics": {
      "total": 45,
      "hot_count": 8,
      "by_category": {
        "warning": 12,
        "info": 18,
        "normal": 15
      }
    }
  }
  ```

## Database Schema

### stories table

- `id`: Primary key (auto-increment)
- `title`: String (required)
- `description`: Text (nullable)
- `source`: String (nullable)
- `url`: String (required, unique)
- `image_url`: String (nullable)
- `author`: String (nullable)
- `published_at`: Timestamp (nullable)
- `category`: Enum (warning, info, normal) - default: normal
- `location`: String (nullable)
- `is_active`: Boolean - default: true
- `is_hot`: Boolean - default: false
- `created_by`: Foreign key to users.id
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Indexes

- `url`: Unique index for duplicate checking
- `is_active, created_at`: Composite index for efficient querying
- `is_hot, is_active`: Composite index for hot stories queries

## External API Integration

### NewsAPI

- **Base URL**: https://newsapi.org/v2/everything
- **Authentication**: API Key (env: NEWS_API_KEY)
- **Rate Limits**: Based on plan (free tier: 100 requests/day)
- **Parameters**:
  - `q`: Keyword query
  - `language`: Language code (vi, en)
  - `sortBy`: Sort order (publishedAt, relevancy)
  - `pageSize`: Results per page (max: 100)
  - `apiKey`: API key
- **Error Handling**:
  - Log errors to Laravel log
  - Return 500 with user-friendly message
  - Don't expose API key or internal errors to client

## Business Rules

### Story Categories

- **warning**: Severe weather alerts, urgent news (red/orange theme)
- **info**: General weather information, educational content (blue theme)
- **normal**: Regular weather-related news (default theme)

### Hot Stories

- Stories flagged by admin as particularly important
- Displayed prominently on homepage
- Limited to top 5 most recent
- Can be filtered in main stories list

### Active/Inactive Stories

- Only active stories are visible to users
- Inactive stories are soft-deleted (is_active=false)
- Admins can delete stories (hard delete from database)

### Story Ownership

- `created_by` tracks which admin created the story
- Currently used for audit purposes
- May be extended for edit history in future
