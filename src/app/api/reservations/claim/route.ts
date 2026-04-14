/**
 * POST /api/reservations/claim
 * 빈자리 알림 링크를 통한 예약 선점
 *
 * 레이스 컨디션 방지:
 * - Prisma 트랜잭션(serializable) + updateMany WHERE 조건으로
 *   딱 한 명만 CLAIMED 상태로 변경되도록 보장
 * - 5분 토큰 만료 체크 포함
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WaitingStatus, ReservationStatus } from "@prisma/client";
import { verifyNotifyToken } from "@/lib/token";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, guestName, guestPhone, guestEmail, partySize, notes } = body;

  if (!token) {
    return NextResponse.json({ error: "토큰이 없습니다." }, { status: 400 });
  }

  // 1. 토큰 유효성 검증
  const result = verifyNotifyToken(token);
  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "링크가 만료되었습니다. (5분 초과)"
        : "유효하지 않은 링크입니다.";
    return NextResponse.json({ error: message }, { status: 410 });
  }

  const { waitingId } = result;

  try {
    // 2. 트랜잭션: 상태가 NOTIFIED이고 토큰이 일치하는 row만 CLAIMED로 변경
    //    동시에 여러 명이 클릭해도 한 명만 성공
    const claimed = await prisma.$transaction(async (tx) => {
      // updateMany는 변경된 row 수를 반환 → 0이면 이미 다른 사람이 선점
      const updated = await tx.waitingList.updateMany({
        where: {
          id: waitingId,
          status: WaitingStatus.NOTIFIED,
          notifyToken: token,
          notifyTokenExp: { gt: new Date() }, // 만료 시간 재검증
        },
        data: {
          status: WaitingStatus.CLAIMED,
        },
      });

      if (updated.count === 0) {
        return null; // 선점 실패
      }

      // 선점 성공 → 대기자 정보를 가져와 실제 예약 생성
      const waiter = await tx.waitingList.findUnique({ where: { id: waitingId } });
      if (!waiter) return null;

      const reservation = await tx.reservation.create({
        data: {
          date: waiter.desiredDate, // 원하는 날짜로 예약 (시간은 추후 확정)
          partySize: partySize ?? waiter.partySize,
          guestName: guestName ?? waiter.guestName,
          guestPhone: guestPhone ?? waiter.guestPhone,
          guestEmail: guestEmail ?? waiter.guestEmail,
          notes: notes ?? null,
          status: ReservationStatus.CONFIRMED,
        },
      });

      return reservation;
    });

    if (!claimed) {
      return NextResponse.json(
        { error: "이미 다른 분이 예약을 선점했습니다." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, reservation: claimed }, { status: 201 });
  } catch (err) {
    console.error("claim error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
