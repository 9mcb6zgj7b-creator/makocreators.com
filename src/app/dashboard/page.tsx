import { DashboardHome } from "@/components/dashboard-home";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, workspace, role } = await requirePageContext("/dashboard");

  return (
    <DashboardHome
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        workspaceName: workspace.name,
        role,
      }}
    />
  );
}
