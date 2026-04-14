/**
 * GET  /api/reservations  – 예약 목록 조회 (날짜 필터 가능)
 * POST /api/reservations  – 예약 생성
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateStr = searchParams.get("date"); // "2026-04-15"

  const where = dateStr
    ? {
        date: {
          gte: new Date(`${dateStr}T00:00:00+09:00`),
          lt: new Date(`${dateStr}T23:59:59+09:00`),
        },
      }
    : {};

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, partySize, guestName, guestPhone, guestEmail, notes } = body;

  if (!date || !partySize || !guestName || !guestPhone) {
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }

  const reservation = await prisma.reservation.create({
    data: {
      date: new Date(date),
      partySize: Number(partySize),
      guestName,
      guestPhone,
      guestEmail: guestEmail ?? null,
      notes: notes ?? null,
      status: ReservationStatus.CONFIRMED,
    },
  });

  return NextResponse.json(reservation, { status: 201 });
}
