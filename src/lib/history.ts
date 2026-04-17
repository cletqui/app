const KEY = "search_history";
const MAX = 10;

export interface HistoryEntry {
  query: string;
  type: string;
  ts: number;
}

export function getHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function pushHistory(query: string, type: string): void {
  const h = getHistory().filter((e) => e.query !== query);
  h.unshift({ query, type, ts: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(h.slice(0, MAX)));
}

export function removeHistory(query: string): void {
  localStorage.setItem(KEY, JSON.stringify(getHistory().filter((e) => e.query !== query)));
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}
