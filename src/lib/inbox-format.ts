// [Claude 2026-06-10] Shared helpers for the Inbox pages.
import type { ConversationThreadState } from "@prisma/client";

export function describeThreadState(state: ConversationThreadState): { label: string; tone: "active" | "waiting" | "attention" | "done" } {
  switch (state) {
    case "READY_TO_SEND":
      return { label: "Ready to send", tone: "waiting" };
    case "INITIAL_SENT":
      return { label: "First email sent", tone: "active" };
    case "FOLLOW_UP_DUE":
      return { label: "Following up", tone: "active" };
    case "REPLIED":
      return { label: "Replied", tone: "active" };
    case "INTERESTED_ASSETS":
    case "WAITING_ASSET_APPROVAL":
      return { label: "Wants assets — approval pending", tone: "attention" };
    case "ASSETS_SENT":
      return { label: "Assets sent", tone: "done" };
    case "INTERESTED_VISIT":
    case "WAITING_VISIT_APPROVAL":
      return { label: "Wants a visit — approval pending", tone: "attention" };
    case "VISIT_SCHEDULED":
      return { label: "Visit confirmed", tone: "done" };
    case "NEEDS_HUMAN":
      return { label: "Needs your reply", tone: "attention" };
    case "NO_RESPONSE":
      return { label: "No response", tone: "done" };
    case "REJECTED":
      return { label: "Declined", tone: "done" };
    case "CLOSED":
      return { label: "Unsubscribed", tone: "done" };
    default:
      return { label: "Draft", tone: "waiting" };
  }
}

export function formatTimestamp(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}
