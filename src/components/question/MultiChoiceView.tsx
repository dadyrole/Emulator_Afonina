"use client";

import { useMemo, useState } from "react";
import type { MultiChoice } from "@/types/question";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { shuffle } from "@/lib/questions";
import { scoreMultiChoice } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface Props {
  question: MultiChoice;
  sessionSeed: string;
  onSubmit: (score: number) => void;
  revealed: boolean;
}

export default function MultiChoiceView({ question, sessionSeed, onSubmit, revealed }: Props) {
  const options = useMemo(
    () => shuffle(question.options, question.id + sessionSeed),
    [question.id, question.options, sessionSeed],
  );
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    if (revealed) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {options.map((opt) => {
          const isCorrect = question.correct.includes(opt.id);
          const isPicked = picked.has(opt.id);
          const cls = cn(
            "flex items-start gap-3 rounded-md border p-3 cursor-pointer",
            revealed && isCorrect && "border-green-500 bg-green-500/15",
            revealed && isPicked && !isCorrect && "border-red-500 bg-red-500/15",
          );
          return (
            <label key={opt.id} className={cls}>
              <Checkbox
                checked={isPicked}
                onCheckedChange={() => toggle(opt.id)}
                disabled={revealed}
              />
              <span className="text-sm leading-6">{opt.text}</span>
            </label>
          );
        })}
      </div>
      {!revealed && (
        <Button
          onClick={() => onSubmit(scoreMultiChoice(question, [...picked]))}
          disabled={picked.size === 0}
        >
          Ответить
        </Button>
      )}
    </div>
  );
}
