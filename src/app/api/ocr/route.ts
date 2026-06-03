import { NextRequest, NextResponse } from "next/server";
import { recognizeWordsFromImage } from "@/lib/server/ocr";

/**
 * OCR 接口：真实供应商识别，失败时返回明确错误（不再静默 mock）。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { imageBase64?: string; mimeType?: string };
  const imageBase64 = (body.imageBase64 ?? "").replace(/^data:image\/\w+;base64,/, "");
  const mimeType = body.mimeType;

  if (!imageBase64) {
    return NextResponse.json({ error: "请上传图片", source: "error" }, { status: 400 });
  }

  try {
    const result = await recognizeWordsFromImage(imageBase64, mimeType);
    if (result.items.length === 0) {
      return NextResponse.json(
        { error: result.error ?? "未识别到有效单词", source: "error" },
        { status: 422 }
      );
    }
    return NextResponse.json({
      items: result.items,
      source: "provider",
      provider: result.provider,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OCR 服务异常";
    return NextResponse.json({ error: message, source: "error" }, { status: 500 });
  }
}
