import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Emulator_Afonina",
  description: "Подготовка к зачёту — 179 вопросов по 17 разделам.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`dark ${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-40">
          <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/" className="font-semibold tracking-tight text-foreground">
              Emulator_Afonina
            </Link>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <Link href="/topics" className="hover:text-foreground">Темы</Link>
              <Link href="/questions" className="hover:text-foreground">Вопросы</Link>
              <Link href="/stats" className="hover:text-foreground">Статистика</Link>
              <Link href="/lectures" className="hover:text-foreground">Лекции</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-card/40 text-xs text-muted-foreground">
          <div className="mx-auto max-w-5xl px-4 py-3">Emulator_Afonina</div>
        </footer>
      </body>
    </html>
  );
}
