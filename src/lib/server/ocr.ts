interface OcrWord {
  word: string;
}

export interface OcrRecognizeResult {
  items: OcrWord[];
  provider?: "baidu" | "ocrspace";
  error?: string;
}

interface OcrSpaceResponse {
  OCRExitCode?: number | string;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
  ParsedResults?: Array<{ ParsedText?: string }>;
}

/**
 * 从 base64 魔数推断图片 MIME。
 */
function detectMimeFromBase64(base64Image: string): string {
  try {
    const head = Buffer.from(base64Image.slice(0, 24), "base64");
    if (head[0] === 0xff && head[1] === 0xd8) return "image/jpeg";
    if (head[0] === 0x89 && head[1] === 0x50) return "image/png";
    if (head[0] === 0x47 && head[1] === 0x49) return "image/gif";
    if (head[0] === 0x52 && head[1] === 0x49 && head[8] === 0x57) return "image/webp";
  } catch {
    /* 忽略解码失败 */
  }
  return "image/jpeg";
}

/**
 * 规范化客户端传入的 MIME。
 */
function normalizeMime(mimeType?: string): string {
  if (!mimeType) return "";
  if (mimeType === "image/jpg") return "image/jpeg";
  if (mimeType.startsWith("image/")) return mimeType;
  return "";
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
 * 读取 OCR.space 错误信息。
 */
function readOcrSpaceError(data: OcrSpaceResponse): string {
  const msg = data.ErrorMessage;
  if (Array.isArray(msg)) return msg.join("; ");
  if (typeof msg === "string" && msg.trim()) return msg;
  if (data.IsErroredOnProcessing) return "OCR.space 处理失败";
  const code = String(data.OCRExitCode ?? "");
  if (code === "3" || code === "4") return "图片无法识别，请换更清晰的照片";
  return "";
}

/**
 * 判断 OCR API Key 是否已有效配置。
 */
function isConfiguredApiKey(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^your_/i.test(trimmed)) return false;
  return true;
}

/**
 * 使用 OCR.space 识别文本。
 */
async function callOcrSpace(base64Image: string, mimeType?: string): Promise<{ text: string; error?: string }> {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!isConfiguredApiKey(apiKey)) {
    return { text: "", error: "未配置 OCR_SPACE_API_KEY，请在 .env.local 中填写" };
  }

  const mime = normalizeMime(mimeType) || detectMimeFromBase64(base64Image);
  const body = new URLSearchParams({
    base64Image: `data:${mime};base64,${base64Image}`,
    language: "eng",
    isOverlayRequired: "false",
    OCREngine: "2",
  });

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: {
      apikey: apiKey.trim(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const raw = await response.text();
  let data: OcrSpaceResponse;
  try {
    data = JSON.parse(raw) as OcrSpaceResponse;
  } catch {
    return {
      text: "",
      error: `OCR.space 响应异常（HTTP ${response.status}）`,
    };
  }

  const providerError = readOcrSpaceError(data);
  if (providerError) {
    return { text: "", error: providerError };
  }

  const text = (data.ParsedResults ?? [])
    .map((row) => row.ParsedText ?? "")
    .join("\n")
    .trim();

  if (!text) {
    return { text: "", error: "未识别到文字，请确保图片清晰且包含英文单词" };
  }

  return { text };
}

/**
 * 使用百度 OCR 识别文本。
 */
async function callBaiduOcr(base64Image: string): Promise<{ text: string; error?: string }> {
  const apiKey = process.env.BAIDU_OCR_API_KEY;
  const secretKey = process.env.BAIDU_OCR_SECRET_KEY;
  if (!isConfiguredApiKey(apiKey) || !isConfiguredApiKey(secretKey)) {
    return { text: "" };
  }

  const tokenResp = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${encodeURIComponent(
      apiKey.trim()
    )}&client_secret=${encodeURIComponent(secretKey.trim())}`,
    { method: "POST" }
  );
  if (!tokenResp.ok) {
    return { text: "", error: "百度 OCR 获取 access_token 失败" };
  }
  const tokenData = (await tokenResp.json()) as { access_token?: string; error_description?: string };
  if (!tokenData.access_token) {
    return { text: "", error: tokenData.error_description ?? "百度 OCR 鉴权失败" };
  }

  const body = new URLSearchParams({ image: base64Image });
  const ocrResp = await fetch(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${tokenData.access_token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );
  if (!ocrResp.ok) {
    return { text: "", error: `百度 OCR 请求失败（HTTP ${ocrResp.status}）` };
  }
  const ocrData = (await ocrResp.json()) as {
    words_result?: Array<{ words?: string }>;
    error_msg?: string;
  };
  if (ocrData.error_msg) {
    return { text: "", error: ocrData.error_msg };
  }
  const text = (ocrData.words_result ?? [])
    .map((row) => row.words ?? "")
    .join("\n")
    .trim();
  return { text };
}

/**
 * OCR 主入口：优先百度，其次 OCR.space。
 */
export async function recognizeWordsFromImage(
  base64Image: string,
  mimeType?: string
): Promise<OcrRecognizeResult> {
  const baidu = await callBaiduOcr(base64Image);
  if (baidu.text) {
    const items = extractWords(baidu.text);
    if (items.length > 0) return { items, provider: "baidu" };
  }

  const ocrSpace = await callOcrSpace(base64Image, mimeType);
  if (ocrSpace.text) {
    const items = extractWords(ocrSpace.text);
    if (items.length > 0) return { items, provider: "ocrspace" };
    return {
      items: [],
      error: "已识别到文字，但未提取到英文单词，请换一张词汇表照片",
    };
  }

  const hasBaidu = isConfiguredApiKey(process.env.BAIDU_OCR_API_KEY);
  const hasOcrSpace = isConfiguredApiKey(process.env.OCR_SPACE_API_KEY);

  if (!hasBaidu && !hasOcrSpace) {
    return {
      items: [],
      error: "未配置 OCR：请在 .env.local 设置 OCR_SPACE_API_KEY 或百度 OCR 密钥",
    };
  }

  return {
    items: [],
    error: ocrSpace.error ?? baidu.error ?? "OCR 识别失败，请稍后重试",
  };
}
