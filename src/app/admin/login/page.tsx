"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/admin/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "비밀번호가 올바르지 않습니다.");
      return;
    }

    router.replace("/admin/store");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 px-4">
      <div className="w-full max-w-sm">
        {/* 브랜드 */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-800 text-4xl shadow-lg shadow-stone-900/50">
              🍱
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">그래도스시</h1>
          <p className="mt-1 text-sm text-stone-400">관리자 로그인</p>
        </div>

        {/* 로그인 카드 */}
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-stone-700/50 bg-stone-900 p-7 shadow-2xl shadow-stone-950/50"
        >
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="h-12 w-full rounded-xl border border-stone-700 bg-stone-800 px-4 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {err ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-800/50 bg-rose-950/50 px-4 py-3 text-sm text-rose-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {err}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || password.length < 4}
            className="h-12 w-full rounded-xl bg-amber-500 font-bold text-stone-950 transition hover:bg-amber-400 active:bg-amber-600 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-500"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                확인 중...
              </span>
            ) : (
              "로그인"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-600">
          © {new Date().getFullYear()} 그래도스시 관리 시스템
        </p>
      </div>
    </div>
  );
}
