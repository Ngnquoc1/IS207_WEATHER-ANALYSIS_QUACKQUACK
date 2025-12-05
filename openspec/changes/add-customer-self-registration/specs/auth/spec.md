## ADDED Requirements
### Requirement: User Self Registration
The system SHALL allow guests to create an account with role set to `customer` via a public API.

#### Scenario: Successful registration
- **GIVEN** a guest provides valid username, email, password (min 6 chars), and matching confirm password
- **WHEN** the guest POSTs to `/api/register`
- **THEN** a 201 response is returned with `success: true`, `access_token`, `token_type`, and user object (`id`, `name` optional, `username`, `email`, `role`)
- **AND** the user is created with `role = "customer"` regardless of payload content

#### Scenario: Duplicate username or email
- **GIVEN** a guest submits a username or email that already exists
- **WHEN** the guest POSTs to `/api/register`
- **THEN** a 422 validation error is returned
- **AND** no user is created

#### Scenario: Missing or invalid fields
- **GIVEN** required fields are missing, password is shorter than 6 characters, or confirm password does not match
- **WHEN** the guest POSTs to `/api/register`
- **THEN** a 422 validation error is returned
- **AND** no user is created

