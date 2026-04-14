"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardData {
  currentlyDining: Array<{
    id: string;
    date: string;
    partySize: number;
    status: string;
    guestName: string;
  }>;
  upcoming: Array<{
    id: string;
    date: string;
    partySize: number;
    status: string;
    guestName: string;
  }>;
  totalToday: number;
  completedToday: number;
  waitingCount: number;
  asOf: string;
}

async function fetchStatus(): Promise<DashboardData> {
  const res = await fetch("/api/reservations/status");
  if (!res.ok) throw new Error("상태 조회 실패");
  return res.json();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** 식사 중인 테이블의 예상 퇴장까지 남은 시간 (90분 기준) */
function minutesLeft(dateIso: string) {
  const resTime = new Date(dateIso).getTime();
  const endTime = resTime + 90 * 60_000;
  const diff = Math.max(0, Math.ceil((endTime - Date.now()) / 60_000));
  return diff;
}

function progressPercent(dateIso: string) {
  const resTime = new Date(dateIso).getTime();
  const elapsed = Date.now() - resTime;
  return Math.min(100, Math.max(0, Math.round((elapsed / (90 * 60_000)) * 100)));
}

export default function ReservationDashboard() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["reservation-status"],
    queryFn: fetchStatus,
    refetchInterval: 30_000, // 30초마다 자동 갱신
    refetchIntervalInBackground: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-6">
        <motion.div
          className="w-2 h-2 rounded-full bg-gray-300"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="text-sm">현황 불러오는 중…</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-400 py-4">현황을 불러올 수 없습니다.</div>
    );
  }

  const hasDining = data.currentlyDining.length > 0;

  return (
    <div className="space-y-4">
      {/* 라이브 헤더 */}
      <div className="flex items-center gap-2">
        <motion.span
          className="inline-block w-2.5 h-2.5 rounded-full bg-green-400"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs font-semibold text-green-600 tracking-wide uppercase">
          LIVE
        </span>
        <span className="text-xs text-gray-400 ml-auto">
          {new Date(data.asOf).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 기준
        </span>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="오늘 예약" value={data.totalToday} unit="팀" />
        <StatCard label="식사 완료" value={data.completedToday} unit="팀" />
        <StatCard label="대기 중" value={data.waitingCount} unit="팀" highlight />
      </div>

      {/* 현재 식사 중 */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">현재 식사 중</p>
        <AnimatePresence>
          {hasDining ? (
            data.currentlyDining.map((r) => {
              const pct = progressPercent(r.date);
              const left = minutesLeft(r.date);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-semibold text-amber-900">
                        {r.guestName}님 ({r.partySize}인)
                      </span>
                      <span className="ml-2 text-xs text-amber-600">
                        {formatTime(r.date)} 입장
                      </span>
                    </div>
                    <span className="text-xs text-amber-700 font-medium">
                      ~{left}분 남음
                    </span>
                  </div>
                  {/* 진행 바 */}
                  <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-amber-500 mt-1 text-right">{pct}% 경과</p>
                </motion.div>
              );
            })
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-400 py-2"
            >
              현재 식사 중인 테이블이 없습니다.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 다음 예약 */}
      {data.upcoming.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">다음 예약</p>
          <div className="space-y-1.5">
            {data.upcoming.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="text-sm font-mono text-gray-700 w-12">
                  {formatTime(r.date)}
                </span>
                <span className="text-sm text-gray-600">
                  {r.guestName}님
                </span>
                <span className="ml-auto text-xs text-gray-400">{r.partySize}인</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      className={`rounded-xl p-3 text-center ${
        highlight ? "bg-blue-50 border border-blue-100" : "bg-gray-50"
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-blue-600" : "text-gray-800"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-400">{unit}</p>
    </motion.div>
  );
}
