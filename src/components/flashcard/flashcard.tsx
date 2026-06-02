"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { VocabularyItem } from "@/types/domain";

interface FlashCardProps {
  item: VocabularyItem;
  onKnown: () => void;
  onUnknown: () => void;
}

/**
 * 闪卡组件：3D 翻面，反面文字保持正向可读。
 */
export function FlashCard({ item, onKnown, onUnknown }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  function toggleFlip(): void {
    setFlipped((prev) => !prev);
  }

  return (
    <section className="card space-y-4">
      <div className="perspective-[1200px]">
        <motion.button
          type="button"
          className="relative min-h-48 w-full cursor-pointer rounded-2xl border border-stone-200 bg-stone-50 p-6 text-left focus:outline-none focus:ring-2 focus:ring-amber-600"
          style={{ transformStyle: "preserve-3d" }}
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          aria-label="翻转卡片查看释义"
          onClick={toggleFlip}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              toggleFlip();
            }
          }}
        >
          {/* 正面 */}
          <div
            className="space-y-2"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <p className="text-xs text-stone-500">正面（点击翻面）</p>
            <h3 className="text-3xl font-bold">{item.word}</h3>
            <p className="text-lg text-stone-600">{item.phonetic ?? "/.../"}</p>
          </div>

          {/* 反面：预旋转 180°，父级翻转后文字正向显示 */}
          <div
            className="absolute inset-0 flex flex-col justify-center space-y-2 p-6"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <p className="text-xs text-stone-500">反面</p>
            <p className="text-xl font-semibold">{item.meaningZh}</p>
            <p className="text-sm text-stone-700">{item.exampleEn ?? "示例句加载中..."}</p>
            {item.exampleZh && <p className="text-sm text-stone-600">{item.exampleZh}</p>}
            {item.mnemonic && (
              <p className="text-sm text-amber-800">
                <span className="font-medium">助记：</span>
                {item.mnemonic}
              </p>
            )}
          </div>
        </motion.button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button className="btn-secondary" onClick={onUnknown} type="button">
          不认识
        </button>
        <button className="btn-primary" onClick={onKnown} type="button">
          认识
        </button>
      </div>
    </section>
  );
}
