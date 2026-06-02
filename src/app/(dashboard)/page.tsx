"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImportPreview } from "@/components/study/import-preview";
import { Heatmap } from "@/components/dashboard/heatmap";
import { useStudyStore } from "@/store/useStudyStore";
import { useUserStore } from "@/store/useUserStore";

const mockDays = Array.from({ length: 28 }, (_, index) => ({
  date: `2026-06-${String(index + 1).padStart(2, "0")}`,
  reviewedCount: (index * 3) % 18,
}));

export default function DashboardPage() {
  const router = useRouter();
  const importWords = useStudyStore((state) => state.importWords);
  const tags = useUserStore((state) => state.preferences.interestTags);

  /**
   * 生成词书成功后跳转学习页。
   */
  async function handleImport(words: string[]): Promise<void> {
    await importWords(words, tags);
    router.push("/study");
  }

  return (
    <div className="space-y-6">
      <header className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">英语闪卡复习</h1>
          <p className="text-stone-600">拍照导入、智能学习、生词强化</p>
        </div>
        <nav className="flex gap-2">
          <Link className="btn-secondary" href="/study">
            去学习
          </Link>
          <Link className="btn-secondary" href="/words">
            生词本
          </Link>
          <Link className="btn-secondary" href="/settings">
            设置
          </Link>
        </nav>
      </header>
      <ImportPreview onConfirm={handleImport} />
      <Heatmap days={mockDays} />
    </div>
  );
}
