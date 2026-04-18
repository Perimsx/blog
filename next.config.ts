import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  cacheStartUrl: false,
  dynamicStartUrl: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Next.js 16 defaults to Turbopack, but @ducanh2912/next-pwa requires webpack
  turbopack: {},
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  outputFileTracingExcludes: {
    "*": [
      "node_modules/pagefind/**/*",
      "node_modules/@swc/core/**/*",
      "node_modules/@resvg/resvg-js/**/*",
      "node_modules/sharp/**/*",
    ],
  },
  images: {
    unoptimized: true,
    qualities: [80],
    remotePatterns: [
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "img1.tucang.cc" },
      { protocol: "https", hostname: "q1.qlogo.cn" },
      { protocol: "https", hostname: "qlogo.cn" },
      { protocol: "https", hostname: "**.cot.wiki" },
      { protocol: "https", hostname: "**.zhimg.com" },
      { protocol: "https", hostname: "**.yuque.com" },
      { protocol: "https", hostname: "**.byteimg.com" },
      { protocol: "https", hostname: "**.csdnimg.cn" },
      { protocol: "https", hostname: "**.jianshu.io" },
      { protocol: "https", hostname: "**.cnblogs.com" },
      { protocol: "https", hostname: "**.segmentfault.com" },
      { protocol: "https", hostname: "**.mmbiz.qpic.cn" },
      { protocol: "https", hostname: "**.hdslb.com" },
      { protocol: "https", hostname: "**.alipayobjects.com" },
    ],
  },
  // Support Tailwind v4 via PostCSS
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

export default withPWA(nextConfig);
