interface HeatmapDay {
  date: string;
  reviewedCount: number;
}

interface HeatmapProps {
  days: HeatmapDay[];
}

/**
 * 学习热力图简版组件。
 */
export function Heatmap({ days }: HeatmapProps) {
  const total = days.reduce((acc, day) => acc + day.reviewedCount, 0);
  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-semibold">学习热力图</h2>
      <p className="text-sm text-stone-600">近 {days.length} 天累计复习 {total} 次</p>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const level = Math.min(4, Math.floor(day.reviewedCount / 5));
          const colors = ["bg-stone-200", "bg-lime-200", "bg-lime-300", "bg-lime-400", "bg-lime-500"];
          return <div key={day.date} className={`h-8 rounded ${colors[level]}`} title={`${day.date}: ${day.reviewedCount}`} />;
        })}
      </div>
    </section>
  );
}
