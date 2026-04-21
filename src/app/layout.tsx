import type { Metadata } from "next";
import Script from "next/script";
import { SITE, SOCIALS } from "@/lib/config";
import { DEFAULT_SHARE_IMAGE, getCanonicalUrl, SEO_BRAND_NAME, toAbsoluteUrl } from "@/lib/seo";
import "./globals.css";

const BROWSER_TITLE = SEO_BRAND_NAME;
const UMAMI_SCRIPT_SRC = "https://cloud.umami.is/script.js";
const UMAMI_WEBSITE_ID = "6264d95b-b636-444a-b672-b34c4ca12849";

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": `${getCanonicalUrl("/")}#person`,
      "@type": "Person",
      image: toAbsoluteUrl(SITE.avatar),
      name: SITE.author,
      sameAs: SOCIALS.filter((social) => social.active).map((social) => social.href),
      url: SITE.profile,
    },
    {
      "@id": `${getCanonicalUrl("/")}#website`,
      "@type": "WebSite",
      alternateName: SITE.title,
      description: SITE.desc,
      inLanguage: SITE.lang,
      name: SEO_BRAND_NAME,
      publisher: {
        "@id": `${getCanonicalUrl("/")}#person`,
      },
      url: SITE.website,
    },
    {
      "@id": `${getCanonicalUrl("/")}#blog`,
      "@type": "Blog",
      alternateName: SEO_BRAND_NAME,
      description: SITE.desc,
      inLanguage: SITE.lang,
      name: SITE.title,
      publisher: {
        "@id": `${getCanonicalUrl("/")}#person`,
      },
      url: SITE.website,
    },
  ],
};

const safeSiteJsonLd = JSON.stringify(siteJsonLd).replace(/</g, "\\u003c");

export const metadata: Metadata = {
  metadataBase: new URL(SITE.website),
  title: {
    default: BROWSER_TITLE,
    template: `%s | ${BROWSER_TITLE}`,
  },
  applicationName: BROWSER_TITLE,
  description: SITE.desc,
  keywords: ["博客", "技术", "信息安全", "Web开发", "Perimsx"],
  authors: [{ name: SITE.author, url: SITE.profile }],
  creator: SITE.author,
  publisher: SITE.author,
  alternates: {
    canonical: SITE.website,
    types: {
      "application/rss+xml": [{ url: "rss.xml", title: `${SITE.title} RSS Feed` }],
    },
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    description: SITE.desc,
    images: [DEFAULT_SHARE_IMAGE],
    locale: "zh_CN",
    siteName: SEO_BRAND_NAME,
    title: BROWSER_TITLE,
    type: "website",
    url: SITE.website,
  },
  twitter: {
    card: "summary_large_image",
    description: SITE.desc,
    images: [DEFAULT_SHARE_IMAGE.url],
    title: BROWSER_TITLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const themeInitializer = `
  (function() {
    try {
      var theme = localStorage.getItem("theme");
      if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="stylesheet" href="https://fontsapi.zeoseven.com/382/main/result.css" />
        <script id="theme-initializer" dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        <script
          id="site-json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeSiteJsonLd }}
        />
        {process.env.NODE_ENV === "production" ? (
          <Script
            id="umami-analytics"
            src={UMAMI_SCRIPT_SRC}
            data-website-id={UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
