/**
 * 图片 MIME 推断工具（供多模态识图与 OCR 复用，无外部依赖以避免循环引用）。
 */

/**
 * 从 base64 魔数推断图片 MIME。
 */
export function detectMimeFromBase64(base64Image: string): string {
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
export function normalizeMime(mimeType?: string): string {
  if (!mimeType) return "";
  if (mimeType === "image/jpg") return "image/jpeg";
  if (mimeType.startsWith("image/")) return mimeType;
  return "";
}

/**
 * 生成可直接喂给视觉模型 / OCR 的 data URL。
 */
export function toDataUrl(base64Image: string, mimeType?: string): string {
  const mime = normalizeMime(mimeType) || detectMimeFromBase64(base64Image);
  return `data:${mime};base64,${base64Image}`;
}
