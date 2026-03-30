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
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
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
