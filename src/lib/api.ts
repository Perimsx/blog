import { NextResponse } from "next/server";

export interface ApiSuccess<T = unknown> {
  success: true;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export function apiSuccess<T>(data?: T, meta?: Record<string, unknown>): ApiSuccess<T> {
  return { success: true, data, meta };
}

export function apiError(error: string): ApiError {
  return { success: false, error };
}

export function jsonError(
  error: string,
  status = 400,
  extraHeaders?: Record<string, string>
): NextResponse {
  return NextResponse.json(apiError(error), {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}
