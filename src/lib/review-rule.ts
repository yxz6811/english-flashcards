import type { ReviewResult, VocabularyItem } from "@/types/domain";

/**
 * 根据判定结果计算词条下一状态。
 */
export function applyReviewRule(
  item: VocabularyItem,
  result: ReviewResult
): VocabularyItem {
  if (result === "unknown") {
    return { ...item, status: "learning", correctStreak: 0, errorCount: item.errorCount + 1 };
  }

  const nextStreak = Math.min(2, item.correctStreak + 1) as 0 | 1 | 2;
  return {
    ...item,
    correctStreak: nextStreak,
    status: nextStreak === 2 ? "mastered" : "learning",
  };
}
