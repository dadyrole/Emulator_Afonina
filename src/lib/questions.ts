import raw from "@/data/questions.json";
import type { Question, QuestionBank, SectionId } from "@/types/question";

export const BANK = raw as unknown as QuestionBank;

export const SECTION_IDS: SectionId[] = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX",
  "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII",
];

export interface Filters {
  pool: "standard" | "extended";
  abbreviationsOnly: boolean;
  section?: SectionId;
}

export function filterQuestions(filters: Filters): Question[] {
  return BANK.questions.filter((q) => {
    if (filters.abbreviationsOnly) {
      if (q.type !== "word_match") return false;
    } else if (filters.pool === "standard" && q.pool !== "standard") {
      return false;
    }
    if (filters.section && q.section !== filters.section) return false;
    return true;
  });
}

export function getQuestionById(id: string): Question | undefined {
  return BANK.questions.find((q) => q.id === id);
}

export function countBySection(filters: Omit<Filters, "section">) {
  const counts: Record<SectionId, number> = Object.fromEntries(
    SECTION_IDS.map((id) => [id, 0]),
  ) as Record<SectionId, number>;
  for (const q of filterQuestions(filters)) counts[q.section]++;
  return counts;
}

export function shuffle<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
