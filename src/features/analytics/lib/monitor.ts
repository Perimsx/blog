import { getSortedPosts } from "@/lib/blog";
import { getAnalyticsSnapshot, type AnalyticsSnapshot } from "./store";

const SITE_STARTED_AT = "2025-11-10";
const SITE_TIME_ZONE = "Asia/Shanghai";

export interface MonitorSiteOverview {
  latestPublishedAt: string | null;
  onlineDays: number;
  posts: number;
  startedAt: string;
  tags: number;
  totalWords: number;
}

export interface MonitorSnapshotPayload {
  analytics: AnalyticsSnapshot;
  site: MonitorSiteOverview;
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

function countWords(content: string) {
  const normalized = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~=-]+/g, " ")
    .replace(/\r?\n/g, " ");

  const cjkUnits =
    normalized.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)
      ?.length ?? 0;
  const latinWords = normalized.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;

  return cjkUnits + latinWords;
}

function getOnlineDays(startedAt: string) {
  const [year, month, day] = startedAt.split("-").map(Number);
  const now = getTimeZoneDateParts(new Date(), SITE_TIME_ZONE);
  const startDate = Date.UTC(year, month - 1, day);
  const currentDate = Date.UTC(now.year, now.month - 1, now.day);
  const dayDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));

  return Math.max(dayDiff + 1, 1);
}

export async function getMonitorSiteOverview(): Promise<MonitorSiteOverview> {
  const posts = await getSortedPosts();

  return {
    latestPublishedAt: posts[0]?.data.modDatetime ?? posts[0]?.data.pubDatetime ?? null,
    onlineDays: getOnlineDays(SITE_STARTED_AT),
    posts: posts.length,
    startedAt: SITE_STARTED_AT,
    tags: new Set(posts.flatMap((post) => post.data.tags ?? [])).size,
    totalWords: posts.reduce((sum, post) => sum + countWords(post.content), 0),
  };
}

export async function getMonitorSnapshot(): Promise<MonitorSnapshotPayload> {
  const [analytics, site] = await Promise.all([getAnalyticsSnapshot(), getMonitorSiteOverview()]);

  return {
    analytics,
    site,
  };
}
