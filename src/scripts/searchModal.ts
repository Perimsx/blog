const PAGEFIND_BUNDLE_PATH = "/pagefind/";
const MODAL_SELECTOR = "#search-modal";
const PANEL_SELECTOR = "#search-modal-panel";
const BACKDROP_SELECTOR = "[data-search-modal-backdrop]";
const CLOSE_BUTTON_SELECTOR = "[data-search-modal-close]";
const INPUT_SELECTOR = "[data-search-input]";
const RESULTS_WRAP_SELECTOR = "[data-search-results-wrap]";
const RESULTS_ROOT_SELECTOR = "[data-search-results]";
const SEARCH_FORM_SELECTOR = "[data-search-form]";

type PagefindSubResult = {
  excerpt?: string;
  title?: string;
  url?: string;
};

type PagefindResultData = {
  excerpt?: string;
  meta?: {
    title?: string;
    url?: string;
  };
  sub_results?: PagefindSubResult[];
  url?: string;
};

type PagefindEntry = {
  data: () => Promise<PagefindResultData>;
};

type PagefindResponse = {
  results?: PagefindEntry[];
};

type PagefindApi = {
  debouncedSearch: (
    query: string,
    filters?: Record<string, never>,
    debounceMs?: number
  ) => Promise<PagefindResponse | null>;
  init: () => Promise<void>;
  options: (options: { basePath: string; excerptLength: number }) => Promise<void>;
};

type SearchMatch = {
  excerpt: string;
  heading: string;
  url: string;
};

type SearchItem = {
  excerpt: string;
  matches: SearchMatch[];
  pageUrl: string;
  pathLabel: string;
  title: string;
};

type FlatSearchResult = {
  url: string;
};

let activeResultIndex = 0;
let flatResults: FlatSearchResult[] = [];
let isInitializing = false;
let pagefindApi: PagefindApi | null = null;
let searchSerial = 0;

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const uniqueBy = <T>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

// Pagefind 在开发和构建产物里的 URL 形态不完全一致，这里统一收敛成站内可跳转地址。
const normalizeResultUrl = (rawUrl = "") => {
  if (!rawUrl) return "#";

  try {
    const normalized = new URL(rawUrl, window.location.origin);
    let pathname = normalized.pathname;

    if (pathname.startsWith("/client/")) {
      pathname = pathname.slice("/client".length);
    } else if (pathname === "/client") {
      pathname = "/";
    }

    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    return `${pathname || "/"}${normalized.search}${normalized.hash}`;
  } catch {
    let pathname = rawUrl.trim();

    if (pathname.startsWith("/client/")) {
      pathname = pathname.slice("/client".length);
    } else if (pathname === "/client") {
      pathname = "/";
    }

    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    return pathname || "#";
  }
};

const ensurePagefindBundle = async () => {
  try {
    const response = await fetch(`${PAGEFIND_BUNDLE_PATH}pagefind.js`, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
};

// 只初始化一次搜索运行时，避免重复 import pagefind 并造成事件和状态叠加。
const initSearchRuntime = async () => {
  if (pagefindApi || isInitializing) return;

  isInitializing = true;

  try {
    if (!(await ensurePagefindBundle())) return;

    pagefindApi = (await import(
      /* @vite-ignore */ `${PAGEFIND_BUNDLE_PATH}pagefind.js`
    )) as unknown as PagefindApi;
    await pagefindApi.options({
      basePath: PAGEFIND_BUNDLE_PATH,
      excerptLength: 28,
    });
    await pagefindApi.init();
  } finally {
    isInitializing = false;
  }
};

export function initSearchModal() {
  window.__searchModalCleanup?.();

  const modal = document.querySelector<HTMLDivElement>(MODAL_SELECTOR);
  const backdrop = modal?.querySelector<HTMLDivElement>(BACKDROP_SELECTOR) ?? null;
  const closeBtn = modal?.querySelector<HTMLButtonElement>(CLOSE_BUTTON_SELECTOR) ?? null;
  const panel = document.querySelector<HTMLDivElement>(PANEL_SELECTOR);
  const input = modal?.querySelector<HTMLInputElement>(INPUT_SELECTOR) ?? null;
  const resultsWrap = modal?.querySelector<HTMLDivElement>(RESULTS_WRAP_SELECTOR) ?? null;
  const resultsRoot = modal?.querySelector<HTMLDivElement>(RESULTS_ROOT_SELECTOR) ?? null;
  const searchForm = modal?.querySelector<HTMLFormElement>(SEARCH_FORM_SELECTOR) ?? null;

  const showResultsPanel = (show: boolean) => {
    resultsWrap?.classList.toggle("hidden", !show);
    searchForm?.classList.toggle("is-expanded", show);
  };

  const renderUnavailableState = () => {
    if (!resultsRoot) return;

    showResultsPanel(true);
    resultsRoot.innerHTML = `
      <div class="status-panel status-panel--warning status-panel--compact">
        <div class="status-panel__eyebrow">
          <span class="status-panel__pill">索引未就绪</span>
        </div>
        <h2 class="status-panel__title">搜索索引还没准备好</h2>
        <p class="status-panel__desc">
          先执行一次 <code class="rounded bg-black/85 px-1.5 py-0.5 text-[0.78rem] text-white">npm run build</code>，然后重启 <code class="rounded bg-black/85 px-1.5 py-0.5 text-[0.78rem] text-white">npm run dev</code>。
        </p>
      </div>
    `;
    flatResults = [];
  };

  const renderIdleState = () => {
    if (!resultsRoot) return;

    showResultsPanel(false);
    resultsRoot.innerHTML = "";
    flatResults = [];
    activeResultIndex = 0;
  };

  const renderLoadingState = () => {
    if (!resultsRoot) return;

    showResultsPanel(true);
    resultsRoot.innerHTML = `
      <div class="space-y-2.5 px-2 py-2.5 sm:px-3 sm:py-3">
        <div class="h-20 animate-pulse rounded-[0.9rem] bg-slate-100 dark:bg-slate-800"></div>
        <div class="h-20 animate-pulse rounded-[0.9rem] bg-slate-100 dark:bg-slate-800"></div>
        <div class="h-20 animate-pulse rounded-[0.9rem] bg-slate-100 dark:bg-slate-800"></div>
      </div>
    `;
    flatResults = [];
  };

  const renderEmptyState = (query: string) => {
    if (!resultsRoot) return;

    showResultsPanel(true);
    resultsRoot.innerHTML = `
      <div class="status-panel status-panel--info status-panel--compact">
        <div class="status-panel__eyebrow">
          <span class="status-panel__pill">暂无结果</span>
        </div>
        <h2 class="status-panel__title">没有找到和 “${escapeHtml(query)}” 相关的文章</h2>
        <p class="status-panel__desc">试试更短的关键词，或者换一个标签词。</p>
      </div>
    `;
    flatResults = [];
  };

  const updateActiveResult = () => {
    if (!resultsRoot) return;

    const links = Array.from(
      resultsRoot.querySelectorAll<HTMLElement>("[data-search-result-link]")
    );
    links.forEach((link, index) => {
      link.classList.toggle("is-active", index === activeResultIndex);
      if (index === activeResultIndex) {
        link.scrollIntoView({ block: "nearest" });
      }
    });
  };

  const renderResults = (items: SearchItem[]) => {
    if (!resultsRoot) return;

    // 扁平化结果是为了复用键盘上下选择逻辑，不区分“文章卡片”和“章节命中”。
    flatResults = items.flatMap((item) => [
      { url: item.pageUrl },
      ...item.matches.map((match) => ({ url: match.url })),
    ]);
    activeResultIndex = 0;
    let resultIndex = 0;

    const listHtml = items
      .map((item) => {
        const articleIndex = resultIndex++;
        const articleHtml = `
          <a
            href="${escapeHtml(item.pageUrl)}"
            data-search-result-link
            data-result-index="${articleIndex}"
            class="search-result-card search-result-card--article group block px-4 py-2.5 text-left transition-all duration-150 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 sm:px-5"
          >
            <div class="min-w-0">
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-2">
                  <span class="search-result-meta-dot"></span>
                  <h3 class="truncate text-[0.92rem] font-semibold leading-5 text-slate-900 dark:text-slate-100 sm:text-[0.98rem]">
                    ${escapeHtml(item.title)}
                  </h3>
                </div>
                <span class="search-result-badge shrink-0">
                  ${item.matches.length ? `${item.matches.length} 处命中` : "全文"}
                </span>
              </div>
              <div class="mt-1 flex items-center gap-2 text-[0.76rem]">
                <span class="font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500/80">文章</span>
                <span class="text-slate-300 dark:text-slate-700">/</span>
                <span class="truncate text-slate-400 dark:text-slate-500">${escapeHtml(item.pathLabel)}</span>
              </div>
              ${item.excerpt ? `<p class="search-result-summary mt-1.5 text-[0.82rem] leading-5 text-slate-500 line-clamp-1 dark:text-slate-400">${item.excerpt}</p>` : ""}
            </div>
          </a>
        `;

        const matchesHtml = item.matches
          .map((match) => {
            const sectionIndex = resultIndex++;
            return `
              <a
                href="${escapeHtml(match.url)}"
                data-search-result-link
                data-result-index="${sectionIndex}"
                class="search-result-card search-result-card--section block px-3 py-1.5 text-left transition-all duration-150 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 sm:px-4"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[0.68rem] font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500/80">章节</span>
                    <h4 class="truncate text-[0.86rem] font-medium leading-5 text-[color:var(--color-accent)] dark:text-sky-300">
                      ${escapeHtml(match.heading)}
                    </h4>
                  </div>
                  <p class="search-result-excerpt mt-0.5 text-[0.78rem] leading-5 text-slate-500 line-clamp-1 dark:text-slate-400">
                    ${match.excerpt || "预览不可用"}
                  </p>
                </div>
              </a>
            `;
          })
          .join("");

        return `
          <section class="search-result-group pt-1 pb-1.5">
            <div class="mb-0.5">${articleHtml}</div>
            ${
              matchesHtml
                ? `<div class="mx-4 ml-[2.35rem] space-y-0.5 border-l border-slate-200/70 dark:border-slate-800/80">${matchesHtml}</div>`
                : ""
            }
          </section>
        `;
      })
      .join("");

    showResultsPanel(true);
    resultsRoot.innerHTML = listHtml;
    updateActiveResult();
  };

  const focusSearchInput = () => {
    if (!input) return;

    window.setTimeout(() => input.focus(), 50);
  };

  const closeModal = (immediate = false) => {
    if (immediate) {
      backdrop?.classList.remove("opacity-100");
      backdrop?.classList.add("opacity-0");
      panel?.classList.remove("is-opening", "is-closing", "translate-y-0", "scale-100");
      panel?.classList.add("translate-y-3", "scale-[0.985]");
      document.body.style.overflow = "";
      modal?.classList.add("hidden");
      return;
    }

    backdrop?.classList.remove("opacity-100");
    backdrop?.classList.add("opacity-0");
    panel?.classList.remove("is-opening");
    panel?.classList.add("is-closing");
    panel?.classList.remove("translate-y-0", "scale-100");
    panel?.classList.add("translate-y-3", "scale-[0.985]");
    document.body.style.overflow = "";

    window.setTimeout(() => {
      modal?.classList.add("hidden");
      panel?.classList.remove("is-closing");
    }, 220);
  };

  const openModal = async () => {
    modal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    await initSearchRuntime();
    if (!pagefindApi) {
      renderUnavailableState();
    }

    requestAnimationFrame(() => {
      backdrop?.classList.remove("opacity-0");
      backdrop?.classList.add("opacity-100");
      panel?.classList.remove("is-closing");
      panel?.classList.remove("translate-y-3", "scale-[0.985]");
      panel?.classList.add("translate-y-0", "scale-100", "is-opening");
      focusSearchInput();
    });
  };

  const navigateToResult = (url: string) => {
    const normalizedUrl = normalizeResultUrl(url);
    if (!normalizedUrl || normalizedUrl === "#") return;

    closeModal(true);
    window.location.assign(normalizedUrl);
  };

  const performSearch = async (rawQuery: string) => {
    const query = rawQuery.trim();
    searchSerial += 1;
    const currentSerial = searchSerial;

    if (!query) {
      renderIdleState();
      return;
    }

    await initSearchRuntime();
    if (!pagefindApi) {
      renderUnavailableState();
      return;
    }

    renderLoadingState();

    try {
      const response = await pagefindApi.debouncedSearch(query, {}, 120);
      // 多次输入会并发触发搜索，这里只保留最后一次请求的结果，避免旧结果回写。
      if (currentSerial !== searchSerial || !response) return;

      const results = await Promise.all(
        (response.results || []).slice(0, 8).map(async (entry) => {
          const data = await entry.data();
          const pageTitle = data.meta?.title || "未命名文章";
          const pageUrl = normalizeResultUrl(data.url || data.meta?.url || "#");
          const pathLabel = pageUrl.replace(/^\/+/, "/");
          const matches = uniqueBy(
            (Array.isArray(data.sub_results) ? data.sub_results : [])
              .map((item) => ({
                heading: item?.title && item.title !== pageTitle ? item.title.trim() : "",
                url: normalizeResultUrl(item?.url || pageUrl),
                excerpt: item?.excerpt || "",
              }))
              .filter((item) => item.heading || item.excerpt),
            (item) => `${item.url}::${item.heading}`
          ).slice(0, 3);

          return {
            title: pageTitle,
            pageUrl,
            pathLabel,
            excerpt: data.excerpt || "",
            matches,
          };
        })
      );

      if (!results.length) {
        renderEmptyState(query);
        return;
      }

      renderResults(results);
    } catch {
      if (currentSerial !== searchSerial || !resultsRoot) return;

      showResultsPanel(true);
      resultsRoot.innerHTML = `
        <div class="status-panel status-panel--error status-panel--compact">
          <div class="status-panel__eyebrow">
            <span class="status-panel__pill">请求失败</span>
          </div>
          <h2 class="status-panel__title">搜索失败了</h2>
          <p class="status-panel__desc">刷新页面后再试一次；如果本地开发中仍有问题，先执行一次 <code class="rounded bg-black/85 px-1.5 py-0.5 text-[0.78rem] text-white">npm run build</code>。</p>
        </div>
      `;
    }
  };

  const onOpen = () => {
    void openModal();
  };

  const onBackdropClick = () => {
    closeModal();
  };

  const onCloseClick = () => {
    closeModal();
  };

  const onInput = (event: Event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;

    void performSearch(target.value);
  };

  const onResultClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const link = target.closest("a[data-search-result-link]");
    if (!(link instanceof HTMLAnchorElement)) return;

    event.preventDefault();
    navigateToResult(link.href);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (modal?.classList.contains("hidden")) {
        void openModal();
      } else {
        closeModal();
      }
      return;
    }

    if (event.key === "Escape" && !modal?.classList.contains("hidden")) {
      closeModal();
      return;
    }

    if (modal?.classList.contains("hidden")) return;

    // 键盘导航只在弹窗打开且已有结果时生效，保证输入和浏览行为互不抢焦点。
    if (event.key === "ArrowDown" && flatResults.length) {
      event.preventDefault();
      activeResultIndex = (activeResultIndex + 1) % flatResults.length;
      updateActiveResult();
      return;
    }

    if (event.key === "ArrowUp" && flatResults.length) {
      event.preventDefault();
      activeResultIndex = (activeResultIndex - 1 + flatResults.length) % flatResults.length;
      updateActiveResult();
      return;
    }

    if (event.key === "Enter" && flatResults.length && document.activeElement === input) {
      const target = resultsRoot?.querySelector<HTMLElement>(
        `[data-result-index="${activeResultIndex}"]`
      );
      if (target instanceof HTMLAnchorElement) {
        event.preventDefault();
        navigateToResult(target.href);
      }
    }
  };

  const handleAfterSwap = () => {
    initSearchModal();
  };

  document.addEventListener("open-search-modal", onOpen);
  backdrop?.addEventListener("click", onBackdropClick);
  closeBtn?.addEventListener("click", onCloseClick);
  input?.addEventListener("input", onInput);
  resultsRoot?.addEventListener("click", onResultClick);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("astro:after-swap", handleAfterSwap);

  void initSearchRuntime();

  window.__searchModalCleanup = () => {
    document.removeEventListener("open-search-modal", onOpen);
    backdrop?.removeEventListener("click", onBackdropClick);
    closeBtn?.removeEventListener("click", onCloseClick);
    input?.removeEventListener("input", onInput);
    resultsRoot?.removeEventListener("click", onResultClick);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("astro:after-swap", handleAfterSwap);
  };
}
