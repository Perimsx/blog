import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  description: "通过邮件、QQ 或在线留言与 Perimsx 取得联系。",
  keywords: ["联系 Perimsx", "技术交流", "博客留言"],
  pathname: "/contact",
  title: "联系",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
