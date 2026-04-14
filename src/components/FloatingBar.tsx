"use client";

import { useEffect, useState } from "react";

type Props = {
  phone?: string;
  kakaoOrderUrl?: string;
};

export function FloatingBar({ phone, kakaoOrderUrl }: Props) {
  const [visible, setVisible] = useState(false);

  // 페이지 스크롤 일정 이상 내려가면 표시
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!phone && !kakaoOrderUrl) return null;
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* 그라데이션 블러 배경 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/80 to-transparent" />

      <div className="relative flex gap-3 px-4 pb-6 pt-3">
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="flex flex-1 h-13 items-center justify-center gap-2 rounded-2xl bg-amber-500 text-sm font-bold text-stone-950 shadow-lg shadow-amber-900/40 active:scale-95 transition-transform"
            style={{ height: "52px" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            전화 주문
          </a>
        ) : null}

        {kakaoOrderUrl ? (
          <a
            href={kakaoOrderUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-yellow-400 text-sm font-bold text-stone-950 shadow-lg shadow-yellow-900/30 active:scale-95 transition-transform"
            style={{ height: "52px" }}
          >
            💬 카카오 주문
          </a>
        ) : null}
      </div>
    </div>
  );
}
