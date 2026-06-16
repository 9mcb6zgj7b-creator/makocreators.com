"use client";

// [Claude 2026-06-12] "Email anyone, anytime" — a compose button on each creator row.
// No active thread → preview-and-send first outreach (same modal as Today's picks).
// Active thread already exists → link straight to the Inbox conversation instead.
// Unsubscribed/declined creators stay blocked (the API enforces suppression).
import { useEffect, useState } from "react";
import { PreviewModal, generateOutreachPreview, type PreviewState } from "@/components/outreach-picks-panel";

type Campaign = { id: string; name: string };

type SendOutcome =
  | { kind: "sent" }
  | { kind: "existing"; threadId: string }
  | { kind: "suppressed" };

export function ComposeOutreachButton({ leadId, name }: { leadId: string; name: string }) {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [outcome, setOutcome] = useState<SendOutcome | null>(null);

  useEffect(() => {
    fetch("/api/campaigns")
      .then(r => r.json())
      .then((data: { campaigns?: Campaign[] }) => setCampaigns(data.campaigns ?? []))
      .catch(() => {});
  }, []);

  async function open() {
    const defaultCampaignId = campaigns[0]?.id ?? "";
    setPreview({ leadId, name, campaignId: defaultCampaignId, styleNote: "", referencePost: "", subject: "", body: "", rewriteNote: "", loading: true, sending: false, rewriting: false, error: "" });
    try {
      const r = await generateOutreachPreview(leadId, "", "", defaultCampaignId || undefined);
      setPreview(prev => (prev ? { ...prev, subject: r.subject ?? "", body: r.body ?? "", styleNote: r.styleNote ?? "", referencePost: r.referencePost ?? "", loading: false } : prev));
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, loading: false, error: caught instanceof Error ? caught.message : "Preview failed." } : prev));
    }
  }

  async function regenerate() {
    if (!preview) return;
    setPreview({ ...preview, loading: true, error: "" });
    try {
      const r = await generateOutreachPreview(preview.leadId, preview.styleNote, preview.referencePost, preview.campaignId || undefined);
      setPreview(prev => (prev ? { ...prev, subject: r.subject ?? prev.subject, body: r.body ?? prev.body, loading: false } : prev));
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, loading: false, error: caught instanceof Error ? caught.message : "Preview failed." } : prev));
    }
  }

  async function rewrite() {
    if (!preview || !preview.rewriteNote.trim()) return;
    setPreview({ ...preview, rewriting: true, error: "" });
    try {
      const res = await fetch("/api/outreach-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rewrite",
          leadId: preview.leadId,
          campaignId: preview.campaignId || undefined,
          subject: preview.subject,
          body: preview.body,
          styleNote: preview.styleNote,
          referencePost: preview.referencePost,
          instruction: preview.rewriteNote,
        }),
      });
      const payload = (await res.json()) as { subject?: string; body?: string; error?: unknown };
      if (!res.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Rewrite failed.");
      setPreview(prev => (prev ? { ...prev, subject: payload.subject ?? prev.subject, body: payload.body ?? prev.body, rewriting: false } : prev));
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, rewriting: false, error: caught instanceof Error ? caught.message : "Rewrite failed." } : prev));
    }
  }

  async function send() {
    if (!preview) return;
    setPreview({ ...preview, sending: true, error: "" });
    try {
      const res = await fetch("/api/outreach-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", leadId: preview.leadId, campaignId: preview.campaignId || undefined, subject: preview.subject, body: preview.body, styleNote: preview.styleNote, referencePost: preview.referencePost }),
      });
      const payload = (await res.json().catch(() => ({}))) as { results?: Array<{ threadId?: string; status?: string }>; error?: unknown };
      if (!res.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Send failed.");
      const result = payload.results?.[0];
      if (result?.status === "existing" && result.threadId) {
        setOutcome({ kind: "existing", threadId: result.threadId });
      } else if (result?.status === "suppressed") {
        setOutcome({ kind: "suppressed" });
      } else {
        setOutcome({ kind: "sent" });
      }
      setPreview(null);
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, sending: false, error: caught instanceof Error ? caught.message : "Send failed." } : prev));
    }
  }

  if (outcome?.kind === "sent") {
    return <span className="compose-outcome sent">Email sent</span>;
  }
  if (outcome?.kind === "existing") {
    return (
      <a className="compose-outcome existing" href={`/inbox/${outcome.threadId}`}>
        Open conversation
      </a>
    );
  }
  if (outcome?.kind === "suppressed") {
    return <span className="compose-outcome suppressed">Opted out</span>;
  }

  return (
    <>
      <button type="button" className="compose-email-button" onClick={open}>
        Email
      </button>
      {preview ? <PreviewModal preview={preview} setPreview={setPreview} campaigns={campaigns} onRegenerate={regenerate} onRewrite={rewrite} onSend={send} /> : null}
    </>
  );
}
