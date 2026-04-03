"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const VISITOR_STORAGE_KEY = "cotovo.analytics.visitor";
const SESSION_STORAGE_KEY = "cotovo.analytics.session";
const DEDUPE_STORAGE_KEY = "cotovo.analytics.last-pageview";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

type SessionState = {
  id: string;
  lastActivity: number;
};

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function ensureVisitorId() {
  const cached = window.localStorage.getItem(VISITOR_STORAGE_KEY);
  if (cached) {
    return cached;
  }

  const created = createId();
  window.localStorage.setItem(VISITOR_STORAGE_KEY, created);
  return created;
}

function ensureSession() {
  const now = Date.now();
  const cached = readJson<SessionState>(SESSION_STORAGE_KEY);

  if (!cached || now - cached.lastActivity > SESSION_TIMEOUT_MS) {
    const freshSession = { id: createId(), lastActivity: now };
    writeJson(SESSION_STORAGE_KEY, freshSession);
    return { isNewSession: true, sessionId: freshSession.id };
  }

  cached.lastActivity = now;
  writeJson(SESSION_STORAGE_KEY, cached);
  return { isNewSession: false, sessionId: cached.id };
}

function shouldSkipDuplicatePageview(path: string) {
  const now = Date.now();
  const cached = readJson<{ path: string; timestamp: number }>(DEDUPE_STORAGE_KEY);

  if (cached && cached.path === path && now - cached.timestamp < 1200) {
    return true;
  }

  writeJson(DEDUPE_STORAGE_KEY, { path, timestamp: now });
  return false;
}

function sendAnalytics(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    const success = navigator.sendBeacon("/api/analytics/track", blob);
    if (success) return;
  }

  void fetch("/api/analytics/track", {
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => {});
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPath = useMemo(() => {
    if (!pathname) return "";
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!currentPath || currentPath.startsWith("/monitor")) {
      return;
    }

    if (shouldSkipDuplicatePageview(currentPath)) {
      return;
    }

    const visitorId = ensureVisitorId();
    const { isNewSession, sessionId } = ensureSession();
    const startedAt = Date.now();
    let hasSentLeave = false;

    sendAnalytics({
      path: currentPath,
      referrer: isNewSession ? document.referrer || "" : "",
      sessionId,
      title: document.title,
      type: "pageview",
      visitorId,
    });

    const sendLeave = () => {
      if (hasSentLeave) {
        return;
      }

      hasSentLeave = true;
      sendAnalytics({
        durationMs: Math.max(0, Date.now() - startedAt),
        path: currentPath,
        sessionId,
        title: document.title,
        type: "pageleave",
        visitorId,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendLeave();
      }
    };

    const handlePageHide = () => {
      sendLeave();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      sendLeave();
    };
  }, [currentPath]);

  return null;
}
