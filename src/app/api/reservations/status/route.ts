/**
 * GET /api/reservations/status
 * 오늘의 예약 현황 요약 (대시보드용)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";

export async function GET() {
  const now = new Date();
  // KST 기준 오늘
  const kstOffset = 9 * 60 * 60 * 1000;
  const todayKST = new Date(now.getTime() + kstOffset);
  todayKST.setUTCHours(0, 0, 0, 0);
  const tomorrowKST = new Date(todayKST);
  tomorrowKST.setUTCDate(tomorrowKST.getUTCDate() + 1);

  const reservations = await prisma.reservation.findMany({
    where: {
      date: { gte: todayKST, lt: tomorrowKST },
      status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED] },
    },
    orderBy: { date: "asc" },
    select: { id: true, date: true, partySize: true, status: true, guestName: true },
  });

  const nowMs = now.getTime();

  // 현재 식사 중 (예약 시간 기준 ±90분 이내, CONFIRMED)
  const currentlyDining = reservations.filter((r) => {
    const resMs = r.date.getTime();
    return (
      r.status === ReservationStatus.CONFIRMED &&
      nowMs >= resMs - 15 * 60_000 && // 15분 전부터
      nowMs <= resMs + 90 * 60_000    // 90분 후까지
    );
  });

  // 다음 예약
  const upcoming = reservations
    .filter((r) => r.date.getTime() > nowMs && r.status === ReservationStatus.CONFIRMED)
    .slice(0, 3);

  // 오늘 전체 예약 수
  const totalToday = reservations.length;
  const completedToday = reservations.filter((r) => r.status === ReservationStatus.COMPLETED).length;

  // 대기자 수
  const waitingCount = await prisma.waitingList.count({
    where: {
      desiredDate: { gte: todayKST, lt: tomorrowKST },
      status: { in: ["WAITING", "NOTIFIED"] },
    },
  });

  return NextResponse.json({
    currentlyDining,
    upcoming,
    totalToday,
    completedToday,
    waitingCount,
    asOf: now.toISOString(),
  });
}
