"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CommentIconMessage } from "./icons";

type CommentsProps = {
  path: string;
};

type TwikooClient = {
  init: (options: {
    el: string;
    envId: string;
    lang?: string;
    path?: string;
    region?: string;
  }) => Promise<void> | void;
};

type TwikooWindow = Window & {
  twikoo?: TwikooClient;
};

const TWIKOO_VERSION = process.env.NEXT_PUBLIC_TWIKOO_VERSION?.trim() || "1.7.7";

let twikooLoader: Promise<TwikooClient> | null = null;
let twikooLoaderUrl = "";

function getTwikooScriptUrl(envId: string) {
  const bundleName =
    envId.startsWith("https://") || envId.startsWith("http://")
      ? "twikoo.min.js"
      : "twikoo.all.min.js";

  return `https://cdn.jsdelivr.net/npm/twikoo@${TWIKOO_VERSION}/dist/${bundleName}`;
}

function loadTwikooScript(scriptUrl: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Twikoo 只能在浏览器环境中加载。"));
  }

  const twikoo = (window as TwikooWindow).twikoo;
  if (twikoo) {
    return Promise.resolve(twikoo);
  }

  if (twikooLoader && twikooLoaderUrl === scriptUrl) {
    return twikooLoader;
  }

  twikooLoaderUrl = scriptUrl;
  twikooLoader = new Promise<TwikooClient>((resolve, reject) => {
    const handleLoad = () => {
      const loadedTwikoo = (window as TwikooWindow).twikoo;
      if (loadedTwikoo) {
        resolve(loadedTwikoo);
        return;
      }

      twikooLoader = null;
      reject(new Error("Twikoo 脚本已加载，但未找到全局实例。"));
    };

    const handleError = () => {
      twikooLoader = null;
      reject(new Error("Twikoo 脚本加载失败，请检查网络或 CDN 配置。"));
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-twikoo-script="true"]'
    );

    if (existingScript) {
      if (existingScript.src !== scriptUrl) {
        existingScript.remove();
      } else {
        existingScript.addEventListener("load", handleLoad, { once: true });
        existingScript.addEventListener("error", handleError, { once: true });
        return;
      }
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = scriptUrl;
    script.dataset.twikooScript = "true";
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });

  return twikooLoader;
}

export default function Comments({ path }: CommentsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const envId = process.env.NEXT_PUBLIC_TWIKOO_ENV_ID?.trim() || "";
  const region = process.env.NEXT_PUBLIC_TWIKOO_REGION?.trim() || "";
  const lang = process.env.NEXT_PUBLIC_TWIKOO_LANG?.trim() || "zh-CN";
  const scriptUrl = useMemo(
    () => (envId ? getTwikooScriptUrl(envId) : ""),
    [envId]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const containerId = useMemo(() => "twikoo-comments", []);
  const envHelp = (
    <span className="whitespace-nowrap">
      评论功能暂未开放，如有问题联系<a href="mailto:Cotovo@163.com" className="transition-colors hover:text-accent hover:underline">Cotovo@163.com</a>
    </span>
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!envId || !container || !scriptUrl) {
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setError("");
    container.innerHTML = "";

    void loadTwikooScript(scriptUrl)
      .then(async (twikoo) => {
        if (cancelled) {
          return;
        }

        await Promise.resolve(
          twikoo.init({
            el: `#${containerId}`,
            envId,
            lang,
            path,
            region: region || undefined,
          })
        );

        if (!cancelled) {
          setIsLoading(false);
        }
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Twikoo 初始化失败，请检查环境配置。"
        );
      });

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [containerId, envId, lang, path, region, scriptUrl]);

  return (
    <section id="comments" className="mt-1 sm:mt-1.5">
      <div className="space-y-3 border-t border-border/45 pt-3 sm:pt-3.5">
        <h2 className="inline-flex items-center gap-2 text-[0.98rem] font-semibold text-accent/92 sm:text-[1.02rem]">
          <CommentIconMessage className="h-[0.98rem] w-[0.98rem]" />
          <span>评论</span>
        </h2>

        {!envId ? (
          <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-[0.9rem] text-foreground/60">
            {envHelp}
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="space-y-3" aria-live="polite">
                <div className="h-[4.5rem] border-b border-border/45 bg-muted/10" />
                <div className="h-[4.5rem] border-b border-border/35 bg-muted/5" />
              </div>
            ) : null}

            {error ? (
              <div className="border border-red-200/70 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:text-red-300">
                <p>{error}</p>
                <p className="mt-1 text-[0.82rem] text-current/80">
                  请确认 Twikoo 后端可访问，并让前端 CDN 版本与后端版本保持一致。
                </p>
              </div>
            ) : null}

            <div
              id={containerId}
              ref={containerRef}
              className={isLoading ? "min-h-[12rem]" : ""}
              data-twikoo-path={path}
            />
          </>
        )}
      </div>
    </section>
  );
}
