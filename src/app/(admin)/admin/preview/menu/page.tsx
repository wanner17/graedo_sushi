import { prisma } from "@/lib/prisma";
import { CategoryNav } from "@/components/CategoryNav";

const STORE_ID = "main";

function formatWon(n: number) {
  return `${n.toLocaleString()}원`;
}

export default async function PreviewMenuPage() {
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

  return (
    <div>
      {/* 미리보기 배너 */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-sm">
        <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
          PREVIEW
        </span>
        <span className="text-amber-800 font-medium">손님에게 보이는 화면입니다</span>
        <a
          href="/menu"
          target="_blank"
          className="ml-2 text-xs text-amber-600 underline hover:text-amber-800"
        >
          실제 화면 열기 ↗
        </a>
      </div>

      <div className="min-h-screen bg-stone-50">
        {/* 히어로 */}
        <header className="bg-stone-950 pb-8 pt-10 text-white">
          <div className="mx-auto max-w-3xl px-5">
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
              <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-stone-700 bg-stone-900 px-3 py-1.5 md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-stone-400">실시간 업데이트</span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {phone ? (
                <div className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-stone-950">
                  📞 전화 주문
                </div>
              ) : null}
              {kakaoOrderUrl ? (
                <div className="inline-flex h-11 items-center gap-2 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-stone-950">
                  💬 카카오 주문
                </div>
              ) : null}
              {mapUrl ? (
                <div className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-stone-600 bg-stone-800 px-4 text-sm font-medium text-stone-200">
                  📍 지도
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* 공지 */}
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

        {/* 영업 정보 */}
        {(store?.open || phone || store?.address) ? (
          <div className="border-b border-neutral-200 bg-white">
            <div className="mx-auto max-w-3xl px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-600">
                {store?.open && store?.close ? (
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-900">
                      {store.open} ~ {store.close}
                    </span>
                    {hasBreak ? (
                      <span className="text-neutral-400">
                        · 브레이크 {store.breakStart}~{store.breakEnd}
                      </span>
                    ) : null}
                  </span>
                ) : null}
                {phone ? <span>{phone}</span> : null}
                {store?.address ? <span className="text-neutral-400">{store.address}</span> : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* 카테고리 탭 */}
        <CategoryNav categories={categories.map((c) => ({ id: c.id, name: c.name }))} />

        {/* 메뉴 */}
        <main className="mx-auto max-w-3xl px-5 py-8">
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center">
              <div className="mb-3 text-5xl">🍱</div>
              <p className="text-neutral-500">현재 공개된 메뉴가 없습니다.</p>
            </div>
          ) : (
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
                            "flex items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm",
                            m.isSoldOut ? "opacity-60" : "",
                          ].join(" ")}
                        >
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
                            <div className="font-semibold text-stone-900">{m.name}</div>
                          </div>
                          <div className="shrink-0">
                            {m.isSoldOut ? (
                              <span className="text-sm font-semibold text-rose-500">품절</span>
                            ) : (
                              <span className="text-base font-bold text-stone-900">
                                {formatWon(m.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </main>

        <footer className="mt-6 border-t border-neutral-200 bg-white py-10 text-center">
          <div className="mb-2 text-2xl">🍱</div>
          <div className="text-sm font-semibold text-stone-700">{name}</div>
          <div className="mt-4 text-[11px] text-neutral-300">
            © {new Date().getFullYear()} {name}
          </div>
        </footer>
      </div>
    </div>
  );
}
