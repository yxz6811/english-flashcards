import type { VocabularyItem } from "@/types/domain";

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
