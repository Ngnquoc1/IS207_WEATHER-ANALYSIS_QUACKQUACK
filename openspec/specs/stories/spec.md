# stories Specification

## Purpose

Allow users to view weather-related news stories, and admins to manage story content sourced from NewsAPI.

## Requirements

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
