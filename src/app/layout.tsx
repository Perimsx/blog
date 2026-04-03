import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SITE, SOCIALS } from "@/lib/config";
import { DEFAULT_SHARE_IMAGE, getCanonicalUrl, SEO_BRAND_NAME, toAbsoluteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const BROWSER_TITLE = SEO_BRAND_NAME;

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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="stylesheet" href="https://fontsapi.zeoseven.com/382/main/result.css" />
        <Script id="theme-initializer" strategy="beforeInteractive">
          {themeInitializer}
        </Script>
        <Script id="site-json-ld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(siteJsonLd)}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
