import { describe, expect, it } from "vitest";
import { applyReviewRule } from "@/lib/review-rule";

const baseItem = {
  id: "1",
  word: "review",
  meaningZh: "复习",
  status: "learning" as const,
  correctStreak: 0 as const,
  errorCount: 0,
  updatedAt: Date.now(),
  version: 1,
};

describe("applyReviewRule", () => {
  it("认识后应增加 streak", () => {
    const next = applyReviewRule(baseItem, "known");
    expect(next.correctStreak).toBe(1);
  });

  it("不认识后应清零并累积错误", () => {
    const item = { ...baseItem, correctStreak: 1 as const };
    const next = applyReviewRule(item, "unknown");
    expect(next.correctStreak).toBe(0);
    expect(next.errorCount).toBe(1);
  });
});
