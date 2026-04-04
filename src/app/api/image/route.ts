import { NextResponse } from "next/server";
import {
  buildUpstreamImageHeaders,
  getHotlinkPlatform,
  guessImageContentType,
  isPrivateIpv4,
  isPrivateIpv6,
  looksLikeImageResponse,
  parseExternalImageUrl,
} from "@/lib/imageProxy";

async function checkDnsRebinding(hostname: string): Promise<boolean> {
  try {
    const dns = await import("node:dns");
    const addresses4 = await dns.promises.resolve4(hostname).catch(() => []);
    const addresses6 = await dns.promises.resolve6(hostname).catch(() => []);
    const allAddresses = [...addresses4, ...addresses6];
    if (allAddresses.length > 0) {
      for (const addr of allAddresses) {
        if (isPrivateIpv4(addr) || isPrivateIpv6(addr)) return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const rawUrl = requestUrl.searchParams.get("url");
  const targetUrl = parseExternalImageUrl(rawUrl ?? "");

  if (!targetUrl) {
    return new Response("无效的图片地址", { status: 400 });
  }

  if (!getHotlinkPlatform(targetUrl)) {
    return new Response("当前地址不在防盗链代理范围内", { status: 400 });
  }

  // DNS rebinding protection: resolve the hostname and block if it resolves to a private IP
  const dnsCheck = await checkDnsRebinding(targetUrl.hostname);
  if (!dnsCheck) {
    return new Response("图片地址解析失败（DNS rebinding 保护）", { status: 400 });
  }

  const upstreamResponse = await fetch(targetUrl, {
    headers: buildUpstreamImageHeaders(targetUrl),
    redirect: "follow",
  });

  if (!upstreamResponse.ok) {
    return new Response(`上游图片请求失败：${upstreamResponse.status}`, { status: 502 });
  }

  const contentType = upstreamResponse.headers.get("content-type") || "";
  if (!looksLikeImageResponse(targetUrl, contentType)) {
    return new Response("上游返回的不是图片资源", { status: 415 });
  }

  const headers = new Headers();
  headers.set("Content-Type", contentType || guessImageContentType(targetUrl));
  headers.set(
    "Cache-Control",
    "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
  );

  const etag = upstreamResponse.headers.get("etag");
  const lastModified = upstreamResponse.headers.get("last-modified");
  const contentLength = upstreamResponse.headers.get("content-length");

  if (etag) headers.set("ETag", etag);
  if (lastModified) headers.set("Last-Modified", lastModified);
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(upstreamResponse.body, {
    status: 200,
    headers,
  });
}
