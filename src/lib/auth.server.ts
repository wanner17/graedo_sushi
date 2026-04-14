import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

function hmac(input: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(input).digest("hex");
}

export function createSessionToken() {
  const secret = process.env.SESSION_SECRET!;
  const ts = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${ts}.${nonce}`;
  const sig = hmac(payload, secret);
  return `${payload}.${sig}`;
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function isValidAdminCookie(token?: string) {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET!;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const sig = parts[2];
  const expected = hmac(payload, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
