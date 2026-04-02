import Link from "next/link";
import { StatusPanel } from "@/components/StatusPanel";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="ui-page layout-frame flex flex-1 items-center justify-center py-12 sm:py-16"
    >
      <StatusPanel
        code="404"
        title="页面未找到"
        description="你访问的链接可能已经失效，或者地址里多带了前缀与尾斜杠。"
      >
        <Link
          href="/"
          className="text-base underline decoration-dashed underline-offset-8 sm:text-lg hover:opacity-80"
        >
          返回首页
        </Link>
      </StatusPanel>
    </main>
  );
}
