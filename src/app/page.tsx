"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BANK, filterQuestions } from "@/lib/questions";
import { loadFilters, saveFilters, type FilterSettings } from "@/lib/filters";

export default function HomePage() {
  const [filters, setFilters] = useState<FilterSettings>({ pool: "standard", abbreviationsOnly: false });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFilters(loadFilters());
    setLoaded(true);
  }, []);

  const update = (patch: Partial<FilterSettings>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      if (next.abbreviationsOnly) next.pool = "extended";
      saveFilters(next);
      return next;
    });
  };

  const pool = filters.pool;
  const totalAvailable = loaded ? filterQuestions(filters).length : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <section>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Emulator_Afonina</h1>
        <p className="mt-2 text-muted-foreground">
          {BANK.questions.length} вопросов в банке: {BANK.sourceList.length} основных
          и {BANK.questions.length - BANK.sourceList.length} расширенных по 17 разделам.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Настройки сессии</CardTitle>
          <CardDescription>Выбор пула вопросов. Сохраняется автоматически.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="pool" className="text-base">Расширенный пул</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Standard — 116 основных вопросов к зачёту. Extended добавляет
                прикладные задачи, matching, аббревиатуры и ввод текста.
              </p>
            </div>
            <Switch
              id="pool"
              checked={pool === "extended"}
              disabled={filters.abbreviationsOnly}
              onCheckedChange={(v) => update({ pool: v ? "extended" : "standard" })}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="abbr" className="text-base">Только аббревиатуры</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Тренировка 35 аббревиатур (SSB, EPIRB, FEC…) в режиме свободного ввода
                с подсветкой совпавших слов. Автоматически включает расширенный пул.
              </p>
            </div>
            <Switch
              id="abbr"
              checked={filters.abbreviationsOnly}
              onCheckedChange={(v) => update({ abbreviationsOnly: v })}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Badge variant="secondary">Пул: {pool === "extended" ? "Extended" : "Standard"}</Badge>
            {filters.abbreviationsOnly && <Badge>Только word_match</Badge>}
            <Badge variant="outline">Доступно: {totalAvailable}</Badge>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2">
        <ModeCard
          href="/topics"
          title="По темам"
          description="17 разделов. Выберите раздел и отвечайте на вопросы из него."
        />
        <ModeCard
          href="/train/quick"
          title="Быстрое повторение"
          description="Все доступные вопросы подряд с мгновенным разбором."
        />
        <ModeCard
          href="/train/exam"
          title="Экзамен"
          description="20 случайных вопросов, таймер 25 минут, разбор в конце."
        />
        <ModeCard
          href="/train/weak"
          title="Слабые места"
          description="До 20 вопросов с худшим лучшим баллом; невиданные приоритетнее."
        />
      </section>

      <section className="flex flex-wrap gap-3 text-sm">
        <Link href="/questions" className="underline text-foreground hover:text-foreground">
          Список 116 вопросов к зачёту →
        </Link>
        <Link href="/lectures" className="underline text-foreground hover:text-foreground">
          Скачать PDF лекций →
        </Link>
      </section>
    </div>
  );
}

function ModeCard({
  href,
  title,
  description,
  soon,
}: {
  href: string;
  title: string;
  description: string;
  soon?: boolean;
}) {
  const inner = (
    <Card className={soon ? "opacity-60" : "hover:border-foreground transition-colors"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {soon && <Badge variant="outline">скоро</Badge>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
  if (soon) return <div>{inner}</div>;
  return <Link href={href}>{inner}</Link>;
}
