import { NextResponse } from "next/server";
import { isRequestAuthorized } from "@/lib/admin/auth";

export async function GET(req: Request) {
  const authenticated = isRequestAuthorized(req);
  return NextResponse.json({ authenticated });
}
