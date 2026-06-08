# Mako Creators MVP PRD

## Summary

Mako Creators is an AI Creator Ops Employee for brands running creator seeding, creator matching, content briefs, shortlists, and outreach workflows. The MVP extends the existing makocreators.com product into an operations cockpit where a brand can evaluate creators, choose the right collaboration path, prepare safe drafts, and route sensitive actions to human approval.

## Target User

- DTC founder or growth lead managing creator seeding manually.
- Local business operator running restaurant, beauty, wellness, or service campaigns.
- Creator partnerships manager juggling spreadsheets, creator links, briefs, outreach, and approvals.

## Problem

Creator seeding is operationally messy because teams must score creator fit, avoid inauthentic claims, personalize outreach, track campaign state, and keep legal or business commitments under human control. Spreadsheet workflows lose context and do not enforce safe approval boundaries.

## MVP Goal

Help a brand move from a creator shortlist to an approval-ready campaign workflow in one session.

The user should be able to:

- See which creators are strongest fits and why.
- Understand whether Mako recommends product seeding or AI content collaboration.
- Review outreach and concept drafts before any external send.
- Track creators across pipeline stages.
- Inspect approval items and blocked actions.
- Understand what the agent did during a run.

## Non-Goals

Mako must not automatically:

- Promise payment.
- Approve paid collaborations.
- Ship samples.
- Agree to usage rights.
- Sign contracts.
- Send external messages.
- Publish content.
- Launch paid ads.

## MVP Experience

### 1. Ops Cockpit

Route: `/ops`

Purpose:

- Give the user a single operations surface for creator seeding work.
- Use demo data until the live backend workflow is fully connected.

Includes:

- KPI strip for creator coverage, high-fit creators, approval load, and AI collaboration candidates.
- Recommended next moves.
- Creator scoring table.
- Campaign pipeline.
- Approval queue.
- Agent run timeline.

### 2. Creator Scoring

Inputs:

- Audience fit.
- Content quality.
- Brand safety.
- Product relevance.
- Engagement signal.
- Authenticity requirement.
- Prior relationship status.

Outputs:

- Fit score from 0 to 100.
- Recommendation: product seeding, AI content collaboration, hold, or reject.
- Score drivers.
- Risk flags.

### 3. Collaboration Path

Mako recommends:

- `Product seeding` when authentic product experience is required.
- `AI content collaboration` when creator-style scripts or drafts can be produced without false first-person claims.
- `Hold` when risk, missing data, or brand-safety context blocks confident action.

### 4. Approval Queue

Approval categories:

- Send outreach.
- Ship sample.
- Discuss paid collaboration.
- Request usage rights.
- Approve AI content script.

All approval actions remain internal in the MVP.

### 5. Agent Workflow

Mako prepares the work package:

1. Normalize creator profile.
2. Score creator fit.
3. Select collaboration path.
4. Draft internal outreach or concept.
5. Run guardrail scan.
6. Route sensitive actions to approval.
7. Wait for human execution outside the MVP.

## Success Metrics

- Time from shortlist to approval-ready plan: under 20 minutes.
- At least 80% of high-fit creators have a clear next action.
- 100% of sensitive actions are routed to approval.
- Zero drafts include payment promises or false first-person product claims.

## Current Prototype Scope

Included now:

- `/ops` local prototype inside the real Next.js project.
- Preview seeded data with a shared overview data layer.
- Persistent `Approval` model and internal approval API.
- English UI copy.
- Safety boundary surfaced in the product.

Deferred:

- Applying the approval table to the live database.
- Creating real approval items from scoring and draft generation workflows.
- Live scoring jobs.
- Creator import to ops cockpit linkage.
- External messaging integrations.
- Fulfillment integrations.
- Usage-rights workflow.
