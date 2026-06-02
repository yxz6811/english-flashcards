import type { SyncOperation, UserPreferences, VocabularyItem } from "@/types/domain";

const WORDS_KEY = "ef_words";
const PREFS_KEY = "ef_prefs";
const OPS_KEY = "ef_ops";
const DEVICE_KEY = "ef_device_id";
const REMOTE_MOCK_KEY = "ef_remote_words";

/**
 * 持久化词条列表到本地存储。
 */
export function saveWords(words: VocabularyItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WORDS_KEY, JSON.stringify(words));
}

/**
 * 从本地存储加载词条列表。
 */
export function loadWords(): VocabularyItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(WORDS_KEY);
  return raw ? (JSON.parse(raw) as VocabularyItem[]) : [];
}

/**
 * 获取当前设备 ID。
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const created = `dev-${crypto.randomUUID()}`;
  window.localStorage.setItem(DEVICE_KEY, created);
  return created;
}

/**
 * 保存待同步操作。
 */
export function savePendingOperations(ops: SyncOperation[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OPS_KEY, JSON.stringify(ops));
}

/**
 * 读取待同步操作。
 */
export function loadPendingOperations(): SyncOperation[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(OPS_KEY);
  return raw ? (JSON.parse(raw) as SyncOperation[]) : [];
}

/**
 * 冲突合并：updatedAt 新者优先，若相同则 version 大者优先。
 */
export function mergeByLastWriteWins(local: VocabularyItem[], remote: VocabularyItem[]): VocabularyItem[] {
  const map = new Map<string, VocabularyItem>();
  [...local, ...remote].forEach((item) => {
    const current = map.get(item.id);
    if (!current) {
      map.set(item.id, item);
      return;
    }
    if (item.updatedAt > current.updatedAt) {
      map.set(item.id, item);
      return;
    }
    if (item.updatedAt === current.updatedAt && item.version > current.version) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

/**
 * 执行同步：有远端端点则请求远端，否则使用本地 mock 远端。
 */
export async function syncWords(localWords: VocabularyItem[], ops: SyncOperation[]): Promise<{
  mergedWords: VocabularyItem[];
  pendingOps: SyncOperation[];
  source: "remote" | "local-mock";
}> {
  const endpoint = process.env.NEXT_PUBLIC_SYNC_ENDPOINT;
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words: localWords, operations: ops }),
    });
    if (!response.ok) {
      return { mergedWords: localWords, pendingOps: ops, source: "remote" };
    }
    const data = (await response.json()) as { words?: VocabularyItem[]; ackedOpIds?: string[] };
    const mergedWords = mergeByLastWriteWins(localWords, data.words ?? []);
    const ack = new Set(data.ackedOpIds ?? []);
    return { mergedWords, pendingOps: ops.filter((op) => !ack.has(op.opId)), source: "remote" };
  }

  const remoteRaw = typeof window === "undefined" ? "[]" : window.localStorage.getItem(REMOTE_MOCK_KEY) ?? "[]";
  const remoteWords = JSON.parse(remoteRaw) as VocabularyItem[];
  const mergedWords = mergeByLastWriteWins(localWords, remoteWords);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REMOTE_MOCK_KEY, JSON.stringify(mergedWords));
  }
  return { mergedWords, pendingOps: [], source: "local-mock" };
}

/**
 * 持久化用户设置。
 */
export function savePreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
}

/**
 * 读取用户设置。
 */
export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return { theme: "light", speechRate: 1, interestTags: ["考试"] };
  }
  const raw = window.localStorage.getItem(PREFS_KEY);
  return raw
    ? (JSON.parse(raw) as UserPreferences)
    : { theme: "light", speechRate: 1, interestTags: ["考试"] };
}
