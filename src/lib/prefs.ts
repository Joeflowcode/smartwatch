import type { CategoryId } from "../types";

const KEY = "wsr-hunt-v1";

export interface HuntPrefs {
  address: string;
  city: string;
  zip: string;
  categories: CategoryId[];
  halfDay: boolean;
  departAt: string;
  pasted: string;
}

export function loadPrefs(): Partial<HuntPrefs> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<HuntPrefs>;
  } catch {
    return {};
  }
}

export function savePrefs(prefs: HuntPrefs): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // quota or private mode — hunt still works for this session
  }
}
