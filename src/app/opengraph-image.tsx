import { ImageResponse } from "next/og";
import { SEO_BRAND_NAME } from "@/lib/seo";

export const alt = `${SEO_BRAND_NAME} 分享图`;
export const contentType = "image/png";
export const size = {
  height: 630,
  width: 1200,
};

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "linear-gradient(135deg, #07111f 0%, #0c1d34 52%, #103456 100%)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "68px",
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
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {SEO_BRAND_NAME}
        </div>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 999,
            color: "rgba(248,250,252,0.82)",
            display: "flex",
            fontSize: 22,
            padding: "12px 22px",
          }}
        >
          Tech Blog
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxWidth: 860,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.08,
          }}
        >
          {SEO_BRAND_NAME}
        </div>
        <div
          style={{
            color: "rgba(226,232,240,0.9)",
            display: "flex",
            fontSize: 32,
            lineHeight: 1.45,
          }}
        >
          Security notes, web development, and technical writing.
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
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          InfoSec · Web Dev · Technical Writing
        </div>
        <div
          style={{
            color: "rgba(226,232,240,0.72)",
            display: "flex",
            fontSize: 24,
          }}
        >
          chenguitao.com
        </div>
      </div>
    </div>,
    size
  );
}
