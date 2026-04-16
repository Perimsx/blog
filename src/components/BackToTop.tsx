"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBackToTop } from "@/hooks/useBackToTop";

export const BackToTop: React.FC = () => {
  const { progress, isVisible } = useBackToTop();
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
          className="layout-floating-anchor group fixed z-50 flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-background shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-foreground/[0.04] transition-[opacity,box-shadow,transform] duration-150 hover:shadow-[0_6px_18px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] dark:ring-foreground/[0.08] dark:hover:shadow-[0_6px_18px_rgba(0,0,0,0.34)] sm:h-11 sm:w-11"
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.14 } }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="回到顶部"
          onClick={handleClick}
        >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-500 dark:text-slate-400 group-hover:text-accent"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </motion.button>
      )}
    </AnimatePresence>

    <style>{`
      @media (min-width: 640px) {
        #back-to-top-group {
          right: var(--layout-floating-right) !important;
          bottom: var(--layout-floating-bottom) !important;
        }
      }
    `}</style>
    </>
  );
};

