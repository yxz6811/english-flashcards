import { describe, expect, it } from "vitest";
import { normalizeWordList } from "@/lib/text-normalize";

describe("study flow utilities", () => {
  it("应去重并清洗词条", () => {
    const list = normalizeWordList([" defeat ", "Defeat", "review"]);
    expect(list).toEqual(["defeat", "review"]);
  });
});
