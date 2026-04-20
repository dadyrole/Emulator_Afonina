import Link from "next/link";
import { BANK } from "@/lib/questions";
import { getAnswer } from "@/lib/answers";
import type { AnswerBlock } from "@/types/exam_answer";

export default function QuestionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-10 space-y-4">
      <h1 className="text-2xl font-semibold">116 вопросов к зачёту</h1>
      <p className="text-sm text-muted-foreground">
        Нажмите на строку, чтобы открыть ответ. Справа — id связанных
        тренировочных карточек.
      </p>

      <div className="border rounded-md bg-card divide-y">
        {BANK.sourceList.map((s) => {
          const answer = getAnswer(s.number);
          return (
            <details key={s.number} className="group">
              <summary
                className="list-none cursor-pointer px-3 py-2 hover:bg-muted/50
                           grid grid-cols-[1.75rem_1fr_auto] items-start gap-x-3 gap-y-1
                           text-sm [&::-webkit-details-marker]:hidden"
              >
                <span className="font-medium text-muted-foreground tabular-nums pt-0.5">
                  {s.number}
                </span>
                <span>{s.afoninText}</span>
                <span className="flex items-center gap-2 pt-0.5 text-muted-foreground text-xs tabular-nums shrink-0">
                  [{s.section}]
                  <Chevron />
                </span>
              </summary>

              <div className="px-3 pb-4 pt-2 border-t bg-muted/20 space-y-3 text-sm">
                {answer ? (
                  answer.blocks.map((b, i) => <AnswerBlockView key={i} block={b} />)
                ) : (
                  <p className="text-muted-foreground italic">
                    Ответ ещё не готов.
                  </p>
                )}

                {s.trainerQuestions.length > 0 && (
                  <div className="pt-2 border-t text-xs">
                    <span className="text-muted-foreground mr-2">В тренажёре:</span>
                    {s.trainerQuestions.map((id, i) => (
                      <span key={id}>
                        <Link
                          href={`/questions/${id}`}
                          className="font-mono text-muted-foreground hover:text-foreground hover:underline"
                        >
                          {id}
                        </Link>
                        {i < s.trainerQuestions.length - 1 && (
                          <span className="text-muted-foreground">, </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function AnswerBlockView({ block }: { block: AnswerBlock }) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-muted-foreground">{block.section}</span>
        {block.isParaphrase && (
          <span className="text-amber-400/90 border border-amber-400/40 rounded px-1.5 py-0.5">
            пересказ
          </span>
        )}
        {block.isLectureGap && (
          <span className="text-rose-400 border border-rose-400/40 rounded px-1.5 py-0.5">
            нет в лекциях
          </span>
        )}
      </div>
      <p className="whitespace-pre-wrap leading-6">{block.text}</p>
      {block.isLectureGap && block.gapNote && (
        <p className="text-xs text-muted-foreground italic">{block.gapNote}</p>
      )}
    </div>
  );
}

function Chevron() {
  return (
    <svg
      className="size-4 transition-transform group-open:rotate-180 text-muted-foreground"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" />
    </svg>
  );
}
