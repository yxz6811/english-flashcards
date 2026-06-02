"use client";

import { useEffect } from "react";

interface StudyHotkeysProps {
  onKnown: () => void;
  onUnknown: () => void;
  onUndo: () => void;
}

/**
 * 学习快捷键绑定。
 */
export function StudyHotkeys({ onKnown, onUnknown, onUndo }: StudyHotkeysProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") onKnown();
      if (event.key === "ArrowLeft") onUnknown();
      if (event.key.toLowerCase() === "z" && event.ctrlKey) onUndo();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKnown, onUnknown, onUndo]);

  return null;
}
