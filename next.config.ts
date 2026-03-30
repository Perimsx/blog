import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/pagefind/**/*',
      'node_modules/@swc/core/**/*',
      'node_modules/@resvg/resvg-js/**/*',
      'node_modules/sharp/**/*',
    ],
  },
  images: {
    unoptimized: true,
    qualities: [80],
    remotePatterns: [
      { protocol: "https", hostname: "**.chenguitao.com" },
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
