import { describe, expect, it } from "vitest";
import { buildTodayActivity } from "@/lib/daily-activity";

describe("buildTodayActivity", () => {
  it("应统计已复习数量", () => {
    const activity = buildTodayActivity([
      {
        id: "1",
        word: "a",
        meaningZh: "a",
        status: "learning",
        correctStreak: 1,
        errorCount: 0,
        updatedAt: Date.now(),
        version: 1,
      },
      {
        id: "2",
        word: "b",
        meaningZh: "b",
        status: "learning",
        correctStreak: 0,
        errorCount: 2,
        updatedAt: Date.now(),
        version: 1,
      },
    ]);
    expect(activity.reviewedCount).toBe(2);
  });
});
