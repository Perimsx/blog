"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBackToTop } from "@/hooks/useBackToTop";

export const BackToTop: React.FC = () => {
  const { isVisible } = useBackToTop();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isMounted) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.button
            key="back-to-top"
            id="back-to-top-btn"
            className="fixed z-50 flex h-9 w-9 items-center justify-center rounded-sm bg-background/90 text-slate-500 shadow-md ring-1 ring-border/50 backdrop-blur-sm transition-all hover:text-accent dark:ring-foreground/10 sm:h-10 sm:w-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            aria-label="回到顶部"
            onClick={handleClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`
        #back-to-top-btn {
          right: var(--layout-floating-mobile-right) !important;
          bottom: var(--layout-floating-mobile-bottom) !important;
        }
        @media (min-width: 640px) {
          #back-to-top-btn {
            right: var(--layout-floating-right) !important;
            bottom: var(--layout-floating-bottom) !important;
          }
        }
      `}</style>
    </>
  );
};
