# Code Checkpoints And Rollback

Every logged-in product UI/design code change must end with a checkpoint.

## What Counts As A Checkpoint

A checkpoint is:

- one Git commit
- one annotated Git tag pointing to that commit
- a passing verification run

Commit format:

```bash
checkpoint: <short description>
```

Tag format:

```bash
checkpoint/design-YYYYMMDD-HHMM-<slug>
```

Example:

```bash
checkpoint: build creator studio intake page
checkpoint/design-20260606-1840-creator-studio-intake
```

## Create A Checkpoint

Run verification first:

```bash
npm run typecheck
npm run build
```

Commit only the files related to the finished change:

```bash
git status --short
git add <changed files>
git commit -m "checkpoint: <short description>"
git tag -a checkpoint/design-YYYYMMDD-HHMM-<slug> -m "Design checkpoint: <short description>"
```

## Find Checkpoints

```bash
git log --oneline --decorate --all --grep="checkpoint:"
git tag --list "checkpoint/design-*"
```

## Roll Back Safely

Use this when you want to inspect an older version without changing `main`:

```bash
git switch -c rollback/<slug> checkpoint/design-YYYYMMDD-HHMM-<slug>
npm run build
```

## Undo A Checkpoint On The Current Branch

Use `git revert` when you want to undo a finished checkpoint while preserving history:

```bash
git revert <checkpoint-commit-sha>
npm run build
```

Do not use `git reset --hard` unless the user explicitly asks for a destructive rollback.
