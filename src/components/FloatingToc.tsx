"use client"

import { motion, AnimatePresence, useSpring } from "framer-motion"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useToc } from "./TocContext"

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export default function FloatingToc({ toc }: { toc?: Heading[] }) {
  const { isTocOpen: open, setIsTocOpen: setOpen } = useToc()
  const [activeId, setActiveId] = useState("")
  const listContainerRef = useRef<HTMLElement | null>(null)
  const isUserInteractingRef = useRef(false)
  const interactTimerRef = useRef<number | null>(null)
  const tickingRef = useRef(false)

  const tocItems = useMemo(() => {
    return (toc || [])
      .filter((item) => item.depth >= 2 && item.depth <= 4)
      .map((item) => ({ ...item, targetId: item.slug, url: `#${item.slug}` }))
      .filter((item) => item.targetId)
  }, [toc])

  const tocIds = useMemo(() => {
    return tocItems.map((item) => item.targetId)
  }, [tocItems])

  const activeIndex = useMemo(() => {
    if (!activeId) return -1
    return tocItems.findIndex((item) => item.targetId === activeId)
  }, [activeId, tocItems])

  const progressLabel = useMemo(() => {
    if (!tocItems.length) return "0%"
    if (activeIndex < 0) return "0%"
    const percent = Math.round(((activeIndex + 1) / tocItems.length) * 100)
    return `${percent}%`
  }, [activeIndex, tocItems.length])

  const updateActiveToc = useCallback(() => {
    if (!tocIds.length) {
      setActiveId("")
      return
    }

    const headings = tocIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node))

    if (!headings.length) {
      setActiveId("")
      return
    }

    const viewportHeight = window.innerHeight
    // 调整检测阈值实现正文滚动到近中间位置时即切换高亮
    const threshold = viewportHeight * 0.45

    let currentActive = ""

    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i]
      const rect = heading.getBoundingClientRect()
      
      if (rect.top <= threshold) {
        currentActive = heading.id
        break
      }
    }

    if (!currentActive && window.scrollY < 100) {
      setActiveId("")
    } else if (currentActive) {
      setActiveId(currentActive)
    }
  }, [tocIds])

  useEffect(() => {
    if (!tocIds.length) return

    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      window.requestAnimationFrame(() => {
        updateActiveToc()
        tickingRef.current = false
      })
    }

    const onHashChange = () => updateActiveToc()
    document.addEventListener("scroll", onScroll, { capture: true, passive: true })
    window.addEventListener("hashchange", onHashChange)
    const initTimer = window.setTimeout(updateActiveToc, 80)

    return () => {
      document.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("hashchange", onHashChange)
      window.clearTimeout(initTimer)
    }
  }, [tocIds, updateActiveToc])

  useEffect(() => {
    if (!open || !activeId || isUserInteractingRef.current || !listContainerRef.current) return

    const container = listContainerRef.current
    const activeLink = container.querySelector<HTMLAnchorElement>(`a[data-target="${activeId}"]`)
    if (!activeLink) return

    const scrollToIndex = () => {
      const containerRect = container.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      const relativeTop = linkRect.top - containerRect.top
      const currentScrollTop = container.scrollTop
      
      const isPastLowerBound = relativeTop > container.clientHeight * 0.75
      const isPastUpperBound = relativeTop < container.clientHeight * 0.25
      
      if (isPastLowerBound || isPastUpperBound) {
        // 让偏航过多的高亮项永远优雅地回归至视觉居中
        const targetScrollTop = currentScrollTop + relativeTop - (container.clientHeight * 0.5)
        
        container.scrollTo({
          top: targetScrollTop,
          behavior: "smooth"
        })
      }
    }

    const timer = setTimeout(scrollToIndex, 100)
    return () => clearTimeout(timer)
  }, [activeId, open])

  // 处理面板初次打开时的对齐
  useEffect(() => {
    if (open && activeId && listContainerRef.current) {
      const container = listContainerRef.current
      const timer = setTimeout(() => {
        const activeLink = container.querySelector<HTMLAnchorElement>(`a[data-target="${activeId}"]`)
        if (activeLink) {
          const containerRect = container.getBoundingClientRect()
          const linkRect = activeLink.getBoundingClientRect()
          const relativeTop = linkRect.top - containerRect.top
          const targetScrollTop = container.scrollTop + relativeTop - (container.clientHeight * 0.5)
          container.scrollTo({
            top: targetScrollTop,
            behavior: "smooth"
          })
        }
      }, 300) 
      return () => clearTimeout(timer)
    }
  }, [activeId, open])

  useEffect(() => {
    if (!open || !listContainerRef.current) return

    const handleInteraction = () => {
      isUserInteractingRef.current = true
      if (interactTimerRef.current) {
        window.clearTimeout(interactTimerRef.current)
      }
      interactTimerRef.current = window.setTimeout(() => {
        isUserInteractingRef.current = false
      }, 500)
    }

    const container = listContainerRef.current
    container.addEventListener("wheel", handleInteraction, { passive: true })
    container.addEventListener("touchstart", handleInteraction, { passive: true })
    container.addEventListener("touchmove", handleInteraction, { passive: true })

    return () => {
      container.removeEventListener("wheel", handleInteraction)
      container.removeEventListener("touchstart", handleInteraction)
      container.removeEventListener("touchmove", handleInteraction)
      if (interactTimerRef.current) {
        window.clearTimeout(interactTimerRef.current)
        interactTimerRef.current = null
      }
      isUserInteractingRef.current = false
    }
  }, [open])

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
          bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))] h-14 w-14 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden
          bg-background/80 backdrop-blur-2xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]
          xl:top-[50%] xl:left-auto xl:right-[max(0.75rem,calc(env(safe-area-inset-right)+0.75rem))] xl:bottom-auto xl:h-12 xl:w-auto xl:min-w-[52px] xl:px-3.5 xl:-translate-y-1/2 xl:rounded-full 
          left-[var(--layout-floating-mobile-left)]
          xl:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] xl:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)]
          text-foreground/80
          ${open 
            ? "text-accent !bg-accent/10 xl:opacity-0 xl:pointer-events-none" 
            : "text-foreground/80 hover:text-accent"
          }`}
      >
        {/* 阅读进度背景深度填充 (仅移动端，且非打开状态) */}
        {!open && (
           <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-accent/5 xl:hidden pointer-events-none"
            initial={{ height: 0 }}
            animate={{ height: `${tocProgress * 100}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
           />
        )}
        <motion.div 
          className="relative h-5 w-5 flex-shrink-0 z-10 flex flex-col items-center justify-center"
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
              x: open ? 10 : 0
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
            className="fixed bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+6.5rem))] left-4 z-[70] flex max-h-[45vh] w-[min(85vw,300px)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/95 backdrop-blur-2xl shadow-2xl xl:bottom-auto xl:top-20 xl:left-auto xl:right-3 2xl:right-10 xl:h-auto xl:max-h-[calc(100vh-14rem)] xl:w-[260px] xl:rounded-none xl:border-none xl:bg-transparent xl:shadow-none xl:transform-none select-none"
          >
            <div className="flex items-center justify-between px-2 pt-1 pb-1 xl:pl-0">
              <h3 className="text-[13px] font-bold tracking-widest text-foreground/70 uppercase">
                目录
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="收起目录"
                className="flex h-6 w-6 items-center justify-center rounded-sm text-foreground/40 transition-all hover:bg-muted hover:text-foreground/80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="flex flex-1 flex-col px-1.5 pt-0 pb-0 min-h-0 sm:px-2 xl:px-0">
              <nav
                ref={listContainerRef}
                className="min-h-0 flex-1 overflow-y-auto pr-1"
                style={{
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                  WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 95%, transparent 100%)",
                  maskImage: "linear-gradient(to bottom, black 0%, black 95%, transparent 100%)",
                } as React.CSSProperties}
              >
                <ul className="relative pt-1.5 pb-6 space-y-[2px] border-l border-border/80 text-[0.8rem]">
                  {tocItems.map((item, index) => {
                    const isActive = activeId === item.targetId
                    return (
                      <li key={`${item.url}-${index}`} className="relative leading-normal">
                        <a
                          href={item.url}
                          data-target={item.targetId}
                          aria-current={isActive ? "location" : undefined}
                          onClick={() => {
                            if (window.innerWidth < 1280) { // xl breakpoint
                              setOpen(false)
                            }
                          }}
                          className={`group relative flex items-start py-1.5 transition-colors duration-200 ${
                            isActive
                              ? "text-accent font-medium"
                              : "text-foreground/60 hover:text-foreground/90"
                          }`}
                          style={{
                            paddingLeft: `${Math.max(0, item.depth - 2) * 12 + 10}px`,
                            fontSize: item.depth === 2 ? "13px" : "12.5px"
                          }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="active-toc-indicator"
                              className="absolute left-[-1.5px] top-1 bottom-1 w-[2.5px] bg-accent"
                              transition={{
                                type: "tween",
                                ease: [0.25, 1, 0.5, 1],
                                duration: 0.4
                              }}
                            />
                          )}
                          <span className={isActive ? "whitespace-normal break-words" : "truncate"}>
                            {item.text}
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </nav>
              <style dangerouslySetInnerHTML={{ __html: `
                #floating-toc-panel nav::-webkit-scrollbar {
                  display: none;
                }
              `}} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
