import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const session = await auth();

  const publicRoutes = ["/", "/resources"];
  if (publicRoutes.some((route) => request.nextUrl.pathname === route)) {
    return NextResponse.next();
  }

  // Redirect to home if trying to access profile without authentication
  if (request.nextUrl.pathname.startsWith("/profile") && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin") && !session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
