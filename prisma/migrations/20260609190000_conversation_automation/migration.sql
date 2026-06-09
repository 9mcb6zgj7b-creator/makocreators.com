-- Conversation automation state machine and message ledger.
CREATE TYPE "ConversationThreadState" AS ENUM (
  'DRAFT',
  'READY_TO_SEND',
  'INITIAL_SENT',
  'REPLIED',
  'INTERESTED_ASSETS',
  'WAITING_ASSET_APPROVAL',
  'ASSETS_SENT',
  'INTERESTED_VISIT',
  'WAITING_VISIT_APPROVAL',
  'VISIT_SCHEDULED',
  'FOLLOW_UP_DUE',
  'NO_RESPONSE',
  'REJECTED',
  'NEEDS_HUMAN',
  'CLOSED'
);

CREATE TYPE "ConversationMessageDirection" AS ENUM (
  'OUTBOUND',
  'INBOUND',
  'INTERNAL'
);

ALTER TYPE "ApprovalType" ADD VALUE IF NOT EXISTS 'SEND_ASSETS';
ALTER TYPE "ApprovalType" ADD VALUE IF NOT EXISTS 'SCHEDULE_VISIT';

CREATE TABLE "ConversationThread" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "creatorLeadId" TEXT,
  "outreachDraftId" TEXT,
  "assignedHumanId" TEXT,
  "state" "ConversationThreadState" NOT NULL DEFAULT 'DRAFT',
  "subject" TEXT,
  "creatorEmail" TEXT,
  "replyToEmail" TEXT,
  "lastIntent" TEXT,
  "lastConfidence" DOUBLE PRECISION,
  "nextActionAt" TIMESTAMP(3),
  "lastMessageAt" TIMESTAMP(3),
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ConversationThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationMessage" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "direction" "ConversationMessageDirection" NOT NULL,
  "provider" TEXT,
  "providerMessageId" TEXT,
  "fromEmail" TEXT,
  "toEmail" TEXT,
  "subject" TEXT,
  "textBody" TEXT,
  "htmlBody" TEXT,
  "intent" TEXT,
  "confidence" DOUBLE PRECISION,
  "extractedTimes" JSONB NOT NULL DEFAULT '[]',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConversationThread_workspaceId_state_nextActionAt_idx" ON "ConversationThread"("workspaceId", "state", "nextActionAt");
CREATE INDEX "ConversationThread_creatorLeadId_idx" ON "ConversationThread"("creatorLeadId");
CREATE INDEX "ConversationThread_assignedHumanId_idx" ON "ConversationThread"("assignedHumanId");
CREATE INDEX "ConversationThread_replyToEmail_idx" ON "ConversationThread"("replyToEmail");
CREATE INDEX "ConversationMessage_threadId_createdAt_idx" ON "ConversationMessage"("threadId", "createdAt");
CREATE INDEX "ConversationMessage_providerMessageId_idx" ON "ConversationMessage"("providerMessageId");

ALTER TABLE "ConversationThread" ADD CONSTRAINT "ConversationThread_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationThread" ADD CONSTRAINT "ConversationThread_creatorLeadId_fkey" FOREIGN KEY ("creatorLeadId") REFERENCES "CreatorLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationThread" ADD CONSTRAINT "ConversationThread_outreachDraftId_fkey" FOREIGN KEY ("outreachDraftId") REFERENCES "OutreachDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationThread" ADD CONSTRAINT "ConversationThread_assignedHumanId_fkey" FOREIGN KEY ("assignedHumanId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ConversationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
