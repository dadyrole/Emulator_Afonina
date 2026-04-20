"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Question, SectionId } from "@/types/question";
import { filterQuestions, shuffle } from "@/lib/questions";
import { loadFilters } from "@/lib/filters";
import { loadProgress, recordAttempt, recordSession } from "@/lib/progress";
import QuestionCard from "@/components/question/QuestionCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Mode = "topic" | "quick" | "exam" | "weak";

const MODE_LABELS: Record<Mode, string> = {
  topic: "По темам",
  quick: "Быстрое повторение",
  exam: "Экзамен",
  weak: "Слабые места",
};

const EXAM_SECONDS = 25 * 60;
const EXAM_SIZE = 20;
const WEAK_SIZE = 20;

export default function TrainingRunner({ mode }: { mode: Mode }) {
  const sp = useSearchParams();
  const sectionParam = sp.get("section") as SectionId | null;

  const [ready, setReady] = useState(false);
  const [sessionSeed] = useState(() => `${Date.now()}-${Math.random()}`);
  const [startedAt] = useState(() => Date.now());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pool, setPool] = useState<"standard" | "extended">("standard");
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [remaining, setRemaining] = useState(EXAM_SECONDS);
  const deferredReveal = mode === "exam";

  useEffect(() => {
    const filters = loadFilters();
    setPool(filters.pool);
    let list = filterQuestions({
      ...filters,
      section: mode === "topic" && sectionParam ? sectionParam : undefined,
    });

    if (mode === "weak") {
      const progress = loadProgress();
      list = [...list].sort((a, b) => {
        const pa = progress.answers[a.id];
        const pb = progress.answers[b.id];
        if (!pa && !pb) return Math.random() - 0.5;
        if (!pa) return -1;
        if (!pb) return 1;
        return pa.bestScore - pb.bestScore;
      }).slice(0, WEAK_SIZE);
    } else if (mode === "exam") {
      list = shuffle(list, sessionSeed).slice(0, EXAM_SIZE);
    } else {
      list = shuffle(list, sessionSeed);
    }

    setQuestions(list);
    setReady(true);
  }, [mode, sectionParam, sessionSeed]);

  const finish = useCallback(() => {
    setFinished(true);
    setScores((current) => {
      const values = Object.values(current);
      const avg = values.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;
      recordSession({
        date: Date.now(),
        mode,
        pool,
        totalQuestions: questions.length,
        averageScore: avg,
        timeSpent: Math.round((Date.now() - startedAt) / 1000),
      });
      return current;
    });
  }, [mode, pool, questions.length, startedAt]);

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (mode !== "exam" || !ready || finished) return;
    const tick = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(tick);
          finishRef.current();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [mode, ready, finished]);

  const current = questions[idx];

  const onAnswer = (score: number) => {
    if (!current) return;
    setScores((s) => ({ ...s, [current.id]: score }));
    recordAttempt(current.id, score);
    if (deferredReveal) {
      if (idx + 1 >= questions.length) {
        finish();
      } else {
        setIdx((i) => i + 1);
      }
    } else {
      setRevealed(true);
    }
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      finish();
      return;
    }
    setIdx((i) => i + 1);
    setRevealed(false);
  };

  const avg = useMemo(() => {
    const v = Object.values(scores);
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
  }, [scores]);

  if (!ready) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Загрузка…</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
        <h1 className="text-2xl font-semibold">{MODE_LABELS[mode]}</h1>
        <p className="text-muted-foreground">
          Нет вопросов под текущие настройки
          {mode === "topic" && sectionParam && ` (раздел ${sectionParam})`}
          {mode === "weak" && " — сначала пройдите хотя бы одну тренировку."}
          .
        </p>
        <Link href="/" className="underline">← Вернуться</Link>
      </div>
    );
  }

  if (finished) {
    const total = questions.length;
    const perfect = Object.values(scores).filter((s) => s === 100).length;
    const spent = Math.round((Date.now() - startedAt) / 1000);
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <h1 className="text-2xl font-semibold">Результат — {MODE_LABELS[mode]}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Средний балл: {avg}%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Всего вопросов: {total}</p>
            <p>Идеально (100%): {perfect}</p>
            <p>Пул: {pool}</p>
            <p>Время: {formatTime(spent)}</p>
            {mode === "exam" && remaining === 0 && (
              <p className="text-red-400">Время истекло — сессия закрыта автоматически.</p>
            )}
          </CardContent>
        </Card>

        {deferredReveal && (
          <Card>
            <CardHeader>
              <CardTitle>Разбор по вопросам</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {questions.map((q, i) => {
                  const s = scores[q.id] ?? 0;
                  const ok = s === 100;
                  return (
                    <li key={q.id} className="flex gap-3 border-b pb-2">
                      <span className="w-6 text-muted-foreground tabular-nums">{i + 1}.</span>
                      <span className={ok ? "text-green-400 w-12" : "text-red-400 w-12"}>
                        {s}%
                      </span>
                      <span className="flex-1">
                        <Link href={`/questions/${q.id}`} className="hover:underline">
                          {q.prompt}
                        </Link>
                        <span className="text-xs text-muted-foreground ml-2">[{q.section}]</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-2">
          <Link href="/"><Button>На главную</Button></Link>
          <Link href={`/train/${mode}${sectionParam ? `?section=${sectionParam}` : ""}`}>
            <Button variant="outline">Ещё раз</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Выход</Link>
          <Badge variant="outline">{MODE_LABELS[mode]}</Badge>
          {sectionParam && <Badge variant="secondary">Раздел {sectionParam}</Badge>}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-3">
          {mode === "exam" && (
            <span
              className={`font-mono tabular-nums ${remaining < 60 ? "text-red-400 font-semibold" : ""}`}
            >
              {formatTime(remaining)}
            </span>
          )}
          <span>{idx + 1} / {questions.length}</span>
          {!deferredReveal && <span>· средний {avg}%</span>}
        </div>
      </div>
      <Progress value={((idx + (revealed ? 1 : 0)) / questions.length) * 100} />

      <QuestionCard
        key={current.id}
        question={current}
        sessionSeed={sessionSeed}
        onAnswer={onAnswer}
        revealed={revealed}
        score={scores[current.id] ?? null}
      />

      {revealed && !deferredReveal && (
        <div className="flex justify-end">
          <Button onClick={next}>
            {idx + 1 >= questions.length ? "Завершить" : "Следующий →"}
          </Button>
        </div>
      )}

      {deferredReveal && (
        <p className="text-xs text-muted-foreground">
          Экзаменационный режим: ответы сохраняются без немедленного разбора.
          Итоги — в конце сессии или по истечении времени.
        </p>
      )}
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
