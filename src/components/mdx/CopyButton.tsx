"use client";

import { useState } from "react";

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 700);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="copy-code absolute right-2 top-2 rounded bg-muted/90 backdrop-blur-sm px-2 py-1 text-xs font-medium leading-4 text-foreground z-10 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm border border-border"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};
