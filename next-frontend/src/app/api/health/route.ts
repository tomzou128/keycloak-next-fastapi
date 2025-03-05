// src/app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // You can add more comprehensive health checks here
  // e.g., database connectivity, external service availability, etc.
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
