# MACO Creators Collaboration Rules

Read this file before writing code in this repository.

This rule applies to both Claude and Codex. Every new coding session must begin by reading this file.

## Project

- Product: `makocreators.com`
- Display name: `MACO Creators`
- Purpose: creator matching, creator personas, campaign briefs, shortlists, and outreach workflows for businesses.
- Primary project workspace: `/Users/shengliu/Desktop/makocreators-com`

## Ownership

Claude owns the public-facing frontend.

Codex owns the backend and logged-in product experience.

Do not edit the other agent's owned area unless the user explicitly asks, or unless the change is required to keep the app working. If a task crosses ownership boundaries, stop and explain the needed boundary crossing before editing.

## Claude Scope

Claude should focus on:

- Landing pages
- Public marketing pages
- React components
- Layout, visual design, styling, responsive UI
- Frontend interaction states
- Copy shown in the browser
- Static mock data used only for UI previews

Claude should avoid changing:

- Database schema
- Authentication/session logic
- API route business logic
- Server actions
- Payment, billing, or subscription logic
- Integrations with external data providers
- Background jobs
- Backend validation, permissions, or data isolation

## Codex Scope

Codex should focus on:

- Logged-in product pages
- Authenticated dashboard views
- Creator database UI
- Campaign workspace UI
- Data report UI
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

Codex should avoid changing:

- Public marketing page visual layout and styling owned by Claude
- Public marketing copy unless required to wire product behavior

## Before Writing Code

Each coding session must start with:

```bash
pwd
git status --short --branch
git branch --show-current
cat COLLABORATION.md
```

Confirm you are in the correct workspace and that the task belongs to your scope before editing files.

## During Work

- Keep changes inside your assigned scope.
- If a change crosses scope boundaries, stop and explain why before editing.
- Do not overwrite or revert changes you did not make.
- Do not edit secrets or paste API keys into code.
- Do not edit `.env` or `.env.local` unless the user explicitly asks.
- Prefer small, focused changes.
- Use English for all app UI. The user has requested English as the default language for every page.
- After meaningful changes, generate a local preview or tell the user why preview is blocked.
- After every logged-in product UI/design code change, create a Git checkpoint commit after verification. Use `checkpoint: <short description>` and add an annotated tag named `checkpoint/design-YYYYMMDD-HHMM-<slug>`.

## Before Commit Or Push

Run:

```bash
git status --short
npm run build
```

Only stage files related to your own task.

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

Do not merge into `main` until the user asks.

When both frontend and backend are ready:

1. Review Claude's frontend changes.
2. Review Codex's backend changes.
3. Merge one branch into `main`.
4. Rebase or merge the second branch after resolving conflicts.
5. Run `npm run build`.
6. Deploy production.
