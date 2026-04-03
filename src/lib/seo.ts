import type { Metadata } from "next";
import { SITE } from "./config";

export const SEO_BRAND_NAME = "Perimsx";
export const SEO_SITE_NAME = SEO_BRAND_NAME;
export const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export interface ShareImage {
  alt?: string;
  height?: number;
  type?: string;
  url: string;
  width?: number;
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
  return {
    alt,
    height: 630,
    type: "image/png",
    url: toAbsoluteUrl(url),
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

export function getPostShareImage(postUrl: string, title: string) {
  return createShareImage(`/posts/${postUrl}/og-image`, `${title} 分享图`);
}
