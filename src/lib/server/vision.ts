import { toDataUrl } from "./image-mime";

interface VisionWord {
  word: string;
}

export interface VisionRecognizeResult {
  items: VisionWord[];
  /** 仅在「已配置但调用失败」时填写；未配置时为空字符串，交由 OCR 兜底。 */
  error?: string;
}

/**
 * 提示词：让视觉模型直接把词汇表照片解析成干净的英文词条列表。
 * 这一步替代了「OCR + 正则清洗」整条脆弱链路：模型理解词汇表结构，
 * 能正确分词（take a message）、去掉音标/中文/词性/页码，并保留词组空格。
 */
const EXTRACT_PROMPT = `这是一张中英文词汇表的照片，每个词条通常是「英文单词或词组 + 音标 + 词性 + 中文释义 + 页码」。
请提取其中所有「英文单词 / 英文词组」，并严格遵守：
1. 按词汇表从上到下、从左列到右列的顺序输出；
2. 只保留英文本身，去掉音标（/.../）、词性缩写（n. v. adj. adv. 等）、中文释义、页码（如 p.34）等一切附加信息；
3. 多词词组必须保留正确的单词间空格，例如 take a message、look forward to、Dragon Boat Festival、side by side；
4. 不要漏词，也不要臆造词汇表里不存在的词，更不要把音标或中文拼成假单词；
5. 保持原有大小写（专有名词如 Nairobi、Dragon Boat Festival 首字母大写）。
只输出 JSON，格式为 {"words": ["word1", "word2", ...]}，不要输出任何额外文字或解释。`;

/**
 * 判断 key 是否已有效配置。
 */
function isConfiguredKey(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^your_/i.test(trimmed)) return false;
  return true;
}

/**
 * 解析视觉模型返回的内容，容错地抽取 words 数组并去重、规整空格。
 * 导出以便单测覆盖（纯函数，无网络）。
 */
export function parseVisionWords(content: string): string[] {
  let text = content.trim();
  // 去掉 ```json ... ``` 代码块包裹
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    // 模型偶尔会在 JSON 前后带说明文字，尝试抠出第一段 {...}
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        data = JSON.parse(match[0]);
      } catch {
        data = null;
      }
    }
  }

  const arr =
    data && typeof data === "object" ? (data as { words?: unknown }).words : undefined;
  if (!Array.isArray(arr)) return [];

  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of arr) {
    if (typeof item !== "string") continue;
    const word = item.trim().replace(/\s+/g, " ");
    if (!word) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(word);
  }
  return result;
}

/**
 * 多模态视觉识图：通过任意「OpenAI 兼容」的视觉模型直接从照片提取英文词条。
 * 默认接通义千问 Qwen-VL（DashScope），可用 env 改成 GLM-4V / GPT-4o / Gemini 等。
 *
 * 约定：未配置 key 时静默返回空（不报错），由上层降级到 OCR；
 * 已配置但调用失败时返回 error，便于在全部失败时给出提示。
 */
export async function recognizeWordsFromImageVision(
  base64Image: string,
  mimeType?: string
): Promise<VisionRecognizeResult> {
  const apiKey = process.env.VISION_API_KEY ?? process.env.DASHSCOPE_API_KEY;
  if (!isConfiguredKey(apiKey)) {
    return { items: [] };
  }

  const baseUrl = (
    process.env.VISION_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1"
  ).replace(/\/+$/, "");
  const model = process.env.VISION_MODEL || "qwen-vl-max";
  const dataUrl = toDataUrl(base64Image, mimeType);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACT_PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "网络错误";
    return { items: [], error: `视觉模型请求失败：${message}` };
  }

  const raw = await response.text();
  if (!response.ok) {
    return {
      items: [],
      error: `视觉模型返回错误（HTTP ${response.status}）：${raw.slice(0, 300)}`,
    };
  }

  let payload: { choices?: Array<{ message?: { content?: string } }> };
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    return { items: [], error: "视觉模型响应解析失败" };
  }

  const content = payload.choices?.[0]?.message?.content ?? "";
  const words = parseVisionWords(content);
  if (words.length === 0) {
    return { items: [], error: "视觉模型未提取到单词，请换一张更清晰的词汇表照片" };
  }

  return { items: words.map((word) => ({ word })) };
}
