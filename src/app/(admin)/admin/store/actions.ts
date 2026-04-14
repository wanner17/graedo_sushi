"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const STORE_ID = "main";

function getStr(fd: FormData, key: string) {
  const v = fd.get(key);
  return v === null ? "" : String(v);
}
function getOptStr(fd: FormData, key: string) {
  const v = fd.get(key);
  const s = v === null ? "" : String(v).trim();
  return s.length ? s : null;
}

export async function upsertStoreSettings(fd: FormData) {
  const name = getStr(fd, "name").trim();
  const phone = getStr(fd, "phone").trim();
  const address = getStr(fd, "address").trim();

  const open = getStr(fd, "open").trim();
  const close = getStr(fd, "close").trim();

  if (!name) throw new Error("가게명을 입력해주세요.");
  if (!phone) throw new Error("전화번호를 입력해주세요.");
  if (!address) throw new Error("주소를 입력해주세요.");
  if (!open) throw new Error("오픈 시간을 입력해주세요.");
  if (!close) throw new Error("마감 시간을 입력해주세요.");

  const noticeEnabled = fd.get("noticeEnabled") === "on";

  await prisma.storeSettings.upsert({
    where: { id: STORE_ID },
    create: {
      id: STORE_ID,
      name,
      tagline: getOptStr(fd, "tagline"),
      phone,
      address,
      parking: getOptStr(fd, "parking"),
      mapUrl: getOptStr(fd, "mapUrl"),
      naverPlace: getOptStr(fd, "naverPlace"),
      instagram: getOptStr(fd, "instagram"),
      kakaoOrderUrl: getOptStr(fd, "kakaoOrderUrl"),

      open,
      close,
      breakStart: getOptStr(fd, "breakStart"),
      breakEnd: getOptStr(fd, "breakEnd"),
      lastOrder: getOptStr(fd, "lastOrder"),
      closedDays: getOptStr(fd, "closedDays"),

      noticeEnabled,
      noticeText: getOptStr(fd, "noticeText"),
    },
    update: {
      name,
      tagline: getOptStr(fd, "tagline"),
      phone,
      address,
      parking: getOptStr(fd, "parking"),
      mapUrl: getOptStr(fd, "mapUrl"),
      naverPlace: getOptStr(fd, "naverPlace"),
      instagram: getOptStr(fd, "instagram"),
      kakaoOrderUrl: getOptStr(fd, "kakaoOrderUrl"),
      
      open,
      close,
      breakStart: getOptStr(fd, "breakStart"),
      breakEnd: getOptStr(fd, "breakEnd"),
      lastOrder: getOptStr(fd, "lastOrder"),
      closedDays: getOptStr(fd, "closedDays"),

      noticeEnabled,
      noticeText: getOptStr(fd, "noticeText"),
    },
  });

  // 손님 페이지 갱신
  revalidatePath("/");
  revalidatePath("/menu");
  // 관리자 페이지 갱신
  revalidatePath("/admin/store");
}
