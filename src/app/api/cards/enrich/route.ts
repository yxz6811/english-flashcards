import { NextRequest, NextResponse } from "next/server";
import { enrichWords } from "@/lib/server/llm";

/**
 * 词条内容补全接口：优先真实 LLM，失败降级模板。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { words?: string[]; interestTags?: string[] };
  const words = body.words ?? [];
  const interestTags = body.interestTags ?? [];
  const enriched = await enrichWords(words, interestTags);
  const now = Date.now();
  const items = enriched.map((item, index) => ({
    id: `${item.word}-${index}`,
    word: item.word,
    phonetic: item.phonetic ?? "/demo/",
    meaningZh: item.meaningZh,
    exampleEn: item.exampleEn,
    exampleZh: item.exampleZh,
    mnemonic: item.mnemonic,
    status: "learning",
    correctStreak: 0,
    errorCount: 0,
    updatedAt: now,
    version: 1,
  }));
  return NextResponse.json({ items });
}
