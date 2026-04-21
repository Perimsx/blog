import type { Metadata } from "next";
import { SITE } from "./config";

export const SEO_BRAND_NAME = "Perimsx";
export const SEO_SITE_NAME = SEO_BRAND_NAME;

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
export const DEFAULT_OG_IMAGE_PATH = "/android-chrome-512x512.png";

export interface ShareImage {
  alt?: string;
  height?: number;
  type?: string;
  url: string;
  width?: number;
}

function inferImageMimeType(url: string) {
  const normalized = url.split("?")[0]?.split("#")[0]?.toLowerCase() ?? "";

  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".gif")) return "image/gif";
  if (normalized.endsWith(".svg")) return "image/svg+xml";

  return undefined;
}

function normalizeLocalPath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "/";
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const withoutDotPrefix = trimmed.replace(/^\.\//, "");
  return withoutDotPrefix.startsWith("/") ? withoutDotPrefix : `/${withoutDotPrefix}`;
}

export function toAbsoluteUrl(value: string) {
  if (ABSOLUTE_URL_PATTERN.test(value)) {
    return value;
  }

  return new URL(normalizeLocalPath(value), SITE.website).href;
}

export function getCanonicalUrl(pathname = "/") {
  return toAbsoluteUrl(pathname);
}

export function createShareImage(url: string, alt: string): ShareImage {
  const absoluteUrl = toAbsoluteUrl(url);
  const type = inferImageMimeType(absoluteUrl);

  return {
    alt,
    height: 630,
    ...(type ? { type } : {}),
    url: absoluteUrl,
    width: 1200,
  };
}

export const DEFAULT_SHARE_IMAGE = createShareImage(
  DEFAULT_OG_IMAGE_PATH,
  `${SEO_BRAND_NAME} 分享图`
);

interface PageMetadataOptions {
  absoluteTitle?: boolean;
  description: string;
  images?: ShareImage[];
  keywords?: string[];
  pathname: string;
  robots?: Metadata["robots"];
  title: string;
}

export function createPageMetadata({
  absoluteTitle = false,
  description,
  images = [DEFAULT_SHARE_IMAGE],
  keywords,
  pathname,
  robots,
  title,
}: PageMetadataOptions): Metadata {
  const canonical = getCanonicalUrl(pathname);

  return {
    ...(absoluteTitle ? { title: { absolute: title } } : { title }),
    alternates: {
      canonical,
    },
    description,
    ...(keywords ? { keywords } : {}),
    openGraph: {
      description,
      images,
      locale: "zh_CN",
      siteName: SEO_SITE_NAME,
      title,
      type: "website",
      url: canonical,
    },
    ...(robots ? { robots } : {}),
    twitter: {
      card: "summary_large_image",
      description,
      images: images.map((image) => image.url),
      title,
    },
  };
}

export function getPostCanonicalUrl(postUrl: string, canonicalURL?: string) {
  return canonicalURL ?? getCanonicalUrl(`/posts/${postUrl}`);
}

export function getPostShareImage(title: string, ...candidates: Array<string | undefined>) {
  const imageSource = candidates.find((candidate) => typeof candidate === "string" && candidate.trim());

  return imageSource
    ? createShareImage(imageSource, `${title} 分享图`)
    : DEFAULT_SHARE_IMAGE;
}
