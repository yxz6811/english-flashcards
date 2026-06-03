import { describe, expect, it } from "vitest";
import { parseVisionWords } from "@/lib/server/vision";

describe("parseVisionWords", () => {
  it("解析标准 JSON 并保留词组空格", () => {
    const out = parseVisionWords(
      '{"words":["take a message","market","Dragon Boat Festival"]}'
    );
    expect(out).toEqual(["take a message", "market", "Dragon Boat Festival"]);
  });

  it("容错 ```json 代码块包裹", () => {
    const out = parseVisionWords('```json\n{"words":["hold on","call back"]}\n```');
    expect(out).toEqual(["hold on", "call back"]);
  });

  it("从含额外文字的响应里抠出 JSON，并去重 / 规整多余空格", () => {
    const out = parseVisionWords('好的：{"words":["work  on","work on","ride"]} 以上');
    expect(out).toEqual(["work on", "ride"]);
  });

  it("非 JSON / 看不清的回复返回空数组", () => {
    expect(parseVisionWords("抱歉，我看不清这张图片。")).toEqual([]);
    expect(parseVisionWords("")).toEqual([]);
  });
});
