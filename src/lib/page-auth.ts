import { redirect } from "next/navigation";
import { AuthError, getRequestContext } from "@/lib/auth";

export async function requirePageContext(nextPath: string) {
  try {
    return await getRequestContext();
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    }
    throw error;
  }
}
