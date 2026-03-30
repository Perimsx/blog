"use client";

import React, { useState, useCallback } from "react";
import TableOfContents from "@/components/TableOfContents";

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface MobileTOCProps {
  headings: Heading[];
}

export const MobileTOC: React.FC<MobileTOCProps> = ({ headings }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen((prev) => !prev);
  }, []);

  const handleOverlayClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <style>{`
        .custom-scrollbar-mobile::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar-mobile {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="xl:hidden">
        <button
          id="mobile-toc-fab"
          className="fixed layout-floating-anchor z-40 p-3.5 bg-background shadow-xl border border-border rounded-full text-foreground hover:text-accent focus:ring-4 ring-accent/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center cursor-pointer"
          aria-label="打开目录"
          onClick={toggleDrawer}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
            <line x1="3" x2="3.01" y1="6" y2="6" />
            <line x1="3" x2="3.01" y1="12" y2="12" />
            <line x1="3" x2="3.01" y1="18" y2="18" />
          </svg>
        </button>

        <div
          id="mobile-toc-overlay"
          className={`fixed inset-0 z-[60] bg-background/50 backdrop-blur-sm transition-opacity duration-400 ease-out ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={handleOverlayClick}
        />

        <div
          id="mobile-toc-drawer"
          className={`fixed bottom-0 left-0 right-0 z-[70] bg-background border-t border-border/60 rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] max-h-[85vh] flex flex-col ${isOpen ? "translate-y-0 pointer-events-auto" : "translate-y-full pointer-events-none"}`}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-3.5 w-12 h-1.5 bg-muted rounded-full" />

          <div className="flex items-center justify-between px-6 pt-9 pb-4 border-b border-border/40">
            <h2 className="text-lg font-bold text-foreground">文章目录</h2>
            <button
              id="mobile-toc-close"
              className="p-1.5 -mr-1.5 bg-muted/40 rounded-full text-foreground/70 hover:text-accent hover:bg-accent/10 transition-colors"
              aria-label="关闭"
              onClick={toggleDrawer}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-4 overflow-y-auto w-full custom-scrollbar-mobile">
            <TableOfContents headings={headings} hideTitle={true} />
          </div>
        </div>
      </div>
    </>
  );
};
