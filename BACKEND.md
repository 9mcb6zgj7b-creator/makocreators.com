# Backend Skeleton

This product is owned end to end by Codex: frontend, backend, authentication, data isolation, preview, and deployment readiness.

## Runtime

- Framework: Next.js route handlers
- ORM: Prisma
- Database: PostgreSQL
- Validation: Zod

## API Routes

Health:

- `GET /api/health`

Auth:

- `POST /api/auth/request-code`
- `POST /api/auth/verify-code`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Dashboard:

- `GET /api/dashboard/home`

Creator personas:

- `GET /api/creator-personas`
- `POST /api/creator-personas`
- `GET /api/creator-personas/:id`
- `PATCH /api/creator-personas/:id`

Creator leads:

- `GET /api/creator-leads`
- `POST /api/creator-leads`
- `POST /api/creator-leads/import`

Creator matching:

- `GET /api/match-runs`
- `POST /api/match-runs`
- `GET /api/match-runs/:id`

Shortlists:

- `GET /api/shortlists`
- `POST /api/shortlists`
- `POST /api/shortlists/:id/items`

Outreach:

- `GET /api/outreach-drafts`
- `POST /api/outreach-drafts`

Campaigns:

- `GET /api/campaigns`
- `POST /api/campaigns`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`

## First Product Flow

Frontend can wire this sequence:

1. Request login code with `POST /api/auth/request-code`.
2. Verify code with `POST /api/auth/verify-code`.
3. Backend sets the `maco_session` http-only cookie.
4. Frontend redirects to `/dashboard`.
5. Protected pages call `getRequestContext()` through `requirePageContext()`.
6. Backend routes filter data by the current workspace.
7. Load logged-in home dashboard with `GET /api/dashboard/home`.
8. Create a campaign with `POST /api/campaigns`.
9. Create or read dashboard tasks with `POST /api/tasks` and `GET /api/tasks`.
10. Submit creator profile links with `POST /api/creator-leads`.
11. Import creator spreadsheets with `POST /api/creator-leads/import`.
12. Create creator persona with `POST /api/creator-personas`.
13. Start match run with `POST /api/match-runs`.
14. Create shortlist with `POST /api/shortlists`.
15. Add creators to shortlist with `POST /api/shortlists/:id/items`.
16. Create outreach draft with `POST /api/outreach-drafts`.

## Frontend Connection

Product routes:

- `/login`: email or phone sign-in
- `/dashboard`: authenticated home
- `/creators`: authenticated creator workspace and intake
- `/campaigns`: authenticated campaign list
- `/reports`: authenticated reports dashboard

See `FRONTEND_BACKEND_FLOW.md` for the full login, session, workspace, and logout path.

## Logged-In Home Dashboard

Frontend can build the first logged-in page from:

- `GET /api/dashboard/home`

The response includes:

- current user and workspace
- navigation items: home, creator database, campaigns, reports
- campaign list for the activity dropdown
- open tasks for the activity operation panel
- workspace stats
- support card content
- empty state copy

Task creation example:

```json
{
  "title": "Review this week's imported creators",
  "description": "Confirm city, category, contact details, and pricing",
  "type": "CREATOR_REVIEW",
  "priority": 20
}
```

## Creator Lead Intake

Direct link submission:

```json
{
  "url": "https://www.instagram.com/example_creator",
  "notes": "Good LA restaurant content"
}
```

Bulk link submission:

```json
{
  "urls": [
    "https://www.instagram.com/example_creator",
    "https://www.tiktok.com/@example_creator"
  ]
}
```

Spreadsheet import uses `multipart/form-data` with one field:

- `file`: `.xlsx`, `.xls`, or `.csv`

Recognized spreadsheet columns can be English or Chinese, including:

- `链接` / `主页链接` / `url`
- `平台` / `platform`
- `达人名字` / `name`
- `城市` / `city`
- `分类` / `标签` / `category`
- `粉丝数` / `followers`
- `平均播放量` / `avg views`
- `联系方式` / `contact`
- `报价` / `最高报价` / `price max`
- `备注` / `notes`

## Local Auth Notes

For local testing only, set:

```bash
AUTH_SHOW_DEV_CODE=true
```

Production must send the code through email or SMS and must keep `AUTH_SHOW_DEV_CODE=false`.
