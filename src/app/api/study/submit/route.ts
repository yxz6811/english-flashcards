import { NextRequest, NextResponse } from "next/server";

/**
 * 学习判定提交接口占位。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const payload = await request.json();
  return NextResponse.json({
    ok: true,
    payload,
  });
}
