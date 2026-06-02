"use client";

import { create } from "zustand";
import { loadPreferences, savePreferences } from "@/lib/storage";
import type { UserPreferences } from "@/types/domain";

interface UserStore {
  preferences: UserPreferences;
  setTheme: (theme: UserPreferences["theme"]) => void;
  setSpeechRate: (rate: UserPreferences["speechRate"]) => void;
  setInterestTags: (tags: string[]) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  preferences: loadPreferences(),
  setTheme: (theme) => {
    const preferences = { ...get().preferences, theme };
    savePreferences(preferences);
    set({ preferences });
  },
  setSpeechRate: (speechRate) => {
    const preferences = { ...get().preferences, speechRate };
    savePreferences(preferences);
    set({ preferences });
  },
  setInterestTags: (interestTags) => {
    const preferences = { ...get().preferences, interestTags };
    savePreferences(preferences);
    set({ preferences });
  },
}));
