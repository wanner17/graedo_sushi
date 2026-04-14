"use client";

import { useState, useMemo } from "react";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  isBest: boolean;
  isSoldOut: boolean;
};

type Category = {
  id: string;
  name: string;
  items: MenuItem[];
};

function formatWon(n: number) {
  return `${n.toLocaleString()}원`;
}

export function MenuSearch({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null; // null = 검색 안 함
    return categories
      .map((c) => ({
        ...c,
        items: c.items.filter((m) => m.name.toLowerCase().includes(q)),
      }))
      .filter((c) => c.items.length > 0);
  }, [query, categories]);

  const totalItems = useMemo(
    () => categories.reduce((acc, c) => acc + c.items.length, 0),
    [categories]
  );

  return (
    <div>
      {/* 검색 입력창 */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`메뉴 검색... (총 ${totalItems}가지)`}
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-10 text-sm text-stone-900 outline-none transition placeholder:text-neutral-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
        />
        {query ? (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-stone-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* 검색 결과 */}
      {filtered !== null ? (
        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center">
              <div className="mb-2 text-3xl">🔍</div>
              <p className="text-sm font-medium text-neutral-500">
                &apos;{query}&apos; 에 해당하는 메뉴가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((c) => (
                <section key={c.id}>
                  <div className="mb-3 flex items-baseline justify-between border-b border-neutral-200 pb-2">
                    <h2 className="text-base font-bold text-stone-900">{c.name}</h2>
                    <span className="text-xs text-neutral-400">{c.items.length}가지</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {c.items.map((m) => (
                      <div
                        key={m.id}
                        className={[
                          "flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm",
                          m.isSoldOut ? "opacity-60" : "",
                        ].join(" ")}
                      >
                        <div className="min-w-0 flex-1">
                          {(m.isBest || m.isSoldOut) ? (
                            <div className="mb-1.5 flex gap-1">
                              {m.isBest ? (
                                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">BEST</span>
                              ) : null}
                              {m.isSoldOut ? (
                                <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">품절</span>
                              ) : null}
                            </div>
                          ) : null}
                          {/* 검색어 하이라이트 */}
                          <HighlightedText text={m.name} query={query} />
                        </div>
                        <div className="shrink-0">
                          {m.isSoldOut ? (
                            <span className="text-sm font-semibold text-rose-500">품절</span>
                          ) : (
                            <span className="text-base font-bold text-stone-900">{formatWon(m.price)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <span className="font-semibold text-stone-900">{text}</span>;

  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span className="font-semibold text-stone-900">{text}</span>;

  return (
    <span className="font-semibold text-stone-900">
      {text.slice(0, idx)}
      <mark className="rounded bg-amber-200 px-0.5 not-italic text-stone-900">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
}
