"use client";

import { useEffect } from "react";

interface StudyHotkeysProps {
  onKnown: () => void;
  onUnknown: () => void;
  onUndo: () => void;
  onFlip: () => void;
  onSpeak: () => void;
}

/**
 * 判断焦点是否在可输入元素上。
 */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
}

/**
 * 学习快捷键：Space 翻面、←/→ 判定、R 重播、Ctrl+Z 撤销。
 */
export function StudyHotkeys({ onKnown, onUnknown, onUndo, onFlip, onSpeak }: StudyHotkeysProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onKnown();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onUnknown();
      }
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        onFlip();
      }
      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        onSpeak();
      }
      if (event.key.toLowerCase() === "z" && event.ctrlKey) {
        event.preventDefault();
        onUndo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKnown, onUnknown, onUndo, onFlip, onSpeak]);

  return (
    <p className="text-center text-xs text-stone-500 dark:text-stone-400">
      快捷键：Space 翻面 · ← 不认识 · → 认识 · R 发音 · Ctrl+Z 撤销
    </p>
  );
}
