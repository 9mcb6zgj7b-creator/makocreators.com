# Deployment Prep

Production domain: `makocreators.com`

Display name: `MACO Creators`

## Current Status

- Project folder exists at `/Users/shengliu/Desktop/makocreators-com`.
- Collaboration rules are in `COLLABORATION.md`.
- No app framework has been scaffolded yet.
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
2. Confirm display name is `MACO Creators`.
3. Scaffold the app framework.
4. Add frontend pages from Claude.
5. Add backend data models and auth from Codex.
6. Run `npm run build`.
7. Connect git remote.
8. Deploy preview.
9. Test login, creator brief, creator matching, shortlist, and outreach flows.
10. Add production domain.

## Backend Launch Notes For Codex

Codex owns:

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

Claude owns frontend visuals and layout. If backend work requires frontend wiring, keep it minimal and document the boundary crossing.
