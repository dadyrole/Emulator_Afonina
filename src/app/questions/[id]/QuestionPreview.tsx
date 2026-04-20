"use client";

import { useMemo, useState } from "react";
import { getQuestionById } from "@/lib/questions";
import { recordAttempt } from "@/lib/progress";
import QuestionCard from "@/components/question/QuestionCard";
import { Button } from "@/components/ui/button";

export default function QuestionPreview({ id }: { id: string }) {
  const question = useMemo(() => getQuestionById(id), [id]);
  const [sessionSeed, setSessionSeed] = useState(() => `${Date.now()}`);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  if (!question) return <div>Вопрос не найден.</div>;

  const onAnswer = (s: number) => {
    setScore(s);
    setRevealed(true);
    recordAttempt(question.id, s);
  };

  const reset = () => {
    setSessionSeed(`${Date.now()}`);
    setRevealed(false);
    setScore(null);
  };

  return (
    <div className="space-y-4">
      <QuestionCard
        key={sessionSeed}
        question={question}
        sessionSeed={sessionSeed}
        onAnswer={onAnswer}
        revealed={revealed}
        score={score}
      />
      {revealed && <Button variant="outline" onClick={reset}>Ответить ещё раз</Button>}
    </div>
  );
}
