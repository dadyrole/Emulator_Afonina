import Link from "next/link";
import { BANK } from "@/lib/questions";

export default function QuestionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-10 space-y-4">
      <h1 className="text-2xl font-semibold">116 вопросов к зачёту</h1>
      <p className="text-sm text-muted-foreground">
        Полный список экзаменационных вопросов. Справа — id связанных
        тренировочных карточек, кликайте для открытия.
      </p>
      <div className="border rounded-md overflow-x-auto bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr className="border-b">
              <th className="text-left font-medium px-3 py-2 w-10">№</th>
              <th className="text-left font-medium px-3 py-2">Текст вопроса</th>
              <th className="text-left font-medium px-3 py-2 w-16">Раздел</th>
              <th className="text-left font-medium px-3 py-2">В тренажёре</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {BANK.sourceList.map((s) => (
              <tr key={s.number} className="hover:bg-muted/50">
                <td className="px-3 py-1.5 font-medium text-muted-foreground align-top tabular-nums">
                  {s.number}
                </td>
                <td className="px-3 py-1.5 align-top">{s.afoninText}</td>
                <td className="px-3 py-1.5 align-top text-muted-foreground tabular-nums">
                  [{s.section}]
                </td>
                <td className="px-3 py-1.5 align-top text-xs">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
