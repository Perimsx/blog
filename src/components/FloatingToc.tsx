"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useToc } from "./TocContext";

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

const TocItem = memo(function TocItem({
  item,
  isActive,
  onClose,
}: {
  item: { targetId: string; url: string; text: string; depth: number };
  isActive: boolean;
  onClose: () => void;
}) {
  const handleClick = (_e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.innerWidth < 1280) {
      onClose();
    }
  };

  return (
    <li className="relative leading-normal">
      <a
        href={item.url}
        data-target={item.targetId}
        aria-current={isActive ? "location" : undefined}
        onClick={handleClick}
        className={`group relative flex items-start py-0.5 transition-colors duration-200 ${
          isActive ? "text-accent font-medium" : "text-foreground/60 hover:text-foreground/90"
        }`}
        style={{
          paddingLeft: `${Math.max(0, item.depth - 2) * 8 + 6}px`,
          fontSize: item.depth === 2 ? "12px" : "11.5px",
        }}
      >
        {isActive && (
          <div className="absolute top-1 bottom-1 left-[-1px] w-[2px] bg-accent" />
        )}
        <span className={isActive ? "whitespace-normal break-words" : "truncate"}>{item.text}</span>
      </a>
    </li>
  );
});

const FloatingTocInner = memo(function FloatingTocInner({ toc }: { toc?: Heading[] }) {
  const { isTocOpen: open, setIsTocOpen: setOpen } = useToc();
  const [activeId, setActiveId] = useState("");
  const listContainerRef = useRef<HTMLElement | null>(null);
  const isUserInteractingRef = useRef(false);
  const interactTimerRef = useRef<number | null>(null);

  const tocItems = useMemo(() => {
    return (toc || [])
      .filter((item) => item.depth >= 2 && item.depth <= 4)
      .map((item) => ({ ...item, targetId: item.slug, url: `#${item.slug}` }))
      .filter((item) => item.targetId);
  }, [toc]);

  const tocIds = useMemo(() => {
    return tocItems.map((item) => item.targetId);
  }, [tocItems]);

  useEffect(() => {
    if (!tocIds.length) return;

    const headingStates = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          headingStates.set(entry.target.id, entry.isIntersecting);
        });

        let lastId = "";
        for (const id of tocIds) {
          if (headingStates.get(id)) {
            lastId = id;
          }
        }

        if (lastId) {
          setActiveId(lastId);
        } else if (window.scrollY < 100) {
          setActiveId("");
        }
      },
      {
        rootMargin: "100% 0px -75% 0px",
        threshold: 0,
      }
    );

    tocIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const onHashChange = () => {
      const rawHash = window.location.hash.replace("#", "");
      if (!rawHash) return;

      try {
        const decodedId = decodeURIComponent(rawHash);
        if (tocIds.includes(decodedId)) setActiveId(decodedId);
        else if (tocIds.includes(rawHash)) setActiveId(rawHash);
      } catch (e) {
        if (tocIds.includes(rawHash)) setActiveId(rawHash);
      }
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [tocIds]);

  useEffect(() => {
    if (!open || !activeId || isUserInteractingRef.current || !listContainerRef.current) return;

    const container = listContainerRef.current;
    const activeLink = container.querySelector<HTMLAnchorElement>(`a[data-target="${activeId}"]`);
    if (!activeLink) return;

    const scrollToIndex = () => {
      const containerRect = container.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const relativeTop = linkRect.top - containerRect.top;
      const targetScrollTop = container.scrollTop + relativeTop - container.clientHeight * 0.5;

      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    };

    const timer = setTimeout(scrollToIndex, 100);
    return () => clearTimeout(timer);
  }, [activeId, open]);

  if (!tocItems.length) return null;

  return (
    <>
      <style>{`
        #floating-toc-btn {
          right: var(--layout-floating-mobile-right) !important;
          bottom: calc(var(--layout-floating-mobile-bottom) + 2.75rem) !important;
        }
        @media (min-width: 640px) {
          #floating-toc-btn {
            right: var(--layout-floating-right) !important;
            bottom: calc(var(--layout-floating-bottom) + 3rem) !important;
          }
        }
      `}</style>

      <button
        id="floating-toc-btn"
        type="button"
        aria-label={open ? "关闭目录" : "打开目录"}
        onClick={() => setOpen(!open)}
        className={`fixed z-50 flex h-9 w-9 items-center justify-center rounded-sm bg-background/90 text-slate-500 shadow-md ring-1 ring-border/50 backdrop-blur-sm transition-all hover:text-accent dark:ring-foreground/10 sm:h-10 sm:w-10 ${open ? "pointer-events-none opacity-0" : "opacity-100"}`}
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
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="18" y2="18" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            id="floating-toc-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed right-2 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] z-[105] flex max-h-[45vh] w-[min(85vw,260px)] flex-col overflow-hidden rounded-sm border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl xl:bottom-auto xl:top-20 xl:right-3 xl:h-auto xl:max-h-[calc(100vh-15rem)] xl:w-[220px] xl:rounded-none xl:border-none xl:bg-transparent xl:shadow-none select-none"
          >
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1 xl:px-0 xl:pt-0.5 xl:pb-1">
              <h3 className="text-[11px] font-bold tracking-widest text-foreground/50 uppercase">
                目录
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-5 w-5 items-center justify-center rounded-sm text-foreground/40 transition-colors hover:bg-muted/50 hover:text-foreground/70"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-2 pb-3 xl:px-0 xl:pb-0">
              <nav
                ref={listContainerRef}
                className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <ul className="relative border-l border-border/50 py-1 text-[0.75rem] space-y-0.5 xl:pb-6">
                  {tocItems.map((item) => (
                    <TocItem
                      key={item.targetId}
                      item={item}
                      isActive={activeId === item.targetId}
                      onClose={() => setOpen(false)}
                    />
                  ))}
                </ul>
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
});

export default memo(FloatingTocInner);
