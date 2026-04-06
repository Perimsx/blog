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
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  if (!isMounted) return null;

  return (
    <>
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="back-to-top"
          id="back-to-top-group"
          className="fixed z-50 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10, transition: { duration: 0.2 } }}
          style={{
            right: "var(--layout-floating-mobile-right)",
            bottom: "var(--layout-floating-mobile-bottom)",
          }}
          aria-label="回到顶部"
        >
          <motion.button
            className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-[1.15rem] bg-background/60 backdrop-blur-2xl ring-1 ring-foreground/[0.06] dark:ring-foreground/[0.1] shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all hover:bg-background/90 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            whileHover={{ scale: 1.05 }}
            style={{ x: mouseX, y: mouseY }}
          >
            {/* 进度环背景 */}
            <svg
              className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none"
              viewBox="0 0 54 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="27"
                cy="27"
                r={radius}
                stroke="currentColor"
                className="text-foreground/[0.06] dark:text-foreground/[0.1]"
              />
              {/* 动态进度环 */}
              <motion.circle
                cx="27"
                cy="27"
                r={radius}
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                className="text-foreground/40 dark:text-foreground/50 group-hover:text-foreground/80 dark:group-hover:text-foreground/90 transition-colors"
              />
            </svg>

            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground/50 group-hover:text-foreground/90 transition-colors"
              >
                <path d="m18 15-6-6-6 6" />
              </svg>
            </div>
          </motion.button>
        </motion.div>
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

