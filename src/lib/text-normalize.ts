import { cleanHeadword } from "@/lib/ocr-vocabulary";

/**
 * 清洗并去重词条。
 */
export function normalizeWordList(raw: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  raw.forEach((entry) => {
    const word = cleanHeadword(entry.trim().replace(/\s+/g, " "));
    if (!word) return;
    const key = word.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(word);
  });

  return result;
}
