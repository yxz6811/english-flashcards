import type { UserPreferences } from "@/types/domain";

/**
 * 将主题同步到 document.documentElement（Tailwind `dark` class）。
 */
export function applyTheme(theme: UserPreferences["theme"]): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}
