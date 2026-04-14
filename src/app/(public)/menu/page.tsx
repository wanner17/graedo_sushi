import { prisma } from "@/lib/prisma";
import { CategoryNav } from "@/components/CategoryNav";
import { StoreStatus } from "@/components/StoreStatus";
import { FloatingBar } from "@/components/FloatingBar";
import { MenuSearch } from "@/components/MenuSearch";

const STORE_ID = "main";

function formatWon(n: number) {
  return `${n.toLocaleString()}원`;
}

export default async function MenuPage() {
  const store = await prisma.storeSettings.findUnique({ where: { id: STORE_ID } });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      items: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  const name = store?.name ?? "그래도스시";
  const tagline = store?.tagline ?? "";
  const noticeEnabled = !!store?.noticeEnabled && !!store?.noticeText;
  const phone = store?.phone ?? "";
  const mapUrl = store?.mapUrl ?? "";
  const naverPlace = store?.naverPlace ?? "";
  const instagram = store?.instagram ?? "";
  const kakaoOrderUrl = store?.kakaoOrderUrl ?? "";
  const hasBreak = !!(store?.breakStart && store?.breakEnd);

  // MenuSearch에 넘길 직렬화 가능 데이터
  const searchCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    items: c.items.map((m) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      isBest: m.isBest,
      isSoldOut: m.isSoldOut,
    })),
  }));

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── 히어로 헤더 ────────────────────────────────── */}
      <header className="bg-stone-950 pb-8 pt-10 text-white">
        <div className="mx-auto max-w-3xl px-5">
          {/* 브랜드 */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                Sushi Restaurant
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {name}
              </h1>
              {tagline ? (
                <p className="mt-3 text-base leading-relaxed text-stone-300">{tagline}</p>
              ) : null}
            </div>

            {/* 영업 상태 + 실시간 뱃지 */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {store?.open && store?.close ? (
                <StoreStatus
                  open={store.open}
                  close={store.close}
                  breakStart={store.breakStart}
                  breakEnd={store.breakEnd}
                  lastOrder={store.lastOrder}
                />
              ) : (
                <div className="hidden items-center gap-1.5 rounded-full border border-stone-700 bg-stone-900 px-3 py-1.5 md:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                  <span className="text-xs text-stone-400">실시간 업데이트</span>
                </div>
              )}
            </div>
          </div>

          {/* CTA 버튼들 */}
          <div className="mt-7 flex flex-wrap gap-2">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-stone-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-400 active:scale-95"
              >
                <PhoneIcon />
                전화 주문
              </a>
            ) : null}

            {kakaoOrderUrl ? (
              <a
                href={kakaoOrderUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-stone-950 transition hover:bg-yellow-300 active:scale-95"
              >
                💬 카카오 주문
              </a>
            ) : null}

            {mapUrl ? (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-stone-600 bg-stone-800 px-4 text-sm font-medium text-stone-200 transition hover:bg-stone-700 active:scale-95"
              >
                <MapIcon />
                지도
              </a>
            ) : null}

            {naverPlace ? (
              <a
                href={naverPlace}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-stone-600 bg-stone-800 px-4 text-sm font-medium text-stone-200 transition hover:bg-stone-700 active:scale-95"
              >
                <span className="rounded bg-green-500 px-1 py-0.5 text-[10px] font-black text-white">N</span>
                네이버
              </a>
            ) : null}

            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-stone-600 bg-stone-800 px-4 text-sm font-medium text-stone-200 transition hover:bg-stone-700 active:scale-95"
              >
                <InstaIcon />
                인스타
              </a>
            ) : null}
          </div>
        </div>
      </header>

      {/* ── 공지 배너 ────────────────────────────────── */}
      {noticeEnabled ? (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto max-w-3xl px-5 py-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                공지
              </span>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-900">
                {store!.noticeText}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── 영업 정보 스트립 ────────────────────────────── */}
      {(store?.open || phone || store?.address) ? (
        <div className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-3xl px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-600">
              {store?.open && store?.close ? (
                <span className="flex items-center gap-1.5">
                  <ClockIcon />
                  <span className="font-semibold text-stone-900">
                    {store.open} ~ {store.close}
                  </span>
                  {hasBreak ? (
                    <span className="text-neutral-400">
                      · 브레이크 {store.breakStart}~{store.breakEnd}
                    </span>
                  ) : null}
                  {store.lastOrder ? (
                    <span className="text-neutral-400">· LO {store.lastOrder}</span>
                  ) : null}
                </span>
              ) : null}

              {store?.closedDays ? (
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <span className="font-medium text-stone-700">휴무</span>
                  {store.closedDays}
                </span>
              ) : null}

              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-1.5 transition hover:text-amber-600"
                >
                  <PhoneIcon />
                  {phone}
                </a>
              ) : null}

              {store?.address ? (
                <span className="flex items-center gap-1.5 text-neutral-500">
                  <PinIcon />
                  {store.address}
                  {store.parking ? (
                    <span className="text-neutral-400">· 주차 {store.parking}</span>
                  ) : null}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── 카테고리 탭 (sticky) ──────────────────────── */}
      <CategoryNav categories={categories.map((c) => ({ id: c.id, name: c.name }))} />

      {/* ── 메인 컨텐츠 ──────────────────────────────── */}
      <main className="mx-auto max-w-3xl px-5 py-8 pb-32 md:pb-8">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center">
            <div className="mb-3 text-5xl">🍱</div>
            <p className="font-semibold text-neutral-500">현재 공개된 메뉴가 없습니다.</p>
            <p className="mt-1 text-sm text-neutral-400">관리자 페이지에서 메뉴를 등록해주세요.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 메뉴 검색 */}
            <MenuSearch categories={searchCategories} />

            {/* 카테고리별 메뉴 목록 */}
            <div className="space-y-10">
              {categories.map((c) => (
                <section key={c.id} id={c.id} className="scroll-mt-14">
                  <div className="mb-4 flex items-baseline justify-between border-b border-neutral-200 pb-3">
                    <h2 className="text-xl font-bold tracking-tight text-stone-900">{c.name}</h2>
                    <span className="text-xs text-neutral-400">{c.items.length}가지</span>
                  </div>

                  {c.items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-6 text-center text-sm text-neutral-400">
                      준비 중입니다
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {c.items.map((m) => (
                        <div
                          key={m.id}
                          className={[
                            "relative flex items-center justify-between gap-3 rounded-2xl border bg-white shadow-sm transition-all duration-200",
                            m.isSoldOut
                              ? "opacity-60"
                              : "hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-300",
                            m.imagePath ? "overflow-hidden p-0" : "p-4",
                          ].join(" ")}
                        >
                          {m.imagePath ? (
                            <>
                              {/* 이미지 있을 때: 왼쪽 정보, 오른쪽 이미지 */}
                              <div className="flex-1 min-w-0 p-4 pr-2">
                                {(m.isBest || m.isSoldOut) ? (
                                  <div className="mb-1.5 flex flex-wrap gap-1">
                                    {m.isBest ? (
                                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
                                        BEST
                                      </span>
                                    ) : null}
                                    {m.isSoldOut ? (
                                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                                        품절
                                      </span>
                                    ) : null}
                                  </div>
                                ) : null}
                                <div className="font-semibold leading-snug text-stone-900">{m.name}</div>
                                <div className="mt-1.5 shrink-0 text-right">
                                  {m.isSoldOut ? (
                                    <span className="text-sm font-semibold text-rose-500">품절</span>
                                  ) : (
                                    <span className="text-base font-bold text-stone-900">
                                      {formatWon(m.price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.imagePath}
                                alt={m.imageAlt ?? m.name}
                                className="h-24 w-24 shrink-0 object-cover"
                              />
                            </>
                          ) : (
                            <>
                              {/* 이미지 없을 때: 기존 레이아웃 */}
                              <div className="min-w-0 flex-1">
                                {(m.isBest || m.isSoldOut) ? (
                                  <div className="mb-1.5 flex flex-wrap gap-1">
                                    {m.isBest ? (
                                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
                                        BEST
                                      </span>
                                    ) : null}
                                    {m.isSoldOut ? (
                                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                                        품절
                                      </span>
                                    ) : null}
                                  </div>
                                ) : null}
                                <div className="font-semibold leading-snug text-stone-900">{m.name}</div>
                              </div>
                              <div className="shrink-0 text-right">
                                {m.isSoldOut ? (
                                  <span className="text-sm font-semibold text-rose-500">품절</span>
                                ) : (
                                  <span className="text-base font-bold text-stone-900">
                                    {formatWon(m.price)}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── 푸터 ─────────────────────────────────────── */}
      <footer className="border-t border-neutral-200 bg-white py-10 text-center">
        <div className="mb-2 text-2xl">🍱</div>
        <div className="text-sm font-semibold text-stone-700">{name}</div>
        {store?.address ? (
          <div className="mt-1 text-xs text-neutral-400">{store.address}</div>
        ) : null}
        {phone ? (
          <div className="mt-1 text-xs text-neutral-400">{phone}</div>
        ) : null}
        <div className="mt-4 text-[11px] text-neutral-300">
          © {new Date().getFullYear()} {name} · 메뉴/가격은 실시간 업데이트됩니다
        </div>
      </footer>

      {/* ── 모바일 플로팅 주문 버튼 ──────────────────── */}
      <FloatingBar phone={phone} kakaoOrderUrl={kakaoOrderUrl} />
    </div>
  );
}

/* ── 아이콘 ────────────────────────────────── */

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function InstaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
