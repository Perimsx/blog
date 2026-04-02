import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "联系",
  description: "通过邮件、QQ 或在线留言与 Perimsx 取得联系。",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
