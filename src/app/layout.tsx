import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chenguitao.com/"),
  title: {
    default: "Perimsx",
    template: "%s | Perimsx",
  },
  description: "记录成长，分享价值。信息安全专业学生，Web 开发爱好者。",
  keywords: ["博客", "技术", "信息安全", "Web开发", "Perimsx"],
  authors: [{ name: "Perimsx" }],
  creator: "Perimsx",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://chenguitao.com/",
    siteName: "Perimsx",
    title: "Perimsx",
    description: "记录成长，分享价值。信息安全专业学生，Web 开发爱好者。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Perimsx",
    description: "记录成长，分享价值。信息安全专业学生，Web 开发爱好者。",
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
  alternates: {
    canonical: "https://chenguitao.com/",
    types: {
      "application/rss+xml": [{ url: "rss.xml", title: "Perimsx RSS Feed" }],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
