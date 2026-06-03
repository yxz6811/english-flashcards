import type { VocabularyItem } from "@/types/domain";

export type WordbookSortKey = "alpha" | "errors" | "progress";

/**
 * 获取学习中的生词列表。
 */
export function selectLearningWords(words: VocabularyItem[]): VocabularyItem[] {
  return words.filter((item) => item.status === "learning");
}

/**
 * 统计已掌握数量。
 */
export function selectMasteredCount(words: VocabularyItem[]): number {
  return words.filter((item) => item.status === "mastered").length;
}

/**
 * 按指定规则排序生词本。
 */
export function sortWordbookItems(items: VocabularyItem[], sortKey: WordbookSortKey): VocabularyItem[] {
  const copy = [...items];
  switch (sortKey) {
    case "errors":
      return copy.sort((a, b) => b.errorCount - a.errorCount || a.word.localeCompare(b.word));
    case "progress":
      return copy.sort(
        (a, b) => a.correctStreak - b.correctStreak || a.word.localeCompare(b.word)
      );
    case "alpha":
    default:
      return copy.sort((a, b) => a.word.localeCompare(b.word, "en"));
  }
}

/**
 * 掌握进度百分比（0–100）。
 */
export function wordbookProgressPercent(item: VocabularyItem): number {
  return Math.round((item.correctStreak / 2) * 100);
}
