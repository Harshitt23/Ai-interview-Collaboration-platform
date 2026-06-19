export type ActivityType = "room_created" | "feedback_submitted" | "interview_completed";

export interface Activity {
  type: ActivityType;
  label: string;
  at: number; // epoch ms
}

const KEY = "recentActivity";
const MAX = 6;

export function logActivity(type: ActivityType, label: string) {
  if (typeof window === "undefined") return;
  try {
    const list: Activity[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    list.unshift({ type, label, at: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

export function getActivity(): Activity[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function timeAgo(at: number): string {
  const s = Math.floor((Date.now() - at) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
