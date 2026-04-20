"use client";

import type { SectionId } from "@/types/question";

export type Pool = "standard" | "extended";

export interface FilterSettings {
  pool: Pool;
  abbreviationsOnly: boolean;
}

const KEY = "sstks-trainer-filters";
const DEFAULT: FilterSettings = { pool: "standard", abbreviationsOnly: false };

export function loadFilters(): FilterSettings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const p = JSON.parse(raw);
    return {
      pool: p.pool === "extended" ? "extended" : "standard",
      abbreviationsOnly: !!p.abbreviationsOnly,
    };
  } catch {
    return DEFAULT;
  }
}

export function saveFilters(f: FilterSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(f));
}

export function sectionToLabel(id: SectionId, sections: Record<string, string>) {
  return sections[id] ?? id;
}
