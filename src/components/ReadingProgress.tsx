"use client";

import { useState, useEffect } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = height > 0 ? (scrollTop / height) * 100 : 0;
      setProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="progress-container fixed top-0 z-10 h-1 w-full bg-background">
      <div
        className="progress-bar h-1 w-0 bg-accent transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
