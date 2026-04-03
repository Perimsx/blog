import type { Metadata } from "next";
import { MonitorDashboard } from "@/components/monitor/MonitorDashboard";
import { getMonitorSnapshot } from "@/features/analytics/lib/monitor";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  description: "查看站点访问概览、流量趋势、来源分布和页面排行。",
  keywords: ["站点监控", "访问统计", "流量面板", "博客分析"],
  pathname: "/monitor",
  title: "监控",
});

export default async function MonitorPage() {
  const initialData = await getMonitorSnapshot();

  return (
    <main id="main-content" className="ui-page mx-auto w-full max-w-5xl px-4 sm:px-6 page-shell">
      <div className="mt-4 sm:mt-6">
        <MonitorDashboard initialData={initialData} />
      </div>
    </main>
  );
}
