"use client";

import { useEffect } from "react";
import { shouldProxyExternalImage, toImageProxyUrl } from "@/lib/imageProxy";

/**
 * 客户端增强：挂载后对 #article 做 DOM 后处理。
 * - 表格包裹为可横滚容器
 * - 防盗链图片加载失败时自动走代理
 * - 图片懒加载兜底
 */
export function ArticleEnhancer() {
  useEffect(() => {
    const article = document.getElementById("article");
    if (!article) return;

    // 1. 表格 → 横滚容器
    const tables = Array.from(article.querySelectorAll<HTMLTableElement>("table"));
    for (const table of tables) {
      if (table.parentElement?.classList.contains("table-scroll-wrapper")) continue;
      const wrapper = document.createElement("div");
      wrapper.className = "table-scroll-wrapper";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }

    // 2. 防盗链图片 fallback + 懒加载
    const images = Array.from(article.querySelectorAll<HTMLImageElement>("img"));
    for (const img of images) {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }

      const src = img.getAttribute("src") ?? "";
      // 已经是代理地址则跳过
      if (src.startsWith("/api/image")) continue;

      // 直接判断：如果是需要代理的外链，立即替换
      if (shouldProxyExternalImage(src)) {
        img.setAttribute("src", toImageProxyUrl(src));
        continue;
      }

      // 其他外链图片：监听 onerror，加载失败时尝试代理
      if (src.startsWith("http")) {
        img.addEventListener(
          "error",
          () => {
            if (img.dataset.proxyRetried) return;
            img.dataset.proxyRetried = "1";
            img.classList.add("img-loading-error");
            // 无论是否在 hotlink 列表内，都尝试代理一次
            img.setAttribute("src", toImageProxyUrl(src));
          },
          { once: true },
        );
      }
    }
  }, []);

  return null;
}
