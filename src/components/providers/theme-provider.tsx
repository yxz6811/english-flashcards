"use client";

import { useEffect } from "react";
import { applyTheme } from "@/lib/theme";
import { useUserStore } from "@/store/useUserStore";

/**
 * 订阅用户主题偏好并应用到根节点。
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUserStore((state) => state.preferences.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return <>{children}</>;
}
