/**
 * 어드민: 예약 관리 페이지
 * - 날짜별 예약 목록 조회
 * - 상태 변경 (취소 → 대기자 자동 알림 트리거)
 * - 대기자 현황 확인
 */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

type ReservationStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
type WaitingStatus = "WAITING" | "NOTIFIED" | "CLAIMED" | "EXPIRED";

interface Reservation {
  id: string;
  date: string;
  partySize: number;
  status: ReservationStatus;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  notes: string | null;
}

interface WaitingEntry {
  id: string;
  guestName: string;
  guestPhone: string;
  desiredDate: string;
  desiredTimeFrom: string;
  desiredTimeTo: string;
  partySize: number;
  status: WaitingStatus;
  notifiedAt: string | null;
}

const STATUS_LABEL: Record<ReservationStatus, string> = {
  CONFIRMED: "확정",
  CANCELLED: "취소",
  COMPLETED: "완료",
  NO_SHOW: "노쇼",
};

const STATUS_COLOR: Record<ReservationStatus, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  NO_SHOW: "bg-orange-100 text-orange-700",
};

const WAIT_COLOR: Record<WaitingStatus, string> = {
  WAITING: "bg-blue-100 text-blue-700",
  NOTIFIED: "bg-yellow-100 text-yellow-700",
  CLAIMED: "bg-green-100 text-green-700",
  EXPIRED: "bg-gray-100 text-gray-500",
};

function Spinner() {
  return (
    <svg className="animate-spin h-3 w-3 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export default function AdminReservationsPage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [tab, setTab] = useState<"reservations" | "waiting">("reservations");
  const qc = useQueryClient();

  // 예약 목록
  const { data: reservations = [] } = useQuery<Reservation[]>({
    queryKey: ["admin-reservations", selectedDate],
    queryFn: () =>
      fetch(`/api/reservations?date=${selectedDate}`).then((r) => r.json()),
    refetchInterval: 15_000,
  });

  // 대기자 목록
  const { data: waiters = [] } = useQuery<WaitingEntry[]>({
    queryKey: ["admin-waiting"],
    queryFn: () => fetch("/api/waiting-list").then((r) => r.json()),
    refetchInterval: 15_000,
  });

  // 상태 변경
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((r) => r.json()),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      qc.invalidateQueries({ queryKey: ["admin-waiting"] });
      qc.invalidateQueries({ queryKey: ["reservation-status"] });
      const label = STATUS_LABEL[variables.status];
      alert(`상태가 "${label}"(으)로 변경되었습니다.`);
    },
    onError: () => {
      alert("오류가 발생했습니다. 다시 시도해 주세요.");
    },
  });

  const isPending = updateStatus.isPending;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">예약 관리</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          취소 처리 시 대기자에게 자동 알림이 발송됩니다.
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2">
        {(["reservations", "waiting"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t === "reservations" ? `예약 (${reservations.length})` : `대기자 (${waiters.length})`}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "reservations" && (
          <motion.div
            key="reservations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* 날짜 선택 */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            {reservations.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">이 날 예약이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {reservations.map((r) => (
                  <motion.div
                    key={r.id}
                    layout
                    className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {r.guestName} ({r.partySize}인)
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDateTime(r.date)} · {r.guestPhone}
                        </p>
                        {r.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">"{r.notes}"</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </div>

                    {/* 상태 변경 버튼 */}
                    {r.status === "CONFIRMED" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          disabled={isPending}
                          onClick={() => updateStatus.mutate({ id: r.id, status: "COMPLETED" })}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPending ? <Spinner /> : null}
                          식사 완료
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => {
                            if (confirm(`${r.guestName}님 예약을 취소하시겠습니까?\n대기자에게 알림이 발송됩니다.`)) {
                              updateStatus.mutate({ id: r.id, status: "CANCELLED" });
                            }
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPending ? <Spinner /> : null}
                          취소 처리
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => updateStatus.mutate({ id: r.id, status: "NO_SHOW" })}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs py-1.5 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPending ? <Spinner /> : null}
                          노쇼
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {waiters.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">대기자가 없습니다.</p>
            ) : (
              waiters.map((w) => (
                <div key={w.id} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {w.guestName} ({w.partySize}인)
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(w.desiredDate).toLocaleDateString("ko-KR")} ·{" "}
                        {w.desiredTimeFrom}~{w.desiredTimeTo}
                      </p>
                      <p className="text-xs text-gray-400">{w.guestPhone}</p>
                      {w.notifiedAt && (
                        <p className="text-xs text-yellow-600 mt-0.5">
                          알림 발송: {formatDateTime(w.notifiedAt)}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WAIT_COLOR[w.status]}`}>
                      {w.status === "WAITING" ? "대기 중"
                        : w.status === "NOTIFIED" ? "알림 발송"
                        : w.status === "CLAIMED" ? "선점 완료"
                        : "만료"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
