/**
 * PATCH /api/reservations/[id]  – 예약 상태 변경
 * 취소(CANCELLED)로 바뀌면 대기자 알림 트리거
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationStatus, WaitingStatus } from "@prisma/client";
import { generateNotifyToken } from "@/lib/token";
import { sendVacancyNotification } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body as { status: ReservationStatus };

  if (!Object.values(ReservationStatus).includes(status)) {
    return NextResponse.json({ error: "유효하지 않은 상태값" }, { status: 400 });
  }

  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status },
  });

  // 예약이 취소됐을 때 대기자 알림 트리거
  if (status === ReservationStatus.CANCELLED) {
    await notifyWaitingGuests(reservation.date);
  }

  return NextResponse.json(reservation);
}

/**
 * 취소된 예약의 날짜/시간과 겹치는 대기자를 찾아 알림 발송
 * - 아직 WAITING 상태인 대기자만 대상
 * - 이미 알림을 받은 대기자는 제외 (중복 방지)
 */
async function notifyWaitingGuests(cancelledDate: Date) {
  const dateOnly = new Date(cancelledDate);
  dateOnly.setHours(0, 0, 0, 0);
  const nextDay = new Date(dateOnly);
  nextDay.setDate(nextDay.getDate() + 1);

  // 취소 날짜와 같은 날, 아직 WAITING 상태인 대기자 조회
  const waiters = await prisma.waitingList.findMany({
    where: {
      status: WaitingStatus.WAITING,
      notifyEnabled: true,
      desiredDate: {
        gte: dateOnly,
        lt: nextDay,
      },
    },
    orderBy: { createdAt: "asc" }, // 먼저 신청한 순
  });

  // 각 대기자에게 알림 발송 (병렬)
  await Promise.all(
    waiters.map(async (waiter) => {
      const { token, expiresAt } = generateNotifyToken(waiter.id);

      // DB에 토큰 저장 + 상태를 NOTIFIED로 변경
      await prisma.waitingList.update({
        where: { id: waiter.id },
        data: {
          status: WaitingStatus.NOTIFIED,
          notifiedAt: new Date(),
          notifyToken: token,
          notifyTokenExp: expiresAt,
        },
      });

      // 알림 발송
      await sendVacancyNotification({
        waitingId: waiter.id,
        guestName: waiter.guestName,
        guestEmail: waiter.guestEmail,
        guestPhone: waiter.guestPhone,
        desiredDate: waiter.desiredDate,
        desiredTimeFrom: waiter.desiredTimeFrom,
        desiredTimeTo: waiter.desiredTimeTo,
        claimToken: token,
      });
    })
  );
}
