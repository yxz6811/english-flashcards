"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MnemonicPanel } from "@/components/flashcard/mnemonic-panel";
import { SwipeZone } from "@/components/flashcard/swipe-zone";
import { speak } from "@/lib/tts";
import type { UserPreferences, VocabularyItem } from "@/types/domain";

interface FlashCardProps {
  item: VocabularyItem;
  onKnown: () => void;
  onUnknown: () => void;
  flipped?: boolean;
  onFlipToggle?: () => void;
  speechRate?: UserPreferences["speechRate"];
  autoSpeak?: boolean;
}

/**
 * 闪卡组件：3D 翻面、TTS、Tinder 滑动判定。
 */
export function FlashCard({
  item,
  onKnown,
  onUnknown,
  flipped: flippedProp,
  onFlipToggle,
  speechRate = 1,
  autoSpeak = true,
}: FlashCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const flipped = flippedProp ?? internalFlipped;

  function toggleFlip(): void {
    if (onFlipToggle) {
      onFlipToggle();
      return;
    }
    setInternalFlipped((prev) => !prev);
  }

  function handleSpeak(): void {
    speak(item.word, speechRate);
  }

  useEffect(() => {
    if (!autoSpeak) return;
    speak(item.word, speechRate);
  }, [item.id, item.word, speechRate, autoSpeak]);

  useEffect(() => {
    if (flippedProp === undefined) {
      setInternalFlipped(false);
    }
  }, [item.id, flippedProp]);

  return (
    <section className="card space-y-4">
      <p className="text-center text-xs text-stone-500 dark:text-stone-400">
        左滑不认识 · 右滑认识 · 点击翻面
      </p>
      <SwipeZone
        resetKey={item.id}
        onSwipeLeft={onUnknown}
        onSwipeRight={onKnown}
      >
        <div className="perspective-[1200px]">
          <motion.div
            role="button"
            tabIndex={0}
            className="relative min-h-48 w-full cursor-pointer rounded-2xl border border-stone-200 bg-stone-50 p-6 text-left focus:outline-none focus:ring-2 focus:ring-amber-600 dark:border-stone-600 dark:bg-stone-800 dark:focus:ring-amber-500"
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
            <div
              className="space-y-2"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <p className="text-xs text-stone-500 dark:text-stone-400">正面</p>
              <h3 className="text-3xl font-bold text-stone-900 dark:text-stone-50">{item.word}</h3>
              <p className="text-lg text-stone-600 dark:text-stone-300">{item.phonetic ?? "/.../"}</p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100 dark:border-stone-500 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600"
                aria-label={`朗读 ${item.word}`}
                onClick={(event) => {
                  event.stopPropagation();
                  handleSpeak();
                }}
              >
                🔊 发音 ({speechRate}x)
              </button>
            </div>

            <div
              className="absolute inset-0 flex flex-col justify-center gap-2 overflow-y-auto p-6"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <p className="text-xs text-stone-500 dark:text-stone-400">反面</p>
              <p className="text-xl font-semibold text-stone-900 dark:text-stone-50">{item.meaningZh}</p>
              <p className="text-sm text-stone-700 dark:text-stone-300">{item.exampleEn ?? "示例句加载中..."}</p>
              {item.exampleZh && (
                <p className="text-sm text-stone-600 dark:text-stone-400">{item.exampleZh}</p>
              )}
              {item.mnemonic && <MnemonicPanel mnemonic={item.mnemonic} />}
            </div>
          </motion.div>
        </div>
      </SwipeZone>
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
