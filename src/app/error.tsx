"use client";

import Link from "next/link";
import { StatusPanel } from "@/components/StatusPanel";

export default function ErrorPage() {
  return (
    <main
      id="main-content"
      className="ui-page layout-frame flex flex-1 items-center justify-center py-12 sm:py-16"
    >
      <StatusPanel
        code="500"
        title="服务暂时不可用"
        description="页面暂时无法打开，可能是服务波动或资源尚未准备完成。稍后刷新再试即可。"
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
