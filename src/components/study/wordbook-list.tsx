"use client";

import { useMemo, useState } from "react";
import {
  sortWordbookItems,
  wordbookProgressPercent,
  type WordbookSortKey,
} from "@/lib/wordbook-selectors";
import type { VocabularyItem } from "@/types/domain";

interface WordbookListProps {
  items: VocabularyItem[];
}

const SORT_OPTIONS: { key: WordbookSortKey; label: string }[] = [
  { key: "alpha", label: "按字母" },
  { key: "errors", label: "按错误次数" },
  { key: "progress", label: "按掌握进度" },
];

/**
 * 生词本列表：排序与 0/2 进度条。
 */
export function WordbookList({ items }: WordbookListProps) {
  const [sortKey, setSortKey] = useState<WordbookSortKey>("alpha");
  const sorted = useMemo(() => sortWordbookItems(items, sortKey), [items, sortKey]);

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">生词本</h2>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={
                sortKey === option.key
                  ? "btn-primary text-xs"
                  : "btn-secondary text-xs"
              }
              onClick={() => setSortKey(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="space-y-3">
        {sorted.map((item) => {
          const percent = wordbookProgressPercent(item);
          return (
            <li
              key={item.id}
              className="rounded-lg border border-stone-200 p-3 dark:border-stone-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.word}</p>
                  <p className="text-sm text-stone-600 dark:text-stone-400">{item.meaningZh}</p>
                </div>
                <span className="shrink-0 text-sm font-medium text-stone-700 dark:text-stone-300">
                  {item.correctStreak}/2
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                  role="progressbar"
                  aria-valuenow={item.correctStreak}
                  aria-valuemin={0}
                  aria-valuemax={2}
                  aria-label={`${item.word} 掌握进度`}
                />
              </div>
              {item.errorCount > 0 && (
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  累计答错 {item.errorCount} 次
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {items.length === 0 && (
        <p className="text-sm text-stone-600 dark:text-stone-400">当前没有生词，继续保持！</p>
      )}
    </section>
  );
}
