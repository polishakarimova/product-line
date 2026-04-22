import type { Metadata } from "next";
import "./globals.css";
import { Stepper } from "@/components/Stepper";
import { ThemePill } from "@/components/ThemePill";

export const metadata: Metadata = {
  title: "Товарная линейка · Конструктор",
  description: "Построй годовую товарную линейку за 6 шагов — цели, продукты, тарифы, сборка, план реализации",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <div className="app-shell">
          <ThemePill />
          <Stepper />
          <main style={{ flex: 1 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
