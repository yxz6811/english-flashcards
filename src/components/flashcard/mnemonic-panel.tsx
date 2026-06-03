"use client";

import { useState } from "react";

interface MnemonicPanelProps {
  mnemonic: string;
}

/**
 * 助记法折叠面板（反面展示）。
 */
export function MnemonicPanel({ mnemonic }: MnemonicPanelProps) {
  const [open, setOpen] = useState(false);

  if (!mnemonic.trim()) return null;

  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 dark:border-amber-800/60 dark:bg-amber-950/40">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-amber-900 dark:text-amber-200"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <span>💡 助记</span>
        <span className="text-xs text-amber-700 dark:text-amber-400">{open ? "收起" : "展开"}</span>
      </button>
      {open && (
        <p className="border-t border-amber-200/80 px-3 py-2 text-sm text-amber-950 dark:border-amber-800/60 dark:text-amber-100">
          {mnemonic}
        </p>
      )}
    </div>
  );
}
