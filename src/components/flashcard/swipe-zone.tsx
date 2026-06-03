"use client";

import { motion, useAnimation } from "framer-motion";
import React, { useEffect, type ReactNode } from "react";

const SWIPE_THRESHOLD = 100;

interface SwipeZoneProps {
  children: ReactNode;
  resetKey: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  disabled?: boolean;
}

/**
 * Tinder 式水平滑动：左滑不认识，右滑认识，松手后卡片飞出。
 */
export function SwipeZone({ children, resetKey, onSwipeLeft, onSwipeRight, disabled }: SwipeZoneProps) {
  const controls = useAnimation();

  useEffect(() => {
    void controls.set({ x: 0, opacity: 1, rotate: 0 });
  }, [resetKey, controls]);

  async function handleDragEnd(_: unknown, info: { offset: { x: number } }): Promise<void> {
    if (disabled) return;

    const { x } = info.offset;
    if (x > SWIPE_THRESHOLD) {
      await controls.start({ x: 420, opacity: 0, rotate: 8, transition: { duration: 0.22 } });
      onSwipeRight();
      return;
    }
    if (x < -SWIPE_THRESHOLD) {
      await controls.start({ x: -420, opacity: 0, rotate: -8, transition: { duration: 0.22 } });
      onSwipeLeft();
    }
  }

  return (
    <motion.div
      drag={disabled ? false : "x"}
      dragConstraints={{ left: -160, right: 160 }}
      dragElastic={0.9}
      animate={controls}
      style={{ touchAction: "pan-y" }}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing" }}
    >
      {children}
    </motion.div>
  );
}
