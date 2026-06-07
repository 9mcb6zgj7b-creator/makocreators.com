import { CampaignWizard } from "@/app/campaigns/new/campaign-wizard";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  await requirePageContext("/campaigns/new");
  return <CampaignWizard />;
}
