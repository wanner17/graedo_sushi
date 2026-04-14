"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, MENU_BUCKET, getPublicUrl } from "@/lib/supabase";

const ADMIN_PATH = "/admin/menu";
const PUBLIC_MENU_PATH = "/menu";

function s(fd: FormData, k: string) {
  const v = fd.get(k);
  return v === null ? "" : String(v);
}
function n(fd: FormData, k: string, fallback = 0) {
  const v = Number(s(fd, k));
  return Number.isFinite(v) ? v : fallback;
}
function on(fd: FormData, k: string) {
  return fd.get(k) === "on";
}

function revalidateAll() {
  revalidatePath(ADMIN_PATH);
  revalidatePath(PUBLIC_MENU_PATH);
  revalidatePath("/");
}

/** ---------- Category CRUD ---------- */

export async function createCategory(fd: FormData) {
  const name = s(fd, "name").trim();
  const sortOrder = n(fd, "sortOrder", 0);
  if (!name) throw new Error("카테고리명을 입력해주세요.");

  await prisma.category.create({
    data: { name, sortOrder, isActive: true },
  });

  revalidateAll();
}

export async function updateCategory(fd: FormData) {
  const id = s(fd, "id");
  const name = s(fd, "name").trim();
  const sortOrder = n(fd, "sortOrder", 0);
  const isActive = on(fd, "isActive");

  if (!id) throw new Error("카테고리 ID가 없습니다.");
  if (!name) throw new Error("카테고리명을 입력해주세요.");

  await prisma.category.update({
    where: { id },
    data: { name, sortOrder, isActive },
  });

  revalidateAll();
}

export async function deleteCategory(fd: FormData) {
  const id = s(fd, "id");
  if (!id) return;
  await prisma.category.delete({ where: { id } });

  revalidateAll();
}

/** 카테고리 sortOrder 위/아래 이동 (swap) */
export async function moveCategory(fd: FormData) {
  const id = s(fd, "id");
  const dir = s(fd, "dir"); // "up" | "down"
  if (!id || (dir !== "up" && dir !== "down")) return;

  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) return;

  const neighbor = await prisma.category.findFirst({
    where:
      dir === "up"
        ? { sortOrder: { lt: current.sortOrder } }
        : { sortOrder: { gt: current.sortOrder } },
    orderBy: { sortOrder: dir === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.category.update({
      where: { id: current.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    prisma.category.update({
      where: { id: neighbor.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  revalidateAll();
}

/** ---------- MenuItem CRUD ---------- */

export async function createMenuItem(fd: FormData) {
  const categoryId = s(fd, "categoryId");
  const name = s(fd, "name").trim();
  const price = n(fd, "price", 0);

  // 사용자가 sortOrder를 직접 넣으면 그 값을 사용하고,
  // 비어있으면 자동으로 "맨 아래(+10)"로 부여
  const sortOrderRaw = s(fd, "sortOrder").trim();
  const sortOrderInput = sortOrderRaw.length ? Number(sortOrderRaw) : NaN;

  const isBest = on(fd, "isBest");
  const isSoldOut = on(fd, "isSoldOut");
  const isActive = on(fd, "isActive");

  if (!categoryId) throw new Error("카테고리를 선택해주세요.");
  if (!name) throw new Error("메뉴명을 입력해주세요.");
  if (price < 0) throw new Error("가격이 올바르지 않습니다.");

  // 자동 sortOrder 계산
  let sortOrder = 0;
  if (Number.isFinite(sortOrderInput)) {
    sortOrder = sortOrderInput;
  } else {
    const max = await prisma.menuItem.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });
    sortOrder = (max._max.sortOrder ?? 0) + 10;
  }

  await prisma.menuItem.create({
    data: { categoryId, name, price, sortOrder, isBest, isSoldOut, isActive },
  });

  revalidateAll();
}


export async function updateMenuItem(fd: FormData) {
  const id = s(fd, "id");
  const categoryId = s(fd, "categoryId");
  const name = s(fd, "name").trim();
  const price = n(fd, "price", 0);
  const sortOrder = n(fd, "sortOrder", 0);

  const isBest = on(fd, "isBest");
  const isSoldOut = on(fd, "isSoldOut");
  const isActive = on(fd, "isActive");

  if (!id) throw new Error("메뉴 ID가 없습니다.");
  if (!categoryId) throw new Error("카테고리를 선택해주세요.");
  if (!name) throw new Error("메뉴명을 입력해주세요.");
  if (price < 0) throw new Error("가격이 올바르지 않습니다.");

  await prisma.menuItem.update({
    where: { id },
    data: { categoryId, name, price, sortOrder, isBest, isSoldOut, isActive },
  });

  revalidateAll();
}

export async function deleteMenuItem(fd: FormData) {
  const id = s(fd, "id");
  if (!id) return;

  await prisma.menuItem.delete({ where: { id } });
  revalidateAll();
}

/** 토글: BEST/품절/활성 */
export async function toggleMenuFlag(fd: FormData) {
  const id = s(fd, "id");
  const field = s(fd, "field"); // "isBest" | "isSoldOut" | "isActive"
  if (!id) return;
  if (!["isBest", "isSoldOut", "isActive"].includes(field)) return;

  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) return;

  const next =
    field === "isBest"
      ? !item.isBest
      : field === "isSoldOut"
      ? !item.isSoldOut
      : !item.isActive;

  await prisma.menuItem.update({
    where: { id },
    data: { [field]: next } as any,
  });

  revalidateAll();
}

/** ---------- MenuItem 이미지 ---------- */

export async function uploadMenuImage(fd: FormData) {
  const id = s(fd, "id");
  const file = fd.get("image") as File | null;
  if (!id || !file || file.size === 0) return;

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) throw new Error("지원하지 않는 이미지 형식입니다. (jpg/png/webp/gif)");

  const bytes = await file.arrayBuffer();
  const storagePath = `${id}.${ext}`;

  // 버킷이 없으면 생성 (public)
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === MENU_BUCKET)) {
    await supabaseAdmin.storage.createBucket(MENU_BUCKET, { public: true });
  }

  const { error } = await supabaseAdmin.storage
    .from(MENU_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

  const publicUrl = getPublicUrl(storagePath);

  await prisma.menuItem.update({
    where: { id },
    data: { imagePath: publicUrl },
  });

  revalidateAll();
}

export async function deleteMenuImage(fd: FormData) {
  const id = s(fd, "id");
  if (!id) return;

  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (item?.imagePath) {
    // URL에서 파일 경로 추출 (버킷 이름 이후 부분)
    const url = new URL(item.imagePath);
    const segments = url.pathname.split(`/${MENU_BUCKET}/`);
    const storagePath = segments[1];
    if (storagePath) {
      await supabaseAdmin.storage.from(MENU_BUCKET).remove([storagePath]);
    }
  }

  await prisma.menuItem.update({
    where: { id },
    data: { imagePath: null, imageAlt: null },
  });

  revalidateAll();
}

/** 메뉴 sortOrder 위/아래 이동 (같은 카테고리 내부 swap) */
export async function moveMenuItem(fd: FormData) {
  const id = s(fd, "id");
  const dir = s(fd, "dir"); // "up" | "down"
  if (!id || (dir !== "up" && dir !== "down")) return;

  const current = await prisma.menuItem.findUnique({ where: { id } });
  if (!current) return;

  const neighbor = await prisma.menuItem.findFirst({
    where:
      dir === "up"
        ? { categoryId: current.categoryId, sortOrder: { lt: current.sortOrder } }
        : { categoryId: current.categoryId, sortOrder: { gt: current.sortOrder } },
    orderBy: { sortOrder: dir === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.menuItem.update({
      where: { id: current.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    prisma.menuItem.update({
      where: { id: neighbor.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  revalidateAll();
}
