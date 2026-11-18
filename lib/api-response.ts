import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message ? { message } : {}),
    },
    { status }
  );
}

export function apiError(message: string, code: string = "BAD_REQUEST", status: number = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}
