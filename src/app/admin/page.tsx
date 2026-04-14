import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, hasAdminCookie } from "@/lib/auth.edge";

export default async function AdminRootPage() {
  const cookieStore = await cookies(); // ✅ await 필요
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const authed = hasAdminCookie(token);

  redirect(authed ? "/admin/store" : "/admin/login");
}