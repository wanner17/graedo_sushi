import { NextResponse } from "next/server";
import { createSessionToken, setAdminCookie } from "@/src/lib/auth.server";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const token = createSessionToken();
  await setAdminCookie(token);
  return NextResponse.json({ ok: true });
}
