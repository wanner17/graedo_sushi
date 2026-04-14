import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 서버 전용 클라이언트 (service role — 버킷 읽기/쓰기/삭제 전 권한)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export const MENU_BUCKET = "menu-images";

/** 파일 경로로 공개 URL 반환 */
export function getPublicUrl(path: string): string {
  const { data } = supabaseAdmin.storage.from(MENU_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
