# Mako Creator Collaboration Rules

Read this file before writing code in this repository.

This rule applies to every coding session in this repository. Every new coding session must begin by reading this file.

## Project

- Product: `makocreators.com`
- Display name: `Mako Creator`
- Purpose: creator matching, creator personas, campaign briefs, shortlists, and outreach workflows for businesses.
- Primary project workspace: `/Users/shengliu/Desktop/makocreators-com`

## Ownership

Codex owns the full product implementation for `makocreators.com`.

This includes public frontend, logged-in frontend, backend, authentication, data isolation, API routes, database schema, deployment reliability, and local preview verification. External design input can be reviewed and incorporated, but Codex is responsible for integrating it safely into this repository.

## Codex Scope

Codex should focus on:

- Public landing pages
- Logged-in product pages
- Authenticated dashboard views
- Creator database UI
- Campaign workspace UI
- Data report UI
- React components, layout, styling, responsive UI, and browser-visible copy
- Database schema
- Authentication and member accounts
- API routes
- Server actions
- Data models for creator personas, creator matches, shortlists, outreach, campaigns, and users
- Backend validation and permissions
- User-specific data isolation
- Integrations with email, SMS, creator data, scraping, CRM, payments, and analytics
- Background jobs and automation
- Deployment and build reliability

## Before Writing Code

Each coding session must start with:

```bash
pwd
git status --short --branch
git branch --show-current
cat COLLABORATION.md
```

Confirm you are in the correct workspace before editing files.

## During Work

- Do not overwrite or revert changes you did not make.
- Do not edit secrets or paste API keys into code.
- Do not edit `.env` or `.env.local` unless the user explicitly asks.
- Prefer small, focused changes.
- Use English for all app UI. The user has requested English as the default language for every page.
- After meaningful changes, generate a local preview or tell the user why preview is blocked.
- After every meaningful product UI/design code change, create a Git checkpoint commit after verification. Use `checkpoint: <short description>` and add an annotated tag named `checkpoint/design-YYYYMMDD-HHMM-<slug>`.

## Before Commit Or Push

Run:

```bash
git status --short
npm run build
```

Only stage files related to the current task.

## Code Rollback Checkpoints

Design checkpoints are normal Git commits plus annotated tags.

Create a checkpoint after each verified design/UI code change:

```bash
npm run typecheck
npm run build
git add <changed files>
git commit -m "checkpoint: <short description>"
git tag -a checkpoint/design-YYYYMMDD-HHMM-<slug> -m "Design checkpoint: <short description>"
```

Preview checkpoints:

```bash
git log --oneline --decorate --all --grep="checkpoint:"
git tag --list "checkpoint/design-*"
```

Rollback safely by creating a review branch from a checkpoint:

```bash
git switch -c rollback/<slug> checkpoint/design-YYYYMMDD-HHMM-<slug>
npm run build
```

Undo a checkpoint on the current branch without rewriting history:

```bash
git revert <checkpoint-commit-sha>
npm run build
```

## Commit Message Style

Use clear messages such as:

```bash
git commit -m "Build creator matching frontend"
git commit -m "Add creator shortlist backend"
```

## Merge Rule

Do not merge external branches into `main` until the user asks. Before deployment, run the build, preview the product, and create a checkpoint.
