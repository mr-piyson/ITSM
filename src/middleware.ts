// import { NextResponse } from "next/server";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {}

export const config = {
  matcher: ["/App/:path*"],
};
