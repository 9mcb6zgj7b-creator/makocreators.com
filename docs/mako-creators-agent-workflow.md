# Mako Creators Agent Workflow

## Operating Principle

Mako prepares creator operations work and routes sensitive actions to humans. It does not complete irreversible external actions.

## Workflow

```mermaid
flowchart TD
  A["Creator shortlist"] --> B["Normalize creator profile"]
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

### 2. Creator Scoring

Mako evaluates:

- Audience fit.
- Content quality.
- Brand safety.
- Product relevance.
- Engagement signal.
- Authenticity need.

### 3. Collaboration Path Selection

Mako recommends:

- Product seeding when authentic experience is required.
- AI content collaboration when the output can be a script, hook, or video draft without claiming the creator used the product.
- Hold when data is incomplete or risk is unclear.
- Reject when fit or safety is poor.

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

Mako creates an approval item for any sensitive next step.

Approval examples:

- Send this outreach draft.
- Ship a sample.
- Discuss paid collaboration.
- Request usage rights.
- Approve AI content script.

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
