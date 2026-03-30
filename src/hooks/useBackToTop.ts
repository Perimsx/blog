"use client";

import { useState, useEffect, useCallback } from "react";

export interface BackToTopResult {
  progress: number;
  isVisible: boolean;
}

const CIRCUMFERENCE = 125.66;
const THRESHOLD = 300;

export function useBackToTop(): BackToTopResult {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const newProgress = docHeight > 0 ? scrollTop / docHeight : 0;
    setProgress(newProgress);
    setIsVisible(scrollTop > THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
    };
  }, [updateProgress]);

  return { progress, isVisible };
}

export function useBackToTopStrokeDashoffset(progress: number): string {
  const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;
  return String(offset);
}
