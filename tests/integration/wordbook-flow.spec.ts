import { describe, expect, it } from "vitest";
import { applyReviewRule } from "@/lib/review-rule";

describe("wordbook flow", () => {
  it("应在连续答对两次后变为已掌握", () => {
    const base = {
      id: "1",
      word: "review",
      meaningZh: "复习",
      status: "learning" as const,
      correctStreak: 0 as const,
      errorCount: 0,
      updatedAt: Date.now(),
      version: 1,
    };
    const first = applyReviewRule(base, "known");
    const second = applyReviewRule(first, "known");
    expect(second.status).toBe("mastered");
    expect(second.correctStreak).toBe(2);
  });
});
