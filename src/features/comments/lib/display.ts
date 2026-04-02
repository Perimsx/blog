const clientIconBase = "/assets/icons/client";

const clientOsIcons = {
  android: `${clientIconBase}/android.svg`,
  apple: `${clientIconBase}/apple.svg`,
  chrome: `${clientIconBase}/chrome.svg`,
  linux: `${clientIconBase}/linux.svg`,
  windows: `${clientIconBase}/windows.svg`,
} as const;

const clientBrowserIcons = {
  baidu: `${clientIconBase}/baidu.png`,
  chrome: `${clientIconBase}/chrome.svg`,
  edge: `${clientIconBase}/edge.svg`,
  firefox: `${clientIconBase}/firefox.svg`,
  ie: `${clientIconBase}/ie.svg`,
  opera: `${clientIconBase}/opera.svg`,
  q360: `${clientIconBase}/q360.png`,
  qq: `${clientIconBase}/qq.png`,
  safari: `${clientIconBase}/safari.svg`,
  vivaldi: `${clientIconBase}/vivaldi.svg`,
  wechat: `${clientIconBase}/wechat.png`,
  weibo: `${clientIconBase}/weibo.png`,
} as const;

const UNKNOWN_META_VALUES = new Set([
  "",
  "unknown",
  "null",
  "none",
  "n/a",
  "na",
  "-",
  "--",
  "undefined",
  "未知",
  "不详",
]);

function normalizeForMatch(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .trim();
}

function hasAny(text: string, parts: string[]) {
  return parts.some((part) => text.includes(part));
}

export function hasKnownCommentMeta(value?: string | null) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return false;
  }

  return !(
    UNKNOWN_META_VALUES.has(normalized) || UNKNOWN_META_VALUES.has(normalized.toLowerCase())
  );
}

function trimTrailingEnglishPart(value: string) {
  const compact = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!compact) {
    return "";
  }

  if (!/[\u3400-\u9fff]/.test(compact)) {
    return compact;
  }

  const tokens = compact.split(" ").filter(Boolean);

  while (tokens.length > 1 && /^[A-Za-z][A-Za-z'.-]*$/.test(tokens[tokens.length - 1] || "")) {
    tokens.pop();
  }

  return tokens.join(" ").trim();
}

export function formatCommentLocation(value?: string | null) {
  if (!hasKnownCommentMeta(value)) {
    return "";
  }

  const compact = trimTrailingEnglishPart(String(value || ""));
  if (!compact) {
    return "";
  }

  return compact
    .split(/\s*(?:\||\/|,|，|->|→|·)\s*/)
    .map((part) => trimTrailingEnglishPart(part))
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");
}

export function stripCommentClientVersionLabel(value: string) {
  return value
    .replace(/\s+\(.*?\)\s*$/, "")
    .replace(/\s+(?:NT\s+)?\d[\d._]*\s*$/i, "")
    .trim();
}

export function getCommentOsIconPath(os?: string | null) {
  if (!hasKnownCommentMeta(os)) {
    return null;
  }

  const value = String(os || "").toLowerCase();

  if (value.includes("windows")) return clientOsIcons.windows;
  if (
    value.includes("mac") ||
    value.includes("ios") ||
    value.includes("iphone") ||
    value.includes("ipad") ||
    value.includes("apple")
  ) {
    return clientOsIcons.apple;
  }
  if (value.includes("android") || value.includes("harmony")) return clientOsIcons.android;
  if (value.includes("linux")) return clientOsIcons.linux;
  if (value.includes("cros") || value.includes("chromeos")) return clientOsIcons.chrome;

  return null;
}

export function getCommentBrowserIconPath(browser?: string | null) {
  if (!hasKnownCommentMeta(browser)) {
    return null;
  }

  const value = normalizeForMatch(String(browser || ""));

  if (hasAny(value, ["wechat", "weixin", "micromessenger"])) return clientBrowserIcons.wechat;
  if (hasAny(value, ["qqbrowser", "mqqbrowser"])) return clientBrowserIcons.qq;
  if (value === "qq" || (value.startsWith("qq") && !hasAny(value, ["browser"]))) {
    return clientBrowserIcons.qq;
  }
  if (hasAny(value, ["weibo"])) return clientBrowserIcons.weibo;
  if (hasAny(value, ["baidubrowser", "bidubrowser", "baidu"])) return clientBrowserIcons.baidu;
  if (hasAny(value, ["qhbrowser", "360se", "360ee", "360browser"])) return clientBrowserIcons.q360;
  if (value.includes("vivaldi")) return clientBrowserIcons.vivaldi;
  if (value.includes("opera") || value.includes("opr")) return clientBrowserIcons.opera;
  if (value.includes("edge") || value.includes("edg")) return clientBrowserIcons.edge;
  if (value.includes("firefox") || value.includes("fxios")) return clientBrowserIcons.firefox;
  if (hasAny(value, ["msie", "trident", "internetexplorer"])) return clientBrowserIcons.ie;

  if (
    value.includes("chrome") ||
    value.includes("crios") ||
    value.includes("brave") ||
    value.includes("samsungbrowser") ||
    value.includes("samsunginternet") ||
    value.includes("yabrowser") ||
    value.includes("yandex") ||
    value.includes("quark") ||
    value.includes("ucbrowser") ||
    value.includes("sogou") ||
    value.includes("dingtalk") ||
    value.includes("alipay")
  ) {
    return clientBrowserIcons.chrome;
  }

  if (value.includes("safari")) return clientBrowserIcons.safari;

  return null;
}
