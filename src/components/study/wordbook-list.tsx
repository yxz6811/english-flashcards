"use client";

import type { VocabularyItem } from "@/types/domain";

interface WordbookListProps {
  items: VocabularyItem[];
}

/**
 * 生词本列表展示组件。
 */
export function WordbookList({ items }: WordbookListProps) {
  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-semibold">生词本</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-lg border border-stone-200 p-3">
            <div>
              <p className="font-medium">{item.word}</p>
              <p className="text-sm text-stone-600">{item.meaningZh}</p>
            </div>
            <span className="text-sm text-stone-700">{item.correctStreak}/2</span>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="text-sm text-stone-600">当前没有生词，继续保持！</p>}
    </section>
  );
}
