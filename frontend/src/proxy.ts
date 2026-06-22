
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  // Check if user is authenticated (simple mock check via cookies since localStorage is not available in middleware)
  // In a real app, we would verify the JWT cookie.
  const isAuthenticated = request.cookies.has("auth_token") || true; // MOCK for development to allow testing without real backend auth cookies yet.
  
  // Actually, wait, let's just check a cookie called `auth_token`.
  // If it doesn't exist, we assume not authenticated.
  const hasToken = request.cookies.has("auth_token");
  
  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") || 
                           request.nextUrl.pathname.startsWith("/journal") || 
                           request.nextUrl.pathname.startsWith("/insights") || 
                           request.nextUrl.pathname.startsWith("/calendar") || 
                           request.nextUrl.pathname.startsWith("/settings");

  if (isProtectedRoute && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

