import { redirect } from "next/navigation";
import { AuthRolePage } from "@/components/auth-role-page";
import { AuthError, getRequestContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RoleLoginPage({ params, searchParams }: { params: { role: string }; searchParams: { next?: string } }) {
  const nextPath = sanitizeNextPath(searchParams.next);

  try {
    await getRequestContext();
    redirect(nextPath);
  } catch (error) {
    if (!(error instanceof AuthError)) throw error;
  }

  return <AuthRolePage mode="login" role={params.role === "creator" ? "creator" : "brand"} nextPath={nextPath} />;
}

function sanitizeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}
