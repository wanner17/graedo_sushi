import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageCarousel } from "@/components/ImageCarousel";

function formatWon(n: number) {
  return `${n.toLocaleString()}원`;
}

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;

  const item = await prisma.menuItem.findUnique({
    where: { id: itemId, isActive: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!item) notFound();

  // images 테이블 + 기존 imagePath 통합
  const allImages = [
    ...item.images.map((img) => ({ path: img.path, alt: img.alt })),
    ...(item.imagePath && item.images.length === 0
      ? [{ path: item.imagePath, alt: item.imageAlt }]
      : []),
  ];

  const hasImages = allImages.length > 0;

  return (
    <div className="min-h-screen bg-sushi-cream">

      {/* ── 상단 헤더 바 ── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#e8ddd3] bg-white/97 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8ddd3] bg-white text-stone-600 transition hover:bg-sushi-cream hover:text-stone-900"
          aria-label="메뉴로 돌아가기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-stone-400">{item.category.name}</p>
          <p className="truncate text-sm font-semibold text-stone-900">{item.name}</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">

        {/* ── 이미지 캐러셀 ── */}
        {hasImages ? (
          <div className="relative">
            <ImageCarousel images={allImages} name={item.name} />
            {item.isSoldOut ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded-full bg-rose-600 px-5 py-2 text-base font-black text-white tracking-wide">
                  품절
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          /* 이미지 없을 때: 플레이스홀더 */
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-stone-100 text-6xl">
            🍣
          </div>
        )}

        {/* ── 메뉴 정보 ── */}
        <div className="px-5 py-6">

          {/* 카테고리 + 뱃지 */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-500">
              {item.category.name}
            </span>
            {item.isBest ? (
              <span className="rounded-full bg-sushi-red px-3 py-1 text-xs font-black text-white">
                BEST
              </span>
            ) : null}
            {item.isSoldOut ? (
              <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
                품절
              </span>
            ) : null}
          </div>

          {/* 메뉴명 */}
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
            {item.name}
          </h1>

          {/* 가격 */}
          <div className="mt-3 flex items-baseline gap-1">
            {item.isSoldOut ? (
              <span className="text-2xl font-bold text-rose-500">품절</span>
            ) : (
              <span className="text-3xl font-extrabold text-sushi-red">
                {formatWon(item.price)}
              </span>
            )}
          </div>

          {/* 구분선 */}
          {item.description ? (
            <>
              <div className="my-5 h-px bg-[#e8ddd3]" />
              <div>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <span className="inline-block h-4 w-[3px] rounded-full bg-sushi-red" />
                  메뉴 소개
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
                  {item.description}
                </p>
              </div>
            </>
          ) : null}

          {/* 하단 여백 + 돌아가기 버튼 */}
          <div className="mt-8">
            <Link
              href="/menu"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8ddd3] bg-white py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-sushi-cream hover:border-sushi-red/30 active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              전체 메뉴 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
