/**
 * GET  /api/waiting-list  – 대기자 목록 (어드민용)
 * POST /api/waiting-list  – 대기 신청
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WaitingStatus } from "@prisma/client";

export async function GET() {
  const list = await prisma.waitingList.findMany({
    orderBy: { createdAt: "asc" },
    where: {
      status: { in: [WaitingStatus.WAITING, WaitingStatus.NOTIFIED] },
    },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    guestName,
    guestPhone,
    guestEmail,
    desiredDate,
    desiredTimeFrom,
    desiredTimeTo,
    partySize,
  } = body;

  if (!guestName || !guestPhone || !desiredDate || !desiredTimeFrom || !desiredTimeTo || !partySize) {
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }

  // 동일 전화번호로 같은 날 중복 신청 방지
  const existing = await prisma.waitingList.findFirst({
    where: {
      guestPhone,
      desiredDate: new Date(desiredDate),
      status: { in: [WaitingStatus.WAITING, WaitingStatus.NOTIFIED] },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "이미 같은 날짜로 대기 신청이 되어 있습니다." },
      { status: 409 }
    );
  }

  const entry = await prisma.waitingList.create({
    data: {
      guestName,
      guestPhone,
      guestEmail: guestEmail ?? null,
      desiredDate: new Date(desiredDate),
      desiredTimeFrom,
      desiredTimeTo,
      partySize: Number(partySize),
      notifyEnabled: true,
      status: WaitingStatus.WAITING,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
