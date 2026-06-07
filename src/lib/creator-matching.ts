import { Platform, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type MatchInput = {
  workspaceId: string;
  createdById: string;
  personaId?: string;
  query?: Prisma.InputJsonValue;
};

const STARTER_CREATORS = [
  {
    displayName: "Mia Eats LA",
    handle: "mia.eats.la",
    location: "Los Angeles",
    categories: ["food", "restaurant", "local-business"],
    languages: ["en", "zh"],
    platform: "INSTAGRAM" as Platform,
    url: "https://instagram.com/mia.eats.la",
    followers: 86000,
    avgViews: 42000,
    engagementRate: 5.8,
    score: 94,
    reasons: ["Local restaurant content fit", "Strong comments with visit intent", "Reels-first short video style"],
    risks: ["May require two-week booking lead time"],
  },
  {
    displayName: "Nora Local Finds",
    handle: "nora.finds",
    location: "Pasadena",
    categories: ["local-life", "food", "weekend-guide"],
    languages: ["en"],
    platform: "INSTAGRAM" as Platform,
    url: "https://instagram.com/nora.finds",
    followers: 31000,
    avgViews: 18000,
    engagementRate: 6.4,
    score: 88,
    reasons: ["High fit for local discovery", "Budget-friendly collab range", "Audience saves weekend ideas"],
    risks: ["Lower reach than larger creator profiles"],
  },
  {
    displayName: "Chef Kai",
    handle: "kaifoodlab",
    location: "San Gabriel Valley",
    categories: ["food", "chef", "education"],
    languages: ["en", "zh"],
    platform: "YOUTUBE" as Platform,
    url: "https://youtube.com/@kaifoodlab",
    followers: 42000,
    avgViews: 26000,
    engagementRate: 7.1,
    score: 86,
    reasons: ["Can explain menu value clearly", "Strong for chef/story-led concepts", "Good short-form performance"],
    risks: ["May need more detailed creative brief"],
  },
];

export async function createMatchRun(input: MatchInput) {
  const creators = await ensureStarterCreators();
  const run = await prisma.creatorMatchRun.create({
    data: {
      workspaceId: input.workspaceId,
      createdById: input.createdById,
      personaId: input.personaId,
      query: input.query ?? {},
      status: "COMPLETED",
      startedAt: new Date(),
      completedAt: new Date(),
      results: {
        create: creators.map(({ creator, seed }, index) => ({
          creatorId: creator.id,
          score: seed.score - index,
          reasons: seed.reasons,
          risks: seed.risks,
          estimatedPriceMin: index === 0 ? 650 : index === 1 ? 350 : 450,
          estimatedPriceMax: index === 0 ? 1200 : index === 1 ? 700 : 900,
          metadata: {
            starter: true,
            note: "Starter result until production creator data is connected.",
          },
        })),
      },
    },
    include: {
      results: {
        include: {
          creator: {
            include: { profiles: true },
          },
        },
        orderBy: { score: "desc" },
      },
    },
  });

  return run;
}

async function ensureStarterCreators() {
  return Promise.all(
    STARTER_CREATORS.map(async seed => {
      const creator = await prisma.creator.upsert({
        where: { handle: seed.handle },
        update: {
          displayName: seed.displayName,
          location: seed.location,
          categories: seed.categories,
          languages: seed.languages,
        },
        create: {
          displayName: seed.displayName,
          handle: seed.handle,
          location: seed.location,
          categories: seed.categories,
          languages: seed.languages,
          profiles: {
            create: {
              platform: seed.platform,
              url: seed.url,
              handle: seed.handle,
              followers: seed.followers,
              avgViews: seed.avgViews,
              engagementRate: seed.engagementRate,
            },
          },
        },
      });

      await prisma.creatorSocialProfile.upsert({
        where: {
          platform_handle: {
            platform: seed.platform,
            handle: seed.handle,
          },
        },
        update: {
          url: seed.url,
          followers: seed.followers,
          avgViews: seed.avgViews,
          engagementRate: seed.engagementRate,
        },
        create: {
          creatorId: creator.id,
          platform: seed.platform,
          url: seed.url,
          handle: seed.handle,
          followers: seed.followers,
          avgViews: seed.avgViews,
          engagementRate: seed.engagementRate,
        },
      });

      return { creator, seed };
    })
  );
}
