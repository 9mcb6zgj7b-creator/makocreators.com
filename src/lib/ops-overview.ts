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
  decisionNotes?: string | null; // [Claude 2026-06-10] shown in the reviewed-approvals list
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

export type OpsCreatorListRow = {
  name: string;
  platform: string;
  followerNumber: string;
  link: string;
  email: string;
  price: string;
  contactDate: string;
  avgViews: string;
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
  reviewedApprovals: OpsApproval[]; // [Claude 2026-06-10] approvals already actioned (approved / needs changes / rejected)
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

  const [creatorLeadStats, matchRunCount, draftCount, openTaskCount, approvalResult, reviewedApprovals, creatorRecommendations, workspaceDrafts] = await Promise.all([
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
    getReviewedApprovals(workspaceId), // [Claude 2026-06-10] actioned approvals so they don't vanish from the UI
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
    reviewedApprovals, // [Claude 2026-06-10]
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

export async function getWorkspaceCreatorListRows(workspaceId: string, options: { contactableOnly?: boolean } = {}): Promise<OpsCreatorListRow[]> {
  if (!process.env.DATABASE_URL) {
    return previewCreators
      .map(creator => ({
        name: creator.name || "missing",
        platform: creator.channel || "missing",
        followerNumber: "missing",
        link: "missing",
        email: creator.contactEmail || "missing",
        price: "missing",
        contactDate: "missing",
        avgViews: "missing",
      }))
      .filter(row => !options.contactableOnly || row.email !== "missing");
  }

  const leads = await prisma.creatorLead.findMany({
    where: { workspaceId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      rawInput: true,
      contactEmail: true,
      displayName: true,
      handle: true,
      platform: true,
      profileUrl: true,
      followers: true,
      avgViews: true,
    },
  });

  return groupWorkspaceCreatorLeads(leads)
    .map(group => {
      const emails = uniqueStrings(group.map(lead => lead.contactEmail ?? ""));
      const row = {
        name: getCreatorGroupDisplayName(group),
        platform: getCreatorGroupPlatforms(group),
        followerNumber: getCreatorGroupFollowerNumber(group),
        link: getCreatorGroupLinks(group),
        email: emails.length ? emails.join(", ") : "missing",
        price: getCreatorGroupPrice(group),
        contactDate: getCreatorGroupContactDate(group),
        avgViews: getCreatorGroupAvgViews(group),
      };
      return row;
    })
    .filter(row => !options.contactableOnly || row.email !== "missing")
    .sort((left, right) => {
      if (left.email === "missing" && right.email !== "missing") return 1;
      if (left.email !== "missing" && right.email === "missing") return -1;
      return left.name.localeCompare(right.name);
    });
}

function getCreatorGroupDisplayName(group: Array<{ rawInput?: unknown; displayName: string | null; handle: string | null; contactEmail: string | null; profileUrl: string }>) {
  const rawName = group.flatMap(lead => getRawInputCreatorNames(lead.rawInput)).find(Boolean);
  const displayName = group.map(lead => lead.displayName).find(Boolean);
  const handle = group.map(lead => lead.handle).find(Boolean);
  const emailName = group.map(lead => lead.contactEmail?.split("@")[0]).find(Boolean);
  const profileHandle = group.flatMap(lead => getRawInputProfileUrls(lead.rawInput).concat(lead.profileUrl).map(extractProfileHandle)).find(Boolean);
  return rawName || displayName || handle || emailName || profileHandle || "missing";
}

function getCreatorGroupPlatforms(group: Array<{ rawInput?: unknown; platform: string }>) {
  const rawPlatforms = group.flatMap(lead => getRawInputPlatforms(lead.rawInput));
  const platforms = uniqueStrings([...rawPlatforms, ...group.map(lead => formatApprovalType(lead.platform))]);
  return platforms.length ? platforms.join(", ") : "missing";
}

function getCreatorGroupFollowerNumber(group: Array<{ rawInput?: unknown; followers?: number | null }>) {
  const rawFollower = group.flatMap(lead => getRawInputValues(lead.rawInput, ["Follower number", "Followers", "Follower Count"])).find(Boolean);
  const followers = group.map(lead => lead.followers).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return rawFollower || (followers.length ? Math.max(...followers).toLocaleString() : "missing");
}

function getCreatorGroupLinks(group: Array<{ rawInput?: unknown; profileUrl: string }>) {
  const links = uniqueStrings([
    ...group.flatMap(lead => getRawInputProfileUrls(lead.rawInput)),
    ...group.map(lead => lead.profileUrl),
  ].filter(link => !link.startsWith("mailto:")));
  return links.length ? links.join(", ") : "missing";
}

function getCreatorGroupPrice(group: Array<{ rawInput?: unknown }>) {
  return group.flatMap(lead => getRawInputValues(lead.rawInput, ["Price", "price", "报价"])).find(Boolean) || "missing";
}

function getCreatorGroupContactDate(group: Array<{ rawInput?: unknown }>) {
  return group.flatMap(lead => getRawInputValues(lead.rawInput, ["Contact Date", "contact date", "Contacted At"])).find(Boolean) || "missing";
}

function getCreatorGroupAvgViews(group: Array<{ rawInput?: unknown; avgViews?: number | null }>) {
  const rawViews = group.flatMap(lead => getRawInputValues(lead.rawInput, ["Avg. views", "Avg views", "Average views", "Views"])).find(Boolean);
  const views = group.map(lead => lead.avgViews).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return rawViews || (views.length ? Math.max(...views).toLocaleString() : "missing");
}

function getRawInputValues(rawInput: unknown, aliases: string[]) {
  return getRawInputRows(rawInput)
    .map(row => getRawRowValue(row, aliases))
    .filter((value): value is string => Boolean(value));
}

function getRawInputPlatforms(rawInput: unknown) {
  const platforms: string[] = [];
  if (isRecord(rawInput) && Array.isArray(rawInput.platforms)) {
    platforms.push(...rawInput.platforms.filter((value): value is string => typeof value === "string").map(formatApprovalType));
  }
  for (const row of getRawInputRows(rawInput)) {
    const platform = getRawRowValue(row, ["Type", "Platform", "platform", "type"]);
    if (platform) platforms.push(formatImportedPlatform(platform));
  }
  return platforms;
}

function formatImportedPlatform(platform: string) {
  const normalized = platform.trim().toLowerCase();
  if (["ins", "ig", "instagram"].includes(normalized)) return "Instagram";
  if (["tiktok", "tik tok", "tt"].includes(normalized)) return "Tiktok";
  if (["youtube", "yt"].includes(normalized)) return "Youtube";
  return platform.trim();
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
      rawInput: true,
      contactEmail: true,
      displayName: true,
      handle: true,
      profileUrl: true,
    },
  });

  const uniqueCreatorKeys = new Set<string>();
  const contactableCreatorKeys = new Set<string>();

  for (const group of groupWorkspaceCreatorLeads(leads)) {
    const key = getCreatorGroupIdentityKey(group);
    uniqueCreatorKeys.add(key);
    if (group.some(lead => lead.contactEmail)) {
      contactableCreatorKeys.add(key);
    }
  }

  return {
    uniqueCreators: uniqueCreatorKeys.size,
    contactableCreators: contactableCreatorKeys.size,
  };
}

function getCreatorIdentityKeys(lead: {
  rawInput?: unknown;
  contactEmail: string | null;
  displayName: string | null;
  handle: string | null;
  profileUrl: string;
}) {
  return uniqueStrings([
    ...getRawInputCreatorNames(lead.rawInput).map(name => `name:${normalizeCreatorIdentity(name)}`),
    lead.displayName ? `name:${normalizeCreatorIdentity(lead.displayName)}` : "",
    lead.handle ? `handle:${normalizeCreatorIdentity(lead.handle).replace(/^@/, "")}` : "",
    lead.contactEmail ? `email:${normalizeCreatorIdentity(lead.contactEmail)}` : "",
    ...getRawInputProfileUrls(lead.rawInput).flatMap(getProfileIdentityKeys),
    ...getProfileIdentityKeys(lead.profileUrl),
  ]);
}

function getCreatorGroupIdentityKey(group: Array<{
  rawInput?: unknown;
  contactEmail: string | null;
  displayName: string | null;
  handle: string | null;
  profileUrl: string;
}>) {
  return group.flatMap(getCreatorIdentityKeys).sort()[0] ?? `url:${normalizeCreatorIdentity(group[0]?.profileUrl ?? "")}`;
}

function normalizeCreatorIdentity(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getRawInputCreatorNames(rawInput: unknown) {
  const names: string[] = [];
  for (const row of getRawInputRows(rawInput)) {
    const name = getRawRowValue(row, ["Influencers' ID", "Influencer ID", "Creator", "Creator ID", "Name", "Display Name"]);
    if (name) names.push(name);
  }
  return names;
}

function getRawInputProfileUrls(rawInput: unknown) {
  const urls: string[] = [];
  if (isRecord(rawInput) && Array.isArray(rawInput.profileUrls)) {
    urls.push(...rawInput.profileUrls.filter((value): value is string => typeof value === "string"));
  }
  for (const row of getRawInputRows(rawInput)) {
    const url = getRawRowValue(row, ["link", "Link", "URL", "Profile URL"]);
    if (url) urls.push(url);
  }
  return urls;
}

function getRawInputRows(rawInput: unknown) {
  if (!isRecord(rawInput)) return [];
  if (Array.isArray(rawInput.rows)) {
    return rawInput.rows.filter(isRecord);
  }
  return [rawInput];
}

function getRawRowValue(row: Record<string, unknown>, aliases: string[]) {
  const entries = Object.entries(row).map(([key, value]) => [normalizeCreatorIdentity(key), value] as const);
  for (const alias of aliases) {
    const match = entries.find(([key]) => key === normalizeCreatorIdentity(alias));
    const value = match?.[1];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function getProfileIdentityKeys(profileUrl: string) {
  const normalizedUrl = normalizeCreatorIdentity(profileUrl);
  const handle = extractProfileHandle(profileUrl);
  return uniqueStrings([
    `url:${normalizedUrl}`,
    handle ? `handle:${normalizeCreatorIdentity(handle).replace(/^@/, "")}` : "",
  ]);
}

function extractProfileHandle(profileUrl: string) {
  try {
    const parsed = new URL(profileUrl.startsWith("http") || profileUrl.startsWith("mailto:") ? profileUrl : `https://${profileUrl}`);
    if (parsed.protocol === "mailto:") return parsed.pathname.split("@")[0] || null;
    const segment = parsed.pathname.split("/").filter(Boolean)[0];
    return segment?.replace(/^@/, "") || null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function getCreatorRecommendations(workspaceId: string): Promise<OpsCreator[]> {
  const leads = await prisma.creatorLead.findMany({
    where: { workspaceId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      rawInput: true,
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

  const uniqueLeads = mergeWorkspaceCreatorLeads(leads);

  return uniqueLeads.map(lead => {
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

function mergeWorkspaceCreatorLeads<T extends {
  id: string;
  rawInput?: unknown;
  displayName: string | null;
  handle: string | null;
  platform: string;
  profileUrl: string;
  city: string | null;
  categories: string[];
  followers: number | null;
  avgViews: number | null;
  status: string;
  notes: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}>(leads: T[]) {
  const groups = groupWorkspaceCreatorLeads(leads);

  return groups.map(group => {
    const [first, ...rest] = group;
    return rest.reduce<T>((existing, lead) => ({
      ...existing,
      displayName: existing.displayName || lead.displayName,
      handle: existing.handle || lead.handle,
      city: existing.city || lead.city,
      categories: uniqueStrings([...existing.categories, ...lead.categories]),
      followers: maxNumber([existing.followers, lead.followers]),
      avgViews: maxNumber([existing.avgViews, lead.avgViews]),
      contactEmail: existing.contactEmail || lead.contactEmail,
      contactPhone: existing.contactPhone || lead.contactPhone,
      notes: existing.notes || lead.notes,
    }), first);
  });
}

function groupWorkspaceCreatorLeads<T extends {
  rawInput?: unknown;
  contactEmail: string | null;
  displayName: string | null;
  handle: string | null;
  profileUrl: string;
}>(leads: T[]) {
  const parents = leads.map((_, index) => index);
  const firstLeadIndexByKey = new Map<string, number>();

  leads.forEach((lead, index) => {
    for (const key of getCreatorIdentityKeys(lead)) {
      const firstLeadIndex = firstLeadIndexByKey.get(key);
      if (typeof firstLeadIndex === "number") {
        unionIndexes(parents, index, firstLeadIndex);
      } else {
        firstLeadIndexByKey.set(key, index);
      }
    }
  });

  const groups = new Map<number, T[]>();
  leads.forEach((lead, index) => {
    const root = findRootIndex(parents, index);
    groups.set(root, [...(groups.get(root) ?? []), lead]);
  });

  return Array.from(groups.values());
}

function findRootIndex(parents: number[], index: number): number {
  if (parents[index] !== index) {
    parents[index] = findRootIndex(parents, parents[index]);
  }
  return parents[index];
}

function unionIndexes(parents: number[], left: number, right: number) {
  const leftRoot = findRootIndex(parents, left);
  const rightRoot = findRootIndex(parents, right);
  if (leftRoot !== rightRoot) parents[rightRoot] = leftRoot;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function maxNumber(values: Array<number | null>) {
  const numbers = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return numbers.length ? Math.max(...numbers) : null;
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

// [Claude 2026-06-10] Fetch approvals that have already been actioned so they remain
// visible (and reopenable) after Approve / Need Change / Reject. Previously only PENDING
// approvals were surfaced, so an actioned item disappeared from the UI entirely.
async function getReviewedApprovals(workspaceId: string): Promise<OpsApproval[]> {
  try {
    const approvals = await prisma.approval.findMany({
      where: {
        workspaceId,
        status: { in: ["APPROVED", "NEEDS_CHANGES", "REJECTED"] },
      },
      orderBy: [{ reviewedAt: "desc" }, { updatedAt: "desc" }],
      take: 15,
    });

    return approvals.map(approval => ({
      id: approval.id,
      type: formatApprovalType(approval.type),
      title: approval.title,
      summary: approval.summary,
      risk: formatRiskLevel(approval.riskLevel),
      status: approval.status,
      decisionNotes: approval.decisionNotes,
    }));
  } catch {
    return [];
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
    reviewedApprovals: [], // [Claude 2026-06-10] no reviewed history in preview mode
    pipeline: previewPipeline,
    agentSteps: previewAgentSteps,
    blockedActions,
  };
}
