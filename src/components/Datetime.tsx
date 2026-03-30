import React from "react";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { SITE } from "@/lib/config";
import { IconCalendar } from "@/components/icons";

dayjs.extend(utc);
dayjs.extend(timezone);

interface DatetimeProps {
  pubDatetime: string | Date;
  modDatetime?: string | Date | null;
  timezone?: string;
  size?: "sm" | "lg";
  className?: string;
}

export const Datetime: React.FC<DatetimeProps> = ({
  pubDatetime,
  modDatetime,
  timezone: postTimezone,
  size = "sm",
  className = "",
}) => {
  const hasUpdated = Boolean(modDatetime && dayjs(modDatetime).isAfter(dayjs(pubDatetime)));
  const latestDatetime = hasUpdated ? modDatetime : pubDatetime;
  const datetime = dayjs(latestDatetime).tz(postTimezone || SITE.timezone);
  const date = datetime.format("D MMM, YYYY");

  return (
    <div className={["flex items-center gap-2 opacity-80", className].join(" ")}>
      <IconCalendar
        className={[
          "inline-block size-5 min-w-[1.25rem]",
          size === "sm" ? "size-4 min-w-[1rem]" : "",
        ].join(" ")}
      />
      {hasUpdated ? (
        <span className={["text-sm italic", size === "lg" ? "sm:text-base" : ""].join(" ")}>
          Updated:
        </span>
      ) : (
        <span className="sr-only">Published:</span>
      )}
      <span className={["text-sm italic", size === "lg" ? "sm:text-base" : ""].join(" ")}>
        <time dateTime={datetime.toISOString()}>{date}</time>
      </span>
    </div>
  );
};
