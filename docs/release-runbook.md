# Mako Creators MVP Release Runbook

Use this path for the fastest controlled MVP release.

## 1. Final local checks

```bash
cd /Users/shengliu/Desktop/makocreators-com
./scripts/release-check.sh
git status --short --branch
```

## 2. Commit checkpoint

```bash
git add AGENTS.md BACKEND.md DEPLOYMENT.md FRONTEND_BACKEND_FLOW.md .env.example vercel.json scripts/release-check.sh \
  prisma/migrations docs src/app src/components src/lib

git commit -m "checkpoint: build creator ops mvp cockpit"
git tag -a checkpoint/design-20260609-0630-creator-ops-mvp-cockpit \
  -m "Design checkpoint: build creator ops mvp cockpit"
```

## 3. Production environment variables

Required for controlled MVP:

```bash
NEXT_PUBLIC_SITE_URL=https://makocreators.com
NEXT_PUBLIC_APP_NAME="Mako Creator"
DATABASE_URL=<production-postgres-url>
AUTH_SHOW_DEV_CODE=false
RESEND_API_KEY=<resend-api-key>
RESEND_FROM_EMAIL="Mako Creator <login@makocreators.com>"
```

Optional for phone sign-in:

```bash
TWILIO_ACCOUNT_SID=<twilio-account-sid>
TWILIO_AUTH_TOKEN=<twilio-auth-token>
TWILIO_FROM_PHONE=<twilio-phone-number>
```

## 4. Apply database migration

Use the production `DATABASE_URL`:

```bash
npx prisma migrate deploy
```

## 5. Deploy

Recommended first deployment: Vercel.

```bash
vercel --prod
```

Or connect the Git repository in Vercel and deploy from the checkpoint commit.

## 6. Smoke test after deploy

- `GET https://makocreators.com/api/health`
  - `databaseConfigured` should be `true`
  - `localPreviewAuthEnabled` should be `false`
- Request an email sign-in code from `/login`.
- Verify code and land on `/dashboard`.
- Create a campaign.
- Import creator links from `/creators/import`.
- Open `/ops` and confirm creator recommendations load.
- Create or review approval items and confirm approval buttons only update internal state.

## 7. Safety boundaries to keep for MVP

Mako must not automatically send outreach, ship samples, promise payment, agree to usage rights, publish content, or launch ads. Approval buttons are internal review records only.
