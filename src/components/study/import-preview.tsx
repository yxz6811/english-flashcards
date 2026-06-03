"use client";

import { useMemo, useState } from "react";
import { withBasePath } from "@/lib/base-path";
import { normalizeWordList } from "@/lib/text-normalize";

interface ImportPreviewProps {
  onConfirm: (words: string[]) => void | Promise<void>;
}

/**
 * 词表导入预览组件，支持基础清洗与删除。
 */
export function ImportPreview({ onConfirm }: ImportPreviewProps) {
  const [rawText, setRawText] = useState("");
  const [removed, setRemoved] = useState<Record<string, boolean>>({});
  const [ocrLoading, setOcrLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const words = useMemo(() => normalizeWordList(rawText.split(/\n|,/g)), [rawText]);
  const visibleWords = words.filter((word) => !removed[word]);

  /**
   * 将文件转为 base64 并调用 OCR 接口。
   */
  async function handleImageImport(file: File): Promise<void> {
    setOcrLoading(true);
    setError("");
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
        body: JSON.stringify({
          imageBase64,
          mimeType: file.type || undefined,
        }),
      });
      const data = (await response.json()) as {
        items?: Array<{ word?: string }>;
        error?: string;
        source?: string;
        provider?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? `OCR 识别失败（HTTP ${response.status}）`);
      }
      if (data.source === "fallback") {
        throw new Error("服务端仍在使用演示数据，请配置 OCR 密钥并重启应用");
      }
      const imported = (data.items ?? []).map((item) => item.word ?? "").filter(Boolean);
      if (imported.length > 0) {
        setRawText((prev) => `${prev}\n${imported.join("\n")}`.trim());
        const via =
          data.provider === "vision"
            ? "AI 识图"
            : data.provider === "ocrspace"
            ? "OCR.space"
            : data.provider === "baidu"
            ? "百度 OCR"
            : "OCR";
        setSuccess(`已通过 ${via} 识别 ${imported.length} 个单词，可继续编辑后生成词书`);
      } else {
        setError(data.error ?? "未识别到有效单词，请换一张更清晰的图片或手动粘贴");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR 识别失败");
    } finally {
      setOcrLoading(false);
    }
  }

  /**
   * 提交词条并生成词书。
   */
  async function handleGenerate(): Promise<void> {
    if (visibleWords.length === 0) return;
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      await onConfirm(visibleWords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成词书失败，请稍后重试");
      setGenerating(false);
    }
  }

  return (
    <section className="card space-y-4">
      <h2 className="text-xl font-semibold">导入词表</h2>
      <textarea
        className="h-36 w-full rounded-xl border border-stone-300 p-3 outline-none ring-amber-600 focus:ring-1"
        placeholder="粘贴单词，一行一个或逗号分隔"
        value={rawText}
        onChange={(event) => {
          setRawText(event.target.value);
          setError("");
          setSuccess("");
        }}
      />
      <label className="btn-secondary inline-flex w-fit cursor-pointer items-center">
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
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
          {success}
        </p>
      )}
      <button
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => void handleGenerate()}
        type="button"
        disabled={visibleWords.length === 0 || generating || ocrLoading}
      >
        {generating ? "正在生成词书..." : `一键生成词书（${visibleWords.length}）`}
      </button>
    </section>
  );
}
