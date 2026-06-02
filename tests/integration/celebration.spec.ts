import { describe, expect, it } from "vitest";
import { applyReviewRule } from "@/lib/review-rule";

describe("celebration trigger", () => {
  it("达到 2/2 时应进入 mastered 状态", () => {
    const base = {
      id: "1",
      word: "victory",
      meaningZh: "胜利",
      status: "learning" as const,
      correctStreak: 1 as const,
      errorCount: 0,
      updatedAt: Date.now(),
      version: 1,
    };
    const next = applyReviewRule(base, "known");
    expect(next.status).toBe("mastered");
  });
});
