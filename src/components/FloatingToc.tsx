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

  const tocProgress = useMemo(() => {
    if (!tocItems.length || activeIndex < 0) return 0;
    return (activeIndex + 1) / tocItems.length;
  }, [activeIndex, tocItems.length]);

  const mouseX = useSpring(0, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(0, { stiffness: 150, damping: 15 });
  const [isHovered, setIsHovered] = useState(false);

  // 进度环参数
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - tocProgress * circumference;

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

  if (!tocItems.length) return null;

  return (
    <>
      <motion.button
        type="button"
        aria-label={open ? "关闭目录" : "打开目录"}
        aria-expanded={open}
        aria-controls="floating-toc-panel"
        onClick={() => setOpen(!open)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          x: mouseX,
          y: mouseY,
        }}
        className={`group fixed z-[90] flex items-center justify-center transition-all duration-300 
          top-[34vh] right-[max(0.35rem,calc(env(safe-area-inset-right)+0.15rem))] h-9 w-[4.6rem] -translate-y-1/2 overflow-hidden rounded-l-full rounded-r-none border border-r-0 border-border/60 bg-background/92 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.32)] backdrop-blur-xl
          xl:top-[50%] xl:left-auto xl:right-[max(0.75rem,calc(env(safe-area-inset-right)+0.75rem))] xl:bottom-auto xl:h-12 xl:w-auto xl:min-w-[52px] xl:px-3.5 xl:rounded-full xl:border xl:border-border/0 
          xl:overflow-hidden xl:shadow-[0_8px_30px_rgba(0,0,0,0.12)] xl:bg-background/80 xl:backdrop-blur-2xl dark:xl:shadow-[0_8px_30px_rgb(0,0,0,0.3)]
          xl:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] xl:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)]
          text-foreground/80
          ${
            open
              ? "text-accent opacity-0 pointer-events-none"
              : "text-foreground/80 hover:text-accent"
          }`}
      >
        {/* 阅读进度背景深度填充 (仅移动端，且非打开状态) */}
        {!open && (
          <motion.div
            className="absolute inset-0 bg-accent/8 xl:hidden pointer-events-none"
            initial={{ width: 0 }}
            animate={{ width: `${tocProgress * 100}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
        )}

        <div className="relative z-10 flex h-full w-full items-center justify-center gap-1.5 xl:hidden">
          <svg
            aria-hidden="true"
            className="h-[0.95rem] w-[0.95rem] shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5h14M5 12h10M5 16.5h12"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
          </svg>
          <span className="text-[10px] font-semibold tracking-[0.06em] text-current/68">
            {progressLabel}
          </span>
        </div>

        <motion.div
          className="relative z-10 hidden h-5 w-5 flex-shrink-0 flex-col items-center justify-center xl:flex"
          animate={isHovered && !open ? { y: -2 } : { y: 0 }}
        >
          <motion.div
            initial={false}
            animate={{
              rotate: open ? 45 : 0,
              y: open ? 0 : -6,
            }}
            className="absolute top-1/2 left-0 h-[2.5px] w-5 origin-center rounded-full bg-current"
          />
          <motion.div
            initial={false}
            animate={{
              opacity: open ? 0 : 1,
              x: open ? 10 : 0,
            }}
            className="absolute top-1/2 left-0 h-[2.5px] w-3.5 -translate-y-1/2 rounded-full bg-current"
          />
          <motion.div
            initial={false}
            animate={{
              rotate: open ? -45 : 0,
              y: open ? 0 : 6,
            }}
            className="absolute top-1/2 left-0 h-[2.5px] w-5 origin-center rounded-full bg-current"
          />

          <AnimatePresence>
            {isHovered && !open && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 16 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute hidden xl:block text-[8px] font-bold tracking-tight text-accent/80 uppercase whitespace-nowrap"
              >
                Menu
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <span className="hidden text-[14px] font-black tracking-tighter transition-colors xl:ml-2 xl:inline-block group-hover:text-accent">
          {progressLabel}
        </span>

        {/* 悬浮光晕 */}
        {isHovered && !open && (
          <motion.div
            layoutId="glow-toc"
            className="absolute inset-[-4px] rounded-full bg-accent/5 blur-md -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
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
