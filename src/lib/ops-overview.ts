import { prisma } from "@/lib/db";

export type OpsPathClass = "seed" | "ai" | "hold" | "neutral";
export type OpsRiskLevel = "Low" | "Medium" | "High";
export type OpsDataSource = "workspace" | "preview" | "derived";

export type OpsCreator = {
  name: string;
  handle: string;
  channel: string;
  audience: string;
  score: number | null;
  contactEmail?: string | null;
  path: string;
  pathClass: OpsPathClass;
  stage: string;
  risk: string;
  driver: string;
  draft: string;
};

export type OpsApproval = {
  id?: string;
  isPreview?: boolean;
  type: string;
  title: string;
  summary: string;
  risk: OpsRiskLevel;
  status?: string;
};

export type OpsDraft = {
  id?: string;
  title: string;
  summary: string;
  status: string;
  channel?: string;
  isPreview?: boolean;
};

export type OpsPipelineStage = {
  label: string;
  count: number;
};

export type OpsAgentStep = {
  title: string;
  state: "Completed" | "Blocked for approval";
  summary: string;
};

export type OpsMetric = {
  label: string;
  value: number;
  note: string;
};

export type OpsOverview = {
  source: "preview" | "workspace";
  creatorSource: Exclude<OpsDataSource, "derived">;
  draftSource: OpsDataSource;
  approvalSource: Exclude<OpsDataSource, "derived">;
  metrics: OpsMetric[];
  creators: OpsCreator[];
  drafts: OpsDraft[];
  approvals: OpsApproval[];
  pipeline: OpsPipelineStage[];
  agentSteps: OpsAgentStep[];
  blockedActions: string[];
};

const previewCreators: OpsCreator[] = [
  {
    name: "Ava Chen",
    handle: "@avaskinnotes",
    channel: "TikTok",
    audience: "Gen Z skincare beginners",
    score: 92,
    path: "Product seeding",
    pathClass: "seed",
    stage: "Needs approval",
    risk: "Sample shipment approval required",
    driver: "Strong ingredient education match with high trust around sensitive-skin routines.",
    draft: "Invite Ava to try the serum first, then decide whether it earns a place in a routine video.",
  },
  {
    name: "Mina Park",
    handle: "@minamakes",
    channel: "Instagram",
    audience: "Millennial clean beauty buyers",
    score: 86,
    path: "AI content collab",
    pathClass: "ai",
    stage: "Draft ready",
    risk: "Usage rights discussion gated",
    driver: "Strong visual language for creator-style scripts without personal-use claims.",
    draft: "Prepare a calm shelf-edit concept that frames GlowLab as a product discovery.",
  },
  {
    name: "Jules Rivera",
    handle: "@julesgetsready",
    channel: "YouTube Shorts",
    audience: "Busy professionals building simple routines",
    score: 81,
    path: "Product seeding",
    pathClass: "seed",
    stage: "Needs approval",
    risk: "Follow-up send approval required",
    driver: "Useful routine context and strong product fit, with moderate engagement.",
    draft: "Follow up with a no-pressure seeding idea for a travel kit series.",
  },
  {
    name: "Nora Smith",
    handle: "@noraformulas",
    channel: "TikTok",
    audience: "Ingredient-conscious shoppers",
    score: 68,
    path: "Hold",
    pathClass: "hold",
    stage: "Research needed",
    risk: "Brand safety review needed",
    driver: "Good category overlap, but recent comparative claims need review.",
    draft: "Hold outreach until brand safety context is reviewed.",
  },
];

const previewApprovals: OpsApproval[] = [
  {
    isPreview: true,
    type: "Send outreach",
    title: "Approve Ava outreach draft",
    summary: "Personalized product seeding message is ready. Human approval is required before any external send.",
    risk: "Medium",
  },
  {
    isPreview: true,
    type: "Send follow-up",
    title: "Approve Jules follow-up",
    summary: "Follow-up draft avoids payment language and asks only about product trial interest.",
    risk: "Medium",
  },
  {
    isPreview: true,
    type: "Usage rights",
    title: "Review usage rights boundary",
    summary: "Mako prepared a concept, but usage rights must be handled by a human before paid media.",
    risk: "High",
  },
];

const previewPipeline: OpsPipelineStage[] = [
  { label: "Scored", count: 4 },
  { label: "Draft ready", count: 2 },
  { label: "Needs approval", count: 3 },
  { label: "Approved for action", count: 1 },
];

const previewDrafts: OpsDraft[] = previewCreators.slice(0, 3).map(creator => ({
  title: creator.name,
  summary: creator.draft,
  status: "Preview",
  channel: creator.channel,
  isPreview: true,
}));

const previewAgentSteps: OpsAgentStep[] = [
  {
    title: "Normalize profiles",
    state: "Completed",
    summary: "Creator handles, channels, audience notes, and prior context were mapped into campaign records.",
  },
  {
    title: "Score creator fit",
    state: "Completed",
    summary: "Mako scored audience fit, content quality, brand safety, product relevance, and engagement signal.",
  },
  {
    title: "Select path",
    state: "Completed",
    summary: "Creators were split between product seeding, AI content collaboration, and hold.",
  },
  {
    title: "Draft internal output",
    state: "Completed",
    summary: "Outreach and concept drafts were prepared for internal review only.",
  },
  {
    title: "Guardrail scan",
    state: "Completed",
    summary: "Payment promises, usage-rights commitments, first-person false claims, and external sends were blocked.",
  },
  {
    title: "Route approvals",
    state: "Blocked for approval",
    summary: "Sensitive next steps are waiting for human review.",
  },
];

const blockedActions = [
  "Promise payment",
  "Approve paid collaboration",
  "Ship samples",
  "Agree to usage rights",
  "Send external messages",
  "Publish content or launch ads",
];

export async function getOpsOverview(workspaceId: string): Promise<OpsOverview> {
  if (!process.env.DATABASE_URL) {
    return buildPreviewOverview("preview");
  }

  const [creatorLeadStats, matchRunCount, draftCount, openTaskCount, approvalResult, creatorRecommendations, workspaceDrafts] = await Promise.all([
    getCreatorLeadStats(workspaceId),
    prisma.creatorMatchRun.count({ where: { workspaceId } }),
    prisma.outreachDraft.count({ where: { workspaceId, status: "DRAFT" } }),
    prisma.dashboardTask.count({
      where: {
        workspaceId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),
    getPendingApprovals(workspaceId),
    getCreatorRecommendations(workspaceId),
    getWorkspaceDrafts(workspaceId),
  ]);

  const overview = buildPreviewOverview("workspace");
  const approvalItems = approvalResult.unavailable ? overview.approvals : approvalResult.items;
  const approvalCount = approvalResult.unavailable ? overview.approvals.length : approvalResult.items.length;
  const creatorSource = creatorRecommendations.length ? "workspace" : "preview";
  const creators = creatorRecommendations.length ? creatorRecommendations : overview.creators;
  const fallbackDraftSource = creatorSource === "workspace" ? "derived" : "preview";
  const draftSource: OpsDataSource = workspaceDrafts.length ? "workspace" : fallbackDraftSource;
  const drafts = workspaceDrafts.length ? workspaceDrafts : buildDraftsFromCreators(creators, fallbackDraftSource);
  const uniqueCreatorCount = creatorLeadStats.uniqueCreators;
  const contactableCreators = creatorLeadStats.contactableCreators || creators.filter(creator => Boolean(creator.contactEmail)).length;

  return {
    ...overview,
    creatorSource,
    draftSource,
    approvalSource: approvalResult.unavailable ? "preview" : "workspace",
    creators,
    drafts,
    approvals: approvalItems,
    metrics: [
      {
        label: "Creators tracked",
        value: uniqueCreatorCount || creators.length,
        note: uniqueCreatorCount ? "Unique creators saved in this workspace" : "Demo shortlist coverage",
      },
      {
        label: "Contactable creators",
        value: contactableCreators,
        note: "Email available for outreach drafting",
      },
      {
        label: "Pending approvals",
        value: approvalCount,
        note: approvalResult.unavailable ? "Preview human review queue" : "Workspace human review queue",
      },
      {
        label: "Open ops tasks",
        value: openTaskCount,
        note: "Follow-ups and review work",
      },
    ],
    pipeline: [
      { label: "Contacts saved", count: contactableCreators },
      { label: "Draft ready", count: draftCount },
      { label: "Needs approval", count: approvalCount },
      { label: "Open ops tasks", count: openTaskCount },
    ],
  };
}

async function getWorkspaceDrafts(workspaceId: string): Promise<OpsDraft[]> {
  const drafts = await prisma.outreachDraft.findMany({
    where: { workspaceId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 5,
    select: {
      id: true,
      channel: true,
      subject: true,
      body: true,
      status: true,
    },
  });

  return drafts.map(draft => ({
    id: draft.id,
    title: draft.subject || `${formatApprovalType(draft.channel)} outreach draft`,
    summary: summarizeDraftBody(draft.body),
    status: formatApprovalType(draft.status),
    channel: formatApprovalType(draft.channel),
  }));
}

async function getCreatorLeadStats(workspaceId: string) {
  const leads = await prisma.creatorLead.findMany({
    where: { workspaceId },
    select: {
      contactEmail: true,
      displayName: true,
      handle: true,
      profileUrl: true,
    },
  });

  const uniqueCreatorKeys = new Set<string>();
  const contactableCreatorKeys = new Set<string>();

  for (const lead of leads) {
    const key = getCreatorIdentityKey(lead);
    uniqueCreatorKeys.add(key);
    if (lead.contactEmail) {
      contactableCreatorKeys.add(key);
    }
  }

  return {
    uniqueCreators: uniqueCreatorKeys.size,
    contactableCreators: contactableCreatorKeys.size,
  };
}

function getCreatorIdentityKey(lead: {
  contactEmail: string | null;
  displayName: string | null;
  handle: string | null;
  profileUrl: string;
}) {
  if (lead.contactEmail) return `email:${normalizeCreatorIdentity(lead.contactEmail)}`;
  if (lead.displayName) return `name:${normalizeCreatorIdentity(lead.displayName)}`;
  if (lead.handle) return `handle:${normalizeCreatorIdentity(lead.handle).replace(/^@/, "")}`;
  return `url:${normalizeCreatorIdentity(lead.profileUrl)}`;
}

function normalizeCreatorIdentity(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

async function getCreatorRecommendations(workspaceId: string): Promise<OpsCreator[]> {
  const leads = await prisma.creatorLead.findMany({
    where: { workspaceId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 8,
    select: {
      id: true,
      displayName: true,
      handle: true,
      platform: true,
      profileUrl: true,
      city: true,
      categories: true,
      followers: true,
      avgViews: true,
      status: true,
      notes: true,
      contactEmail: true,
      contactPhone: true,
    },
  });

  return leads.map(lead => {
    const score = null;
    const hasContact = Boolean(lead.contactEmail || lead.contactPhone);
    const pathClass: OpsPathClass = hasContact ? "neutral" : "hold";
    const path = hasContact ? "Ready for outreach draft" : "Needs creator email";
    const name = lead.displayName || lead.handle || "Unnamed creator";
    const handle = lead.handle || `lead-${lead.id.slice(0, 6)}`;
    const categoryText = lead.categories.length ? lead.categories.join(", ") : "General creator";

    return {
      name,
      handle,
      channel: formatApprovalType(lead.platform),
      audience: lead.city ? `${lead.city} ${categoryText}` : categoryText,
      score,
      contactEmail: lead.contactEmail,
      path,
      pathClass,
      stage: hasContact ? "Contact saved" : "Email missing",
      risk: getCreatorRisk(pathClass, hasContact),
      driver: buildContactDriver(categoryText, lead.contactEmail, lead.profileUrl),
      draft: buildCreatorDraft(name, pathClass),
    };
  });
}

async function getPendingApprovals(workspaceId: string): Promise<{ items: OpsApproval[]; unavailable: boolean }> {
  try {
    const approvals = await prisma.approval.findMany({
      where: {
        workspaceId,
        status: "PENDING",
      },
      orderBy: [{ riskLevel: "desc" }, { createdAt: "desc" }],
      take: 10,
    });

    return {
      unavailable: false,
      items: approvals.map(approval => ({
        id: approval.id,
        type: formatApprovalType(approval.type),
        title: approval.title,
        summary: approval.summary,
        risk: formatRiskLevel(approval.riskLevel),
        status: approval.status,
      })),
    };
  } catch {
    return { items: [], unavailable: true };
  }
}

function scoreCreatorLead(lead: {
  categories: string[];
  followers: number | null;
  avgViews: number | null;
  status: string;
  contactEmail: string | null;
  contactPhone: string | null;
}) {
  let score = 58;

  if (lead.categories.length) score += 10;
  if ((lead.followers ?? 0) >= 10_000) score += 10;
  if ((lead.avgViews ?? 0) >= 2_500) score += 8;
  if (lead.contactEmail || lead.contactPhone) score += 6;
  if (lead.status === "ANALYZED" || lead.status === "APPROVED") score += 8;
  if (lead.status === "NEEDS_REVIEW") score -= 6;
  if (lead.status === "FAILED" || lead.status === "ARCHIVED") score -= 18;

  return Math.max(40, Math.min(96, score));
}

function hasCreatorEnrichmentSignal(lead: {
  categories: string[];
  followers: number | null;
  avgViews: number | null;
  status: string;
  contactEmail: string | null;
  contactPhone: string | null;
}) {
  return Boolean(
    lead.categories.length ||
      lead.followers ||
      lead.avgViews ||
      lead.contactEmail ||
      lead.contactPhone ||
      lead.status === "ANALYZED" ||
      lead.status === "APPROVED" ||
      lead.status === "NEEDS_REVIEW",
  );
}

function getCreatorRisk(pathClass: OpsPathClass, hasContact: boolean) {
  if (pathClass === "hold") return "Creator email is needed before outreach can be prepared";
  if (pathClass === "ai") return "Usage rights and false first-person claims gated";
  return hasContact ? "Human approval required before any external send" : "Contact review required before seeding";
}

function buildCreatorDriver(score: number, categoryText: string, followers: number | null, avgViews: number | null) {
  const reach = followers ? `${followers.toLocaleString()} followers` : "unknown follower count";
  const views = avgViews ? `${avgViews.toLocaleString()} average views` : "limited view signal";
  return `${categoryText} fit with ${reach}, ${views}, and an internal readiness score of ${score}.`;
}

function buildPendingEnrichmentDriver(categoryText: string) {
  return `${categoryText} imported. Mako is waiting for creator enrichment before assigning a fit score or collaboration recommendation.`;
}

function buildContactDriver(categoryText: string, contactEmail: string | null, profileUrl: string) {
  if (contactEmail) {
    return `${categoryText} contact saved at ${contactEmail}. Prepare a safe outreach draft, then route sending for human approval.`;
  }

  const source = profileUrl.startsWith("mailto:") ? "creator email" : "profile link";
  return `${categoryText} ${source} saved, but no creator email is available yet. Add an email before outreach drafting.`;
}

function buildCreatorDraft(name: string, pathClass: OpsPathClass) {
  if (pathClass === "hold") {
    return `Hold outreach to ${name} until brand-safety and campaign-fit context is reviewed.`;
  }

  if (pathClass === "ai") {
    return `Prepare a creator-style script concept for ${name} without implying product use or usage-rights approval.`;
  }

  return `Prepare a product seeding note for ${name}, then route any sample shipment or external send to approval.`;
}

function buildDraftsFromCreators(creators: OpsCreator[], source: Extract<OpsDataSource, "preview" | "derived">): OpsDraft[] {
  return creators.slice(0, 3).map(creator => ({
    title: creator.name,
    summary: creator.draft,
    status: creator.stage,
    channel: creator.channel,
    isPreview: source === "preview",
  }));
}

function summarizeDraftBody(body: string) {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (normalized.length <= 220) return normalized;
  return `${normalized.slice(0, 217).trim()}...`;
}

function formatApprovalType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatRiskLevel(risk: string): OpsRiskLevel {
  if (risk === "HIGH") return "High";
  if (risk === "LOW") return "Low";
  return "Medium";
}

function buildPreviewOverview(source: OpsOverview["source"]): OpsOverview {
  const highFit = previewCreators.filter(creator => (creator.score ?? 0) >= 80).length;
  const aiCandidates = previewCreators.filter(creator => creator.path === "AI content collab").length;

  return {
    source,
    creatorSource: "preview",
    draftSource: "preview",
    approvalSource: "preview",
    metrics: [
      { label: "Creators scored", value: previewCreators.length, note: "Demo shortlist coverage" },
      { label: "High-fit creators", value: highFit, note: "Score 80 or higher" },
      { label: "Pending approvals", value: previewApprovals.length, note: "Preview human review queue" },
      { label: "AI collab candidates", value: aiCandidates, note: "No false first-person claims" },
    ],
    creators: previewCreators,
    drafts: previewDrafts,
    approvals: previewApprovals,
    pipeline: previewPipeline,
    agentSteps: previewAgentSteps,
    blockedActions,
  };
}
