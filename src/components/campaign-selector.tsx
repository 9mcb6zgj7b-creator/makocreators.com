"use client";

// [Claude 2026-06-16] Campaign selector for the merged Home/Ops page.
// Changing the selection updates the URL search param so the server re-renders
// with the correct campaign context.
import { useRouter } from "next/navigation";

type Campaign = { id: string; name: string };

export function CampaignSelector({ campaigns, selectedId }: { campaigns: Campaign[]; selectedId: string }) {
  const router = useRouter();

  if (!campaigns.length) return null;

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value;
    const params = new URLSearchParams(window.location.search);
    if (id) params.set("campaignId", id);
    else params.delete("campaignId");
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <label className="campaign-select">
      <span>Campaign</span>
      <select value={selectedId} onChange={onChange}>
        {campaigns.length === 0 && <option value="">No campaigns yet</option>}
        {campaigns.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </label>
  );
}
