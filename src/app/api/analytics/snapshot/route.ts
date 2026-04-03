import { NextResponse } from "next/server";
import { getMonitorSnapshot } from "@/features/analytics/lib/monitor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const snapshot = await getMonitorSnapshot();

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
