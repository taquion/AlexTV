import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyTokenEdge } from "@/lib/auth-edge";

const PUBLIC_API_PREFIXES = ["/api/auth", "/api/collections/validate-pin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public API endpoints
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // GET /api/collections* is public (player needs it)
  if (pathname.startsWith("/api/collections") && request.method === "GET") {
    return NextResponse.next();
  }

  // Everything under /admin or /api requires auth
  const token = getTokenFromRequest(request);
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyTokenEdge(token);
  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload/:path*", "/api/media/:path*", "/api/collections/:path*"],
};
