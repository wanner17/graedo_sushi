/**
 * HMAC-SHA256 기반의 시간 제한 토큰
 * 외부 JWT 라이브러리 없이 Node.js 내장 crypto 사용
 */
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const SECRET = process.env.NOTIFY_TOKEN_SECRET ?? "graedo-sushi-secret-change-me";
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5분

export function generateNotifyToken(waitingId: string): {
  token: string;
  expiresAt: Date;
} {
  const salt = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  const payload = `${waitingId}:${expiresAt.getTime()}:${salt}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${sig}`).toString("base64url");
  return { token, expiresAt };
}

export type TokenVerifyResult =
  | { ok: true; waitingId: string }
  | { ok: false; reason: "expired" | "invalid" };

export function verifyNotifyToken(token: string): TokenVerifyResult {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return { ok: false, reason: "invalid" };

    const [waitingId, expStr, salt, sig] = parts;
    const expiresAt = parseInt(expStr, 10);

    if (Date.now() > expiresAt) return { ok: false, reason: "expired" };

    const payload = `${waitingId}:${expStr}:${salt}`;
    const expected = createHmac("sha256", SECRET).update(payload).digest("hex");

    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return { ok: false, reason: "invalid" };
    }

    return { ok: true, waitingId };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
