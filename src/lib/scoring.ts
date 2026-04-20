import type {
  MultiChoice,
  SingleChoice,
  TextInput,
  WordMatch,
  FormatCheck,
  Matching,
} from "@/types/question";

export function normalizeText(s: string, opts?: { caseSensitive?: boolean; stripSpaces?: boolean; stripPunctuation?: boolean }) {
  let out = s;
  if (!opts?.caseSensitive) out = out.toLowerCase();
  out = out.trim();
  if (opts?.stripPunctuation !== false) out = out.replace(/[.,;:!?]/g, "");
  if (opts?.stripSpaces) out = out.replace(/\s+/g, "");
  else out = out.replace(/\s+/g, " ");
  return out;
}

export function scoreSingleChoice(q: SingleChoice, answerId: string | null) {
  return answerId === q.correct ? 100 : 0;
}

export function scoreMultiChoice(q: MultiChoice, picked: string[]) {
  const correct = new Set(q.correct);
  const pick = new Set(picked);
  if (correct.size === pick.size && [...correct].every((c) => pick.has(c))) return 100;
  const hits = [...pick].filter((p) => correct.has(p)).length;
  const extras = [...pick].filter((p) => !correct.has(p)).length;
  const score = Math.round(((hits - extras * 0.2) / correct.size) * 100);
  return Math.max(0, score);
}

export function scoreTextInput(q: TextInput, value: string, usedFallback: boolean, fallbackAnswerId?: string) {
  if (usedFallback && q.fallbackOptions) {
    return fallbackAnswerId === q.fallbackOptions.correct ? 50 : 0;
  }
  const normOpts = {
    caseSensitive: q.normalization?.caseSensitive ?? false,
    stripSpaces: q.normalization?.stripSpaces ?? false,
    stripPunctuation: q.normalization?.stripPunctuation ?? true,
  };
  const got = normalizeText(value, normOpts);
  if (!got) return 0;
  for (const acc of q.acceptedAnswers) {
    if (normalizeText(acc, normOpts) === got) return 100;
  }
  if (q.regex) {
    try {
      if (new RegExp(q.regex, normOpts.caseSensitive ? "" : "i").test(value.trim())) return 100;
    } catch { /* ignore bad regex */ }
  }
  return 0;
}

export interface WordMatchResult {
  score: number;
  highlighted: { text: string; matched: boolean }[];
  missingKeywords: string[];
}

function normWord(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,;!?]/g, "")
    .replace(/[-–—]/g, " ");
}

export function scoreWordMatch(userInput: string, q: WordMatch): WordMatchResult {
  const userWords = new Set(
    normWord(userInput).split(/\s+/).filter(Boolean),
  );
  const canonical = normWord(q.correctAnswer).split(/\s+/).filter(Boolean);
  const altSets: string[][] = [canonical,
    ...(q.acceptedAlternatives ?? []).map((a) => normWord(a).split(/\s+/).filter(Boolean)),
  ];
  if (q.allowRussian && q.russianAnswer) {
    altSets.push(normWord(q.russianAnswer).split(/\s+/).filter(Boolean));
  }

  let bestMatched = new Set<string>();
  let bestRef: string[] = canonical;
  for (const set of altSets) {
    const matched = new Set(set.filter((w) => userWords.has(w)));
    if (matched.size > bestMatched.size) {
      bestMatched = matched;
      bestRef = set;
    }
  }

  if (q.requiredKeywords && q.requiredKeywords.length) {
    const missing = q.requiredKeywords.filter((k) => !userWords.has(normWord(k)));
    if (missing.length) {
      return {
        score: 0,
        highlighted: q.correctAnswer.split(/(\s+|-)/).map((chunk) => ({
          text: chunk,
          matched: false,
        })),
        missingKeywords: missing,
      };
    }
  }

  const highlighted = q.correctAnswer.split(/(\s+|-)/).map((chunk) => ({
    text: chunk,
    matched: /\S/.test(chunk) && bestMatched.has(normWord(chunk)),
  }));
  const denom = bestRef.length || canonical.length || 1;
  const score = Math.round((bestMatched.size / denom) * 100);
  return { score, highlighted, missingKeywords: [] };
}

export function scoreFormatCheck(q: FormatCheck, clicked: Set<string>) {
  const errorIds = new Set(q.tokens.filter((t) => t.isError).map((t) => t.id));
  let hits = 0;
  let falsePositives = 0;
  for (const id of clicked) {
    if (errorIds.has(id)) hits++;
    else falsePositives++;
  }
  const total = errorIds.size || 1;
  const score = Math.round((hits / total) * 100 - falsePositives * 10);
  return Math.max(0, Math.min(100, score));
}

export function scoreMatching(q: Matching, picks: Record<string, string>) {
  let right = 0;
  for (const pair of q.pairs) {
    if (picks[pair.id] === pair.id) right++;
  }
  return Math.round((right / q.pairs.length) * 100);
}
