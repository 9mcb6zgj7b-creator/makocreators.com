import { redirect } from "next/navigation";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : "";
  redirect(`/login/brand${next}`);
}
