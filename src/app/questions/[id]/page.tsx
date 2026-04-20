import { notFound } from "next/navigation";
import Link from "next/link";
import { BANK } from "@/lib/questions";
import QuestionPreview from "./QuestionPreview";

export function generateStaticParams() {
  return BANK.questions.map((q) => ({ id: q.id }));
}

export default async function QuestionDetailPage({ params }: PageProps<"/questions/[id]">) {
  const { id } = await params;
  const q = BANK.questions.find((x) => x.id === id);
  if (!q) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <Link href="/questions" className="text-sm text-muted-foreground hover:text-foreground">
        ← К списку 116 вопросов
      </Link>
      <QuestionPreview id={id} />
    </div>
  );
}
