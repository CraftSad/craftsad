import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const publicFiles = new Set([
  "/favicon.ico",
  "/favicon.svg",
  "/brand-mark.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
]);

export async function proxy(request: NextRequest) {
  if (
    publicFiles.has(request.nextUrl.pathname) ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/legal") ||
    request.nextUrl.pathname.startsWith("/images/") ||
    request.nextUrl.pathname.startsWith("/fonts/")
  ) {
    return NextResponse.next();
  }
  const sessionCookie = getSessionCookie(request);

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|auth|favicon.ico).*)"],
};
