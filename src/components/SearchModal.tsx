"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearch } from "@/hooks/useSearch";
import { StatusPanel } from "@/components/StatusPanel";

export const SearchModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    searchState,
    activeResultIndex,
    performSearch,
    navigateToResult,
    moveActiveResult,
    getCurrentActiveUrl,
  } = useSearch();

  const openModal = useCallback(async () => {
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
    }, 220);
  }, []);

  // Listen for open events
  useEffect(() => {
    const handleOpen = () => void openModal();
    document.addEventListener("open-search-modal", handleOpen);
    return () => document.removeEventListener("open-search-modal", handleOpen);
  }, [openModal]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          closeModal();
        } else {
          void openModal();
        }
        return;
      }

      if (e.key === "Escape" && isOpen) {
        closeModal();
        return;
      }

      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveActiveResult("down");
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveActiveResult("up");
        return;
      }

      if (e.key === "Enter" && document.activeElement === inputRef.current) {
        const url = getCurrentActiveUrl();
        if (url) {
          e.preventDefault();
          navigateToResult(url);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, openModal, closeModal, moveActiveResult, getCurrentActiveUrl, navigateToResult]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    void performSearch(value);
  };

  const handleResultClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    navigateToResult(url);
  };

  const isExpanded = searchState.status === "results" || searchState.status === "loading";

  if (!isOpen && !isClosing) return null;

  return (
    <>
      <style>{`
        .search-shell.is-expanded {
          border-radius: 1.55rem;
          border-color: color-mix(in srgb, var(--color-accent) 82%, white);
          box-shadow: 0 26px 62px -34px rgba(37, 99, 235, 0.26), 0 0 0 1px rgba(37, 99, 235, 0.12);
        }
        html[data-theme="dark"] .search-shell.is-expanded {
          border-color: color-mix(in srgb, var(--color-accent) 80%, #0f172a);
          box-shadow: 0 26px 62px -34px rgba(14, 116, 244, 0.22), 0 0 0 1px rgba(59, 130, 246, 0.12);
        }
        .search-results-list {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.6) transparent;
          display: grid;
          gap: 0.15rem;
        }
        .search-result-card.is-active {
          background: color-mix(in srgb, var(--color-accent) 8%, white);
        }
        html[data-theme="dark"] .search-result-card.is-active {
          background: color-mix(in srgb, var(--color-accent) 12%, #0f172a);
        }
        .search-result-group {
          border-bottom: 1px solid rgba(226, 232, 240, 0.75);
        }
        html[data-theme="dark"] .search-result-group {
          border-bottom-color: rgba(30, 41, 59, 0.9);
        }
        .search-result-group:last-child {
          border-bottom: 0;
        }
        .search-result-meta-dot {
          width: 6px;
          height: 6px;
          border-radius: 99px;
          background-color: var(--color-accent);
          opacity: 0.6;
          flex-shrink: 0;
        }
        .search-result-badge {
          flex-shrink: 0;
          border-radius: 6px;
          background: color-mix(in srgb, var(--color-accent) 6%, #f1f5f9);
          padding: 0.15rem 0.45rem;
          font-size: 0.68rem;
          font-weight: 600;
          line-height: 1.2;
          color: color-mix(in srgb, var(--color-accent) 70%, #475569);
        }
        html[data-theme="dark"] .search-result-badge {
          background: color-mix(in srgb, var(--color-accent) 10%, #1e293b);
          color: color-mix(in srgb, var(--color-accent) 80%, #94a3b8);
        }
        .search-result-summary, .search-result-excerpt {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
        }
        .search-result-summary { -webkit-line-clamp: 1; }
        .search-result-excerpt { -webkit-line-clamp: 2; }
        .search-hints kbd {
          display: inline-flex;
          min-width: 1.6rem;
          align-items: center;
          justify-content: center;
          border-radius: 0.45rem;
          border: 1px solid rgba(148, 163, 184, 0.45);
          padding: 0.18rem 0.35rem;
          font-size: 0.76rem;
          line-height: 1;
          background: rgba(248, 250, 252, 0.9);
        }
        html[data-theme="dark"] .search-hints kbd {
          border-color: rgba(71, 85, 105, 0.9);
          background: rgba(15, 23, 42, 0.92);
        }
        #search-modal-input[type="search"]::-webkit-search-decoration,
        #search-modal-input[type="search"]::-webkit-search-cancel-button,
        #search-modal-input[type="search"]::-webkit-search-results-button,
        #search-modal-input[type="search"]::-webkit-search-results-decoration {
          display: none;
          -webkit-appearance: none;
        }
        #search-modal-input[type="search"]::-ms-clear,
        #search-modal-input[type="search"]::-ms-reveal {
          display: none;
          width: 0;
          height: 0;
        }
        @keyframes search-modal-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes search-modal-slide-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(8px); }
        }
        #search-modal-panel.is-opening .search-modal-header {
          animation: search-modal-slide-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        #search-modal-panel.is-closing .search-modal-header {
          animation: search-modal-slide-out 0.18s ease-in both;
        }
        @media (prefers-reduced-motion: reduce) {
          #search-modal-panel, #search-modal-panel * {
            animation: none !important;
            transition-duration: 0ms !important;
          }
        }
        @media (max-width: 640px) {
          .search-shell { border-radius: 1.05rem !important; }
          .search-shell.is-expanded { border-radius: 1.15rem !important; }
          .search-hints { gap: 0.75rem; font-size: 0.78rem; flex-wrap: wrap; }
        }
      `}</style>

      <div
        id="search-modal"
        className="fixed inset-0 isolate z-[130] overflow-y-auto"
        aria-labelledby="search-modal-input"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative flex min-h-screen items-start justify-center px-4 pt-[15vh] pb-8 sm:px-6">
          <div
            className="absolute inset-0 bg-slate-950/22 opacity-100 backdrop-blur-[12px] transition-opacity duration-300 dark:bg-black/72"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div
            id="search-modal-panel"
            className={[
              "relative isolate z-[131] w-full max-w-[46rem] transition-transform duration-300",
              isOpening ? "translate-y-0 scale-100 is-opening" : "",
              isClosing ? "translate-y-3 scale-[0.985] is-closing" : "",
              !isOpening && !isClosing ? "translate-y-3 scale-[0.985]" : "",
            ].join(" ")}
          >
            <form
              className={[
                "search-shell overflow-hidden rounded-[1.45rem] border border-[color:color-mix(in_srgb,var(--color-accent)_72%,white)] bg-white shadow-[0_20px_52px_-30px_rgba(37,99,235,0.28)] transition-[border-radius,box-shadow,border-color] duration-300 dark:border-[color:color-mix(in_srgb,var(--color-accent)_72%,#0f172a)] dark:bg-slate-950",
                isExpanded ? "is-expanded" : "",
              ].join(" ")}
            >
              <div className="search-modal-header flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
                <svg
                  className="shrink-0 text-slate-800 dark:text-slate-100"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7.5" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  id="search-modal-input"
                  ref={inputRef}
                  type="search"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="键入开始搜索"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[1rem] text-slate-900 outline-none placeholder:text-slate-400 sm:text-[1.08rem] dark:text-slate-100 dark:placeholder:text-slate-500"
                  value={query}
                  onChange={handleInput}
                />
                <button
                  onClick={closeModal}
                  className="inline-flex size-8 items-center justify-center rounded-full text-[color:color-mix(in_srgb,var(--color-accent)_88%,#1e3a8a)] transition-all duration-200 hover:rotate-90 hover:bg-[color:color-mix(in_srgb,var(--color-accent)_10%,white)] active:scale-95 dark:hover:bg-slate-800"
                  aria-label="关闭搜索"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              {(searchState.status === "results" || searchState.status === "loading" || searchState.status === "empty" || searchState.status === "unavailable" || searchState.status === "error") && (
                <div className="border-t border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-950">
                  <div className="search-results-list max-h-[52vh] overflow-y-auto pt-2 pb-3">
                    {searchState.status === "loading" && (
                      <div className="space-y-2.5 px-2 py-2.5 sm:px-3 sm:py-3">
                        <div className="h-20 animate-pulse rounded-[0.9rem] bg-slate-100 dark:bg-slate-800" />
                        <div className="h-20 animate-pulse rounded-[0.9rem] bg-slate-100 dark:bg-slate-800" />
                        <div className="h-20 animate-pulse rounded-[0.9rem] bg-slate-100 dark:bg-slate-800" />
                      </div>
                    )}

                    {searchState.status === "unavailable" && (
                      <div className="px-4 py-4">
                        <StatusPanel
                          variant="warning"
                          compact
                          title="搜索索引还没准备好"
                          description="先执行一次 npm run build，然后重启 npm run dev。"
                        />
                      </div>
                    )}

                    {searchState.status === "empty" && (
                      <div className="px-4 py-4">
                        <StatusPanel
                          variant="info"
                          compact
                          title={`没有找到和 "${query}" 相关的文章`}
                          description="试试更短的关键词，或者换一个标签词。"
                        />
                      </div>
                    )}

                    {searchState.status === "error" && (
                      <div className="px-4 py-4">
                        <StatusPanel
                          variant="error"
                          compact
                          title="搜索失败了"
                          description="刷新页面后再试一次；如果本地开发中仍有问题，先执行一次 npm run build。"
                        />
                      </div>
                    )}

                    {searchState.status === "results" && searchState.items.map((item, itemIndex) => (
                      <section key={item.pageUrl} className="search-result-group pt-1 pb-1.5">
                        <div className="mb-0.5">
                          <a
                            href={item.pageUrl}
                            data-search-result-link
                            data-result-index={itemIndex}
                            className={[
                              "search-result-card search-result-card--article group block px-4 py-2.5 text-left transition-all duration-150 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 sm:px-5",
                              activeResultIndex === itemIndex ? "is-active" : "",
                            ].join(" ")}
                            onClick={(e) => handleResultClick(e, item.pageUrl)}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="search-result-meta-dot" />
                                  <h3 className="truncate text-[0.92rem] font-semibold leading-5 text-slate-900 dark:text-slate-100 sm:text-[0.98rem]">
                                    {item.title}
                                  </h3>
                                </div>
                                <span className="search-result-badge shrink-0">
                                  {item.matches.length ? `${item.matches.length} 处命中` : "全文"}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-[0.76rem]">
                                <span className="font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500/80">文章</span>
                                <span className="text-slate-300 dark:text-slate-700">/</span>
                                <span className="truncate text-slate-400 dark:text-slate-500">{item.pathLabel}</span>
                              </div>
                              {item.excerpt && (
                                <p className="search-result-summary mt-1.5 text-[0.82rem] leading-5 text-slate-500 dark:text-slate-400">
                                  {item.excerpt}
                                </p>
                              )}
                            </div>
                          </a>
                        </div>
                        {item.matches.length > 0 && (
                          <div className="mx-4 ml-[2.35rem] space-y-0.5 border-l border-slate-200/70 dark:border-slate-800/80">
                            {item.matches.map((match, matchIndex) => {
                              const globalIndex = itemIndex + 1 + matchIndex;
                              return (
                                <a
                                  key={match.url}
                                  href={match.url}
                                  data-search-result-link
                                  data-result-index={globalIndex}
                                  className={[
                                    "search-result-card search-result-card--section block px-3 py-1.5 text-left transition-all duration-150 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 sm:px-4",
                                    activeResultIndex === globalIndex ? "is-active" : "",
                                  ].join(" ")}
                                  onClick={(e) => handleResultClick(e, match.url)}
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500/80">章节</span>
                                      <h4 className="truncate text-[0.86rem] font-medium leading-5 text-[color:var(--color-accent)] dark:text-sky-300">
                                        {match.heading}
                                      </h4>
                                    </div>
                                    <p className="search-result-excerpt mt-0.5 text-[0.78rem] leading-5 text-slate-500 dark:text-slate-400">
                                      {match.excerpt || "预览不可用"}
                                    </p>
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    ))}
                  </div>
                  <div className="search-hints mt-2.5 flex items-center justify-center gap-3 text-[0.8rem] text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1"><kbd>↑</kbd><kbd>↓</kbd> 切换</span>
                    <span className="inline-flex items-center gap-1"><kbd>↵</kbd> 选择</span>
                    <span className="inline-flex items-center gap-1"><kbd>Esc</kbd> 关闭</span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
