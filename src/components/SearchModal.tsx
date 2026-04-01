"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearch } from "@/hooks/useSearch";

export const SearchModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    searchState,
    activeResultIndex,
    performSearch,
    navigateToResult,
    moveActiveResult,
    getCurrentActiveUrl,
  } = useSearch();

  const openModal = useCallback(() => {
    setIsOpen(true);
    setIsOpening(true);
    setTimeout(() => {
      setIsOpening(false);
      inputRef.current?.focus();
    }, 50);
  }, []);

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setQuery("");
      performSearch("");
    }, 200);
  }, [performSearch]);

  useEffect(() => {
    const handleOpen = () => openModal();
    document.addEventListener("open-search-modal", handleOpen);
    return () => document.removeEventListener("open-search-modal", handleOpen);
  }, [openModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        isOpen ? closeModal() : openModal();
        return;
      }
      if (e.key === "Escape" && isOpen) {
        closeModal();
      } else if (isOpen) {
        if (e.key === "ArrowDown") { e.preventDefault(); moveActiveResult("down"); }
        else if (e.key === "ArrowUp") { e.preventDefault(); moveActiveResult("up"); }
        else if (e.key === "Enter" && document.activeElement === inputRef.current) {
          const url = getCurrentActiveUrl();
          if (url) { e.preventDefault(); navigateToResult(url); }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, openModal, closeModal, moveActiveResult, getCurrentActiveUrl, navigateToResult]);

  useEffect(() => {
    if (activeResultIndex >= 0 && scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeResultIndex]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    void performSearch(e.target.value);
  };

  const flatItems = useMemo(() => {
    if (searchState.status !== "results" && searchState.status !== "loading") return [];
    const items = searchState.items || [];
    return items.flatMap(item => [
      { type: 'page', title: item.title, url: item.pageUrl, excerpt: item.excerpt, parentTitle: "" },
      ...item.matches.map(m => ({ type: 'match', title: m.heading, url: m.url, excerpt: m.excerpt, parentTitle: item.title }))
    ]);
  }, [searchState]);

  if (!isOpen && !isClosing) return null;

  return (
    <>
      <style>{`
        .search-shell {
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.1), 0 20px 50px -12px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s;
        }
        .search-shell.is-glow {
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3), 0 0 20px rgba(37, 99, 235, 0.15), 0 25px 60px -12px rgba(0, 0, 0, 0.2);
        }
        .search-item.is-active {
          background-color: var(--color-muted);
        }
        .search-highlight {
          color: var(--color-accent);
          font-weight: 600;
        }
        .search-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .search-scroll::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
      `}</style>

      <div className="fixed inset-0 isolate z-[200] flex items-center justify-center overflow-y-auto px-4 py-10 sm:px-6">
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-[4px] dark:bg-black/50" onClick={closeModal} />

        <div className={`relative z-10 w-full max-w-2xl transition-all duration-200 ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
          <div className="search-shell is-glow flex flex-col overflow-hidden rounded-xl border border-blue-100 bg-[#ffffff] dark:bg-[#020617] opacity-100">
            
            {/* Header: Fixed Input */}
            <div className="relative flex items-center gap-3 px-4 py-3 sm:px-5">
              <svg className="shrink-0 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="键入开始搜索"
                className="w-full bg-transparent text-[1rem] font-medium text-slate-700 outline-none placeholder:text-slate-300 dark:text-slate-200"
                value={query}
                onChange={handleInput}
              />
              <button onClick={closeModal} className="p-1 text-slate-300 hover:text-slate-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Results List */}
            {query && (
              <div ref={scrollRef} className="search-scroll max-h-[65vh] overflow-y-auto border-t border-slate-50 dark:border-slate-900">
                {searchState.status === "loading" && flatItems.length === 0 && (
                   <div className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">正在搜索结果...</div>
                )}

                {searchState.status === "empty" && (
                  <div className="px-5 py-8 text-center text-slate-400 underline decoration-slate-200 underline-offset-8">
                     未找到相关内容
                  </div>
                )}

                {flatItems.length > 0 && (
                  <div className="flex flex-col">
                    {flatItems.map((item, i) => (
                      <button
                        key={item.url + i}
                        data-active={activeResultIndex === i}
                        onClick={() => navigateToResult(item.url)}
                        className={`search-item group flex flex-col gap-1 border-b border-slate-50 px-5 py-3.5 text-left transition-colors last:border-0 dark:border-slate-900 ${
                          activeResultIndex === i ? 'is-active' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5 text-[0.92rem] font-bold text-slate-700 dark:text-slate-200">
                            {item.type === 'match' ? (
                               <>
                                 <span className="truncate opacity-60">{item.parentTitle}</span>
                                 <span className="shrink-0 text-slate-300 opacity-50 font-normal">›</span>
                                 <span className="shrink-0 text-blue-500 dark:text-blue-400">Section 1</span>
                                 <span className="truncate text-blue-500 dark:text-blue-400 font-medium">{item.title}</span>
                               </>
                            ) : (
                               <span className="truncate">{item.title}</span>
                            )}
                          </div>
                        </div>
                        {item.excerpt && (
                          <p 
                            className="line-clamp-2 text-[0.82rem] leading-relaxed text-slate-500 dark:text-slate-400"
                            dangerouslySetInnerHTML={{ 
                                __html: item.excerpt.replace(/<mark>(.*?)<\/mark>/g, '<span class="search-highlight">$1</span>') 
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {query && (
              <div className="flex items-center justify-center gap-4 border-t border-slate-50 bg-slate-50/50 px-5 py-2 text-[0.7rem] font-medium text-slate-400 dark:border-slate-900 dark:bg-slate-950">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 font-sans">↑↓</kbd> 切换</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 font-sans">Enter</kbd> 选择</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 font-sans">Esc</kbd> 关闭</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
