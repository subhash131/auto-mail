import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicPaths = [
    "/",
    "/auth/login",
    "/auth/register",
    "/public",
    "/api/user/login",
    "/api/user/register",
  ];

  const isPublicPath =
    publicPaths.includes(path) ||
    publicPaths.some((p) => path.startsWith(p + "/"));

  const token = await getToken({
    req: request,
    secret: process.env.JWT_SECRET,
  });

  console.log({ path });
  console.log({ token });

  if (path.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/unread", request.url));
  }
  if (token && !isPublicPath) {
    return NextResponse.next();
  }
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
