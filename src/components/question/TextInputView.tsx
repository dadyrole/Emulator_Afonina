"use client";

import { useMemo, useState } from "react";
import type { TextInput } from "@/types/question";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { scoreTextInput } from "@/lib/scoring";
import { shuffle } from "@/lib/questions";
import { cn } from "@/lib/utils";

interface Props {
  question: TextInput;
  sessionSeed: string;
  onSubmit: (score: number) => void;
  revealed: boolean;
}

export default function TextInputView({ question, sessionSeed, onSubmit, revealed }: Props) {
  const [value, setValue] = useState("");
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackPick, setFallbackPick] = useState<string | null>(null);

  const fallbackOptions = useMemo(() => {
    if (!question.fallbackOptions) return [];
    return shuffle(question.fallbackOptions.options, question.id + sessionSeed);
  }, [question, sessionSeed]);

  return (
    <div className="space-y-4">
      {!useFallback ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={question.placeholder ?? "Введите ответ"}
          disabled={revealed}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Выбор варианта — максимум 50% балла
          </p>
          <RadioGroup
            value={fallbackPick ?? ""}
            onValueChange={(v) => !revealed && setFallbackPick(v)}
            className="space-y-2"
          >
            {fallbackOptions.map((opt) => {
              const isCorrect = opt.id === question.fallbackOptions?.correct;
              const isPicked = opt.id === fallbackPick;
              const cls = cn(
                "flex items-start gap-3 rounded-md border p-3",
                revealed && isCorrect && "border-green-500 bg-green-500/15",
                revealed && !isCorrect && isPicked && "border-red-500 bg-red-500/15",
              );
              return (
                <label key={opt.id} htmlFor={`${question.id}-fb-${opt.id}`} className={cls}>
                  <RadioGroupItem value={opt.id} id={`${question.id}-fb-${opt.id}`} disabled={revealed} />
                  <span className="text-sm leading-6">{opt.text}</span>
                </label>
              );
            })}
          </RadioGroup>
        </div>
      )}

      {!revealed && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              onSubmit(scoreTextInput(question, value, useFallback, fallbackPick ?? undefined))
            }
            disabled={useFallback ? !fallbackPick : !value.trim()}
          >
            Ответить
          </Button>
          {question.fallbackOptions && !useFallback && (
            <Button variant="outline" onClick={() => setUseFallback(true)}>
              Показать варианты (−50%)
            </Button>
          )}
        </div>
      )}

      {revealed && (
        <div className="text-sm">
          <span className="text-muted-foreground">Допустимые ответы: </span>
          <span className="font-medium">{question.acceptedAnswers.join(", ")}</span>
        </div>
      )}
    </div>
  );
}
