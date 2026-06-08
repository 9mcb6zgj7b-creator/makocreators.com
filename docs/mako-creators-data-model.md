# Mako Creators MVP Data Model

## Existing Schema Coverage

The current Prisma schema already supports the core backbone:

- `User`, `Session`, `LoginChallenge`
- `Workspace`, `WorkspaceMember`
- `Campaign`
- `CreatorLead`
- `Creator`
- `CreatorSocialProfile`
- `CreatorPersona`
- `CreatorMatchRun`
- `CreatorMatchResult`
- `Shortlist`, `ShortlistItem`
- `OutreachDraft`
- `DashboardTask`

## MVP Operational Concepts

## Current MVP Data Layer

The Creator Ops Cockpit is backed by:

- `src/lib/ops-overview.ts`
- `GET /api/ops/overview`
- `src/app/ops/page.tsx`

Current behavior:

- Without `DATABASE_URL`, the page and API return preview data for the MVP cockpit.
- With `DATABASE_URL`, the metrics start reading existing workspace counts from creator leads, match runs, outreach drafts, and dashboard tasks.
- Creator recommendations, approval examples, pipeline stages, and agent workflow still use preview data until live scoring and approval persistence are connected.

This keeps the prototype runnable while giving the frontend, API, and future agent code one shared overview contract.

### Creator Scoring

Current home:

- `CreatorMatchRun`
- `CreatorMatchResult`

Useful fields:

- `score`
- `reasons`
- `risks`
- `estimatedPriceMin`
- `estimatedPriceMax`
- `metadata`

Recommended metadata shape:

```json
{
  "audienceFit": 94,
  "contentQuality": 88,
  "brandSafety": 96,
  "productRelevance": 91,
  "engagementSignal": 89,
  "authenticityNeed": "high",
  "collaborationPath": "product_seeding"
}
```

### Collaboration Path

Recommended values:

- `product_seeding`
- `ai_content_collab`
- `hold`
- `reject`

This can initially live in `CreatorMatchResult.metadata.collaborationPath`.

### Outreach Draft Safety

Current home:

- `OutreachDraft`

Current statuses:

- `DRAFT`
- `SENT`
- `ARCHIVED`

Recommended near-term extension:

- Add `NEEDS_REVIEW`
- Add `APPROVED`
- Rename or interpret `SENT` as externally completed by a human, never sent automatically by Mako.

Recommended metadata shape:

```json
{
  "safeClaims": ["Creator has been invited to try the product before any testimonial."],
  "blockedClaims": ["No payment promise.", "No false first-person product-use claim."],
  "approvalId": "approval_123"
}
```

### Approval Gate

The schema now has a dedicated `Approval` model for human-gated actions. Approval items are internal records only; they do not send messages, ship samples, promise payment, grant rights, publish content, or launch ads.

Current model:

```prisma
model Approval {
  id              String         @id @default(cuid())
  workspaceId     String
  createdById     String
  reviewedById    String?
  campaignId      String?
  creatorId       String?
  outreachDraftId String?
  type            ApprovalType
  title           String
  summary         String         @db.Text
  riskLevel       ApprovalRisk
  status          ApprovalStatus @default(PENDING)
  decisionNotes   String?        @db.Text
  reviewedAt      DateTime?
  metadata        Json           @default("{}")
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

Current types:

- `SEND_OUTREACH`
- `SHIP_SAMPLE`
- `PAID_COLLABORATION`
- `USAGE_RIGHTS`
- `APPROVE_AI_SCRIPT`
- `GENERAL_REVIEW`

Statuses:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `NEEDS_CHANGES`
- `ARCHIVED`

Risk:

- `LOW`
- `MEDIUM`
- `HIGH`

Current API:

- `GET /api/approvals`
- `POST /api/approvals`
- `PATCH /api/approvals/:id`
- `POST /api/outreach-drafts` creates an `OutreachDraft` and a linked `SEND_OUTREACH` approval item in the same transaction.

`/ops` reads pending approvals through `getOpsOverview()`. If the database is unavailable or the approval table has not been pushed yet, the MVP falls back to preview approval examples so the cockpit remains usable locally.

### Campaign Pipeline

Current homes:

- `Campaign.status`
- `ShortlistItem.status`
- `DashboardTask.status`

Recommended creator pipeline states:

- `PROSPECT`
- `SCORED`
- `DRAFT_READY`
- `NEEDS_APPROVAL`
- `APPROVED_FOR_ACTION`
- `OUTREACH_SENT_EXTERNALLY_BY_HUMAN`
- `SAMPLE_SHIPPED_EXTERNALLY_BY_HUMAN`
- `CONTENT_RECEIVED`
- `CLOSED`

These can initially live in `ShortlistItem.metadata.pipelineStage` if a schema migration is not desired yet.

## Safety Invariant

Every record should distinguish:

- AI-prepared recommendation.
- Human-approved action.
- Externally completed human action.

No database state should imply that Mako itself sent outreach, shipped samples, approved paid terms, granted usage rights, signed contracts, published content, or launched paid ads.
