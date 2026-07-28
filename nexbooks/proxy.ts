import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("lb_session")?.value;
  const { pathname } = request.nextUrl;
  if (!session && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|.*\\.(?:svg|png|jpg|avif|ico)).*)"],
};
