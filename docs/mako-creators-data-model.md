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

The schema does not yet have a dedicated approval table. For the MVP prototype, approval items are UI data. For backend implementation, add an `Approval` model.

Recommended model:

```prisma
model Approval {
  id          String   @id @default(cuid())
  workspaceId String
  campaignId  String?
  creatorId   String?
  type        ApprovalType
  title       String
  summary     String   @db.Text
  riskLevel   ApprovalRisk
  status      ApprovalStatus @default(PENDING)
  metadata    Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Recommended enums:

- `SEND_OUTREACH`
- `SHIP_SAMPLE`
- `PAID_COLLABORATION`
- `USAGE_RIGHTS`
- `APPROVE_AI_SCRIPT`

Statuses:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `NEEDS_CHANGES`

Risk:

- `LOW`
- `MEDIUM`
- `HIGH`

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
