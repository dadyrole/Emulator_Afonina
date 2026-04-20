import { Suspense } from "react";
import TrainingRunner from "./TrainingRunner";

export function generateStaticParams() {
  return [
    { mode: "topic" },
    { mode: "quick" },
    { mode: "exam" },
    { mode: "weak" },
  ];
}

export default async function TrainPage({ params }: PageProps<"/train/[mode]">) {
  const { mode } = await params;
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Загрузка…</div>}>
      <TrainingRunner mode={mode as "topic" | "quick" | "exam" | "weak"} />
    </Suspense>
  );
}
