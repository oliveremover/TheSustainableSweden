import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Keep these public/no-redirect paths — adjust as needed
  const allowlist = [
    "/",                 // home
    "/_next",            // internal assets
    "/api",              // API (optional)
    "/favicon.ico",
    "/private",          // keep private page accessible without redirect
    "/pages",            // your pages route folder (login, milestone pages)
    "/pages/login",      // login page
    "/login",            // alternative route
    "/admin",            // admin UI (you may still check server-side)
  ];

  // allow exact or prefix matches
  if (allowlist.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  return updateSession(req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}