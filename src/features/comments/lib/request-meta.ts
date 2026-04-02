export interface CommentRequestMeta {
  location: string | null;
  browser: string | null;
  os: string | null;
}

const regionDisplayNames =
  typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["zh-CN"], { type: "region" })
    : null;

function normalizeText(value: string | null | undefined, maxLength = 96) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function readFirstHeader(headers: Headers, names: string[]) {
  for (const name of names) {
    const value = normalizeText(headers.get(name));
    if (value) {
      return value;
    }
  }

  return "";
}

function normalizeCountry(value: string) {
  const normalized = normalizeText(value, 64);
  if (!normalized) {
    return "";
  }

  const upper = normalized.toUpperCase();
  if (/^[A-Z]{2}$/.test(upper)) {
    return regionDisplayNames?.of(upper) ?? upper;
  }

  return normalized;
}

function normalizeLocationPart(value: string) {
  return normalizeText(value, 64).replace(/\s*(?:\||\/|,|，|·)\s*/g, " ");
}

function formatLocation(parts: Array<string | null | undefined>) {
  const normalized = parts
    .map((part, index) => {
      if (!part) {
        return "";
      }

      return index === 0 ? normalizeCountry(part) : normalizeLocationPart(part);
    })
    .filter(Boolean);

  if (!normalized.length) {
    return null;
  }

  return normalized.slice(0, 2).join(" · ");
}

function detectBrowserFromUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (ua.includes("micromessenger")) return "WeChat";
  if (ua.includes("weibo")) return "Weibo";
  if (ua.includes("qqbrowser") || ua.includes("mqqbrowser")) return "QQ Browser";
  if (ua.includes("qq/") && !ua.includes("qqbrowser")) return "QQ";
  if (ua.includes("baidubrowser") || ua.includes("bidubrowser")) return "Baidu Browser";
  if (ua.includes("qhbrowser") || ua.includes("360se") || ua.includes("360ee"))
    return "360 Browser";
  if (ua.includes("vivaldi")) return "Vivaldi";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("edg/") || ua.includes("edge/")) return "Edge";
  if (ua.includes("firefox/") || ua.includes("fxios/")) return "Firefox";
  if (ua.includes("msie") || ua.includes("trident/")) return "Internet Explorer";
  if (ua.includes("chrome/") || ua.includes("crios/")) return "Chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";

  return "";
}

function detectOsFromUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (ua.includes("windows")) return "Windows";
  if (ua.includes("android") || ua.includes("harmony")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod") || ua.includes("ios")) {
    return "iOS";
  }
  if (ua.includes("mac os") || ua.includes("macintosh")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("cros")) return "ChromeOS";

  return "";
}

export function getCommentRequestMeta(request: Request): CommentRequestMeta {
  const headers = request.headers;
  const userAgent = normalizeText(headers.get("user-agent"), 512);
  const country = readFirstHeader(headers, [
    "eo-client-ipcountry",
    "cf-ipcountry",
    "x-vercel-ip-country",
    "x-geo-country",
    "x-country-code",
    "x-country",
  ]);
  const region = readFirstHeader(headers, [
    "eo-client-ipprovince",
    "x-vercel-ip-country-region",
    "x-geo-region",
    "x-region",
  ]);
  const city = readFirstHeader(headers, [
    "eo-client-ipcity",
    "x-vercel-ip-city",
    "x-geo-city",
    "x-city",
  ]);

  const browser = detectBrowserFromUserAgent(userAgent);
  const os = detectOsFromUserAgent(userAgent);

  return {
    location: formatLocation([country, region || city]),
    browser: browser || null,
    os: os || null,
  };
}
