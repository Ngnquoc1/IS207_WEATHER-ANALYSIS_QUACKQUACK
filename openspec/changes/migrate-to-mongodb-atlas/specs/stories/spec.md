## MODIFIED Requirements

### Requirement: View Paginated Stories

The system SHALL allow authenticated users to view paginated, active stories from MongoDB.

#### Scenario: Get all stories with default pagination

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories` with Bearer token
- **THEN** a 200 response is returned
- **AND** response includes paginated stories from MongoDB (10 per page by default)
- **AND** only stories with `is_active=true` are returned from MongoDB stories collection
- **AND** stories are ordered by created_at descending

#### Scenario: Custom pagination

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories?per_page=20&page=2`
- **THEN** page 2 with 20 stories per page is returned from MongoDB
- **AND** pagination metadata includes total, current_page, last_page

### Requirement: Create Story (Admin Only)

The system SHALL allow admins to create new weather stories in MongoDB with default values for required fields.

#### Scenario: Admin creates story successfully

- **GIVEN** an authenticated admin user
- **WHEN** POST request to `/api/stories` with story data
- **THEN** a 201 response is returned
- **AND** story is saved to MongoDB stories collection
- **AND** response contains the created story with `_id` (ObjectId)
- **AND** `created_by` field is set to admin's MongoDB user `_id`
- **AND** `is_active` defaults to `true` if not provided in request
- **AND** `is_hot` defaults to `false` if not provided in request
- **AND** `category` defaults to `'normal'` if not provided in request

#### Scenario: Story primary key is ObjectId

- **GIVEN** a newly created story
- **WHEN** saved to MongoDB
- **THEN** story has `_id` field as ObjectId
- **AND** `_id` is returned in API response
- **AND** story can be retrieved using `_id`

#### Scenario: Customer cannot create story

- **GIVEN** an authenticated customer user
- **WHEN** POST request to `/api/stories`
- **THEN** a 403 Forbidden response is returned

### Requirement: Update Story (Admin Only)

The system SHALL allow admins to update existing stories in MongoDB.

#### Scenario: Admin updates story successfully

- **GIVEN** an authenticated admin user
- **AND** an existing story in MongoDB
- **WHEN** PUT/PATCH request to `/api/stories/{id}` with updated data
- **THEN** a 200 response is returned
- **AND** story is updated in MongoDB stories collection
- **AND** response contains the updated story

### Requirement: Delete Story (Admin Only)

The system SHALL allow admins to soft-delete stories in MongoDB.

#### Scenario: Admin deletes story successfully

- **GIVEN** an authenticated admin user
- **AND** an existing story in MongoDB
- **WHEN** DELETE request to `/api/stories/{id}`
- **THEN** a 200 response is returned
- **AND** story `is_active` is set to false in MongoDB
- **AND** story is not removed from database (soft delete)

### Requirement: Search and Filter Stories

The system SHALL support searching and filtering stories from MongoDB.

#### Scenario: Search stories by keyword

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories?search=typhoon`
- **THEN** stories with "typhoon" in title or description are returned from MongoDB
- **AND** search is case-insensitive

#### Scenario: Filter by category

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories?category=warning`
- **THEN** only stories with category="warning" are returned from MongoDB

#### Scenario: Filter by hot status

- **GIVEN** an authenticated user
- **WHEN** GET request to `/api/stories?is_hot=true`
- **THEN** only stories with `is_hot=true` are returned from MongoDB

## Database Schema

### MongoDB Collection: stories

```json
{
  "_id": ObjectId,
  "title": String (required),
  "description": String (nullable),
  "source": String (nullable),
  "url": String (required, unique),
  "image_url": String (nullable),
  "author": String (nullable),
  "published_at": Date (nullable),
  "category": String (enum: "warning", "info", "normal", default: "normal"),
  "location": String (nullable),
  "is_active": Boolean (default: true),
  "is_hot": Boolean (default: false),
  "created_by": ObjectId (references users._id, nullable, onDelete: null),
  "created_at": Date,
  "updated_at": Date
}
```

### Indexes (Future Optimization)

- `published_at` (descending) - for date ordering
- `is_active` - for filtering active stories
- `is_hot` - for hot stories filter
- `category` - for category filtering
- Text index on `title` and `description` - for search

## API Endpoints (Unchanged)

All stories endpoints remain identical:

- GET /api/stories
- GET /api/stories/{id}
- POST /api/stories (admin only)
- PUT/PATCH /api/stories/{id} (admin only)
- DELETE /api/stories/{id} (admin only)

Request/response formats unchanged.
