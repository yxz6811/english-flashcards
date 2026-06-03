import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "英语闪卡复习",
  description: "拍照导入 + AI 制卡 + 生词强化的英语复习应用",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
