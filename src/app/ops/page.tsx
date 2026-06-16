// [Claude 2026-06-16] Ops cockpit merged into /dashboard. Redirect old bookmarks.
import { redirect } from "next/navigation";

export default function OpsRedirect() {
  redirect("/dashboard");
}
