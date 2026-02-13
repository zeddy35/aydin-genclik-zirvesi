import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  
  if (!isDashboard && !isAdmin) {
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

  // For admin routes, verify admin claim (client-side check, server verification in API)
  // This is a basic guard - actual verification happens server-side
  if (isAdmin) {
    // Admin check will be done client-side via AuthProvider
    // For production, use server-side token verification
    const response = NextResponse.next();
    response.headers.set("x-requires-admin", "true");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
