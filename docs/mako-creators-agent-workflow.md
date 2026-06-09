# Mako Creators Agent Workflow

## Operating Principle

Mako prepares creator operations work and routes sensitive actions to humans. It does not complete irreversible external actions.

## Workflow

Core MVP path:

1. Start with creator leads.
2. Score creators and split each lead into product seeding, AI content collaboration, hold, or review.
3. Prepare safe outreach, script, and next-step drafts.
4. Route sensitive actions to the approval queue.
5. Let the human approve and execute any external action outside Mako.

```mermaid
flowchart TD
  A["Creator leads"] --> B["Normalize creator profile"]
  B --> C["Score creator fit"]
  C --> D{"Authentic product experience required?"}
  D -- "Yes" --> E["Recommend product seeding"]
  D -- "No" --> F["Consider AI content collaboration"]
  E --> G["Draft safe outreach"]
  F --> H["Draft concept without false first-person claims"]
  G --> I["Run guardrail scan"]
  H --> I
  I --> J{"Sensitive action?"}
  J -- "Yes" --> K["Create approval item"]
  J -- "No" --> L["Mark draft ready"]
  K --> M["Human review"]
  L --> M
  M --> N["Human executes approved external action"]
```

## Current Implementation Surface

The MVP cockpit now reads from a shared overview layer:

- Page: `/ops`
- API: `GET /api/ops/overview`
- Server helper: `getOpsOverview(workspaceId)`

The helper returns preview data in local no-database mode and uses existing workspace counts when a database is configured. This is intentionally not an external automation surface yet; it prepares and displays work, but does not execute external actions.

## Steps

### 1. Intake

Inputs:

- Campaign goal.
- Business or product context.
- Target audience.
- Creator shortlist.
- Brand voice.
- Restricted claims.

Outputs:

- Normalized creator records.
- Missing-data warnings.

### 2. Creator Contact Readiness

Mako evaluates:

- Whether a creator email is available.
- Whether a profile link needs manual contact research.
- Whether notes include enough campaign context for a safe outreach draft.
- Whether any sensitive next step must be approval-gated.

Fit scoring is intentionally parked until Mako has a stable creator data source or user-provided performance fields.

### 3. Collaboration Path Selection

Mako recommends:

- Ready for outreach draft when a creator email is saved.
- Needs creator email when only a profile link exists.
- Hold when contact context is incomplete or risk is unclear.
- Future scoring recommendations only after a stable data source is connected.

### 4. Drafting

Allowed:

- Internal outreach drafts.
- Briefs.
- Script concepts.
- Product talking points.
- Follow-up suggestions.

Blocked:

- Payment promises.
- Usage-rights commitments.
- False first-person product-use claims.
- External sending.

When an outreach draft is created through `POST /api/outreach-drafts`, Mako also creates a linked `SEND_OUTREACH` approval item. This makes every external-message candidate visible in the internal approval queue before any human action happens outside the MVP.

### 5. Guardrail Scan

Hard-blocked actions:

- Promise payment.
- Approve paid collaboration.
- Ship samples.
- Agree to usage rights.
- Sign contracts.
- Send external messages.
- Publish content.
- Launch paid ads.

### 6. Approval Routing

Mako creates an internal `Approval` item for any sensitive next step. The item can be listed through `GET /api/approvals`, created through `POST /api/approvals`, and reviewed through `PATCH /api/approvals/:id`.

Approval examples:

- Send this outreach draft.
- Ship a sample.
- Discuss paid collaboration.
- Request usage rights.
- Approve AI content script.

Approval status options:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `NEEDS_CHANGES`
- `ARCHIVED`

Approval records can reference a campaign, creator, or outreach draft, but they remain internal workflow records. The `/ops` approval queue can mark a real approval item as approved, rejected, or needing changes. These buttons only update Mako's internal approval state; they do not send the outreach, ship samples, commit payment, grant usage rights, publish content, or launch ads.

If the workspace has no pending approvals, `/ops` shows an empty approval state. Preview approval examples are used only when local preview or database fallback is needed.

### 7. Human Execution

After approval, the user performs the external action outside the MVP. Mako records the state as externally completed by a human.

## Day Mode and Night Mode

Day mode:

- Ask before major product direction changes, schema changes, legal/business commitments, external integrations, or irreversible actions.

Night mode:

- Continue autonomously within safe boundaries.
- Prefer reversible local changes.
- Do not perform external actions.
- Leave clear notes for review.
