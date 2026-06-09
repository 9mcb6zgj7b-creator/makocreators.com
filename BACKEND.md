# Backend Skeleton

This product is owned end to end by Codex: frontend, backend, authentication, data isolation, preview, and deployment readiness.

## Runtime

- Framework: Next.js route handlers
- ORM: Prisma
- Database: PostgreSQL
- Validation: Zod
- API errors: auth and validation errors return actionable messages; unexpected server errors return route-level fallback copy in production so internal database or environment details are not exposed to users.

## API Routes

Health:

- `GET /api/health`

The health response includes service status, runtime environment, whether `DATABASE_URL` is configured, and whether local preview auth is enabled.

Auth:

- `POST /api/auth/request-code`
- `POST /api/auth/verify-code`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Dashboard:

- `GET /api/dashboard/home`

Ops:

- `GET /api/ops/overview`

The ops overview response includes section source labels, metrics, creator recommendations, safe drafts, pending approvals, pipeline counts, agent workflow steps, and blocked external actions.

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

Approvals:

- `GET /api/approvals`
- `POST /api/approvals`
- `PATCH /api/approvals/:id`

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
17. Review approval items with `GET /api/approvals` or the `/ops` cockpit.
18. Mark internal approval decisions with `PATCH /api/approvals/:id`.

## Frontend Connection

Product routes:

- `/login`: email or phone sign-in
- `/dashboard`: authenticated home
- `/creators`: authenticated creator workspace and intake
- `/creators/import`: authenticated creator lead link and spreadsheet import
- `/campaigns`: authenticated campaign list
- `/campaigns/:id`: authenticated campaign detail and next-step routing
- `/reports`: authenticated reports dashboard
- `/billing`: authenticated billing readiness page
- `/support`: authenticated support routing page

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


## Creator Directory

Mako now keeps a global creator directory in addition to workspace-owned creator leads.

- `CreatorLead` remains workspace-owned and records what a specific customer imported.
- `CreatorDirectoryEntry` is the internal cross-workspace creator database.
- Imports sync into the directory by normalized creator email first, then normalized creator name, then profile URL.
- Repeated creator emails or names update the existing directory entry instead of creating duplicate creator records.
- This directory is an internal data foundation for future enrichment, scoring, and creator database workflows; it is not exposed as a public user-facing list yet.

## Creator Lead Intake

The authenticated `/creators/import` page connects to the creator lead APIs. In local no-database preview mode, the page remains visible for workflow review but warns that imports need `DATABASE_URL` before leads can be saved.

Direct contact submission:

```json
{
  "email": "creator@example.com",
  "notes": "Good LA restaurant content"
}
```

Bulk contact submission can include emails and profile links:

```json
{
  "emails": ["creator@example.com", "second@example.com"],
  "urls": [
    "https://www.instagram.com/example_creator",
    "https://www.tiktok.com/@example_creator"
  ]
}
```

Spreadsheet import uses `multipart/form-data` with one field:

- `file`: `.xlsx`, `.xls`, or `.csv`

Recognized spreadsheet columns can be English or Chinese, including:

- `邮箱` / `联系邮箱` / `email`
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
