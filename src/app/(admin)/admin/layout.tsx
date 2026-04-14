import Link from "next/link";
import { AdminNav } from "@/src/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          {/* 로고 */}
          <Link href="/admin/store" className="flex items-center gap-2.5 text-stone-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-lg">
              🍱
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold leading-tight text-stone-900">그래도스시</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                Admin
              </div>
            </div>
          </Link>

          {/* 네비게이션 */}
          <AdminNav />

          {/* 손님 페이지 바로가기 */}
          <a
            href="/menu"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-stone-900 md:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            손님 화면
          </a>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
