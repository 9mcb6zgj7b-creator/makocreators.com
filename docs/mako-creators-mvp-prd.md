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

The core MVP path is:

1. Start with creator leads.
2. Score creators and split each lead into product seeding, AI content collaboration, hold, or review.
3. Prepare safe outreach, script, and next-step drafts.
4. Route sensitive actions to the approval queue.
5. Let the human approve and execute any external action outside Mako.

The user should be able to:

- Import creator emails or profile links.
- See which creators are contactable now and which still need an email.
- Prepare safe outreach drafts before any external send.
- Track creators across contact, draft, and approval stages.
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

- KPI strip for creator coverage, contactable creators, approval load, and open ops tasks.
- Creator contact queue.
- Creator contacts table.
- Campaign pipeline.
- Approval queue.
- Agent run timeline.

### 2. Creator Contact Intake

Inputs:

- Creator email addresses.
- Optional profile links.
- Optional names, categories, contact notes, pricing, and campaign context from spreadsheet import.

Outputs:

- Contactable creators ready for outreach drafting.
- Creator leads that still need an email.
- Contact notes and source records for the workspace.

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
When an approval item is backed by a persisted `Approval` record, `/ops` can mark it as `APPROVED`, `NEEDS_CHANGES`, or `REJECTED`. This records the human review decision only; the user still performs any external action outside the MVP.
When the workspace has no pending approvals, `/ops` shows an empty queue. Demo approval examples are used only for local preview mode or database fallback.

### 5. Agent Workflow

Mako prepares the work package:

1. Normalize creator contact or profile link.
2. Identify whether a creator email is available.
3. Prepare internal outreach context.
4. Draft internal outreach or concept.
5. Run guardrail scan.
6. Route sensitive actions to approval.
7. Wait for human execution outside the MVP.

## Success Metrics

- Time from shortlist to approval-ready plan: under 20 minutes.
- At least 80% of imported creator emails have a clear next action.
- 100% of sensitive actions are routed to approval.
- Zero drafts include payment promises or false first-person product claims.

## Current Prototype Scope

Included now:

- `/ops` local prototype inside the real Next.js project.
- Preview seeded data with a shared overview data layer.
- Persistent `Approval` model and internal approval API.
- Workspace creator leads mapped into a contact-first ops queue when real lead data exists.
- Workspace outreach drafts shown in the safe draft package when real drafts exist.
- Workspace approval queue with approve, needs changes, reject, and empty states.
- Section-level source labels for workspace data, derived draft suggestions, and preview fallback data.
- English UI copy.
- Safety boundary surfaced in the product.

Deferred:

- Applying the approval table to the live database.
- Creating real approval items from draft generation workflows.
- Live scoring jobs and third-party creator data enrichment.
- Restoring fit score UI after a stable data source is connected.
- External messaging integrations.
- Fulfillment integrations.
- Usage-rights workflow.
