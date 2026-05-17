"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

export type TocContextType = {
  isTocOpen: boolean;
  setIsTocOpen: (open: boolean) => void;
};

const TocContext = createContext<TocContextType | undefined>(undefined);

export function TocProvider({ children }: { children: ReactNode }) {
  const [isTocOpen, setIsTocOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1280) {
      setIsTocOpen(true);
    }
  }, []);

  return <TocContext.Provider value={{ isTocOpen, setIsTocOpen }}>{children}</TocContext.Provider>;
}

export function useToc() {
  const context = useContext(TocContext);
  if (context === undefined) {
    throw new Error("useToc must be used within a TocProvider");
  }
  return context;
}
