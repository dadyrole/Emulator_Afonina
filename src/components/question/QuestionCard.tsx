"use client";

import type { Question } from "@/types/question";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SingleChoiceView from "./SingleChoiceView";
import MultiChoiceView from "./MultiChoiceView";
import TextInputView from "./TextInputView";
import WordMatchView from "./WordMatchView";
import MatchingView from "./MatchingView";
import FormatCheckView from "./FormatCheckView";

interface Props {
  question: Question;
  sessionSeed: string;
  onAnswer: (score: number) => void;
  revealed: boolean;
  score: number | null;
}

export default function QuestionCard({ question, sessionSeed, onAnswer, revealed, score }: Props) {
  const sourceTag =
    question.sourceQuestions.length > 0
      ? `Вопрос №${question.sourceQuestions.join(", ")} к зачёту`
      : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline">[{question.section}]</Badge>
          {sourceTag && <Badge variant="secondary">{sourceTag}</Badge>}
          <Badge variant="outline">{question.pool}</Badge>
          <Badge variant="outline">{question.difficulty}</Badge>
          <Badge variant="outline">{question.type}</Badge>
        </div>
        <h2 className="text-lg font-medium mt-2">{question.prompt}</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderBody(question, sessionSeed, onAnswer, revealed)}

        {revealed && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Балл: </span>
                <span className="font-semibold">{score ?? 0}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Разбор: </span>
                <span>{question.explanation}</span>
              </div>
              {question.lectureRef && (
                <div>
                  <span className="text-muted-foreground">Лекции: </span>
                  <span>{question.lectureRef}</span>
                </div>
              )}
              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {question.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function renderBody(
  q: Question,
  seed: string,
  onAnswer: (score: number) => void,
  revealed: boolean,
) {
  switch (q.type) {
    case "single_choice":
      return <SingleChoiceView question={q} sessionSeed={seed} onSubmit={onAnswer} revealed={revealed} />;
    case "multi_choice":
      return <MultiChoiceView question={q} sessionSeed={seed} onSubmit={onAnswer} revealed={revealed} />;
    case "text_input":
      return <TextInputView question={q} sessionSeed={seed} onSubmit={onAnswer} revealed={revealed} />;
    case "word_match":
      return <WordMatchView question={q} onSubmit={onAnswer} revealed={revealed} />;
    case "matching":
      return <MatchingView question={q} sessionSeed={seed} onSubmit={onAnswer} revealed={revealed} />;
    case "format_check":
      return <FormatCheckView question={q} onSubmit={onAnswer} revealed={revealed} />;
  }
}
