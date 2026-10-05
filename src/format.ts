import { SPORTS, type Sport } from "./teams";

export function sportLabel(sport: Sport): string {
  return SPORTS.find((s) => s.id === sport)?.label ?? sport;
}

// "Sun, Oct 5, 2026", in the player's own time zone.
export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
