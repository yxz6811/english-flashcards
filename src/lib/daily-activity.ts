import type { VocabularyItem } from "@/types/domain";

export interface DailyActivity {
  date: string;
  reviewedCount: number;
  completedDailyGoal: boolean;
}

/**
 * 基于词条列表聚合简易当日活动数据。
 */
export function buildTodayActivity(words: VocabularyItem[]): DailyActivity {
  const reviewedCount = words.filter((item) => item.correctStreak > 0 || item.errorCount > 0).length;
  return {
    date: new Date().toISOString().slice(0, 10),
    reviewedCount,
    completedDailyGoal: reviewedCount >= 20,
  };
}
