import raw from "@/data/exam_answers.json";
import type { ExamAnswer } from "@/types/exam_answer";

export const EXAM_ANSWERS = raw as unknown as ExamAnswer[];

const BY_NUMBER = new Map<number, ExamAnswer>(
  EXAM_ANSWERS.map((a) => [a.number, a]),
);

export function getAnswer(number: number): ExamAnswer | undefined {
  return BY_NUMBER.get(number);
}
