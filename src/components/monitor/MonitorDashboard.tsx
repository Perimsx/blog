"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Calendar, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";
import type { MonitorSnapshotPayload } from "@/features/analytics/lib/monitor";
import type {
  AnalyticsBreakdownStat,
  AnalyticsPageStat,
  AnalyticsTimeseriesPoint,
} from "@/features/analytics/lib/store";

const PIE_COLORS = ["#006cac", "#2f8fca", "#69aedf", "#9fcaec", "#d2e7f6", "#edf5fb"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.21, 0.47, 0.32, 0.98] as any,
    },
  },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("zh-CN");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function formatDuration(seconds: number) {
  if (!seconds) {
    return "0s";
  }

  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  if (!minutes) {
    return `${restSeconds}s`;
  }

  return `${minutes}m ${restSeconds}s`;
}

function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.6rem] border border-border/50 bg-background/60 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-border/80 hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

function SurfaceHeader({
  meta,
  title,
}: {
  meta?: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 px-5 py-3.5">
      <h2 className="text-[0.88rem] font-bold tracking-tight text-foreground/90">{title}</h2>
      {meta ? (
        <span className="text-[0.7rem] font-medium text-foreground/38">{meta}</span>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subValue,
  icon,
}: {
  icon?: React.ReactNode;
  label: string;
  subValue?: string;
  value: string;
}) {
  return (
    <Surface className="flex flex-col p-3.5 sm:p-5">
      <div className="flex items-start justify-between">
        <span className="text-[0.625rem] font-bold tracking-wider text-foreground/42 uppercase sm:text-[0.72rem]">
          {label}
        </span>
        {icon && <div className="hidden text-foreground/30 sm:block">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5 sm:mt-2.5 sm:gap-2">
        <div className="text-[1.3rem] leading-none font-extrabold tracking-tight text-foreground sm:text-[1.6rem]">
          {value}
        </div>
        {subValue && (
          <div className="max-w-[50%] truncate text-[0.625rem] font-medium text-foreground/34 sm:text-[0.7rem]">
            {subValue}
          </div>
        )}
      </div>
    </Surface>
  );
}

function ListTable({
  items,
  title,
  limit = 8,
}: {
  items: AnalyticsBreakdownStat[];
  limit?: number;
  title: string;
}) {
  return (
    <Surface>
      <SurfaceHeader title={title} meta={items.length ? undefined : "0"} />
      <div className="divide-y divide-border/30">
        {items.length === 0 ? (
          <div className="px-4 py-4 text-sm text-foreground/34 sm:px-5 sm:py-5">暂无数据</div>
        ) : (
          items.slice(0, limit).map((item, index) => (
            <div
              key={item.label}
              className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 transition-colors hover:bg-foreground/[0.02] sm:gap-3 sm:px-5 sm:py-3.5"
            >
              <span className="text-[0.6rem] font-bold text-foreground/24 sm:text-[0.65rem]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="truncate text-[0.75rem] font-medium text-foreground/75 sm:text-[0.82rem]">
                {item.label}
              </span>
              <span className="text-[0.75rem] font-bold text-foreground sm:text-[0.82rem]">
                {formatNumber(item.value)}
              </span>
            </div>
          ))
        )}
      </div>
    </Surface>
  );
}

function PagesList({
  items,
}: {
  items: AnalyticsPageStat[];
}) {
  return (
    <div className="divide-y divide-border/30">
      {items.length === 0 ? (
        <div className="px-4 py-4 text-sm text-foreground/34 sm:px-5 sm:py-5">暂无数据</div>
      ) : (
        items.slice(0, 8).map((item, index) => (
          <div
            key={item.path}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)_3.5rem_3.5rem] items-center gap-2 px-4 py-3 transition-colors hover:bg-foreground/[0.02] sm:grid-cols-[1.8rem_minmax(0,1fr)_4rem_4rem] sm:gap-3 sm:px-5 sm:py-3.5"
          >
            <span className="text-[0.6rem] font-bold text-foreground/24 sm:text-[0.65rem]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[0.75rem] font-bold text-foreground/80 sm:text-[0.82rem]">
                {item.title || item.path}
              </div>
              <div className="truncate text-[0.65rem] font-medium text-foreground/38 sm:text-[0.68rem]">
                {item.path}
              </div>
            </div>
            <span className="text-right text-[0.75rem] font-medium text-foreground/60 sm:text-[0.82rem]">
              {formatNumber(item.views)}
            </span>
            <span className="text-right text-[0.75rem] font-bold text-foreground sm:text-[0.82rem]">
              {formatNumber(item.visitors)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function TooltipShell({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{
    color?: string;
    dataKey?: string;
    name?: string;
    value?: number | string;
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="z-50 rounded-xl border border-border/80 bg-background/95 px-3 py-2 shadow-xl backdrop-blur-md sm:rounded-2xl sm:px-3.5 sm:py-2.5">
      {label ? (
        <div className="mb-1.5 text-[0.6rem] font-bold tracking-widest text-foreground/40 uppercase sm:mb-2 sm:text-[0.68rem]">
          {label}
        </div>
      ) : null}
      <div className="space-y-1 sm:space-y-1.5">
        {payload.map((entry) => (
          <div
            key={`${entry.dataKey}-${entry.name}`}
            className="flex items-center gap-2 text-[0.75rem] sm:gap-3 sm:text-[0.82rem]"
          >
            <span
              className="inline-block h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
              style={{ backgroundColor: entry.color ?? "#006cac" }}
            />
            <span className="font-medium text-foreground/60">{entry.name}</span>
            <span className="ml-auto font-bold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyChart({ className }: { className: string }) {
  return (
    <div
      className={`rounded-[1.4rem] border border-border/50 bg-foreground/[0.03] sm:rounded-3xl ${className}`}
    />
  );
}

function TrafficChart({ items }: { items: AnalyticsTimeseriesPoint[] }) {
  return (
    <div className="h-[14rem] w-full sm:h-[22rem]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={items} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="monitorViewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#006cac" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#006cac" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="monitorVisitorsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#73bdf2" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#73bdf2" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#888888" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 10, opacity: 0.4 }}
            dy={8}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={32}
            tick={{ fill: "currentColor", fontSize: 10, opacity: 0.4 }}
          />
          <Tooltip
            content={<TooltipShell />}
            cursor={{ stroke: "rgba(0,108,172,0.1)", strokeWidth: 1.5 }}
          />
          <Area
            type="monotone"
            dataKey="views"
            name="浏览量"
            stroke="#006cac"
            strokeWidth={2}
            fill="url(#monitorViewsFill)"
            activeDot={{ r: 4, fill: "#006cac", stroke: "#ffffff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            name="访客数"
            stroke="#73bdf2"
            strokeWidth={1.5}
            fill="url(#monitorVisitorsFill)"
            activeDot={{ r: 4, fill: "#73bdf2", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SourcesChart({ items }: { items: AnalyticsBreakdownStat[] }) {
  const chartData = items.length ? items : [{ label: "直接访问", value: 0 }];

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center sm:gap-6 sm:p-6">
      <div className="relative h-[10rem] w-full sm:h-[12rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius="70%"
              outerRadius="95%"
              paddingAngle={4}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<TooltipShell />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[0.55rem] font-bold tracking-[0.16em] text-foreground/30 uppercase">
            总览
          </span>
          <span className="mt-0.5 text-[1.2rem] leading-none font-extrabold tracking-tight text-foreground sm:text-[1.4rem]">
            {formatNumber(items.reduce((sum, item) => sum + item.value, 0))}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-1 sm:space-y-2.5">
        {items.length === 0 ? (
          <div className="col-span-2 text-[0.75rem] text-foreground/34 sm:col-span-1">
            暂无数据
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between gap-2 text-[0.75rem]">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full ring-2 ring-offset-1 ring-offset-background"
                  style={{
                    backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                    "--tw-ring-color": PIE_COLORS[index % PIE_COLORS.length],
                  } as React.CSSProperties}
                />
                <span className="truncate font-medium text-foreground/60">{item.label}</span>
              </div>
              <span className="font-bold text-foreground/80">{formatNumber(item.value)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PagesChart({ items }: { items: AnalyticsPageStat[] }) {
  const chartData = items.length
    ? items.slice(0, 6).map((item) => ({
        name: item.title || item.path,
        path: item.path.length > 18 ? `${item.path.slice(0, 18)}...` : item.path,
        views: item.views,
      }))
    : [{ path: "/", views: 0 }];

  return (
    <div className="h-[16rem] w-full px-4 pb-4 sm:h-[20rem] sm:px-5 sm:pb-5">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
          barCategoryGap={16}
        >
          <CartesianGrid stroke="#888888" strokeOpacity={0.08} horizontal={true} vertical={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 10, opacity: 0.4 }}
          />
          <YAxis
            dataKey="path"
            type="category"
            tickLine={false}
            axisLine={false}
            width={70}
            tick={{ fill: "currentColor", fontSize: 10, opacity: 0.6 }}
          />
          <Tooltip content={<TooltipShell />} cursor={{ fill: "rgba(0,108,172,0.04)" }} />
          <Bar
            dataKey="views"
            name="浏览量"
            radius={[0, 4, 4, 0]}
            fill="#006cac"
            maxBarSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DevicesChart({ items }: { items: AnalyticsBreakdownStat[] }) {
  const chartData = items.length ? items : [{ label: "Desktop", value: 0 }];

  return (
    <div className="h-[14rem] w-full px-4 pb-4 sm:h-[20rem] sm:px-5 sm:pb-5">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="#888888" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 10, opacity: 0.6 }}
            dy={8}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={32}
            tick={{ fill: "currentColor", fontSize: 10, opacity: 0.4 }}
          />
          <Tooltip content={<TooltipShell />} cursor={{ fill: "rgba(0,108,172,0.04)" }} />
          <Bar
            dataKey="value"
            name="访问量"
            radius={[4, 4, 0, 0]}
            fill="#006cac"
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <EmptyChart className="h-24 sm:h-28" />
        <EmptyChart className="h-24 sm:h-28" />
        <EmptyChart className="h-24 sm:h-28" />
        <EmptyChart className="h-24 sm:h-28" />
      </div>
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.4fr)]">
        <EmptyChart className="h-[18rem] sm:h-[26rem]" />
        <EmptyChart className="h-[18rem] sm:h-[26rem]" />
      </div>
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <EmptyChart className="h-[18rem] sm:h-[24rem]" />
        <EmptyChart className="h-[18rem] sm:h-[24rem]" />
      </div>
    </div>
  );
}

export function MonitorDashboard({ initialData }: { initialData: MonitorSnapshotPayload }) {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let isDisposed = false;

    const refresh = async () => {
      try {
        const response = await fetch("/api/analytics/snapshot", {
          cache: "no-store",
          headers: {
            "cache-control": "no-cache",
          },
        });

        if (!response.ok) {
          return;
        }

        const nextData = (await response.json()) as MonitorSnapshotPayload;

        if (!isDisposed) {
          setData(nextData);
        }
      } catch {}
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    const handleFocus = () => {
      void refresh();
    };

    const intervalId = window.setInterval(() => {
      void refresh();
    }, 15000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (!isMounted) {
    return <DashboardSkeleton />;
  }

  const { analytics: snapshot, site } = data;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative space-y-5 px-0.5 pb-10 sm:space-y-6 sm:pb-12"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[40rem] w-[80rem] -translate-x-1/2 bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)] opacity-[0.02] sm:opacity-[0.03]" />

      <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
        <div className="text-[0.95rem] font-bold tracking-tight text-foreground/80">概览</div>
        <div className="text-[0.625rem] font-bold tracking-widest text-foreground/24 uppercase">
          {formatDateTime(snapshot.generatedAt)}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <SummaryCard
          label="在线天数"
          value={formatNumber(site.onlineDays)}
          subValue={`始于 ${site.startedAt}`}
          icon={<Calendar size={18} strokeWidth={2.5} />}
        />
        <SummaryCard
          label="文章总数"
          value={formatNumber(site.posts)}
          subValue={`${formatNumber(site.totalWords)} 字`}
          icon={<FileText size={18} strokeWidth={2.5} />}
        />
        <SummaryCard
          label="累计访问"
          value={formatNumber(snapshot.overview.pageviews)}
          subValue={`${formatNumber(snapshot.overview.visitors)} 访客`}
          icon={<BarChart3 size={18} strokeWidth={2.5} />}
        />
        <SummaryCard
          label="平均停留"
          value={formatDuration(snapshot.overview.avgVisitDurationSeconds)}
          subValue={`跳出率 ${snapshot.overview.bounceRate}%`}
          icon={<Clock size={18} strokeWidth={2.5} />}
        />
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,0.45fr)]">
        <Surface>
          <SurfaceHeader title="流量趋势" meta="最近 30 天" />
          <div className="px-4 pt-2 pb-4 sm:px-5 sm:pt-3 sm:pb-5">
            <TrafficChart items={snapshot.timeseries} />
          </div>
        </Surface>

        <Surface>
          <SurfaceHeader title="访问来源" />
          <SourcesChart items={snapshot.referrers} />
        </Surface>
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,0.45fr)]">
        <Surface>
          <SurfaceHeader title="热门内容" meta="浏览量 / 访客数" />
          <PagesList items={snapshot.pages} />
        </Surface>

        <Surface>
          <SurfaceHeader title="路径分布" />
          <PagesChart items={snapshot.pages} />
        </Surface>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Surface>
          <SurfaceHeader title="访问设备" />
          <DevicesChart items={snapshot.devices} />
        </Surface>

        <ListTable title="浏览器排名" items={snapshot.browsers} />
        <ListTable title="地区分布" items={snapshot.countries} />
      </div>
    </motion.div>
  );
}
