"use client";

import type React from "react";
import { useMemo } from "react";

interface PostHeatmapProps {
  posts: { pubDatetime: string | Date }[];
}

interface DayData {
  date: Date;
  count: number;
  level: number;
  isFuture: boolean;
}

export const PostHeatmap: React.FC<PostHeatmapProps> = ({ posts }) => {
  const { weeks, months } = useMemo(() => {
    const postDates = posts.map((post) => {
      const date = new Date(post.pubDatetime);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    });

    const dateCounts: Record<number, number> = {};
    postDates.forEach((date) => {
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysToDisplay = 371;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToDisplay + 1);
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const weeksData: DayData[][] = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 53; i++) {
      const week: DayData[] = [];
      for (let j = 0; j < 7; j++) {
        const time = currentDay.getTime();
        const count = dateCounts[time] || 0;
        let level = 0;
        if (count > 0) level = Math.min(4, Math.floor(count / 1) + 1);

        week.push({
          date: new Date(currentDay),
          count,
          level,
          isFuture: currentDay > today,
        });
        currentDay.setDate(currentDay.getDate() + 1);
      }
      weeksData.push(week);
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthsData: { name: string; index: number }[] = [];
    let lastMonth = -1;
    weeksData.forEach((week, i) => {
      const month = week[0].date.getMonth();
      if (month !== lastMonth) {
        monthsData.push({ name: monthNames[month], index: i });
        lastMonth = month;
      }
    });

    return { weeks: weeksData, months: monthsData };
  }, [posts]);

  const columnGap = 12.3;
  const cellSize = 10;
  const svgWidth = (weeks.length - 1) * columnGap + cellSize;
  const svgHeight = (7 - 1) * columnGap + cellSize;

  return (
    <div className="post-heatmap-container py-1 sm:py-2">
      <div className="heatmap-shell">
        <div className="month-row" aria-hidden="true">
          {months.map((m, monthIndex) => (
            <span
              key={m.name + m.index}
              className={`month-label ${monthIndex % 2 === 1 ? "month-label-alt" : ""}`}
              style={{ left: `${((m.index * columnGap) / svgWidth) * 100}%` }}
            >
              {m.name}
            </span>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="heatmap-svg"
          role="img"
          aria-label="过去一年文章发布热力图"
        >
          <title>过去一年文章发布热力图</title>
          {weeks.map((week, i) => (
            <g
              key={week[0]?.date.toISOString() ?? `week-${i}`}
              transform={`translate(${i * columnGap}, 0)`}
            >
              {week.map((day, j) => (
                <rect
                  key={day.date.toISOString()}
                  width={cellSize}
                  height={cellSize}
                  x="0"
                  y={j * columnGap}
                  rx="2"
                  ry="2"
                  className={`day-rect level-${day.level} ${day.isFuture ? "opacity-0" : ""}`}
                  data-date={day.date.toDateString()}
                  data-count={day.count}
                >
                  <title>
                    {day.count} 篇文章 - {day.date.toLocaleDateString()}
                  </title>
                </rect>
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
          overflow: hidden;
        }
        .month-row {
          position: relative;
          height: 1rem;
          margin-bottom: 0.75rem;
          font-size: 10px;
          color: color-mix(in srgb, var(--color-foreground) 40%, transparent);
        }
        .month-label {
          position: absolute;
          top: 0;
          left: 0;
          transform: translateX(-10%);
          white-space: nowrap;
        }
        .month-label:first-child {
          transform: translateX(0);
        }
        .heatmap-svg {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
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
          .month-row {
            height: 0.9rem;
            font-size: 9px;
            margin-bottom: 0.45rem;
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
