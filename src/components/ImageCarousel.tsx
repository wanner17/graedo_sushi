"use client";

import { useState } from "react";

type Image = { path: string; alt?: string | null };

export function ImageCarousel({ images, name }: { images: Image[]; name: string }) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="relative w-full overflow-hidden bg-black">
      {/* 이미지 */}
      <div className="relative aspect-[4/3] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[current].path}
          alt={images[current].alt ?? name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* 품절 오버레이는 부모에서 처리 */}

        {/* 좌우 화살표 (이미지 2장 이상일 때만) */}
        {images.length > 1 ? (
          <>
            <button
              onClick={prev}
              aria-label="이전 이미지"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="다음 이미지"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      {/* 도트 인디케이터 */}
      {images.length > 1 ? (
        <div className="flex justify-center gap-1.5 py-2.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`${i + 1}번째 이미지`}
              className={[
                "h-1.5 rounded-full transition-all",
                i === current ? "w-5 bg-sushi-red" : "w-1.5 bg-white/40",
              ].join(" ")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
