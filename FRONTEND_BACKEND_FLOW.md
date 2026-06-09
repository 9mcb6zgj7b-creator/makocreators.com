# Frontend And Backend Flow

Read `COLLABORATION.md` before changing this project.

## Product Entry

- `/login` is the public sign-in page.
- `/` redirects to `/dashboard`.
- `/dashboard`, `/ops`, `/creators`, `/campaigns`, and `/reports` are protected product pages.

## Login Flow

The frontend supports either email or phone sign-in.

1. The user enters an email address or phone number on `/login`.
2. The frontend calls `POST /api/auth/request-code`.
3. The backend validates and normalizes the identifier, creates a `LoginChallenge`, and returns a local preview code only when `AUTH_SHOW_DEV_CODE=true`.
4. The user enters the verification code.
5. The frontend calls `POST /api/auth/verify-code`.
6. The backend verifies the code, creates or finds the `User`, creates or finds the user's default `Workspace`, creates a `Session`, and sets the `maco_session` http-only cookie.
7. The frontend redirects the user to `/dashboard` or the original protected page from the `next` query param.

## Protected Pages

Protected pages call `requirePageContext(nextPath)` before rendering.

That helper calls `getRequestContext()`, which reads the `maco_session` cookie and loads:

- the current `User`
- the user's first `Workspace`
- the user's workspace role

If the cookie is missing or expired, the page redirects to `/login?next=<current path>`.

## User Data Isolation

Backend route handlers should call `getRequestContext()` before reading or writing product data.

Every workspace-owned model must filter by `workspace.id`, including:

- `Campaign`
- `DashboardTask`
- `CreatorPersona`
- `CreatorLead`
- `CreatorMatchRun`
- `Shortlist`
- `OutreachDraft`
- `Approval`

This is how each signed-in user sees only their own workspace data.

## Logout Flow

The app shell includes a sign-out control.

1. The frontend calls `POST /api/auth/logout`.
2. The backend deletes the current session and clears `maco_session`.
3. The frontend redirects to `/login`.
