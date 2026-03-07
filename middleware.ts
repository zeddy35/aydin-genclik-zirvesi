import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isUserRoute = isDashboard;

  // Admin routes: let client-side layout handle auth (Firebase doesn't set __session cookie)
  if (isAdminRoute) {
    return NextResponse.next();
  }

  if (!isUserRoute) {
    return NextResponse.next();
  }

  // Get session cookie (Firebase sets this via client SDK)
  const session = request.cookies.get("__session");

  // If no session, redirect to login
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
