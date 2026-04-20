"use client";

import { useMemo, useState } from "react";
import type { SingleChoice } from "@/types/question";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { shuffle } from "@/lib/questions";
import { scoreSingleChoice } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface Props {
  question: SingleChoice;
  sessionSeed: string;
  onSubmit: (score: number) => void;
  revealed: boolean;
}

export default function SingleChoiceView({ question, sessionSeed, onSubmit, revealed }: Props) {
  const options = useMemo(
    () => shuffle(question.options, question.id + sessionSeed),
    [question.id, question.options, sessionSeed],
  );
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <RadioGroup
        value={picked ?? ""}
        onValueChange={(v) => !revealed && setPicked(v)}
        className="space-y-2"
      >
        {options.map((opt) => {
          const isCorrect = opt.id === question.correct;
          const isPicked = opt.id === picked;
          const cls = cn(
            "flex items-start gap-3 rounded-md border p-3",
            revealed && isCorrect && "border-green-500 bg-green-500/15",
            revealed && !isCorrect && isPicked && "border-red-500 bg-red-500/15",
          );
          return (
            <label key={opt.id} htmlFor={`${question.id}-${opt.id}`} className={cls}>
              <RadioGroupItem value={opt.id} id={`${question.id}-${opt.id}`} disabled={revealed} />
              <span className="text-sm leading-6">{opt.text}</span>
            </label>
          );
        })}
      </RadioGroup>
      {!revealed && (
        <Button
          onClick={() => onSubmit(scoreSingleChoice(question, picked))}
          disabled={!picked}
        >
          Ответить
        </Button>
      )}
    </div>
  );
}
