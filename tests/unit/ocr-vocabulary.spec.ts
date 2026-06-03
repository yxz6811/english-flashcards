import { describe, expect, it } from "vitest";
import { extractWordsFromOcrText } from "@/lib/ocr-vocabulary";

describe("extractWordsFromOcrText", () => {
  it("应剔除斜杠内音标碎片", () => {
    const text = `
New York /njuː ˈjɔːk/ 纽约 p.38
Kenya /ˈkenjə/ 肯尼亚 p.38
affect /əˈfekt/ v. 影响 p.41
`;
    const words = extractWordsFromOcrText(text).map((w) => w.toLowerCase());
    expect(words).toContain("new york");
    expect(words).toContain("kenya");
    expect(words).toContain("affect");
    expect(words).not.toContain("nju");
    expect(words).not.toContain("jo");
    expect(words).not.toContain("kenja");
    expect(words).not.toContain("fekt");
  });

  it("应模拟 OCR 把音标拆成独立 token 的场景", () => {
    const text = `
new
york
nju
jo
kenya
kenja
he
`;
    const words = extractWordsFromOcrText(text).map((w) => w.toLowerCase());
    expect(words).toContain("kenya");
    expect(words).not.toContain("nju");
    expect(words).not.toContain("jo");
    expect(words).not.toContain("kenja");
  });

  it("应保留无音标行的短语词条", () => {
    const text = "rain or shine 不论是雨或是晴 p.41";
    const words = extractWordsFromOcrText(text);
    expect(words.some((w) => w.toLowerCase().includes("rain"))).toBe(true);
  });

  it("应去掉词头后的词性标注", () => {
    const words = extractWordsFromOcrText(`
affect /əˈfekt/ v. 影响 p.41
dry /draɪ/ adj. 干的 p.41
lightning /ˈlaɪtnɪŋ/ n. 闪电 p.42
north /nɔːθ/ n. 北 p.42
`).map((w) => w.toLowerCase());

    expect(words).toContain("affect");
    expect(words).toContain("dry");
    expect(words).toContain("lightning");
    expect(words).toContain("north");
    expect(words.every((w) => !/\s(n|v|adj)$/.test(w))).toBe(true);
    expect(words.some((w) => w.endsWith(" v") || w.endsWith(" adj"))).toBe(false);
  });

  it("应去掉词头后的 OCR 噪声碎片", () => {
    const words = extractWordsFromOcrText(`
New York /njuː ˈjɔːk/ 纽约 p.38
Kenya HE T /ˈkenjə/ 肯尼亚 p.38
USA De
Unit
`);
    const lower = words.map((w) => w.toLowerCase());
    expect(lower).toContain("new york");
    expect(lower).toContain("kenya");
    expect(lower).toContain("usa");
    expect(lower).toContain("unit");
    expect(words.some((w) => /^kenya\s/i.test(w) && w.length > 6)).toBe(false);
    expect(words.some((w) => /^usa\s/i.test(w) && !/^usa$/i.test(w.trim()))).toBe(false);
  });

  it("应剔除中文被英文引擎误识别后黏在词尾的混合大小写碎片", () => {
    // 模拟 OCR.space language=eng 把中文释义硬塞成拉丁碎片的真实输出
    const words = extractWordsFromOcrText(`
at the moment IE
work on fi
take a message fi
hold on lE
right now
`).map((w) => w.toLowerCase());

    expect(words).toContain("at the moment");
    expect(words).toContain("work on");
    expect(words).toContain("take a message");
    expect(words).toContain("hold on");
    expect(words).toContain("right now"); // 合法 3 字母尾词不应被误删
    expect(words).not.toContain("at the moment ie");
    expect(words).not.toContain("work on fi");
    expect(words).not.toContain("take a message fi");
    expect(words.every((w) => !/\s(fi|ie|le)$/.test(w))).toBe(true);
  });

  it("应处理 adv→ado、尾部 it、butt 等 OCR 误识别", () => {
    const words = extractWordsFromOcrText(`
around the world it 世界各地 p.38
in a hurry butt
brightly /ˈbraɪtli/ ado 明亮地 p.40
slowly /ˈsləʊli/ adv. 缓慢地 p.40
rush /rʌʃ/ v. 冲 p.34
`).map((w) => w.toLowerCase());

    expect(words).toContain("around the world");
    expect(words).toContain("in a hurry");
    expect(words).toContain("brightly");
    expect(words).toContain("slowly");
    expect(words).toContain("rush");
    expect(words).not.toContain("around the world it");
    expect(words.every((w) => !w.endsWith(" ado"))).toBe(true);
    expect(words.every((w) => !w.endsWith(" butt"))).toBe(true);
  });
});
