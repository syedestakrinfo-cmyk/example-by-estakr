import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const adminId = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    if (adminId) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !adminId) {
    const url = new URL("/admin/login", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
