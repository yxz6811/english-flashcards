"use client";

import Link from "next/link";
import { WordbookList } from "@/components/study/wordbook-list";
import { useStudyStore } from "@/store/useStudyStore";

export default function WordsPage() {
  const words = useStudyStore((state) => state.words);
  const learningWords = words.filter((item) => item.status === "learning");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">生词本</h1>
        <Link href="/" className="btn-secondary">
          返回首页
        </Link>
      </header>
      <WordbookList items={learningWords} />
    </div>
  );
}
