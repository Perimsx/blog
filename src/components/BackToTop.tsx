"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useBackToTop } from "@/hooks/useBackToTop";

export const BackToTop: React.FC = () => {
  const { progress, isVisible } = useBackToTop();
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 磁力效果逻辑
  const mouseX = useSpring(0, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(0, { stiffness: 150, damping: 15 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x * 0.35);
    mouseY.set(y * 0.35);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  // 进度环参数
  const radius = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  if (!isMounted) return null;

  return (
    <>
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="back-to-top"
          id="back-to-top-btn"
          className="layout-floating-anchor group fixed z-50 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[0.85rem] bg-background shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-foreground/[0.04] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] dark:ring-foreground/[0.08] transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] active:scale-95"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10, transition: { duration: 0.2 } }}
          style={{
            x: mouseX,
            y: mouseY,
          }}
          aria-label="回到顶部"
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
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
              className="text-slate-500 transition-colors group-hover:text-accent dark:text-slate-400"
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

