import { NextResponse } from "next/server";

/**
 * 学习热力图读取接口。
 */
export async function GET(): Promise<NextResponse> {
  const days = Array.from({ length: 28 }, (_, index) => ({
    date: `2026-06-${String(index + 1).padStart(2, "0")}`,
    reviewedCount: (index * 3) % 18,
    completedDailyGoal: (index * 3) % 18 >= 12,
  }));
  return NextResponse.json({ days });
}
