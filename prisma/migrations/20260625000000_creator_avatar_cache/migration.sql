-- CreateEnum
CREATE TYPE "AvatarStatus" AS ENUM ('OK', 'NOT_FOUND');

-- CreateTable
CREATE TABLE "CreatorAvatar" (
    "key" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "handle" TEXT NOT NULL,
    "status" "AvatarStatus" NOT NULL DEFAULT 'OK',
    "contentType" TEXT,
    "data" BYTEA,
    "sourceUrl" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorAvatar_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "CreatorAvatar_status_fetchedAt_idx" ON "CreatorAvatar"("status", "fetchedAt");
