import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, hasAdminCookie } from "./src/lib/auth.edge";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // admin 영역 아니면 패스
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // 로그인 API는 항상 허용
  if (pathname.startsWith("/admin/api/admin/login")) return NextResponse.next();

  // ✅ /admin 루트(/admin, /admin/)는 로그인 여부로 분기
  if (pathname === "/admin" || pathname === "/admin/") {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const authed = hasAdminCookie(token);

    const url = req.nextUrl.clone();
    url.pathname = authed ? "/admin/store" : "/admin/login";
    return NextResponse.redirect(url);
  }

  // 로그인 페이지는 로그인 안 된 사람만
  if (pathname === "/admin/login") {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (hasAdminCookie(token)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/store";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 그 외는 인증 필요
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!hasAdminCookie(token)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // ✅ /admin 루트도 반드시 미들웨어 타게
  matcher: ["/admin", "/admin/:path*"],
};