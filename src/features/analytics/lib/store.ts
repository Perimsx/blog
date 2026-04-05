import fs from "node:fs/promises";
import path from "node:path";
import { SITE } from "@/lib/config";
import { getAnalyticsRequestMeta, normalizeReferrerSource } from "./request-meta";

const ANALYTICS_DATA_FILE = path.join(process.cwd(), ".data", "analytics.local.json");
const ANALYTICS_DUPLICATE_WINDOW_MS = 5000;
const MAX_ANALYTICS_EVENTS = 50000;
const ANALYTICS_TIME_ZONE = SITE.timezone || "UTC";
let analyticsDatabaseQueue: Promise<unknown> = Promise.resolve();
const ANALYTICS_BRAND_TITLES: string[] = [...new Set([SITE.title, SITE.author].filter(Boolean))];

export type AnalyticsEventType = "pageleave" | "pageview";

export interface AnalyticsEventRecord {
  browser: string | null;
  device: string | null;
  durationMs: number | null;
  id: string;
  location: string | null;
  os: string | null;
  path: string;
  referrer: string;
  sessionId: string;
  timestamp: string;
  title: string | null;
  type: AnalyticsEventType;
  visitorId: string;
}

interface AnalyticsDatabase {
  events: AnalyticsEventRecord[];
}

export interface AnalyticsOverview {
  avgVisitDurationSeconds: number;
  bounceRate: number;
  pageviews: number;
  pagesPerVisit: number;
  visits: number;
  visitors: number;
}

export interface AnalyticsTimeseriesPoint {
  date: string;
  label: string;
  views: number;
  visits: number;
  visitors: number;
}

export interface AnalyticsPageStat {
  path: string;
  title: string;
  views: number;
  visitors: number;
}

export interface AnalyticsBreakdownStat {
  label: string;
  value: number;
}

export interface AnalyticsSnapshot {
  browsers: AnalyticsBreakdownStat[];
  countries: AnalyticsBreakdownStat[];
  devices: AnalyticsBreakdownStat[];
  generatedAt: string;
  overview: AnalyticsOverview;
  pages: AnalyticsPageStat[];
  referrers: AnalyticsBreakdownStat[];
  timeseries: AnalyticsTimeseriesPoint[];
}

export interface RecordAnalyticsInput {
  durationMs?: number | null;
  path: string;
  referrer?: string | null;
  sessionId: string;
  title?: string | null;
  type: AnalyticsEventType;
  visitorId: string;
}

export interface RecordAnalyticsResult {
  reason?: "bot" | "duplicate" | "ignored";
  stored: boolean;
}

function normalizeText(value: string | null | undefined, maxLength = 240) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizePath(value: string) {
  const normalized = normalizeText(value, 320);
  if (!normalized) {
    return "/";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function stripAnalyticsBranding(title: string | null | undefined) {
  let normalized = normalizeText(title, 160);

  if (!normalized) {
    return "";
  }

  let hasChanged = true;

  while (hasChanged) {
    hasChanged = false;

    for (const brandTitle of ANALYTICS_BRAND_TITLES) {
      for (const separator of [" | ", " - ", " · ", " • "]) {
        const suffix = `${separator}${brandTitle}`;

        if (normalized.endsWith(suffix)) {
          normalized = normalized.slice(0, -suffix.length).trim();
          hasChanged = true;
        }
      }
    }
  }

  return normalized;
}

function resolveAnalyticsPageTitle(title: string | null | undefined, pathname: string) {
  const normalizedTitle = stripAnalyticsBranding(title);
  const isBrandTitle = ANALYTICS_BRAND_TITLES.some((brandTitle) => brandTitle === normalizedTitle);

  if (pathname === "/") {
    if (!normalizedTitle || isBrandTitle) {
      return "首页";
    }
  }

  return normalizedTitle || pathname;
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatDayLabel(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${month}/${day}`;
}

function padNumber(value: number) {
  return value.toString().padStart(2, "0");
}

function getTimeZoneDateParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });

  const parts = formatter.formatToParts(date);

  return {
    day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
    year: Number(parts.find((part) => part.type === "year")?.value ?? "1970"),
  };
}

function createDateKey(year: number, month: number, day: number) {
  return `${year}-${padNumber(month)}-${padNumber(day)}`;
}

function getDateKeyInTimeZone(date: Date, timeZone: string) {
  const parts = getTimeZoneDateParts(date, timeZone);
  return createDateKey(parts.year, parts.month, parts.day);
}

function createEmptyTimeseries() {
  const today = getTimeZoneDateParts(new Date(), ANALYTICS_TIME_ZONE);
  const baseDate = new Date(Date.UTC(today.year, today.month - 1, today.day));

  return Array.from({ length: 30 }, (_, index) => {
    const day = new Date(baseDate);
    day.setUTCDate(baseDate.getUTCDate() - (29 - index));
    const dateKey = createDateKey(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate());

    return {
      date: dateKey,
      label: formatDayLabel(dateKey),
      views: 0,
      visits: 0,
      visitors: 0,
    };
  });
}

function withDatabaseLock<T>(task: () => Promise<T>) {
  const run = analyticsDatabaseQueue.then(task, task);
  analyticsDatabaseQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readDatabase(): Promise<AnalyticsDatabase> {
  try {
    const raw = await fs.readFile(ANALYTICS_DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<AnalyticsDatabase>;

    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    return { events: [] };
  }
}

async function writeDatabase(database: AnalyticsDatabase) {
  await fs.mkdir(path.dirname(ANALYTICS_DATA_FILE), { recursive: true });
  await fs.writeFile(ANALYTICS_DATA_FILE, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

function buildEmptySnapshot(): AnalyticsSnapshot {
  return {
    browsers: [],
    countries: [],
    devices: [],
    generatedAt: new Date().toISOString(),
    overview: {
      avgVisitDurationSeconds: 0,
      bounceRate: 0,
      pageviews: 0,
      pagesPerVisit: 0,
      visits: 0,
      visitors: 0,
    },
    pages: [],
    referrers: [],
    timeseries: createEmptyTimeseries(),
  };
}

function takeTop(map: Map<string, number>, limit: number) {
  return [...map.entries()]
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function isIgnoredPath(pathname: string) {
  return pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname === "/sw.js";
}

function hasRecentDuplicate(events: AnalyticsEventRecord[], record: AnalyticsEventRecord) {
  const threshold = Date.parse(record.timestamp) - ANALYTICS_DUPLICATE_WINDOW_MS;

  for (let index = events.length - 1; index >= 0; index -= 1) {
    const candidate = events[index];

    if (Date.parse(candidate.timestamp) < threshold) {
      break;
    }

    if (
      candidate.type === record.type &&
      candidate.path === record.path &&
      candidate.sessionId === record.sessionId &&
      candidate.visitorId === record.visitorId
    ) {
      if (record.type !== "pageleave") {
        return true;
      }

      const durationDelta = Math.abs((candidate.durationMs ?? 0) - (record.durationMs ?? 0));
      if (durationDelta <= 1500) {
        return true;
      }
    }
  }

  return false;
}

export async function recordAnalyticsEvent(
  input: RecordAnalyticsInput,
  request: Request
): Promise<RecordAnalyticsResult> {
  return withDatabaseLock(async () => {
    const database = await readDatabase();
    const meta = getAnalyticsRequestMeta(request);
    const normalizedPath = normalizePath(input.path);

    if (meta.isBot) {
      return { reason: "bot", stored: false };
    }

    if (isIgnoredPath(normalizedPath)) {
      return { reason: "ignored", stored: false };
    }

    const record: AnalyticsEventRecord = {
      browser: meta.browser,
      device: meta.device,
      durationMs:
        typeof input.durationMs === "number" && Number.isFinite(input.durationMs)
          ? Math.max(0, Math.min(Math.round(input.durationMs), 30 * 60 * 1000))
          : null,
      id: crypto.randomUUID(),
      location: meta.location,
      os: meta.os,
      path: normalizedPath,
      referrer: normalizeReferrerSource(input.referrer ?? "", SITE.website),
      sessionId: normalizeText(input.sessionId, 96),
      timestamp: new Date().toISOString(),
      title: stripAnalyticsBranding(input.title) || null,
      type: input.type,
      visitorId: normalizeText(input.visitorId, 96),
    };

    if (!record.sessionId || !record.visitorId) {
      throw new Error("missing identifiers");
    }

    if (hasRecentDuplicate(database.events, record)) {
      return { reason: "duplicate", stored: false };
    }

    database.events.push(record);

    if (database.events.length > MAX_ANALYTICS_EVENTS) {
      database.events = database.events.slice(-MAX_ANALYTICS_EVENTS);
    }

    await writeDatabase(database);

    return { stored: true };
  });
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  return withDatabaseLock(async () => {
    const database = await readDatabase();
    const pageviews = database.events.filter((event) => event.type === "pageview");
    const pageleaves = database.events.filter((event) => event.type === "pageleave");

    if (!pageviews.length) {
      return buildEmptySnapshot();
    }

    const visitorIds = new Set<string>();
    const sessionViews = new Map<string, number>();
    const sessionDurations = new Map<string, number>();
    const pages = new Map<string, { title: string; views: number; visitors: Set<string> }>();
    const browsers = new Map<string, number>();
    const devices = new Map<string, number>();
    const countries = new Map<string, number>();
    const referrers = new Map<string, number>();
    const timeseries = new Map<
      string,
      { views: number; visits: Set<string>; visitors: Set<string> }
    >();
    const sessionLandingView = new Map<string, AnalyticsEventRecord>();

    for (const point of createEmptyTimeseries()) {
      timeseries.set(point.date, { views: 0, visits: new Set(), visitors: new Set() });
    }

    for (const event of pageviews) {
      visitorIds.add(event.visitorId);
      sessionViews.set(event.sessionId, (sessionViews.get(event.sessionId) ?? 0) + 1);

      if (!sessionLandingView.has(event.sessionId)) {
        sessionLandingView.set(event.sessionId, event);
      }

      const resolvedTitle = resolveAnalyticsPageTitle(event.title, event.path);
      const page = pages.get(event.path) ?? {
        title: resolvedTitle,
        views: 0,
        visitors: new Set<string>(),
      };
      page.title = page.title || resolvedTitle;
      page.views += 1;
      page.visitors.add(event.visitorId);
      pages.set(event.path, page);

      const browser = event.browser || "Unknown";
      const device = event.device || "Unknown";
      const country = event.location || "Unknown";

      browsers.set(browser, (browsers.get(browser) ?? 0) + 1);
      devices.set(device, (devices.get(device) ?? 0) + 1);
      countries.set(country, (countries.get(country) ?? 0) + 1);

      const dateKey = getDateKeyInTimeZone(new Date(event.timestamp), ANALYTICS_TIME_ZONE);
      const bucket = timeseries.get(dateKey);
      if (bucket) {
        bucket.views += 1;
        bucket.visits.add(event.sessionId);
        bucket.visitors.add(event.visitorId);
      }
    }

    for (const event of pageleaves) {
      sessionDurations.set(
        event.sessionId,
        (sessionDurations.get(event.sessionId) ?? 0) + (event.durationMs ?? 0)
      );
    }

    for (const landing of sessionLandingView.values()) {
      referrers.set(landing.referrer, (referrers.get(landing.referrer) ?? 0) + 1);
    }

    const visits = sessionViews.size;
    const bouncedSessions = [...sessionViews.values()].filter((count) => count <= 1).length;
    const totalDuration = [...sessionDurations.values()].reduce((sum, value) => sum + value, 0);

    return {
      browsers: takeTop(browsers, 6),
      countries: takeTop(countries, 6),
      devices: takeTop(devices, 6),
      generatedAt: new Date().toISOString(),
      overview: {
        avgVisitDurationSeconds: visits ? Math.round(totalDuration / visits / 1000) : 0,
        bounceRate: visits ? round((bouncedSessions / visits) * 100) : 0,
        pageviews: pageviews.length,
        pagesPerVisit: visits ? round(pageviews.length / visits) : 0,
        visits,
        visitors: visitorIds.size,
      },
      pages: [...pages.entries()]
        .map(([pagePath, page]) => ({
          path: pagePath,
          title: page.title,
          views: page.views,
          visitors: page.visitors.size,
        }))
        .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path, "zh-CN"))
        .slice(0, 10),
      referrers: takeTop(referrers, 6),
      timeseries: createEmptyTimeseries().map((point) => {
        const bucket = timeseries.get(point.date);

        return {
          date: point.date,
          label: point.label,
          views: bucket?.views ?? 0,
          visits: bucket?.visits.size ?? 0,
          visitors: bucket?.visitors.size ?? 0,
        };
      }),
    };
  });
}
