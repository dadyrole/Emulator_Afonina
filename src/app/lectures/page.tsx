"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LecturesPage() {
  const [status, setStatus] = useState<"checking" | "ok" | "missing">("checking");

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    fetch(`${base}/lectures.pdf`, { method: "HEAD" })
      .then((r) => setStatus(r.ok ? "ok" : "missing"))
      .catch(() => setStatus("missing"));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <h1 className="text-2xl font-semibold">Лекции</h1>
      <Card>
        <CardHeader>
          <CardTitle>PDF учебного пособия</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "checking" && (
            <p className="text-sm text-muted-foreground">Проверка доступности…</p>
          )}
          {status === "ok" && (
            <a href="/lectures.pdf" download className="underline text-foreground">
              Скачать PDF лекций (~7,6 МБ)
            </a>
          )}
          {status === "missing" && (
            <Alert>
              <AlertTitle>PDF недоступен в этой сборке</AlertTitle>
              <AlertDescription>
                Файл <code>/lectures.pdf</code> не закоммичен по лицензионным причинам.
                Попросите его у владельца проекта и положите в <code>public/lectures.pdf</code>
                при локальной сборке.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
