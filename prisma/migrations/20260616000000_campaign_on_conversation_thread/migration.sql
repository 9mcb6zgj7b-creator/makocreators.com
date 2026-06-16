-- Add campaignId to ConversationThread so each outreach thread can be
-- scoped to a specific campaign (rather than implicitly using the latest one).
ALTER TABLE "ConversationThread" ADD COLUMN "campaignId" TEXT;

ALTER TABLE "ConversationThread"
  ADD CONSTRAINT "ConversationThread_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ConversationThread_campaignId_idx" ON "ConversationThread"("campaignId");
