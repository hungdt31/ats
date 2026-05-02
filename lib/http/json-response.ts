import { NextResponse } from "next/server";

import type { ApiErrorBody } from "../../types/api";

export function jsonError(
  status: number,
  error: string,
  fieldErrors?: Record<string, string[] | undefined>
): NextResponse<ApiErrorBody> {
  const cleaned =
    fieldErrors &&
    Object.fromEntries(Object.entries(fieldErrors).filter(([, v]) => v != null && v.length > 0));
  return NextResponse.json(
    {
      success: false,
      error,
      ...(cleaned && Object.keys(cleaned).length > 0 ? { fieldErrors: cleaned as Record<string, string[]> } : {}),
    },
    { status }
  );
}
