"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FlashCard } from "@/components/flashcard/flashcard";
import { FullscreenConfetti } from "@/components/study/fullscreen-confetti";
import { MicroCelebration } from "@/components/study/micro-celebration";
import { StudyHotkeys } from "@/components/study/study-hotkeys";
import { speak } from "@/lib/tts";
import { useStudyStore } from "@/store/useStudyStore";
import { useUserStore } from "@/store/useUserStore";

export default function StudyPage() {
  const [flipped, setFlipped] = useState(false);
  const currentWord = useStudyStore((state) => state.currentWord);
  const words = useStudyStore((state) => state.words);
  const reviewCurrent = useStudyStore((state) => state.reviewCurrent);
  const undoReview = useStudyStore((state) => state.undoReview);
  const syncNow = useStudyStore((state) => state.syncNow);
  const syncStatus = useStudyStore((state) => state.syncStatus);
  const pendingOps = useStudyStore((state) => state.pendingOps.length);
  const speechRate = useUserStore((state) => state.preferences.speechRate);
  const word = currentWord();
  const masteredCount = words.filter((item) => item.status === "mastered").length;
  const showDailyDone = words.length > 0 && masteredCount === words.length;

  useEffect(() => {
    setFlipped(false);
  }, [word?.id]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">学习模式</h1>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => void syncNow()} type="button">
            立即同步（待同步 {pendingOps}）
          </button>
          <Link href="/" className="btn-secondary">
            返回首页
          </Link>
        </div>
      </header>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        同步状态：
        {syncStatus === "idle" && "待机"}
        {syncStatus === "syncing" && "同步中"}
        {syncStatus === "ok" && "已同步"}
        {syncStatus === "error" && "同步失败，请重试"}
      </p>
      {word ? (
        <>
          <FlashCard
            item={word}
            flipped={flipped}
            onFlipToggle={() => setFlipped((prev) => !prev)}
            speechRate={speechRate}
            onKnown={() => reviewCurrent("known")}
            onUnknown={() => reviewCurrent("unknown")}
          />
          <MicroCelebration visible={word.correctStreak === 1} />
          <button className="btn-secondary w-full sm:w-auto" onClick={undoReview} type="button">
            撤销上一步
          </button>
          <StudyHotkeys
            onKnown={() => reviewCurrent("known")}
            onUnknown={() => reviewCurrent("unknown")}
            onUndo={undoReview}
            onFlip={() => setFlipped((prev) => !prev)}
            onSpeak={() => speak(word.word, speechRate)}
          />
        </>
      ) : (
        <section className="card">
          <p>暂无词条，请先返回首页导入词表。</p>
        </section>
      )}
      <FullscreenConfetti show={showDailyDone} />
    </div>
  );
}
