"use client";

const KEY = "sstks-trainer-progress";

export interface AnswerRecord {
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastAttempt: number;
  flagged: boolean;
}

export interface SessionRecord {
  date: number;
  mode: "topic" | "exam" | "weak" | "quick";
  pool: "standard" | "extended";
  totalQuestions: number;
  averageScore: number;
  timeSpent: number;
}

export interface Progress {
  answers: Record<string, AnswerRecord>;
  sessions: SessionRecord[];
}

const empty: Progress = { answers: {}, sessions: [] };

export function loadProgress(): Progress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return { answers: parsed.answers ?? {}, sessions: parsed.sessions ?? [] };
  } catch {
    return empty;
  }
}

function save(p: Progress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function recordAttempt(questionId: string, score: number) {
  const p = loadProgress();
  const prev = p.answers[questionId];
  p.answers[questionId] = {
    attempts: (prev?.attempts ?? 0) + 1,
    bestScore: Math.max(prev?.bestScore ?? 0, score),
    lastScore: score,
    lastAttempt: Date.now(),
    flagged: prev?.flagged ?? false,
  };
  save(p);
}

export function recordSession(s: SessionRecord) {
  const p = loadProgress();
  p.sessions.push(s);
  save(p);
}

export function toggleFlag(questionId: string) {
  const p = loadProgress();
  const prev = p.answers[questionId] ?? {
    attempts: 0, bestScore: 0, lastScore: 0, lastAttempt: 0, flagged: false,
  };
  p.answers[questionId] = { ...prev, flagged: !prev.flagged };
  save(p);
}
