import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  moveCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuFlag,
  moveMenuItem,
  uploadMenuImage,
  deleteMenuItemImage,
} from "./actions";

import { Card, Input, Select, Button, Label, Badge, Divider, SectionHeader, Textarea } from "@/components/ui/ui";

export default async function AdminMenuPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const items = await prisma.menuItem.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: [
      { category: { sortOrder: "asc" } },
      { sortOrder: "asc" },
      { createdAt: "asc" },
    ],
  });

  const itemsByCategory = new Map<string, typeof items>();
  for (const it of items) {
    const arr = itemsByCategory.get(it.categoryId) ?? [];
    arr.push(it);
    itemsByCategory.set(it.categoryId, arr);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          icon="📋"
          title="메뉴 관리"
          description="카테고리와 메뉴를 추가·수정하고 BEST·품절·정렬을 관리하세요."
        />
        <Link
          href="/admin/menu/import"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100"
        >
          📥 엑셀 일괄 등록
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── 좌측: 카테고리 + 메뉴 추가 ── */}
        <div className="space-y-5 lg:col-span-5">
          {/* 카테고리 관리 */}
          <Card title="카테고리" description="정렬 숫자가 작을수록 위에 표시됩니다.">
            <form action={createCategory} className="flex gap-2">
              <div className="flex-1">
                <Input name="name" placeholder="카테고리명 (예: 초밥)" required />
              </div>
              <div className="w-20">
                <Input name="sortOrder" type="number" placeholder="정렬" />
              </div>
              <Button type="submit" variant="primary" size="sm">추가</Button>
            </form>

            {categories.length > 0 ? (
              <div className="mt-4 space-y-2">
                {categories.map((c) => (
                  <div key={c.id} className="rounded-xl border border-neutral-200 bg-stone-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-stone-900 truncate">{c.name}</span>
                        {!c.isActive ? <Badge tone="inactive">비활성</Badge> : null}
                        <span className="text-xs text-neutral-400">
                          ({itemsByCategory.get(c.id)?.length ?? 0}개)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <form action={moveCategory}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="dir" value="up" />
                          <Button size="sm" variant="ghost" type="submit" className="px-2">↑</Button>
                        </form>
                        <form action={moveCategory}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="dir" value="down" />
                          <Button size="sm" variant="ghost" type="submit" className="px-2">↓</Button>
                        </form>
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={c.id} />
                          <Button size="sm" variant="danger" type="submit">삭제</Button>
                        </form>
                      </div>
                    </div>

                    <Divider />

                    <form action={updateCategory} className="flex flex-wrap gap-2">
                      <input type="hidden" name="id" value={c.id} />
                      <div className="flex-1 min-w-[120px]">
                        <Input name="name" defaultValue={c.name} placeholder="카테고리명" />
                      </div>
                      <div className="w-16">
                        <Input name="sortOrder" type="number" defaultValue={c.sortOrder} />
                      </div>
                      <label className="flex h-10 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs cursor-pointer">
                        <input type="checkbox" name="isActive" defaultChecked={c.isActive} className="accent-amber-500" />
                        표시
                      </label>
                      <Button type="submit" variant="secondary" size="sm">저장</Button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-400">
                카테고리를 먼저 추가하세요.
              </div>
            )}
          </Card>

          {/* 메뉴 추가 */}
          <Card title="메뉴 추가" description="카테고리를 먼저 선택하고 메뉴를 추가하세요.">
            <form action={createMenuItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>카테고리</Label>
                  <Select name="categoryId" required defaultValue="">
                    <option value="" disabled>선택</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>정렬</Label>
                  <Input name="sortOrder" type="number" placeholder="(자동)" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>메뉴명</Label>
                  <Input name="name" placeholder="예: 연어초밥" required />
                </div>
                <div>
                  <Label>가격 (원)</Label>
                  <Input name="price" type="number" placeholder="12000" required />
                </div>
              </div>

              <div>
                <Label>메뉴 설명 (선택)</Label>
                <Textarea name="description" placeholder="메뉴에 대한 설명을 입력하세요..." className="min-h-16" />
              </div>

              <div className="flex flex-wrap gap-4 rounded-lg border border-neutral-200 bg-stone-50 px-3 py-2.5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="isBest" className="accent-amber-500" />
                  <span className="font-medium text-amber-600">BEST</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="isSoldOut" className="accent-rose-500" />
                  <span className="font-medium text-rose-600">품절</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked className="accent-amber-500" />
                  <span className="font-medium text-neutral-700">활성</span>
                </label>
              </div>

              <Button className="w-full" type="submit" variant="primary">+ 메뉴 추가</Button>
            </form>
          </Card>
        </div>

        {/* ── 우측: 메뉴 목록 ── */}
        <div className="lg:col-span-7">
          <Card title="메뉴 목록" description="카테고리별 메뉴를 정렬·수정·삭제할 수 있습니다.">
            <div className="space-y-5">
              {categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-400">
                  카테고리를 먼저 추가하세요.
                </div>
              ) : (
                categories.map((c) => {
                  const list = itemsByCategory.get(c.id) ?? [];
                  return (
                    <div key={c.id} className="rounded-xl border border-neutral-200 overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-neutral-100 bg-stone-50 px-4 py-3">
                        <span className="font-semibold text-stone-900">{c.name}</span>
                        {!c.isActive ? <Badge tone="inactive">비활성</Badge> : null}
                        <span className="text-xs text-neutral-400">{list.length}개</span>
                      </div>

                      <div className="p-3 space-y-3">
                        {list.length === 0 ? (
                          <p className="py-4 text-center text-sm text-neutral-400">
                            이 카테고리에 메뉴가 없습니다.
                          </p>
                        ) : (
                          list.map((m) => (
                            <div key={m.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                              {/* 메뉴 정보 + 퀵 액션 */}
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                    <span className="font-semibold text-stone-900">{m.name}</span>
                                    {m.isBest ? <Badge tone="best">BEST</Badge> : null}
                                    {m.isSoldOut ? <Badge tone="soldout">품절</Badge> : null}
                                    {!m.isActive ? <Badge tone="inactive">비활성</Badge> : null}
                                  </div>
                                  <div className="text-sm text-neutral-500">
                                    {m.price.toLocaleString()}원
                                  </div>
                                  {m.description ? (
                                    <div className="mt-1 text-xs text-neutral-400 line-clamp-1">{m.description}</div>
                                  ) : null}
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  <form action={moveMenuItem}>
                                    <input type="hidden" name="id" value={m.id} />
                                    <input type="hidden" name="dir" value="up" />
                                    <Button size="sm" variant="ghost" type="submit" className="px-2">↑</Button>
                                  </form>
                                  <form action={moveMenuItem}>
                                    <input type="hidden" name="id" value={m.id} />
                                    <input type="hidden" name="dir" value="down" />
                                    <Button size="sm" variant="ghost" type="submit" className="px-2">↓</Button>
                                  </form>
                                  <form action={toggleMenuFlag}>
                                    <input type="hidden" name="id" value={m.id} />
                                    <input type="hidden" name="field" value="isBest" />
                                    <Button size="sm" variant="ghost" type="submit" className={m.isBest ? "text-amber-600" : ""}>
                                      {m.isBest ? "BEST 해제" : "BEST"}
                                    </Button>
                                  </form>
                                  <form action={toggleMenuFlag}>
                                    <input type="hidden" name="id" value={m.id} />
                                    <input type="hidden" name="field" value="isSoldOut" />
                                    <Button size="sm" variant="ghost" type="submit" className={m.isSoldOut ? "text-rose-600" : ""}>
                                      {m.isSoldOut ? "품절 해제" : "품절"}
                                    </Button>
                                  </form>
                                  <form action={toggleMenuFlag}>
                                    <input type="hidden" name="id" value={m.id} />
                                    <input type="hidden" name="field" value="isActive" />
                                    <Button size="sm" variant="ghost" type="submit">
                                      {m.isActive ? "숨기기" : "표시"}
                                    </Button>
                                  </form>
                                  <form action={deleteMenuItem}>
                                    <input type="hidden" name="id" value={m.id} />
                                    <Button size="sm" variant="danger" type="submit">삭제</Button>
                                  </form>
                                </div>
                              </div>

                              <Divider />

                              {/* 수정 폼 */}
                              <form action={updateMenuItem} className="space-y-3">
                                <input type="hidden" name="id" value={m.id} />

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label>카테고리</Label>
                                    <Select name="categoryId" defaultValue={m.categoryId}>
                                      {categories.map((cc) => (
                                        <option key={cc.id} value={cc.id}>{cc.name}</option>
                                      ))}
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>정렬</Label>
                                    <Input name="sortOrder" type="number" defaultValue={m.sortOrder} />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label>메뉴명</Label>
                                    <Input name="name" defaultValue={m.name} />
                                  </div>
                                  <div>
                                    <Label>가격</Label>
                                    <Input name="price" type="number" defaultValue={m.price} />
                                  </div>
                                </div>

                                <div>
                                  <Label>메뉴 설명</Label>
                                  <Textarea
                                    name="description"
                                    defaultValue={m.description ?? ""}
                                    placeholder="메뉴 설명 (선택)"
                                    className="min-h-16"
                                  />
                                </div>

                                <div className="flex flex-wrap gap-4 rounded-lg border border-neutral-100 bg-stone-50 px-3 py-2.5">
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input type="checkbox" name="isBest" defaultChecked={m.isBest} className="accent-amber-500" />
                                    <span className="font-semibold text-amber-600">BEST</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input type="checkbox" name="isSoldOut" defaultChecked={m.isSoldOut} className="accent-rose-500" />
                                    <span className="font-semibold text-rose-600">품절</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input type="checkbox" name="isActive" defaultChecked={m.isActive} className="accent-amber-500" />
                                    <span className="font-semibold text-neutral-700">활성</span>
                                  </label>
                                </div>

                                <Button className="w-full" type="submit" variant="secondary" size="sm">
                                  수정 저장
                                </Button>
                              </form>

                              <Divider />

                              {/* 이미지 관리 (다중) */}
                              <div className="space-y-3">
                                <Label>메뉴 이미지 ({m.images.length}장)</Label>

                                {/* 기존 이미지 목록 */}
                                {m.images.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {m.images.map((img, idx) => (
                                      <div key={img.id} className="relative group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={img.path}
                                          alt={img.alt ?? m.name}
                                          className="h-20 w-20 rounded-lg object-cover border border-neutral-200"
                                        />
                                        {idx === 0 ? (
                                          <span className="absolute top-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white">
                                            대표
                                          </span>
                                        ) : null}
                                        <form action={deleteMenuItemImage} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                                          <input type="hidden" name="imageId" value={img.id} />
                                          <input type="hidden" name="menuItemId" value={m.id} />
                                          <button
                                            type="submit"
                                            className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold shadow hover:bg-rose-700"
                                            title="이미지 삭제"
                                          >
                                            ✕
                                          </button>
                                        </form>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-neutral-400">등록된 이미지가 없습니다.</p>
                                )}

                                {/* 이미지 추가 */}
                                <form action={uploadMenuImage} encType="multipart/form-data" className="flex items-center gap-2">
                                  <input type="hidden" name="id" value={m.id} />
                                  <input
                                    type="file"
                                    name="image"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="flex-1 text-xs text-neutral-600 file:mr-2 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-stone-700 hover:file:bg-stone-200"
                                  />
                                  <Button type="submit" variant="secondary" size="sm">추가</Button>
                                </form>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
