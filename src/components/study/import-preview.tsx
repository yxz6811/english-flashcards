"use client";

import { useMemo, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import { normalizeWordList } from "@/lib/text-normalize";

interface ImportPreviewProps {
  onConfirm: (words: string[]) => void;
}

/**
 * 词表导入预览组件，支持基础清洗与删除。
 */
export function ImportPreview({ onConfirm }: ImportPreviewProps) {
  const [rawText, setRawText] = useState("");
  const [removed, setRemoved] = useState<Record<string, boolean>>({});
  const [ocrLoading, setOcrLoading] = useState(false);

  const words = useMemo(() => normalizeWordList(rawText.split(/\n|,/g)), [rawText]);
  const visibleWords = words.filter((word) => !removed[word]);

  /**
   * 将文件转为 base64 并调用 OCR 接口。
   */
  async function handleImageImport(file: File): Promise<void> {
    setOcrLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      bytes.forEach((b) => {
        binary += String.fromCharCode(b);
      });
      const imageBase64 = btoa(binary);
      const response = await fetch(withBasePath("/api/ocr"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      const data = (await response.json()) as { items?: Array<{ word?: string }> };
      const imported = (data.items ?? []).map((item) => item.word ?? "").filter(Boolean);
      if (imported.length > 0) {
        setRawText((prev) => `${prev}\n${imported.join("\n")}`.trim());
      }
    } finally {
      setOcrLoading(false);
    }
  }

  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-semibold">导入词表</h2>
      <textarea
        className="h-36 w-full rounded-xl border border-stone-300 p-3 outline-none ring-amber-600 focus:ring-1"
        placeholder="粘贴单词，一行一个或逗号分隔"
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
      />
      <label className="btn-secondary inline-flex w-fit items-center">
        {ocrLoading ? "OCR 识别中..." : "上传图片 OCR 导入"}
        <input
          className="hidden"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImageImport(file);
          }}
        />
      </label>
      <div className="grid gap-2">
        {visibleWords.slice(0, 30).map((word) => (
          <button
            key={word}
            className="btn-secondary justify-start text-left"
            onClick={() => setRemoved((prev) => ({ ...prev, [word]: true }))}
            type="button"
          >
            {word}
          </button>
        ))}
        {visibleWords.length === 0 && <p className="text-sm text-stone-600">暂无可导入词条</p>}
      </div>
      <button
        className="btn-primary"
        onClick={() => onConfirm(visibleWords)}
        type="button"
        disabled={visibleWords.length === 0}
      >
        一键生成词书（{visibleWords.length}）
      </button>
    </section>
  );
}
