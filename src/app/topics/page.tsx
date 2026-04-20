"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BANK, SECTION_IDS, countBySection } from "@/lib/questions";
import { SECTIONS } from "@/types/question";
import { loadFilters, type FilterSettings } from "@/lib/filters";
import { loadProgress } from "@/lib/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function TopicsPage() {
  const [filters, setFilters] = useState<FilterSettings>({ pool: "standard", abbreviationsOnly: false });
  const [ready, setReady] = useState(false);
  const [best, setBest] = useState<Record<string, number>>({});

  useEffect(() => {
    setFilters(loadFilters());
    const p = loadProgress();
    const m: Record<string, number> = {};
    for (const [id, rec] of Object.entries(p.answers)) m[id] = rec.bestScore;
    setBest(m);
    setReady(true);
  }, []);

  if (!ready) return <div className="mx-auto max-w-5xl px-4 py-10 text-muted-foreground">Загрузка…</div>;

  const counts = countBySection(filters);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Разделы</h1>
        <div className="flex gap-2 text-sm">
          <Badge variant="secondary">Пул: {filters.pool}</Badge>
          {filters.abbreviationsOnly && <Badge>только аббревиатуры</Badge>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SECTION_IDS.map((id) => {
          const total = counts[id];
          const answeredIds = BANK.questions
            .filter((q) => q.section === id)
            .map((q) => q.id)
            .filter((qid) => best[qid] !== undefined);
          const avg = answeredIds.length
            ? Math.round(answeredIds.reduce((a, qid) => a + (best[qid] ?? 0), 0) / answeredIds.length)
            : 0;
          const pct = total ? Math.round((answeredIds.length / total) * 100) : 0;
          const disabled = total === 0;
          const card = (
            <Card className={disabled ? "opacity-50" : "hover:border-foreground transition-colors"}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    <Badge variant="outline" className="mr-2">[{id}]</Badge>
                    {SECTIONS[id]}
                  </span>
                  <span className="text-sm text-muted-foreground">{total}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Progress value={pct} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Пройдено: {answeredIds.length}/{total}</span>
                  <span>Лучший средний: {avg}%</span>
                </div>
              </CardContent>
            </Card>
          );
          return disabled ? (
            <div key={id}>{card}</div>
          ) : (
            <Link key={id} href={`/train/topic?section=${id}`}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
