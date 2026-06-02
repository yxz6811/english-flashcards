export type ReviewResult = "known" | "unknown";
export type WordStatus = "learning" | "mastered";

export interface VocabularyItem {
  id: string;
  word: string;
  meaningZh: string;
  phonetic?: string;
  exampleEn?: string;
  exampleZh?: string;
  mnemonic?: string;
  status: WordStatus;
  correctStreak: 0 | 1 | 2;
  errorCount: number;
  updatedAt: number;
  version: number;
}

export interface StudySnapshot {
  itemId: string;
  before: VocabularyItem;
  after: VocabularyItem;
}

export interface UserPreferences {
  theme: "light" | "dark";
  speechRate: 0.75 | 1 | 1.25;
  interestTags: string[];
}

export interface SyncOperation {
  opId: string;
  itemId: string;
  kind: "import" | "review" | "undo";
  timestamp: number;
  deviceId: string;
  payload: Partial<VocabularyItem>;
}
