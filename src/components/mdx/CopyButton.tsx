"use client";

import React, { useState } from "react";

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
      onClick={handleCopy}
      className="copy-code absolute right-3 -top-3 rounded bg-muted px-2 py-1 text-xs font-medium leading-4 text-foreground z-10 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm border border-border"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};
