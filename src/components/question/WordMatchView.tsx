"use client";

import { useState } from "react";
import type { WordMatch } from "@/types/question";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { scoreWordMatch, type WordMatchResult } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface Props {
  question: WordMatch;
  onSubmit: (score: number) => void;
  revealed: boolean;
}

export default function WordMatchView({ question, onSubmit, revealed }: Props) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<WordMatchResult | null>(null);

  const submit = () => {
    const r = scoreWordMatch(value, question);
    setResult(r);
    onSubmit(r.score);
  };

  return (
    <div className="space-y-4">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={question.placeholder ?? "Введите расшифровку"}
        disabled={revealed}
      />
      {!revealed && (
        <Button onClick={submit} disabled={!value.trim()}>
          Проверить
        </Button>
      )}
      {revealed && result && (
        <div className="space-y-2">
          <p className="text-sm">
            Балл: <span className="font-semibold">{result.score}%</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Правильный ответ: </span>
            <span>
              {result.highlighted.map((h, i) => (
                <span
                  key={i}
                  className={cn(
                    h.matched ? "text-green-400 font-semibold" : "text-muted-foreground",
                  )}
                >
                  {h.text}
                </span>
              ))}
            </span>
          </p>
          {question.allowRussian && question.russianAnswer && (
            <p className="text-xs text-muted-foreground">
              Русский эквивалент: {question.russianAnswer}
            </p>
          )}
          {result.missingKeywords.length > 0 && (
            <Alert>
              <AlertDescription>
                Пропущено ключевое слово:{" "}
                <span className="font-semibold">
                  {result.missingKeywords.join(", ")}
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
