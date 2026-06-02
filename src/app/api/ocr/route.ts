import { NextRequest, NextResponse } from "next/server";
import { recognizeWordsFromImage } from "@/lib/server/ocr";

/**
 * OCR 接口：支持真实供应商与降级策略。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { imageBase64?: string };
  const imageBase64 = body.imageBase64 ?? "";
  if (!imageBase64) {
    return NextResponse.json(
      { items: [{ word: "defeat" }, { word: "review" }, { word: "vocabulary" }], source: "fallback" },
      { status: 200 }
    );
  }

  try {
    const items = await recognizeWordsFromImage(imageBase64);
    if (items.length === 0) {
      return NextResponse.json(
        { items: [{ word: "defeat" }, { word: "review" }, { word: "vocabulary" }], source: "fallback" },
        { status: 200 }
      );
    }
    return NextResponse.json({ items, source: "provider" });
  } catch {
    return NextResponse.json(
      { items: [{ word: "defeat" }, { word: "review" }, { word: "vocabulary" }], source: "fallback" },
      { status: 200 }
    );
  }
}
