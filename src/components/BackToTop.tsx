"use client";

import React from "react";
import { useBackToTop, useBackToTopStrokeDashoffset } from "@/hooks/useBackToTop";

export const BackToTop: React.FC = () => {
  const { progress, isVisible } = useBackToTop();
  const strokeDashoffset = useBackToTopStrokeDashoffset(progress);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <button
        id="back-to-top"
        className={[
          "layout-floating-anchor fixed z-50 transition-all duration-500 group",
          isVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        ].join(" ")}
        style={{
          right: "var(--layout-floating-mobile-right)",
          bottom: "var(--layout-floating-mobile-bottom)",
        }}
        aria-label="Back to Top"
        onClick={handleClick}
      >
        <div className="relative flex size-12 items-center justify-center">
          <svg
            className="absolute inset-0 size-12 -rotate-90"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              className="text-foreground/10"
            />
            <circle
              id="scroll-progress-ring"
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="125.66"
              strokeDashoffset={strokeDashoffset}
              className="text-accent transition-[stroke-dashoffset] duration-100"
            />
          </svg>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground/60 group-hover:text-accent transition-all duration-300 group-hover:-translate-y-0.5"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </div>

        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Top
        </span>
      </button>

      <style>{`
        @media (min-width: 640px) {
          #back-to-top {
            top: auto !important;
            right: var(--layout-floating-right) !important;
            bottom: var(--layout-floating-bottom) !important;
          }
        }
      `}</style>
    </>
  );
};
