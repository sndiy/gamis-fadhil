// middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  // Dapatkan session token dari cookie jika ada
  const session = request.cookies.get("session");

  // Check if the route starts with /admin (excluding /admin/login)
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.includes("/admin/login")
  ) {
    // Redirect ke login jika tidak ada session
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
