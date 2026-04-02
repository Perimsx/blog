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
  {
    name: "taobao",
    referer: "https://www.taobao.com/",
    hosts: [/\.alicdn\.com$/i, /\.tbcache\.com$/i, /\.etao\.com$/i],
  },
  {
    name: "sina",
    referer: "https://weibo.com/",
    hosts: [/\.sinaimg\.cn$/i],
  },
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

// ---------------------------------------------------------------------------
// IP Parsing & Normalization
// ---------------------------------------------------------------------------

function parseIpv4Component(value: string): number | null {
  value = value.trim();
  if (/^\d+$/.test(value)) {
    const n = Number.parseInt(value, 10);
    return n >= 0 && n <= 255 && String(n) === value ? n : null;
  }
  if (/^0[0-7]+$/.test(value)) {
    const n = Number.parseInt(value, 8);
    return n >= 0 && n <= 255 ? n : null;
  }
  if (/^0[xX][0-9a-fA-F]+$/.test(value)) {
    const n = Number.parseInt(value, 16);
    return n >= 0 && n <= 255 ? n : null;
  }
  return null;
}

function normalizeIpv4(hostname: string): string | null {
  const octets = hostname.split(".");
  if (octets.length !== 4) return null;
  const normalized: number[] = [];
  for (const part of octets) {
    const n = parseIpv4Component(part);
    if (n === null) return null;
    normalized.push(n);
  }
  return normalized.join(".");
}

function normalizeIpv6(hostname: string): string | null {
  let normalized = hostname.toLowerCase();
  const hasBrackets = normalized.startsWith("[") && normalized.endsWith("]");
  if (hasBrackets) normalized = normalized.slice(1, -1);

  const ipv4MappedMatch = normalized.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (ipv4MappedMatch) {
    const ipv4 = normalizeIpv4(ipv4MappedMatch[1]);
    if (!ipv4) return null;
    const [a, b, c, d] = ipv4.split(".").map(Number);
    normalized = `::ffff:${((a << 8) | b).toString(16).padStart(4, "0")}:${((c << 8) | d).toString(16).padStart(4, "0")}`;
  }

  if (normalized.includes("::")) {
    const parts = normalized.split("::");
    if (parts.length > 2) return null;
    const leftParts = parts[0] ? parts[0].split(":") : [];
    const rightParts = parts[1] ? parts[1].split(":") : [];
    const totalParts = leftParts.length + rightParts.length;
    if (totalParts > 7) return null;
    const fullParts = [...leftParts, ...Array(8 - totalParts).fill("0"), ...rightParts];
    if (fullParts.length !== 8) return null;
    normalized = fullParts.join(":");
  } else {
    const parts = normalized.split(":");
    if (parts.length !== 8) return null;
    normalized = parts.join(":");
  }

  for (const part of normalized.split(":")) {
    if (!/^[0-9a-f]{1,4}$/.test(part)) return null;
  }
  return normalized;
}

// ---------------------------------------------------------------------------
// Private IP Checks
// ---------------------------------------------------------------------------

function isPrivateIpv4(hostname: string): boolean {
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    const octets = hostname.split(".").map((p) => Number.parseInt(p, 10));
    if (octets.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return false;
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
  const normalized = normalizeIpv4(hostname);
  if (!normalized) return false;
  const octets = normalized.split(".").map((p) => Number.parseInt(p, 10));
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

function isPrivateIpv6(hostname: string): boolean {
  const normalized = normalizeIpv6(hostname);
  if (!normalized) return false;
  const hextets = normalized.split(":");
  const firstHextet = hextets[0];

  if (normalized === "0:0:0:0:0:0:0:0") return true;
  if (normalized === "0:0:0:0:0:0:0:1") return true;
  if (normalized.startsWith("0:0:0:0:0:ffff:") || normalized.startsWith("::ffff:")) return true;
  if (firstHextet >= "fe80" && firstHextet <= "febf") return true;
  if (firstHextet >= "fc00" && firstHextet <= "fdff") return true;
  if (hextets[0] === "2002") return true;
  if (hextets[0] === "2001" && hextets[1] === "db8") return true;
  if (firstHextet >= "fec0" && firstHextet <= "feff") return true;
  if (hextets[0] === "2001") return true;

  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function parseExternalImageUrl(value: string): URL | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;

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

// checkDnsRebinding is in the API route only (uses node:dns which is server-only)

export function getHotlinkPlatform(
  urlValue: string | URL
): { name: string; referer: string } | null {
  const url = typeof urlValue === "string" ? parseExternalImageUrl(urlValue) : urlValue;
  if (!url) return null;
  return (
    HOTLINK_PLATFORM_RULES.find((rule) =>
      rule.hosts.some((pattern) => pattern.test(url.hostname))
    ) ?? null
  );
}

export function shouldProxyExternalImage(urlValue: string): boolean {
  const url = parseExternalImageUrl(urlValue);
  return Boolean(url && getHotlinkPlatform(url));
}

export function toImageProxyUrl(urlValue: string): string {
  return `/api/image?url=${encodeURIComponent(urlValue)}`;
}

export function buildUpstreamImageHeaders(urlValue: string | URL): Headers {
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

export function looksLikeImageResponse(targetUrl: URL, contentType = ""): boolean {
  if (contentType.toLowerCase().startsWith("image/")) return true;
  return /\.(avif|gif|jpe?g|png|svg|webp)(?:$|\?)/i.test(targetUrl.pathname + targetUrl.search);
}

export function guessImageContentType(targetUrl: URL): string {
  const pathname = targetUrl.pathname.toLowerCase();
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  if (pathname.endsWith(".gif")) return "image/gif";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".avif")) return "image/avif";
  if (pathname.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}
