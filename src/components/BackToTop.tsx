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
            className="layout-floating-anchor group fixed z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-lg ring-1 ring-foreground/[0.04] transition-[box-shadow,transform] duration-200 hover:shadow-xl dark:shadow-black/20 dark:ring-foreground/[0.08] sm:h-10 sm:w-10"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-500 transition-colors group-hover:text-accent dark:text-slate-400"
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
