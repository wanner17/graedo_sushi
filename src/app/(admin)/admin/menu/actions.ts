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

export async function moveCategory(fd: FormData) {
  const id = s(fd, "id");
  const dir = s(fd, "dir");
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
    prisma.category.update({ where: { id: current.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.category.update({ where: { id: neighbor.id }, data: { sortOrder: current.sortOrder } }),
  ]);

  revalidateAll();
}

/** ---------- MenuItem CRUD ---------- */

export async function createMenuItem(fd: FormData) {
  const categoryId = s(fd, "categoryId");
  const name = s(fd, "name").trim();
  const price = n(fd, "price", 0);
  const description = s(fd, "description").trim() || null;
  const sortOrderRaw = s(fd, "sortOrder").trim();
  const sortOrderInput = sortOrderRaw.length ? Number(sortOrderRaw) : NaN;
  const isBest = on(fd, "isBest");
  const isSoldOut = on(fd, "isSoldOut");
  const isActive = on(fd, "isActive");

  if (!categoryId) throw new Error("카테고리를 선택해주세요.");
  if (!name) throw new Error("메뉴명을 입력해주세요.");
  if (price < 0) throw new Error("가격이 올바르지 않습니다.");

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
    data: { categoryId, name, description, price, sortOrder, isBest, isSoldOut, isActive },
  });

  revalidateAll();
}

export async function updateMenuItem(fd: FormData) {
  const id = s(fd, "id");
  const categoryId = s(fd, "categoryId");
  const name = s(fd, "name").trim();
  const price = n(fd, "price", 0);
  const sortOrder = n(fd, "sortOrder", 0);
  const description = s(fd, "description").trim() || null;
  const isBest = on(fd, "isBest");
  const isSoldOut = on(fd, "isSoldOut");
  const isActive = on(fd, "isActive");

  if (!id) throw new Error("메뉴 ID가 없습니다.");
  if (!categoryId) throw new Error("카테고리를 선택해주세요.");
  if (!name) throw new Error("메뉴명을 입력해주세요.");
  if (price < 0) throw new Error("가격이 올바르지 않습니다.");

  await prisma.menuItem.update({
    where: { id },
    data: { categoryId, name, description, price, sortOrder, isBest, isSoldOut, isActive },
  });

  revalidateAll();
}

export async function deleteMenuItem(fd: FormData) {
  const id = s(fd, "id");
  if (!id) return;

  // Supabase 이미지도 정리
  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: { images: true },
  });
  if (item) {
    const paths: string[] = [];
    if (item.imagePath) {
      const seg = new URL(item.imagePath).pathname.split(`/${MENU_BUCKET}/`);
      if (seg[1]) paths.push(seg[1]);
    }
    for (const img of item.images) {
      const seg = new URL(img.path).pathname.split(`/${MENU_BUCKET}/`);
      if (seg[1]) paths.push(seg[1]);
    }
    if (paths.length > 0) {
      await supabaseAdmin.storage.from(MENU_BUCKET).remove(paths);
    }
  }

  await prisma.menuItem.delete({ where: { id } });
  revalidateAll();
}

export async function toggleMenuFlag(fd: FormData) {
  const id = s(fd, "id");
  const field = s(fd, "field");
  if (!id) return;
  if (!["isBest", "isSoldOut", "isActive"].includes(field)) return;

  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) return;

  const next =
    field === "isBest" ? !item.isBest :
    field === "isSoldOut" ? !item.isSoldOut :
    !item.isActive;

  await prisma.menuItem.update({
    where: { id },
    data: { [field]: next } as any,
  });

  revalidateAll();
}

export async function moveMenuItem(fd: FormData) {
  const id = s(fd, "id");
  const dir = s(fd, "dir");
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
    prisma.menuItem.update({ where: { id: current.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.menuItem.update({ where: { id: neighbor.id }, data: { sortOrder: current.sortOrder } }),
  ]);

  revalidateAll();
}

/** ---------- MenuItem 이미지 (다중) ---------- */

async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === MENU_BUCKET)) {
    await supabaseAdmin.storage.createBucket(MENU_BUCKET, { public: true });
  }
}

export async function uploadMenuImage(fd: FormData) {
  const id = s(fd, "id");
  const file = fd.get("image") as File | null;
  if (!id || !file || file.size === 0) return;

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) throw new Error("지원하지 않는 이미지 형식입니다. (jpg/png/webp/gif)");

  await ensureBucket();

  // 기존 이미지 수로 sortOrder 결정
  const existingCount = await prisma.menuItemImage.count({ where: { menuItemId: id } });
  const imageId = `${id}_${Date.now()}`;
  const storagePath = `${id}/${imageId}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error } = await supabaseAdmin.storage
    .from(MENU_BUCKET)
    .upload(storagePath, bytes, { contentType: file.type || "image/jpeg", upsert: true });

  if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

  const publicUrl = getPublicUrl(storagePath);

  await prisma.menuItemImage.create({
    data: { menuItemId: id, path: publicUrl, sortOrder: existingCount },
  });

  // 첫 번째 이미지면 imagePath도 업데이트 (하위 호환)
  if (existingCount === 0) {
    await prisma.menuItem.update({ where: { id }, data: { imagePath: publicUrl } });
  }

  revalidateAll();
}

export async function deleteMenuItemImage(fd: FormData) {
  const imageId = s(fd, "imageId");
  const menuItemId = s(fd, "menuItemId");
  if (!imageId || !menuItemId) return;

  const img = await prisma.menuItemImage.findUnique({ where: { id: imageId } });
  if (img) {
    const seg = new URL(img.path).pathname.split(`/${MENU_BUCKET}/`);
    const storagePath = seg[1];
    if (storagePath) {
      await supabaseAdmin.storage.from(MENU_BUCKET).remove([storagePath]);
    }
    await prisma.menuItemImage.delete({ where: { id: imageId } });
  }

  // imagePath를 다음 이미지로 업데이트
  const next = await prisma.menuItemImage.findFirst({
    where: { menuItemId },
    orderBy: { sortOrder: "asc" },
  });
  await prisma.menuItem.update({
    where: { id: menuItemId },
    data: { imagePath: next?.path ?? null, imageAlt: null },
  });

  revalidateAll();
}

/** 기존 단일 이미지 삭제 (하위 호환) */
export async function deleteMenuImage(fd: FormData) {
  const id = s(fd, "id");
  if (!id) return;

  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (item?.imagePath) {
    const url = new URL(item.imagePath);
    const segments = url.pathname.split(`/${MENU_BUCKET}/`);
    const storagePath = segments[1];
    if (storagePath) {
      await supabaseAdmin.storage.from(MENU_BUCKET).remove([storagePath]);
    }
  }

  await prisma.menuItem.update({ where: { id }, data: { imagePath: null, imageAlt: null } });
  revalidateAll();
}

/** ---------- 엑셀 일괄 가져오기 ---------- */

export type ImportRow = {
  category: string;
  name: string;
  price: number;
  description?: string;
  isBest?: boolean;
  isSoldOut?: boolean;
  sortOrder?: number;
};

export async function importMenuFromExcel(rows: ImportRow[]) {
  if (!rows || rows.length === 0) return { created: 0, updated: 0, errors: [] as string[] };

  const errors: string[] = [];
  let created = 0;
  let updated = 0;

  // 카테고리 캐시 (이름 → id)
  const catCache = new Map<string, string>();

  // 기존 카테고리 로드
  const existingCats = await prisma.category.findMany();
  for (const c of existingCats) {
    catCache.set(c.name.trim(), c.id);
  }

  // 기존 카테고리의 최대 sortOrder
  const maxCatOrder = existingCats.reduce((m, c) => Math.max(m, c.sortOrder), 0);
  let newCatOrder = maxCatOrder + 10;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 헤더가 1행이므로 2행부터

    if (!row.name?.trim()) {
      errors.push(`${rowNum}행: 메뉴명이 없습니다.`);
      continue;
    }
    if (!row.category?.trim()) {
      errors.push(`${rowNum}행: 카테고리가 없습니다.`);
      continue;
    }
    if (!Number.isFinite(row.price) || row.price < 0) {
      errors.push(`${rowNum}행 (${row.name}): 가격이 올바르지 않습니다.`);
      continue;
    }

    // 카테고리 찾기 or 생성
    const catName = row.category.trim();
    let categoryId = catCache.get(catName);
    if (!categoryId) {
      const newCat = await prisma.category.create({
        data: { name: catName, sortOrder: newCatOrder, isActive: true },
      });
      categoryId = newCat.id;
      catCache.set(catName, categoryId);
      newCatOrder += 10;
    }

    // 같은 카테고리 + 같은 이름 → upsert
    const existing = await prisma.menuItem.findFirst({
      where: { categoryId, name: row.name.trim() },
    });

    const data = {
      name: row.name.trim(),
      price: row.price,
      description: row.description?.trim() || null,
      isBest: row.isBest ?? false,
      isSoldOut: row.isSoldOut ?? false,
      sortOrder: row.sortOrder ?? 0,
    };

    if (existing) {
      await prisma.menuItem.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.menuItem.create({ data: { ...data, categoryId, isActive: true } });
      created++;
    }
  }

  revalidateAll();
  return { created, updated, errors };
}
