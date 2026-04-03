import { NextResponse } from "next/server";
import {
  recordAnalyticsEvent,
  type AnalyticsEventType,
  type RecordAnalyticsInput,
} from "@/features/analytics/lib/store";

type TrackPayload = {
  durationMs?: number;
  path?: string;
  referrer?: string | null;
  sessionId?: string;
  title?: string | null;
  type?: AnalyticsEventType;
  visitorId?: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { error: message, success: false },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
      status,
    }
  );
}

export async function POST(request: Request) {
  let payload: TrackPayload;

  try {
    payload = (await request.json()) as TrackPayload;
  } catch {
    return jsonError("invalid analytics payload");
  }

  if (!payload.type || (payload.type !== "pageview" && payload.type !== "pageleave")) {
    return jsonError("invalid analytics event type");
  }

  if (!payload.path || !payload.sessionId || !payload.visitorId) {
    return jsonError("missing analytics identifiers");
  }

  const input: RecordAnalyticsInput = {
    durationMs: typeof payload.durationMs === "number" ? payload.durationMs : null,
    path: payload.path,
    referrer: payload.referrer ?? "",
    sessionId: payload.sessionId,
    title: payload.title ?? "",
    type: payload.type,
    visitorId: payload.visitorId,
  };

  try {
    const result = await recordAnalyticsEvent(input, request);

    return NextResponse.json(
      { ...result, success: true },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
        status: 202,
      }
    );
  } catch {
    return jsonError("failed to store analytics event", 500);
  }
}
