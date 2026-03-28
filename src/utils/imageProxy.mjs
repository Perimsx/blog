const HOTLINK_PLATFORM_RULES = [
  {
    name: "zhihu",
    referer: "https://www.zhihu.com/",
    hosts: [/\.zhimg\.com$/i, /^zhimg\.com$/i],
  },
  {
    name: "yuque",
    referer: "https://www.yuque.com/",
    hosts: [/\.yuque\.com$/i, /\.nlark\.com$/i, /\.alipayobjects\.com$/i],
  },
  {
    name: "juejin",
    referer: "https://juejin.cn/",
    hosts: [/\.byteimg\.com$/i, /\.bytednsdoc\.com$/i],
  },
  {
    name: "csdn",
    referer: "https://blog.csdn.net/",
    hosts: [/\.csdnimg\.cn$/i, /\.csdnimg\.com$/i],
  },
  {
    name: "jianshu",
    referer: "https://www.jianshu.com/",
    hosts: [/\.jianshu\.io$/i],
  },
  {
    name: "cnblogs",
    referer: "https://www.cnblogs.com/",
    hosts: [/\.cnblogs\.com$/i],
  },
  {
    name: "segmentfault",
    referer: "https://segmentfault.com/",
    hosts: [/^segmentfault\.com$/i, /^sfault-image\./i],
  },
  {
    name: "wechat",
    referer: "https://mp.weixin.qq.com/",
    hosts: [/^mmbiz\.qpic\.cn$/i, /^res\.wx\.qq\.com$/i],
  },
  {
    name: "bilibili",
    referer: "https://www.bilibili.com/",
    hosts: [/\.hdslb\.com$/i],
  },
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

function isPrivateIpv4(hostname) {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return false;
  const octets = hostname.split(".").map((part) => Number.parseInt(part, 10));
  if (octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return false;

  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIpv6(hostname) {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

export function parseExternalImageUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;

    const hostname = url.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.endsWith(".local") ||
      isPrivateIpv4(hostname) ||
      isPrivateIpv6(hostname)
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export function getHotlinkPlatform(urlValue) {
  const url = typeof urlValue === "string" ? parseExternalImageUrl(urlValue) : urlValue;
  if (!url) return null;

  return (
    HOTLINK_PLATFORM_RULES.find((rule) => rule.hosts.some((pattern) => pattern.test(url.hostname))) ?? null
  );
}

export function shouldProxyExternalImage(urlValue) {
  const url = parseExternalImageUrl(urlValue);
  return Boolean(url && getHotlinkPlatform(url));
}

export function toImageProxyUrl(urlValue) {
  return `/api/image?url=${encodeURIComponent(urlValue)}`;
}

export function buildUpstreamImageHeaders(urlValue) {
  const url = typeof urlValue === "string" ? parseExternalImageUrl(urlValue) : urlValue;
  if (!url) return new Headers();

  const platform = getHotlinkPlatform(url);
  const referer = platform?.referer ?? `${url.origin}/`;
  const headers = new Headers();

  headers.set("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8");
  headers.set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8");
  headers.set("Cache-Control", "no-cache");
  headers.set("Pragma", "no-cache");
  headers.set("Referer", referer);
  headers.set("Origin", new URL(referer).origin);
  headers.set("User-Agent", USER_AGENT);

  return headers;
}

export function looksLikeImageResponse(targetUrl, contentType = "") {
  if (contentType.toLowerCase().startsWith("image/")) return true;

  return /\.(avif|gif|jpe?g|png|svg|webp)(?:$|\?)/i.test(targetUrl.pathname + targetUrl.search);
}

export function guessImageContentType(targetUrl) {
  const pathname = targetUrl.pathname.toLowerCase();

  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  if (pathname.endsWith(".gif")) return "image/gif";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".avif")) return "image/avif";
  if (pathname.endsWith(".webp")) return "image/webp";

  return "application/octet-stream";
}

