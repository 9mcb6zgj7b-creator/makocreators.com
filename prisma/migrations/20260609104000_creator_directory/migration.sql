-- CreateTable
CREATE TABLE "CreatorDirectoryEntry" (
    "id" TEXT NOT NULL,
    "primaryName" TEXT,
    "normalizedName" TEXT,
    "primaryEmail" TEXT,
    "normalizedEmail" TEXT,
    "profileUrls" TEXT[],
    "platforms" "Platform"[],
    "categories" TEXT[],
    "contactNotes" TEXT,
    "sourceCount" INTEGER NOT NULL DEFAULT 0,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorDirectoryEntry_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "CreatorLead" ADD COLUMN "directoryEntryId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CreatorDirectoryEntry_normalizedEmail_key" ON "CreatorDirectoryEntry"("normalizedEmail");

-- CreateIndex
CREATE INDEX "CreatorDirectoryEntry_normalizedName_idx" ON "CreatorDirectoryEntry"("normalizedName");

-- CreateIndex
CREATE INDEX "CreatorDirectoryEntry_lastSeenAt_idx" ON "CreatorDirectoryEntry"("lastSeenAt");

-- CreateIndex
CREATE INDEX "CreatorLead_directoryEntryId_idx" ON "CreatorLead"("directoryEntryId");

-- AddForeignKey
ALTER TABLE "CreatorLead" ADD CONSTRAINT "CreatorLead_directoryEntryId_fkey" FOREIGN KEY ("directoryEntryId") REFERENCES "CreatorDirectoryEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
