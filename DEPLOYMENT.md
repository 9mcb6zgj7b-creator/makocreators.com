# Deployment Prep

Production domain: `makocreators.com`

Display name: `Mako Creator`

## Current Status

- Project folder exists at `/Users/shengliu/Desktop/makocreators-com`.
- Collaboration rules are in `COLLABORATION.md`.
- Next.js app framework is scaffolded.
- Codex owns frontend, backend, auth, data isolation, preview, and deployment readiness.
- Email or phone login routes are implemented.
- Protected product pages redirect unauthenticated users to `/login`.
- Dashboard, Creators, Campaigns, and Reports pages read workspace-owned data after sign-in.
- No git remote has been configured yet.

## Recommended Hosting

Use Vercel for the first production deployment unless the user chooses a different host.

Recommended production URLs:

- Primary: `https://makocreators.com`
- Redirect alias: `https://www.makocreators.com`

## DNS Checklist

After the app is created and connected to the hosting provider:

1. Add `makocreators.com` in the hosting dashboard.
2. Add `www.makocreators.com` in the hosting dashboard.
3. Configure DNS at the domain registrar using the records shown by the hosting provider.
4. Set `www.makocreators.com` to redirect to `makocreators.com`.
5. Confirm HTTPS certificate status is active.

Do not guess final DNS records if the hosting provider shows different records.

## Environment Variables

Create production environment variables in the hosting dashboard.

Required before launch:

- `NEXT_PUBLIC_SITE_URL`
- `AUTH_SECRET`
- `DATABASE_URL`

Required for local full login testing:

- `DATABASE_URL`
- `AUTH_SHOW_DEV_CODE=true`

Required when features are connected:

- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Pre-Launch Checklist

Before production launch:

1. Confirm production domain is `makocreators.com`.
2. Confirm display name is `Mako Creator`.
3. Confirm `DATABASE_URL` points to the production PostgreSQL database.
4. Run Prisma migration or `prisma db push` for the target environment.
5. Confirm `AUTH_SHOW_DEV_CODE=false` in production.
6. Run `npm run build`.
7. Connect git remote.
8. Deploy preview.
9. Test login, creator brief, creator matching, shortlist, and outreach flows.
10. Add production domain.

## Backend Launch Notes For Codex

Codex owns:

- Public and logged-in frontend
- Auth and member accounts
- Database schema
- Creator personas
- Creator match results
- Shortlists
- Outreach drafts
- Campaign records
- API routes
- Data isolation by user/account
- Deployment reliability
