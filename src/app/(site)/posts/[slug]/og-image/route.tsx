import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";
import { SITE } from "@/lib/config";
import { SEO_BRAND_NAME } from "@/lib/seo";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

const SITE_HOST = new URL(SITE.website).host;

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function toAsciiHeadline(value: string, fallback: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return [...normalized].every((character) => character.charCodeAt(0) <= 0x7f)
    ? normalized
    : fallback;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return new Response("Not Found", { status: 404 });
  }

  const title = truncate(toAsciiHeadline(post.data.title, post.url.toUpperCase()), 44);
  const description = truncate(
    "Security and engineering notes from Perimsx, optimized for reliable social sharing previews.",
    96
  );

  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "linear-gradient(135deg, #0f172a 0%, #10233b 54%, #163d67 100%)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "64px",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 0.8,
          }}
        >
          {SEO_BRAND_NAME}
        </div>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 999,
            color: "rgba(226,232,240,0.82)",
            display: "flex",
            fontSize: 22,
            padding: "10px 20px",
          }}
        >
          Blog Post
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          maxWidth: 980,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: -1.8,
            lineHeight: 1.14,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "rgba(226,232,240,0.88)",
            display: "flex",
            fontSize: 28,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          alignItems: "flex-end",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "rgba(125,211,252,0.92)",
            display: "flex",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          Article · {post.url}
        </div>
        <div
          style={{
            color: "rgba(226,232,240,0.72)",
            display: "flex",
            fontSize: 24,
          }}
        >
          {SITE_HOST}
        </div>
      </div>
    </div>,
    {
      height: 630,
      width: 1200,
    }
  );
}
