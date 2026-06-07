import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login/login-form";
import { AuthError, getRequestContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const nextPath = sanitizeNextPath(searchParams.next);

  try {
    await getRequestContext();
    redirect(nextPath);
  } catch (error) {
    if (!(error instanceof AuthError)) {
      throw error;
    }
  }

  return <LoginForm nextPath={nextPath} />;
}

function sanitizeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}
