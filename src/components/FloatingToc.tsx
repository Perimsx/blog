"use client";

import { AnimatePresence, motion, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToc } from "./TocContext";

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export default function FloatingToc({ toc }: { toc?: Heading[] }) {
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

  const activeIndex = useMemo(() => {
    if (!activeId) return -1;
    return tocItems.findIndex((item) => item.targetId === activeId);
  }, [activeId, tocItems]);

  const progressLabel = useMemo(() => {
    if (!tocItems.length) return "0%";
    if (activeIndex < 0) return "0%";
    const percent = Math.round(((activeIndex + 1) / tocItems.length) * 100);
    return `${percent}%`;
  }, [activeIndex, tocItems.length]);

  useEffect(() => {
    if (!tocIds.length) return;

    // 维护所有标题的可见性状态
    const headingStates = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          headingStates.set(entry.target.id, entry.isIntersecting);
        });

        // 找到最后一个在“激活区”及其上方的标题
        // 激活区由 rootMargin 定义，这里设置为视口顶部到 25% 处
        let lastId = "";
        for (const id of tocIds) {
          if (headingStates.get(id)) {
            lastId = id;
          }
        }

        if (lastId) {
          setActiveId(lastId);
        } else if (window.scrollY < 100) {
          // 页面顶部兜底
          setActiveId("");
        }
      },
      {
        // 捕捉落在视口上半部分 25% 区域内及上方的标题
        // 将顶部 margin 设为 100% 确保已通过的标题依然被记为可见，维持状态连续性
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
      const currentScrollTop = container.scrollTop;

      const isPastLowerBound = relativeTop > container.clientHeight * 0.75;
      const isPastUpperBound = relativeTop < container.clientHeight * 0.25;

      if (isPastLowerBound || isPastUpperBound) {
        // 让偏航过多的高亮项永远优雅地回归至视觉居中
        const targetScrollTop = currentScrollTop + relativeTop - container.clientHeight * 0.5;

        container.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      }
    };

    const timer = setTimeout(scrollToIndex, 100);
    return () => clearTimeout(timer);
  }, [activeId, open]);

  // 处理面板初次打开时的对齐
  useEffect(() => {
    if (open && activeId && listContainerRef.current) {
      const container = listContainerRef.current;
      const timer = setTimeout(() => {
        const activeLink = container.querySelector<HTMLAnchorElement>(
          `a[data-target="${activeId}"]`
        );
        if (activeLink) {
          const containerRect = container.getBoundingClientRect();
          const linkRect = activeLink.getBoundingClientRect();
          const relativeTop = linkRect.top - containerRect.top;
          const targetScrollTop = container.scrollTop + relativeTop - container.clientHeight * 0.5;
          container.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeId, open]);

  useEffect(() => {
    if (!open || !listContainerRef.current) return;

    const handleInteraction = () => {
      isUserInteractingRef.current = true;
      if (interactTimerRef.current) {
        window.clearTimeout(interactTimerRef.current);
      }
      interactTimerRef.current = window.setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 500);
    };

    const container = listContainerRef.current;
    container.addEventListener("wheel", handleInteraction, { passive: true });
    container.addEventListener("touchstart", handleInteraction, { passive: true });
    container.addEventListener("touchmove", handleInteraction, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleInteraction);
      container.removeEventListener("touchstart", handleInteraction);
      container.removeEventListener("touchmove", handleInteraction);
      if (interactTimerRef.current) {
        window.clearTimeout(interactTimerRef.current);
        interactTimerRef.current = null;
      }
      isUserInteractingRef.current = false;
    };
  }, [open]);

  const mouseX = useSpring(0, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(0, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x * 0.35);
    mouseY.set(y * 0.35);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (!tocItems.length) return null;

  return (
    <>
      <style>{`
        #floating-toc-btn {
          right: var(--layout-floating-mobile-right) !important;
          bottom: calc(var(--layout-floating-mobile-bottom) + 3.5rem) !important;
          top: auto !important;
        }
        @media (min-width: 640px) {
          #floating-toc-btn {
            right: var(--layout-floating-right) !important;
            bottom: calc(var(--layout-floating-bottom) + 3.8rem) !important;
          }
        }
      `}</style>

      <motion.button
        id="floating-toc-btn"
        type="button"
        aria-label={open ? "关闭目录" : "打开目录"}
        aria-expanded={open}
        aria-controls="floating-toc-panel"
        onClick={() => setOpen(!open)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          x: mouseX,
          y: mouseY,
        }}
        className={`group fixed z-50 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[0.85rem] bg-background shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-foreground/[0.04] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] dark:ring-foreground/[0.08] transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] active:scale-95 ${open ? "opacity-0 pointer-events-none scale-90 translate-x-4" : "opacity-100 scale-100"}`}
      >
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
          className="text-slate-500 transition-colors group-hover:text-accent dark:text-slate-400"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="18" y2="18" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            id="floating-toc-panel"
            key="toc-panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-3 bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+6.5rem))] z-[105] flex max-h-[40vh] w-[min(80vw,272px)] flex-col overflow-hidden rounded-xl border border-border/55 bg-background/95 backdrop-blur-2xl shadow-xl xl:bottom-auto xl:top-20 xl:left-auto xl:right-3 2xl:right-10 xl:h-auto xl:max-h-[calc(100vh-15rem)] xl:w-[228px] xl:rounded-none xl:border-none xl:bg-transparent xl:shadow-none xl:transform-none select-none"
          >
            <div className="flex items-center justify-between px-1.5 pt-0.5 pb-0.5 xl:px-0">
              <h3 className="text-[12px] font-semibold tracking-[0.18em] text-foreground/65 uppercase">
                目录
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="收起目录"
                className="flex h-5 w-5 items-center justify-center rounded-sm text-foreground/40 transition-all hover:bg-muted/70 hover:text-foreground/75"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-1 pt-0 pb-0 sm:px-1.5 xl:px-0">
              <nav
                ref={listContainerRef}
                className="min-h-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={
                  {
                    msOverflowStyle: "none",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, black 95%, transparent 100%)",
                    maskImage: "linear-gradient(to bottom, black 0%, black 95%, transparent 100%)",
                  } as React.CSSProperties
                }
              >
                <ul className="relative border-l border-border/70 pt-1 pb-4 text-[0.78rem] space-y-px">
                  {tocItems.map((item) => {
                    const isActive = activeId === item.targetId;
                    return (
                      <li key={item.targetId} className="relative leading-normal">
                        <a
                          href={item.url}
                          data-target={item.targetId}
                          aria-current={isActive ? "location" : undefined}
                          onClick={() => {
                            if (window.innerWidth < 1280) {
                              // xl breakpoint
                              setOpen(false);
                            }
                          }}
                          className={`group relative flex items-start py-1 transition-colors duration-200 ${
                            isActive
                              ? "text-accent font-medium"
                              : "text-foreground/60 hover:text-foreground/90"
                          }`}
                          style={{
                            paddingLeft: `${Math.max(0, item.depth - 2) * 10 + 8}px`,
                            fontSize: item.depth === 2 ? "12.5px" : "12px",
                          }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="active-toc-indicator"
                              className="absolute top-1 bottom-1 left-[-1px] w-[2px] bg-accent"
                              transition={{
                                type: "tween",
                                ease: [0.25, 1, 0.5, 1],
                                duration: 0.4,
                              }}
                            />
                          )}
                          <span className={isActive ? "whitespace-normal break-words" : "truncate"}>
                            {item.text}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
