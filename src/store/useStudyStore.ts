"use client";

import { create } from "zustand";
import { withBasePath } from "@/lib/base-path";
import { applyReviewRule } from "@/lib/review-rule";
import {
  getDeviceId,
  loadPendingOperations,
  loadWords,
  savePendingOperations,
  saveWords,
  syncWords,
} from "@/lib/storage";
import type { ReviewResult, StudySnapshot, SyncOperation, VocabularyItem } from "@/types/domain";

interface StudyStore {
  words: VocabularyItem[];
  cursor: number;
  history: StudySnapshot[];
  pendingOps: SyncOperation[];
  syncStatus: "idle" | "syncing" | "ok" | "error";
  importWords: (entries: string[], interestTags: string[]) => Promise<void>;
  reviewCurrent: (result: ReviewResult) => void;
  undoReview: () => void;
  currentWord: () => VocabularyItem | null;
  syncNow: () => Promise<void>;
}

const seedWords = loadWords().map((item) => ({
  ...item,
  updatedAt: item.updatedAt ?? Date.now(),
  version: item.version ?? 1,
}));
const seedOps = loadPendingOperations();

function createOp(itemId: string, kind: SyncOperation["kind"], payload: Partial<VocabularyItem>): SyncOperation {
  return {
    opId: crypto.randomUUID(),
    itemId,
    kind,
    timestamp: Date.now(),
    deviceId: getDeviceId(),
    payload,
  };
}

export const useStudyStore = create<StudyStore>((set, get) => ({
  words: seedWords,
  cursor: 0,
  history: [],
  pendingOps: seedOps,
  syncStatus: "idle",
  importWords: async (entries, interestTags) => {
    const response = await fetch(withBasePath("/api/cards/enrich"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words: entries, interestTags }),
    });
    const data = (await response.json()) as { items: VocabularyItem[] };
    const words = data.items;
    const importOps = words.map((item) => createOp(item.id, "import", item));
    const nextOps = [...get().pendingOps, ...importOps];
    saveWords(words);
    savePendingOperations(nextOps);
    set({ words, cursor: 0, history: [], pendingOps: nextOps });
  },
  reviewCurrent: (result) => {
    const { words, cursor, history, pendingOps } = get();
    const current = words[cursor];
    if (!current) return;
    const nextBase = applyReviewRule(current, result);
    const next = {
      ...nextBase,
      updatedAt: Date.now(),
      version: current.version + 1,
    };
    const nextWords = [...words];
    nextWords[cursor] = next;
    const op = createOp(next.id, "review", { status: next.status, correctStreak: next.correctStreak, errorCount: next.errorCount, updatedAt: next.updatedAt, version: next.version });
    const nextOps = [...pendingOps, op];
    saveWords(nextWords);
    savePendingOperations(nextOps);
    set({
      words: nextWords,
      cursor: Math.min(cursor + 1, Math.max(0, nextWords.length - 1)),
      history: [...history, { itemId: current.id, before: current, after: next }],
      pendingOps: nextOps,
    });
  },
  undoReview: () => {
    const { words, history, pendingOps } = get();
    const last = history[history.length - 1];
    if (!last) return;
    const index = words.findIndex((item) => item.id === last.itemId);
    if (index < 0) return;
    const nextWords = [...words];
    const restored = {
      ...last.before,
      updatedAt: Date.now(),
      version: last.before.version + 1,
    };
    nextWords[index] = restored;
    const op = createOp(restored.id, "undo", {
      status: restored.status,
      correctStreak: restored.correctStreak,
      errorCount: restored.errorCount,
      updatedAt: restored.updatedAt,
      version: restored.version,
    });
    const nextOps = [...pendingOps, op];
    saveWords(nextWords);
    savePendingOperations(nextOps);
    set({
      words: nextWords,
      cursor: index,
      history: history.slice(0, -1),
      pendingOps: nextOps,
    });
  },
  currentWord: () => {
    const { words, cursor } = get();
    return words[cursor] ?? null;
  },
  syncNow: async () => {
    const { words, pendingOps } = get();
    set({ syncStatus: "syncing" });
    try {
      const result = await syncWords(words, pendingOps);
      saveWords(result.mergedWords);
      savePendingOperations(result.pendingOps);
      set({
        words: result.mergedWords,
        pendingOps: result.pendingOps,
        syncStatus: "ok",
      });
    } catch {
      set({ syncStatus: "error" });
    }
  },
}));
