"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { VocabularyItem } from "@/types/domain";

interface FlashCardProps {
  item: VocabularyItem;
  onKnown: () => void;
  onUnknown: () => void;
}

/**
 * 闪卡组件，支持翻面与认识判定。
 */
export function FlashCard({ item, onKnown, onUnknown }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <section className="card space-y-4">
      <motion.div
        className="min-h-48 cursor-pointer rounded-2xl border border-stone-200 bg-stone-50 p-6 focus:outline-none focus:ring-2 focus:ring-amber-600"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.25 }}
        role="button"
        tabIndex={0}
        aria-label="翻转卡片查看释义"
        onClick={() => setFlipped((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            setFlipped((prev) => !prev);
          }
        }}
      >
        {!flipped ? (
          <div className="space-y-2">
            <p className="text-xs text-stone-500">正面（点击翻面）</p>
            <h3 className="text-3xl font-bold">{item.word}</h3>
            <p className="text-lg text-stone-600">{item.phonetic ?? "/.../"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-stone-500">反面</p>
            <p className="text-xl font-semibold">{item.meaningZh}</p>
            <p className="text-sm text-stone-700">{item.exampleEn ?? "示例句加载中..."}</p>
          </div>
        )}
      </motion.div>
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
