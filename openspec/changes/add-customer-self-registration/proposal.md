## Why
Users currently cannot self-register and must rely on seeded accounts. Allowing customer self-signup reduces admin overhead and lets new users access the dashboard immediately.

## What Changes
- Add public `/api/register` endpoint that creates a user with role `customer`, validates username/email uniqueness, and issues a Sanctum token.
- Extend frontend auth flow with a register tab in the login modal, capturing username/email/password/confirm and auto-logging in on success.
- Add specs and tests for registration success, duplicate username/email, and validation failures.

## Impact
- Affected specs: `specs/auth/spec.md` (add registration requirement)
- Affected code: `backend/routes/api.php`, `backend/app/Http/Controllers/AuthController.php`, backend tests; `frontend/src/services/authService.js`, `frontend/src/components/LoginModal.js`
- Breaking changes: None (additive)

