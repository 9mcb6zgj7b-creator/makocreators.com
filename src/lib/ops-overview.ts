import { prisma } from "@/lib/db";

export type OpsPathClass = "seed" | "ai" | "hold" | "neutral";
export type OpsRiskLevel = "Low" | "Medium" | "High";

export type OpsCreator = {
  name: string;
  handle: string;
  channel: string;
  audience: string;
  score: number;
  path: string;
  pathClass: OpsPathClass;
  stage: string;
  risk: string;
  driver: string;
  draft: string;
};

export type OpsApproval = {
  id?: string;
  type: string;
  title: string;
  summary: string;
  risk: OpsRiskLevel;
  status?: string;
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
  metrics: OpsMetric[];
  creators: OpsCreator[];
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
    type: "Send outreach",
    title: "Approve Ava outreach draft",
    summary: "Personalized product seeding message is ready. Human approval is required before any external send.",
    risk: "Medium",
  },
  {
    type: "Send follow-up",
    title: "Approve Jules follow-up",
    summary: "Follow-up draft avoids payment language and asks only about product trial interest.",
    risk: "Medium",
  },
  {
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

  const [creatorLeadCount, matchRunCount, draftCount, openTaskCount, approvals] = await Promise.all([
    prisma.creatorLead.count({ where: { workspaceId } }),
    prisma.creatorMatchRun.count({ where: { workspaceId } }),
    prisma.outreachDraft.count({ where: { workspaceId, status: "DRAFT" } }),
    prisma.dashboardTask.count({
      where: {
        workspaceId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),
    getPendingApprovals(workspaceId),
  ]);

  const overview = buildPreviewOverview("workspace");
  const approvalItems = approvals.length ? approvals : overview.approvals;

  return {
    ...overview,
    approvals: approvalItems,
    metrics: [
      {
        label: "Creators tracked",
        value: creatorLeadCount || overview.metrics[0].value,
        note: creatorLeadCount ? "Workspace creator leads" : "Demo shortlist coverage",
      },
      {
        label: "Match runs",
        value: matchRunCount || overview.metrics[1].value,
        note: matchRunCount ? "Workspace scoring runs" : "Score 80 or higher",
      },
      {
        label: "Drafts pending",
        value: draftCount || overview.metrics[2].value,
        note: draftCount ? "Draft outreach items" : "Human review queue",
      },
      {
        label: "Approval items",
        value: approvals.length || overview.metrics[3].value,
        note: approvals.length ? "Workspace human review queue" : "No false first-person claims",
      },
    ],
    pipeline: [
      overview.pipeline[0],
      overview.pipeline[1],
      { label: "Needs approval", count: approvals.length || overview.pipeline[2].count },
      { label: "Open ops tasks", count: openTaskCount || overview.pipeline[3].count },
    ],
  };
}

async function getPendingApprovals(workspaceId: string): Promise<OpsApproval[]> {
  try {
    const approvals = await prisma.approval.findMany({
      where: {
        workspaceId,
        status: "PENDING",
      },
      orderBy: [{ riskLevel: "desc" }, { createdAt: "desc" }],
      take: 10,
    });

    return approvals.map(approval => ({
      id: approval.id,
      type: formatApprovalType(approval.type),
      title: approval.title,
      summary: approval.summary,
      risk: formatRiskLevel(approval.riskLevel),
      status: approval.status,
    }));
  } catch {
    return [];
  }
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
  const highFit = previewCreators.filter(creator => creator.score >= 80).length;
  const aiCandidates = previewCreators.filter(creator => creator.path === "AI content collab").length;

  return {
    source,
    metrics: [
      { label: "Creators scored", value: previewCreators.length, note: "Demo shortlist coverage" },
      { label: "High-fit creators", value: highFit, note: "Score 80 or higher" },
      { label: "Approval items", value: previewApprovals.length, note: "Human review queue" },
      { label: "AI collab candidates", value: aiCandidates, note: "No false first-person claims" },
    ],
    creators: previewCreators,
    approvals: previewApprovals,
    pipeline: previewPipeline,
    agentSteps: previewAgentSteps,
    blockedActions,
  };
}
