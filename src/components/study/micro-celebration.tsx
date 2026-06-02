interface MicroCelebrationProps {
  visible: boolean;
}

/**
 * 生词攻克后的局部庆祝提示。
 */
export function MicroCelebration({ visible }: MicroCelebrationProps) {
  if (!visible) return null;
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
      恭喜！该单词已达到 2/2，成功掌握。
    </div>
  );
}
