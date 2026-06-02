import { NextResponse } from "next/server";

/**
 * 撤销接口占位实现。
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ ok: true });
}
