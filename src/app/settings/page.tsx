"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";

export default function SettingsPage() {
  const { preferences, setTheme, setSpeechRate, setInterestTags } = useUserStore();
  const [tagsInput, setTagsInput] = useState(preferences.interestTags.join(","));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">学习设置</h1>
        <Link href="/" className="btn-secondary">
          返回首页
        </Link>
      </header>

      <section className="card space-y-4">
        <div>
          <p className="mb-2 font-medium">主题</p>
          <div className="flex gap-2">
            <Button onClick={() => setTheme("light")} type="button">
              浅色
            </Button>
            <Button onClick={() => setTheme("dark")} type="button">
              深色
            </Button>
          </div>
        </div>
        <div>
          <p className="mb-2 font-medium">语速</p>
          <div className="flex gap-2">
            {[0.75, 1, 1.25].map((rate) => (
              <Button key={rate} onClick={() => setSpeechRate(rate as 0.75 | 1 | 1.25)} type="button">
                {rate}x
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-medium">兴趣标签（逗号分隔）</p>
          <input
            className="w-full rounded-xl border border-stone-300 px-3 py-2"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
          />
          <Button
            className="mt-3"
            variant="primary"
            type="button"
            onClick={() => setInterestTags(tagsInput.split(",").map((entry) => entry.trim()).filter(Boolean))}
          >
            保存标签
          </Button>
        </div>
      </section>
    </div>
  );
}
