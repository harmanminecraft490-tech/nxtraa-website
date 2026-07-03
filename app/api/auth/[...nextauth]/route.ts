import { NextResponse } from "next/server";

const disabledResponse = NextResponse.json(
  { error: "OAuth sign-in is not enabled for this site." },
  { status: 404 },
);

export function GET() {
  return disabledResponse;
}

export function POST() {
  return disabledResponse;
}
