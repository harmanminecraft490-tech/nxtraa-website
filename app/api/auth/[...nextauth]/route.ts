import { NextResponse } from "next/server";

const response = NextResponse.json(
  { error: "Authentication is temporarily disabled." },
  { status: 404 },
);

export function GET() {
  return response;
}

export function POST() {
  return response;
}
