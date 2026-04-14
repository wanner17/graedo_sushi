export const ADMIN_COOKIE_NAME = "admin_session";

// Edge 미들웨어에서는 crypto 검증 대신 "쿠키 존재 여부"만 확인
export function hasAdminCookie(token?: string) {
  return typeof token === "string" && token.length > 10;
}
