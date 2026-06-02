import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FlashCard } from "@/components/flashcard/flashcard";

describe("FlashCard", () => {
  it("应渲染单词正面内容", () => {
    render(
      <FlashCard
        item={{
          id: "1",
          word: "defeat",
          meaningZh: "击败",
          status: "learning",
          correctStreak: 0,
          errorCount: 0,
          updatedAt: Date.now(),
          version: 1,
        }}
        onKnown={() => undefined}
        onUnknown={() => undefined}
      />
    );
    expect(screen.getByText("defeat")).toBeTruthy();
  });
});
