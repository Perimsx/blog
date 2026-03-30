"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const PAGEFIND_BUNDLE_PATH = "/pagefind/";

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

export type SearchItem = {
  excerpt: string;
  matches: SearchMatch[];
  pageUrl: string;
  pathLabel: string;
  title: string;
};

type FlatSearchResult = {
  url: string;
};

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

export type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "results"; items: SearchItem[] }
  | { status: "empty"; query: string }
  | { status: "unavailable" }
  | { status: "error"; message: string };

export function useSearch() {
  const [searchState, setSearchState] = useState<SearchState>({ status: "idle" });
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [isPagefindReady, setIsPagefindReady] = useState(false);

  const pagefindApiRef = useRef<PagefindApi | null>(null);
  const isInitializingRef = useRef(false);
  const searchSerialRef = useRef(0);
  const flatResultsRef = useRef<FlatSearchResult[]>([]);

  const ensurePagefindBundle = async () => {
    try {
      const response = await fetch(`${PAGEFIND_BUNDLE_PATH}pagefind.js`, { cache: "no-store" });
      return response.ok;
    } catch {
      return false;
    }
  };

  const initSearchRuntime = useCallback(async () => {
    if (pagefindApiRef.current || isInitializingRef.current) return;

    isInitializingRef.current = true;

    try {
      if (!(await ensurePagefindBundle())) return;

      // Use new Function to bypass Turbopack/webpack dynamic import resolution
      const dynamicImport = new Function("specifier", "return import(specifier)");
      pagefindApiRef.current = (await dynamicImport(`${PAGEFIND_BUNDLE_PATH}pagefind.js`)) as unknown as PagefindApi;
      await pagefindApiRef.current.options({
        basePath: PAGEFIND_BUNDLE_PATH,
        excerptLength: 28,
      });
      await pagefindApiRef.current.init();
      setIsPagefindReady(true);
    } finally {
      isInitializingRef.current = false;
    }
  }, []);

  const performSearch = useCallback(async (rawQuery: string) => {
    const query = rawQuery.trim();
    searchSerialRef.current += 1;
    const currentSerial = searchSerialRef.current;

    if (!query) {
      setSearchState({ status: "idle" });
      flatResultsRef.current = [];
      setActiveResultIndex(0);
      return;
    }

    await initSearchRuntime();

    if (!pagefindApiRef.current) {
      setSearchState({ status: "unavailable" });
      return;
    }

    setSearchState({ status: "loading" });

    try {
      const response = await pagefindApiRef.current.debouncedSearch(query, {}, 120);
      if (currentSerial !== searchSerialRef.current || !response) return;

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

      if (currentSerial !== searchSerialRef.current) return;

      if (!results.length) {
        setSearchState({ status: "empty", query });
        flatResultsRef.current = [];
        setActiveResultIndex(0);
        return;
      }

      flatResultsRef.current = results.flatMap((item) => [
        { url: item.pageUrl },
        ...item.matches.map((match) => ({ url: match.url })),
      ]);
      setActiveResultIndex(0);
      setSearchState({ status: "results", items: results });
    } catch {
      if (currentSerial !== searchSerialRef.current) return;
      setSearchState({ status: "error", message: "搜索失败了" });
      flatResultsRef.current = [];
      setActiveResultIndex(0);
    }
  }, [initSearchRuntime]);

  const navigateToResult = useCallback((url: string) => {
    const normalizedUrl = normalizeResultUrl(url);
    if (!normalizedUrl || normalizedUrl === "#") return;
    window.location.assign(normalizedUrl);
  }, []);

  const moveActiveResult = useCallback((direction: "up" | "down") => {
    setActiveResultIndex((prev) => {
      const total = flatResultsRef.current.length;
      if (total === 0) return prev;
      if (direction === "down") {
        return (prev + 1) % total;
      }
      return (prev - 1 + total) % total;
    });
  }, []);

  const getCurrentActiveUrl = useCallback(() => {
    return flatResultsRef.current[activeResultIndex]?.url;
  }, [activeResultIndex]);

  useEffect(() => {
    void initSearchRuntime();
  }, [initSearchRuntime]);

  return {
    searchState,
    activeResultIndex,
    flatResults: flatResultsRef.current,
    isPagefindReady,
    performSearch,
    navigateToResult,
    moveActiveResult,
    getCurrentActiveUrl,
    escapeHtml,
  };
}
