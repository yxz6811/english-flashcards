/**
 * IPA / 音标相关字符（含常见 OCR 误识别为 ASCII 的碎片）。
 */
const IPA_CHAR_RE =
  /[\u0250-\u02AF\u02B0-\u02EB\u1D00-\u1D7F\u1D80-\u1DBFˈˌːᵊᵻʰʷⁿəɪʊŋʃʒθðɔæɜ]/;

/** 词性缩写（OCR 常单独成词或附在词头后） */
const POS_ABBREV = new Set([
  "n",
  "v",
  "adj",
  "adv",
  "prep",
  "conj",
  "pron",
  "det",
  "interj",
  "vi",
  "vt",
  "pl",
  "sing",
  "ado",
  "adu",
  "modal",
]);

/** OCR 将 adv. 误识别为 ado/adu 等 */
const POS_OCR_TYPOS = new Set(["ado", "adu", "adv", "modal"]);

/** 保留的全大写缩写（勿当噪声剔除） */
const ALLOWED_ACRONYMS = new Set(["USA", "UK", "EU", "UN", "AI", "IT", "NY", "LA"]);

/** 尾部词性正则（可重复匹配） */
const TRAILING_POS_RE =
  /\s+(?:n|v|adj|adv|adu|ado|prep|conj|pron|det|interj|vi|vt|pl|sing|modal)\.?\s*$/i;

/** 允许保留的极短常见词 */
const SHORT_WORD_ALLOW = new Set([
  "a",
  "an",
  "as",
  "at",
  "be",
  "by",
  "do",
  "go",
  "he",
  "if",
  "in",
  "is",
  "it",
  "me",
  "my",
  "no",
  "of",
  "on",
  "or",
  "so",
  "to",
  "up",
  "us",
  "we",
]);

/**
 * 去掉页码引用。
 */
function stripPageRefs(text: string): string {
  return text.replace(/\bp\.?\s*\d+\b/gi, " ");
}

/**
 * 剥离 /音标/ 区块，并收集音标内的 ASCII 碎片用于排除。
 */
function stripSlashPhonetics(text: string): { text: string; ipaAsciiTokens: Set<string> } {
  const ipaAsciiTokens = new Set<string>();

  const cleaned = text.replace(/\/[^/\n]{1,160}\//g, (segment) => {
    const inner = segment.slice(1, -1);
    const tokens = inner.match(/[A-Za-z][A-Za-z'-]*/g) ?? [];
    tokens.forEach((token) => {
      if (token.length >= 2) ipaAsciiTokens.add(token.toLowerCase());
    });
    return " ";
  });

  return { text: cleaned, ipaAsciiTokens };
}

/**
 * 去掉音标 Unicode 与 stress 符号。
 */
function stripIpaSymbols(text: string): string {
  return text.replace(IPA_CHAR_RE, " ");
}

/**
 * 编辑距离（用于剔除 kenja / kenya 这类音标误识别）。
 */
function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

/**
 * 是否像音标音节碎片（nju、jo、kenja 等）。
 */
function looksLikePhoneticSyllable(word: string): boolean {
  const w = word.toLowerCase();
  if (w.length < 2 || w.length > 6) return false;
  if (IPA_CHAR_RE.test(word)) return true;
  if (!/^[a-z'-]+$/.test(w)) return false;
  if (!/[aeiouy]/.test(w)) return true;

  // 中间含 nj、tn、mpr 等音标拼写特征；短词 jo、nju 等
  if (/nj|tnng|tn|mpr|graoval|ltk|fekt|laht|kjc|vlt/.test(w)) return true;
  if (w.length <= 3 && /^[bcdfghjklmnpqrstvwxz]*[aeiouy][bcdfghjklmnpqrstvwxz]{1,2}$/.test(w) && !SHORT_WORD_ALLOW.has(w)) {
    return true;
  }

  return false;
}

/**
 * 剔除与更长词条仅差 1 个字符的短碎片（如 kenja vs kenya）。
 */
function phoneticLikelihood(word: string): number {
  let score = 0;
  if (looksLikePhoneticSyllable(word)) score += 4;
  if (/nj|tn|mpr|fekt|laht|ltk/i.test(word)) score += 2;
  if (word.length <= 4) score += 1;
  return score;
}

/**
 * 剔除与正词仅差 1 字符的音标误识别（保留更像正词的一侧）。
 */
function filterNearHeadwordTypos(words: string[]): string[] {
  const drop = new Set<number>();

  for (let i = 0; i < words.length; i += 1) {
    for (let j = i + 1; j < words.length; j += 1) {
      const a = words[i].toLowerCase();
      const b = words[j].toLowerCase();
      if (a === b) continue;
      if (Math.abs(a.length - b.length) > 2) continue;
      if (editDistance(a, b) !== 1) continue;

      const scoreA = phoneticLikelihood(words[i]);
      const scoreB = phoneticLikelihood(words[j]);
      if (scoreA > scoreB) drop.add(i);
      else if (scoreB > scoreA) drop.add(j);
      else if (a.length < b.length) drop.add(i);
      else drop.add(j);
    }
  }

  return words.filter((_, index) => !drop.has(index));
}

/**
 * 去掉词头末尾的词性标注（如 affect v、dry adj.）。
 */
function stripTrailingPos(phrase: string): string {
  let result = phrase.trim();
  while (TRAILING_POS_RE.test(result)) {
    result = result.replace(TRAILING_POS_RE, "").trim();
  }
  return result;
}

/**
 * 判断尾部单词是否为 OCR 噪声（HE、T、De 等）。
 */
function isTrailingNoiseToken(token: string, leadingPhrase: string): boolean {
  const lower = token.toLowerCase();

  // 词性缩写与 OCR 词性误识别（n. / v. / adv→ado）
  if (POS_ABBREV.has(lower) || POS_OCR_TYPOS.has(lower)) return true;
  if (lower === "ado" || lower === "adu") return true;

  // 单字符一律视为噪声
  if (token.length === 1) return true;

  // 全大写缩写（非白名单）→ 噪声（IE、HE、ABC…）
  if (/^[A-Z]{2,4}$/.test(token) && !ALLOWED_ACRONYMS.has(token)) {
    return true;
  }

  // 长度 ≤ 2 的尾部碎片：除非是公认短词，否则一律视为噪声。
  // OCR 把中文释义强行识别成的拉丁碎片（fi / lE / Ie / de …，含大小写混排）
  // 几乎都落在这里，用通用规则替代旧版逐例 hardcode（he+kenya、de+usa）。
  if (token.length <= 2 && !SHORT_WORD_ALLOW.has(lower) && !ALLOWED_ACRONYMS.has(token)) {
    return true;
  }

  // 多词短语末尾误识别的 it（around the world it）
  if (lower === "it" && leadingPhrase.split(/\s+/).length >= 2) {
    return true;
  }

  // but / 中文「但」→ butt（in a hurry butt）
  if (lower === "butt" && (/\bhurry\b/i.test(leadingPhrase) || /\bin a\b/i.test(leadingPhrase))) {
    return true;
  }

  return false;
}

/**
 * 去掉词头末尾的噪声英文碎片。
 */
function stripTrailingNoise(phrase: string): string {
  const parts = phrase.trim().split(/\s+/);
  while (parts.length > 1) {
    const last = parts[parts.length - 1];
    const leading = parts.slice(0, -1).join(" ");
    if (!isTrailingNoiseToken(last, leading)) break;
    parts.pop();
  }
  return parts.join(" ");
}

/**
 * 清洗词头/词条短语。
 */
export function cleanHeadword(phrase: string): string {
  let result = phrase.trim().replace(/\s+/g, " ");
  result = result.replace(/\s+adv\.?\s*$/i, "");
  result = stripTrailingPos(result);
  return stripTrailingNoise(result).trim();
}

/**
 * 同一清洗结果只保留最短词组（去掉带噪声尾巴的长条目）。
 */
function collapseByCleanedKey(words: string[]): string[] {
  const best = new Map<string, string>();

  words.forEach((word) => {
    const cleaned = cleanHeadword(word);
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    const prev = best.get(key);
    if (!prev || cleaned.split(/\s+/).length < prev.split(/\s+/).length) {
      best.set(key, cleaned);
    }
  });

  return [...best.values()];
}

/**
 * 从单行提取词头（斜杠前的英文部分）。
 */
function extractHeadwordFromLine(line: string): string | null {
  const slashIdx = line.indexOf("/");
  const headPart = slashIdx >= 0 ? line.slice(0, slashIdx) : line;
  const latin = headPart
    .replace(/[\u4e00-\u9fff]/g, " ")
    .replace(/[^\u0020-\u007E]/g, " ")
    .trim();

  const match = latin.match(
    /(?:^|\s)([A-Za-z][A-Za-z\s,'-]{0,48}?)(?=\s*(?:$|\(|,|\.|;|:|\d|\s+(?:n|v|adj|adv|adu|ado|prep|conj|pron|det|modal)(?![A-Za-z])|\s*\/))/
  );
  if (!match) return null;

  const phrase = cleanHeadword(match[1]);
  if (!phrase || phrase.length < 2) return null;
  if (POS_ABBREV.has(phrase.toLowerCase())) return null;
  if (looksLikePhoneticSyllable(phrase)) return null;

  // 无 /音标/ 的单行小写碎片（OCR 常把音标拆成独立行）不作为词头
  if (slashIdx < 0 && phrase === phrase.toLowerCase() && !phrase.includes(" ") && phrase.length <= 5) {
    return null;
  }

  return phrase;
}

/**
 * 判断是否为应丢弃的 token。
 */
function shouldDropToken(
  token: string,
  ipaAsciiTokens: Set<string>,
  headwordHints: Set<string>
): boolean {
  const lower = token.toLowerCase();

  if (POS_ABBREV.has(lower) || POS_OCR_TYPOS.has(lower)) return true;
  if (lower === "butt" || lower === "ado" || lower === "adu") return true;
  if (/^p\d+$/i.test(lower)) return true;
  if (IPA_CHAR_RE.test(token)) return true;
  if (ipaAsciiTokens.has(lower)) return true;

  if (headwordHints.has(lower)) return false;

  if (looksLikePhoneticSyllable(token)) return true;
  if (lower.length <= 2 && !SHORT_WORD_ALLOW.has(lower)) return true;

  return false;
}

/**
 * 从 OCR 原文提取词汇表词条（过滤音标与页码）。
 */
export function extractWordsFromOcrText(text: string): string[] {
  let working = stripPageRefs(text);
  const { text: withoutSlashes, ipaAsciiTokens } = stripSlashPhonetics(working);
  working = stripIpaSymbols(withoutSlashes);

  const headwordHints = new Set<string>();
  const headwords: string[] = [];

  working.split(/\n+/).forEach((line) => {
    const head = extractHeadwordFromLine(line);
    if (!head) return;
    headwords.push(head);
    head.split(/\s+/).forEach((part) => {
      if (part.length >= 2) headwordHints.add(part.toLowerCase());
    });
    headwordHints.add(head.toLowerCase());
  });

  const tokenSet = new Set<string>();
  const addToken = (raw: string): void => {
    const token = cleanHeadword(raw.trim());
    if (!token || token.length < 2) return;
    if (shouldDropToken(token, ipaAsciiTokens, headwordHints)) return;
    const key = token.toLowerCase();
    if (tokenSet.has(key)) return;
    tokenSet.add(key);
  };

  headwords.forEach((head) => addToken(head));

  const globalTokens = working.match(/[A-Za-z][A-Za-z'-]{1,}/g) ?? [];
  globalTokens.forEach((token) => addToken(token));

  const ordered = [...tokenSet].map((key) => {
    const fromHead = headwords.find((h) => h.toLowerCase() === key);
    if (fromHead) return fromHead;
    const fromGlobal = globalTokens.find((t) => t.toLowerCase() === key);
    return fromGlobal ?? key;
  });

  const deduped: string[] = [];
  const seen = new Set<string>();
  ordered.forEach((word) => {
    const key = word.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(word);
  });

  const cleaned = deduped
    .map((word) => cleanHeadword(word))
    .filter(
      (word) =>
        word.length >= 2 &&
        !POS_ABBREV.has(word.toLowerCase()) &&
        !POS_OCR_TYPOS.has(word.toLowerCase())
    );

  return filterNearHeadwordTypos(collapseByCleanedKey(cleaned));
}
