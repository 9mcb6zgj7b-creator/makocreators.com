import type { CreatorLeadInput } from "@/lib/creator-leads";
import { prisma } from "@/lib/db";

type DirectoryInput = Pick<
  CreatorLeadInput,
  "profileUrl" | "profileUrls" | "displayName" | "handle" | "contactEmail" | "platform" | "platforms" | "categories" | "contactNotes" | "rawInput"
>;

export function normalizeCreatorName(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, " ");
  return normalized || null;
}

export function normalizeCreatorEmail(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

export async function syncCreatorDirectoryEntry(input: DirectoryInput) {
  const normalizedEmail = normalizeCreatorEmail(input.contactEmail);
  const primaryName = input.displayName || input.handle || normalizedEmail?.split("@")[0] || null;
  const normalizedName = normalizeCreatorName(primaryName);
  const existing = await findExistingDirectoryEntry(normalizedEmail, normalizedName);
  const rawInput = input.rawInput && typeof input.rawInput === "object" && !Array.isArray(input.rawInput) ? input.rawInput as Record<string, unknown> : {};
  const rawProfileUrls = Array.isArray(rawInput.profileUrls) ? rawInput.profileUrls.filter((url): url is string => typeof url === "string") : [];
  const rawPlatforms = Array.isArray(rawInput.platforms) ? rawInput.platforms.filter((platform): platform is NonNullable<typeof input.platform> => typeof platform === "string") : [];
  const profileUrls = unique([...(existing?.profileUrls ?? []), input.profileUrl, ...(input.profileUrls ?? []), ...rawProfileUrls].filter(Boolean));
  const platforms = unique([...(existing?.platforms ?? []), input.platform, ...(input.platforms ?? []), ...rawPlatforms].filter(Boolean));
  const categories = unique([...(existing?.categories ?? []), ...(input.categories ?? [])]);

  if (existing) {
    return prisma.creatorDirectoryEntry.update({
      where: { id: existing.id },
      data: {
        primaryName: existing.primaryName || primaryName,
        normalizedName: existing.normalizedName || normalizedName,
        primaryEmail: existing.primaryEmail || normalizedEmail,
        normalizedEmail: existing.normalizedEmail || normalizedEmail,
        profileUrls,
        platforms,
        categories,
        contactNotes: input.contactNotes || existing.contactNotes,
        sourceCount: { increment: 1 },
        lastSeenAt: new Date(),
      },
    });
  }

  return prisma.creatorDirectoryEntry.create({
    data: {
      primaryName,
      normalizedName,
      primaryEmail: normalizedEmail,
      normalizedEmail,
      profileUrls,
      platforms,
      categories,
      contactNotes: input.contactNotes,
      sourceCount: 1,
    },
  });
}

export async function attachLeadToCreatorDirectory(input: DirectoryInput, leadId: string) {
  const entry = await syncCreatorDirectoryEntry(input);
  await prisma.creatorLead.update({
    where: { id: leadId },
    data: { directoryEntryId: entry.id },
  });
  return entry;
}

async function findExistingDirectoryEntry(normalizedEmail: string | null, normalizedName: string | null) {
  if (!normalizedEmail && !normalizedName) return null;
  return prisma.creatorDirectoryEntry.findFirst({
    where: {
      OR: [
        normalizedEmail ? { normalizedEmail } : null,
        normalizedName ? { normalizedName } : null,
      ].filter((item): item is NonNullable<typeof item> => Boolean(item)),
    },
    orderBy: { updatedAt: "desc" },
  });
}

function unique<T>(values: Array<T | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is T => value !== null && value !== undefined && value !== "")));
}
