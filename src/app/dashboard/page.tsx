import { DashboardHome } from "@/components/dashboard-home";
import { requirePageContext } from "@/lib/page-auth";
import { getDashboardData } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, workspace, role } = await requirePageContext("/dashboard");
  const dashboard = await getDashboardData(workspace.id);

  return (
    <DashboardHome
      dashboard={dashboard}
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
