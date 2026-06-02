interface FullscreenConfettiProps {
  show: boolean;
}

/**
 * 当日任务完成后的全局庆祝层。
 */
export function FullscreenConfetti({ show }: FullscreenConfettiProps) {
  if (!show) return null;
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-amber-100/80"
      aria-live="polite"
    >
      <p className="rounded-2xl bg-white px-6 py-4 text-xl font-bold text-amber-700 shadow">
        今日任务完成，继续保持！
      </p>
    </div>
  );
}
