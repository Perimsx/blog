"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { SITE } from "@/lib/config";

interface PostHeatmapProps {
  initialNow: string;
  posts: { pubDatetime: string | Date }[];
}

interface DayData {
  dateKey: string;
  count: number;
  level: number;
  isFuture: boolean;
}

const HEATMAP_TIME_ZONE = SITE.timezone || "UTC";

function padNumber(value: number) {
  return value.toString().padStart(2, "0");
}

function getTimeZoneDateParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });

  const parts = formatter.formatToParts(date);

  return {
    day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
    year: Number(parts.find((part) => part.type === "year")?.value ?? "1970"),
  };
}

function createDateKey(year: number, month: number, day: number) {
  return `${year}-${padNumber(month)}-${padNumber(day)}`;
}

function getDateKeyInTimeZone(date: Date, timeZone: string) {
  const parts = getTimeZoneDateParts(date, timeZone);
  return createDateKey(parts.year, parts.month, parts.day);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(date: Date) {
  return getDateKeyInTimeZone(date, HEATMAP_TIME_ZONE);
}

export const PostHeatmap: React.FC<PostHeatmapProps> = ({ posts, initialNow }) => {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const liveNow = new Date().toISOString();
    if (liveNow !== initialNow) {
      setNow(liveNow);
    }
  }, [initialNow]);

  const { weeks, months } = useMemo(() => {
    const postDates = posts.map((post) => {
      return getDateKeyInTimeZone(new Date(post.pubDatetime), HEATMAP_TIME_ZONE);
    });

    const dateCounts: Record<string, number> = {};
    postDates.forEach((dateKey) => {
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    });

    const todayDateKey = getDateKeyInTimeZone(new Date(now), HEATMAP_TIME_ZONE);
    const [tYear, tMonth, tDay] = todayDateKey.split("-").map(Number);
    const todayUTCDate = new Date(Date.UTC(tYear, tMonth - 1, tDay));
    
    // Ensure grid aligns to the Saturday of the current week (GitHub style)
    const startDayOfWeek = todayUTCDate.getUTCDay();
    const startDate = new Date(todayUTCDate.getTime());
    startDate.setUTCDate(todayUTCDate.getUTCDate() - startDayOfWeek - 52 * 7);

    const weeksData: DayData[][] = [];
    const currentDay = new Date(startDate.getTime());

    for (let i = 0; i < 53; i++) {
      const week: DayData[] = [];
      for (let j = 0; j < 7; j++) {
        const currentYear = currentDay.getUTCFullYear();
        const currentMonth = currentDay.getUTCMonth();
        const currentD = currentDay.getUTCDate();
        
        const dateKey = createDateKey(currentYear, currentMonth + 1, currentD);
        const count = dateCounts[dateKey] || 0;
        
        let level = 0;
        if (count > 0) level = Math.min(4, count);

        week.push({
          dateKey,
          count,
          level,
          isFuture: currentDay.getTime() > todayUTCDate.getTime(),
        });
        currentDay.setUTCDate(currentDay.getUTCDate() + 1);
      }
      weeksData.push(week);
    }

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthsData: { name: string; index: number }[] = [];
    const seenMonths = new Set<string>();

    const firstDayKey = weeksData[0]?.[0]?.dateKey;
    if (firstDayKey) {
      const [y, m, _d] = firstDayKey.split("-").map(Number);
      const monthKey = `${y}-${m}`;
      monthsData.push({ name: monthNames[m - 1], index: 0 });
      seenMonths.add(monthKey);
    }

    weeksData.forEach((week, weekIndex) => {
      week.forEach((day) => {
        const [y, m, d] = day.dateKey.split("-").map(Number);
        if (d !== 1) return;

        const monthKey = `${y}-${m}`;
        if (seenMonths.has(monthKey)) return;

        monthsData.push({ name: monthNames[m - 1], index: weekIndex });
        seenMonths.add(monthKey);
      });
    });

    return { weeks: weeksData, months: monthsData };
  }, [now, posts]);

  const cellSize = 10;
  const cellGap = 2.3;
  const columnStep = cellSize + cellGap;
  const rowStep = cellSize + cellGap;
  const labelHeight = 16;
  const gridOffsetY = labelHeight + 4;
  const svgWidth = (weeks.length - 1) * columnStep + cellSize;
  const gridHeight = (7 - 1) * rowStep + cellSize;
  const svgHeight = gridOffsetY + gridHeight;

  return (
    <div className="post-heatmap-container py-1 sm:py-2">
      <div className="heatmap-shell">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="heatmap-svg"
          role="img"
          aria-label="过去一年文章发布热力图"
        >
          <title>过去一年文章发布热力图</title>
          <g>
            {months.map((month, monthIndex) => (
              <text
                key={month.name + month.index}
                x={month.index * columnStep}
                y="0"
                className={`month-label ${monthIndex % 2 === 1 ? "month-label-alt" : ""}`}
                dominantBaseline="hanging"
              >
                {month.name}
              </text>
            ))}
          </g>

          {weeks.map((week, i) => (
            <g
              key={week[0]?.dateKey ?? `week-${i}`}
              transform={`translate(${i * columnStep}, ${gridOffsetY})`}
            >
              {week.map((day, j) => (
                !day.isFuture && (
                  <rect
                    key={day.dateKey}
                    width={cellSize}
                    height={cellSize}
                    x="0"
                    y={j * rowStep}
                    rx="2"
                    ry="2"
                    className={`day-rect level-${day.level}`}
                    data-date={day.dateKey}
                    data-count={day.count}
                  >
                    <title>
                      {day.count} 篇文章 - {day.dateKey}
                    </title>
                  </rect>
                )
              ))}
            </g>
          ))}
        </svg>

        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-swatch size-2.5 rounded-[2px] bg-foreground/5 dark:bg-foreground/10" />
          <div className="legend-swatch size-2.5 rounded-[2px] bg-accent/20" />
          <div className="legend-swatch size-2.5 rounded-[2px] bg-accent/50" />
          <div className="legend-swatch size-2.5 rounded-[2px] bg-accent/80" />
          <div className="legend-swatch size-2.5 rounded-[2px] bg-accent" />
          <span>More</span>
        </div>
      </div>

      <style>{`
        .heatmap-shell {
          width: 100%;
          max-width: 650px;
          margin-inline: auto;
        }
        .month-label {
          font-size: 10px;
          fill: color-mix(in srgb, var(--color-foreground) 40%, transparent);
          white-space: nowrap;
        }
        .heatmap-svg {
          display: block;
          width: 100%;
          height: auto;
        }
        .heatmap-legend {
          margin-top: 0.5rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
          gap: 0.375rem;
          font-size: 10px;
          font-family: var(--font-mono);
          color: color-mix(in srgb, var(--color-foreground) 40%, transparent);
        }
        .day-rect {
          transition: all 0.2s;
        }
        .day-rect:hover {
          stroke: var(--color-foreground);
          stroke-width: 1px;
          opacity: 0.8;
        }
        .level-0 { fill: color-mix(in srgb, var(--color-foreground) 5%, transparent); }
        .level-1 { fill: color-mix(in srgb, var(--color-accent) 20%, transparent); }
        .level-2 { fill: color-mix(in srgb, var(--color-accent) 50%, transparent); }
        .level-3 { fill: color-mix(in srgb, var(--color-accent) 80%, transparent); }
        .level-4 { fill: var(--color-accent); }
        .dark .level-0 { fill: color-mix(in srgb, var(--color-foreground) 10%, transparent); }
        @media (max-width: 480px) {
          .post-heatmap-container {
            padding-block: 0.1rem 0;
          }
          .month-label {
            font-size: 9px;
          }
          .month-label-alt {
            display: none;
          }
          .heatmap-legend {
            justify-content: flex-start;
            margin-top: 0.35rem;
            gap: 0.25rem;
            font-size: 9px;
          }
          .legend-swatch {
            width: 0.55rem;
            height: 0.55rem;
          }
        }
      `}</style>
    </div>
  );
};
