import { describe, expect, it } from "vitest";
import { sortWordbookItems, wordbookProgressPercent } from "@/lib/wordbook-selectors";
import type { VocabularyItem } from "@/types/domain";

function item(partial: Partial<VocabularyItem> & Pick<VocabularyItem, "word">): VocabularyItem {
  return {
    id: partial.id ?? partial.word,
    word: partial.word,
    meaningZh: partial.meaningZh ?? "释义",
    status: "learning",
    correctStreak: partial.correctStreak ?? 0,
    errorCount: partial.errorCount ?? 0,
    updatedAt: Date.now(),
    version: 1,
    ...partial,
  };
}

describe("wordbook-selectors", () => {
  it("应按字母排序", () => {
    const sorted = sortWordbookItems([item({ word: "zebra" }), item({ word: "apple" })], "alpha");
    expect(sorted.map((entry) => entry.word)).toEqual(["apple", "zebra"]);
  });

  it("应按错误次数降序", () => {
    const sorted = sortWordbookItems(
      [item({ word: "a", errorCount: 1 }), item({ word: "b", errorCount: 3 })],
      "errors"
    );
    expect(sorted[0].word).toBe("b");
  });

  it("应计算掌握进度百分比", () => {
    expect(wordbookProgressPercent(item({ word: "x", correctStreak: 1 }))).toBe(50);
    expect(wordbookProgressPercent(item({ word: "y", correctStreak: 2 }))).toBe(100);
  });
});
