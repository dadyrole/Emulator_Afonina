"use client";

import { useState } from "react";
import type { FormatCheck } from "@/types/question";
import { Button } from "@/components/ui/button";
import { scoreFormatCheck } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface Props {
  question: FormatCheck;
  onSubmit: (score: number) => void;
  revealed: boolean;
}

export default function FormatCheckView({ question, onSubmit, revealed }: Props) {
  const [clicked, setClicked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    if (revealed) return;
    setClicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 p-4 rounded-md border bg-muted/50 font-mono text-sm leading-7">
        {question.tokens.map((tok) => {
          const isPicked = clicked.has(tok.id);
          const isError = tok.isError;
          const base = "px-1 rounded cursor-pointer border";
          const state = revealed
            ? isError
              ? isPicked
                ? "bg-green-100 border-green-500"
                : "bg-yellow-500/25 border-yellow-500"
              : isPicked
                ? "bg-red-100 border-red-500"
                : "border-transparent"
            : isPicked
              ? "bg-blue-500/25 border-blue-500"
              : "border-transparent hover:border-muted-foreground";
          return (
            <span
              key={tok.id}
              title={revealed && tok.isError ? tok.errorReason : undefined}
              className={cn(base, state)}
              onClick={() => toggle(tok.id)}
            >
              {tok.text}
            </span>
          );
        })}
      </div>
      {!revealed && (
        <Button onClick={() => onSubmit(scoreFormatCheck(question, clicked))}>
          Проверить
        </Button>
      )}
    </div>
  );
}
