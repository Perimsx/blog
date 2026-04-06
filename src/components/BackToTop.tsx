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
            className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-xl border border-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all active:scale-95 hover:border-accent/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
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
                strokeWidth="2"
                className="text-foreground/[0.03] dark:text-foreground/[0.06]"
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
                style={{ strokeDasharray: circumference }}
                className="text-accent"
              />
            </svg>

            {/* 内部图标 */}
            <motion.div
              className="relative z-10 flex flex-col items-center justify-center overflow-hidden h-full w-full"
              animate={isHovered ? { y: -2 } : { y: 0 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground/60 group-hover:text-accent transition-colors"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    key="hover-label"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-2 text-[8px] font-bold tracking-tight text-accent/80 uppercase"
                  >
                    Top
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 悬浮光晕 */}
            {isHovered && (
              <motion.div
                layoutId="glow"
                className="absolute inset-[-4px] rounded-full bg-accent/5 blur-md -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
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

