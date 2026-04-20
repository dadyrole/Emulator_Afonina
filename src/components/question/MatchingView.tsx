"use client";

import { useMemo, useState } from "react";
import type { Matching } from "@/types/question";
import { Button } from "@/components/ui/button";
import { shuffle } from "@/lib/questions";
import { scoreMatching } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface Props {
  question: Matching;
  sessionSeed: string;
  onSubmit: (score: number) => void;
  revealed: boolean;
}

export default function MatchingView({ question, sessionSeed, onSubmit, revealed }: Props) {
  const rightChoices = useMemo(
    () => shuffle(question.pairs, question.id + sessionSeed),
    [question.id, question.pairs, sessionSeed],
  );
  const [picks, setPicks] = useState<Record<string, string>>({});

  const complete = question.pairs.every((p) => picks[p.id]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-3 items-center text-sm">
        <span />
        <span className="font-medium text-foreground">{question.leftLabel}</span>
        <span className="font-medium text-foreground">{question.rightLabel}</span>
        {question.pairs.map((pair) => {
          const pick = picks[pair.id];
          const correct = pick === pair.id;
          return (
            <div key={pair.id} className="contents">
              <span className="text-muted-foreground text-xs">→</span>
              <span className="py-2">{pair.left}</span>
              <select
                className={cn(
                  "border rounded px-2 py-1 bg-card text-sm",
                  revealed && correct && "border-green-500 bg-green-500/15",
                  revealed && !correct && "border-red-500 bg-red-500/15",
                )}
                value={pick ?? ""}
                disabled={revealed}
                onChange={(e) =>
                  setPicks((prev) => ({ ...prev, [pair.id]: e.target.value }))
                }
              >
                <option value="">—</option>
                {rightChoices.map((c) => (
                  <option key={c.id} value={c.id}>{c.right}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      {!revealed && (
        <Button onClick={() => onSubmit(scoreMatching(question, picks))} disabled={!complete}>
          Ответить
        </Button>
      )}
    </div>
  );
}
