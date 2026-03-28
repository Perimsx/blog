// @ts-check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import edgeone from "@edgeone/astro";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import { remarkCodeBlockTitle } from "./src/utils/remarkCodeBlockTitle.mjs";
import { remarkLazyLoadImages } from "./src/utils/remarkLazyLoadImages.mjs";
import { remarkProxyExternalImages } from "./src/utils/remarkProxyExternalImages.mjs";
import { validateBlogContent } from "./src/utils/validateBlogContent.mjs";
import { SITE } from "./src/config";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
validateBlogContent();

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const pagefindDistDir = path.join(projectRoot, "dist", "pagefind");

const pagefindMimeTypes = {
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

function servePagefindFromDist() {
  return {
    name: "serve-pagefind-from-dist",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/pagefind", (req, res, next) => {
        const requestPath = decodeURIComponent((req.url || "/").split("?")[0] || "/");
        const relativePath = requestPath === "/" ? "/pagefind.js" : requestPath;
        const filePath = path.resolve(pagefindDistDir, `.${relativePath}`);

        if (!filePath.startsWith(pagefindDistDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          next();
          return;
        }

        const ext = path.extname(filePath);
        res.setHeader("Content-Type", pagefindMimeTypes[ext] || "application/octet-stream");
        res.end(fs.readFileSync(filePath));
      });
    },
  };
}

export default defineConfig({
  output: "static",
  adapter: edgeone(),
  server: { port: 3000 },
  site: SITE.website,
  trailingSlash: "never",
  markdown: {
    remarkPlugins: [
      remarkToc,
      // @ts-ignore - TypeScript has issues with remark plugin tuple syntax
      [remarkCollapse, { test: "Table of contents" }],
      remarkCodeBlockTitle,
      remarkLazyLoadImages,
      remarkProxyExternalImages,
    ],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      wrap: true,
    },
  },
  integrations: [
    mdx(),
	    sitemap({
	      filter: (page) => {
	        // Always exclude archives if not showing them
	        if (!SITE.showArchives && page.endsWith("/archives")) return false;
	        if (page.endsWith(".md")) return false;
	        if (page.endsWith("/search") || page.endsWith("/search/")) return false;
        
        // Optionally exclude tag pages to reduce sitemap bloat
        // Uncomment the following line to exclude all tag pages:
        // if (page.includes("/tags/")) return false;
        
        return true;
      },
	      serialize: (item) => {
	        const normalizedSiteUrl = SITE.website.endsWith("/") ? SITE.website.slice(0, -1) : SITE.website;
	        const itemUrl = new URL(item.url);
	        const pathname = itemUrl.pathname.replace(/\/$/, "") || "/";
	        
	        // Set defaults
	        item.changefreq = ChangeFreqEnum.MONTHLY;
	        item.priority = 0.4;
	        
	        // Homepage - highest priority, frequent updates
	        if (pathname === "/") {
	          item.priority = 1.0;
	          item.changefreq = ChangeFreqEnum.DAILY;
	          item.lastmod = new Date().toISOString();
	        }
	        // Main section pages
	        else if (pathname === "/posts" || pathname === "/about" || pathname === "/contact" || pathname === "/tags") {
	          item.priority = 0.8;
	          item.changefreq = ChangeFreqEnum.WEEKLY;
	        }
	        // Article detail pages
	        else if (pathname.startsWith("/posts/") && !/^\/posts\/\d+$/.test(pathname)) {
	          item.priority = 0.8;
	          item.changefreq = ChangeFreqEnum.WEEKLY;
	        }
	        // Tag pages - low priority
	        else if (pathname.startsWith("/tags/")) {
	          item.priority = 0.3;
	          item.changefreq = ChangeFreqEnum.MONTHLY;
	        }
	        // Pagination pages
	        else if (/^\/posts\/\d+$/.test(pathname)) {
	          item.priority = 0.4;
	          item.changefreq = ChangeFreqEnum.WEEKLY;
	        }

	        item.url = pathname === "/" ? `${normalizedSiteUrl}/` : `${normalizedSiteUrl}${pathname}`;
        
        return item;
      }
    }),
    react(),
    AstroPWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Perimsx",
        short_name: "Perimsx",
        description: "Perimsx | 记录成长，分享价值",
        theme_color: "#006cac",
        background_color: "#fdfdfd",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "favicon.ico",
            sizes: "48x48",
            type: "image/x-icon",
          },
        ],
      },
      workbox: {
        navigateFallback: "/404",
        globPatterns: ["**/*.{css,js,html,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        navigateFallbackAllowlist: [/^\//],
      },
      experimental: {
        directoryAndTrailingSlashHandler: true,
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    plugins: [tailwindcss(), servePagefindFromDist()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
