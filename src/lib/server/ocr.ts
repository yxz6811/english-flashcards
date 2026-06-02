interface OcrWord {
  word: string;
}

/**
 * 从文本中提取英文单词。
 */
function extractWords(text: string): OcrWord[] {
  const tokens = text.match(/[A-Za-z][A-Za-z'-]{1,}/g) ?? [];
  const uniq = Array.from(new Set(tokens.map((word) => word.toLowerCase())));
  return uniq.map((word) => ({ word }));
}

/**
 * 使用 OCR.space 识别文本。
 */
async function callOcrSpace(base64Image: string): Promise<string> {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) return "";
  const body = new URLSearchParams({
    apikey: apiKey,
    base64Image: `data:image/png;base64,${base64Image}`,
    language: "eng",
    isOverlayRequired: "false",
  });
  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body,
  });
  if (!response.ok) return "";
  const data = (await response.json()) as {
    ParsedResults?: Array<{ ParsedText?: string }>;
  };
  return data.ParsedResults?.[0]?.ParsedText ?? "";
}

/**
 * 使用百度 OCR 识别文本。
 */
async function callBaiduOcr(base64Image: string): Promise<string> {
  const apiKey = process.env.BAIDU_OCR_API_KEY;
  const secretKey = process.env.BAIDU_OCR_SECRET_KEY;
  if (!apiKey || !secretKey) return "";

  const tokenResp = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${encodeURIComponent(
      apiKey
    )}&client_secret=${encodeURIComponent(secretKey)}`,
    { method: "POST" }
  );
  if (!tokenResp.ok) return "";
  const tokenData = (await tokenResp.json()) as { access_token?: string };
  if (!tokenData.access_token) return "";

  const body = new URLSearchParams({ image: base64Image });
  const ocrResp = await fetch(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${tokenData.access_token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );
  if (!ocrResp.ok) return "";
  const ocrData = (await ocrResp.json()) as {
    words_result?: Array<{ words?: string }>;
  };
  return (ocrData.words_result ?? [])
    .map((row) => row.words ?? "")
    .join("\n")
    .trim();
}

/**
 * OCR 主入口：优先百度，其次 OCR.space。
 */
export async function recognizeWordsFromImage(base64Image: string): Promise<OcrWord[]> {
  const baiduText = await callBaiduOcr(base64Image);
  const rawText = baiduText || (await callOcrSpace(base64Image));
  if (!rawText) return [];
  return extractWords(rawText);
}
