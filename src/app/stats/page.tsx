"use client";

import { useEffect, useState } from "react";
import { loadProgress, type Progress as P } from "@/lib/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BANK } from "@/lib/questions";

export default function StatsPage() {
  const [data, setData] = useState<P | null>(null);

  useEffect(() => {
    setData(loadProgress());
  }, []);

  if (!data) return <div className="mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Загрузка…</div>;

  const answeredIds = Object.keys(data.answers);
  const perfect = Object.values(data.answers).filter((a) => a.bestScore === 100).length;
  const avg = answeredIds.length
    ? Math.round(
        Object.values(data.answers).reduce((a, b) => a + b.bestScore, 0) / answeredIds.length,
      )
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <h1 className="text-2xl font-semibold">Статистика</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard title="Отвечено" value={`${answeredIds.length}/${BANK.questions.length}`} />
        <StatCard title="Средний лучший" value={`${avg}%`} />
        <StatCard title="На 100%" value={`${perfect}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние сессии</CardTitle>
        </CardHeader>
        <CardContent>
          {data.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Сессий пока нет.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.sessions.slice(-10).reverse().map((s, i) => (
                <li key={i} className="flex justify-between border-b pb-2">
                  <span>
                    {new Date(s.date).toLocaleString()} — {s.mode} ({s.pool})
                  </span>
                  <span>
                    {s.averageScore}% · {s.totalQuestions} вопр · {s.timeSpent}с
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent><div className="text-2xl font-semibold">{value}</div></CardContent>
    </Card>
  );
}
