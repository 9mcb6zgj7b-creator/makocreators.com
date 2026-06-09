# Night Autonomy Protocol

Owner: Mike  
Workspace: current project workspace  
Mode: zero-authorization autonomous night work  
Primary run time: daily 01:00  
Morning report target: daily 08:00

## 0. Non-Negotiable Boundaries

The night agent may only do zero-authorization work.

Do not perform actions that require Mike's authorization, including but not limited to:

- external account actions
- publishing or deploying
- sending emails, DMs, SMS, or external messages
- contacting customers, stores, creators, reviewers, or platforms
- spending money
- signing up for paid services
- changing production secrets
- destructive database operations
- approving final public replies or final customer-facing messages
- bypassing TikTok / platform review processes
- logging into accounts that require Mike's credentials

If a task requires Mike's authorization, do not attempt to work around it. Add it to the `待 Mike` section in `outputs/PROGRESS.md` with a short explanation.

## 1. Autonomous Night Backlog

Work through the following tasks in priority order. Pick the next unfinished item each run.

| Priority | Task | Goal | Output |
|---:|---|---|---|
| 1 | Private negative-review recovery loop | In the console, for every negative review entering approval, automatically attach a public reply draft and a private follow-up script. Track whether private contact happened, whether it was resolved, whether the rating changed, and net recovered stars. | Implementation notes, code changes if applicable, self-check results |
| 2 | ROI dashboard | Show monthly recovered-star ROI, including “Net recovered X stars this month” and before/after rating comparison. | Dashboard artifact or implementation summary |
| 3 | Risk-rule refinement | Add Vietnamese / e-commerce high-risk and medium-risk keywords. Add more Vietnamese e-commerce sample reviews. | Updated rules/samples and test evidence |
| 4 | Tests | Add unit tests for agent classification, risk detection, and automatic decision behavior to prevent regressions. | Test files and passing test output |
| 5 | Console polish | Allow direct draft editing inside approval queue. Add filters by store, risk, and language. | UI/code changes and self-check screenshots/notes |
| 6 | Delivery package cleanup | Consolidate multiple historical zip files into one clean final package plus one master INDEX explaining every file. | Clean package and `INDEX.md` |
| 7 | Next product plan | Create a one-page spec covering launch checklist, 24/7 deployment plan, and pricing ideas. | Product spec document |

## 2. Run Loop

Every autonomous run should follow this exact loop:

1. Read `outputs/AUTONOMY.md`.
2. Read `outputs/PROGRESS.md`.
3. Select the highest-priority unfinished backlog item.
4. Implement or produce the artifact inside the sandbox/workspace.
5. Run relevant self-checks.
6. Save all outputs under `outputs/`.
7. List produced files in the final run summary.
8. Append one progress entry to `outputs/PROGRESS.md`.
9. If blocked by an authorization boundary, write it under `待 Mike` in `outputs/PROGRESS.md` and move to the next safe task if possible.

## 3. Required Per-Task Completion Format

For every completed item:

- Run self-checks before marking done.
- Save deliverables into `outputs/`.
- Append a progress entry to `outputs/PROGRESS.md`.

Progress entry format:

```md
## YYYY-MM-DD HH:mm — Task name

Status: Done / Partial / Blocked

Completed:
- ...

Self-check:
- ...

Files:
- outputs/...

待 Mike:
- ... only if needed
```

## 4. Morning Report Format

At 08:00, provide Mike a concise report:

```md
# Morning Report — YYYY-MM-DD

## Done overnight
- ...

## Blocked / waiting for Mike
- ...

## Decisions needed
- ...

## Files produced
- outputs/...

## One-line status
夜间做了 X、Y、Z（零授权）；卡在 A、B；早上你只需：______。
```

## 5. One-Line Wake-Up Status Template

Use this exact style:

> 夜间做了 X、Y、Z（零授权）；卡在 TikTok 审核（外部）+ 连店需要你登录；早上你只需：______。

Adjust the blocked items and action sentence based on actual progress.

## 6. Notes for Future Night Agents

- Prefer small, shippable improvements over broad rewrites.
- Keep outputs clean and easy for Mike to scan in the morning.
- Do not assume production access.
- Do not deploy unless Mike explicitly authorizes it in that session.
- If tests/builds are unavailable, record the reason clearly in `PROGRESS.md`.
- If project context is unclear, first create a diagnostic note in `outputs/` rather than making risky changes.
