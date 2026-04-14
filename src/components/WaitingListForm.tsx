"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIME_RANGES = [
  { label: "점심 (11:30~14:00)", from: "11:30", to: "14:00" },
  { label: "저녁 (17:30~20:30)", from: "17:30", to: "20:30" },
  { label: "종일", from: "11:30", to: "20:30" },
];

export default function WaitingListForm() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    desiredDate: "",
    timeRange: 0,
    partySize: "2",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
  });

  const set = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const range = TIME_RANGES[form.timeRange];
    try {
      const res = await fetch("/api/waiting-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: form.guestName,
          guestPhone: form.guestPhone,
          guestEmail: form.guestEmail || undefined,
          desiredDate: `${form.desiredDate}T00:00:00+09:00`,
          desiredTimeFrom: range.from,
          desiredTimeTo: range.to,
          partySize: Number(form.partySize),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "신청 실패");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6 space-y-2"
      >
        <div className="text-3xl">🔔</div>
        <p className="font-semibold text-gray-800">대기 신청 완료!</p>
        <p className="text-xs text-gray-500">
          취소 자리가 생기면 이메일로 알려드립니다.
          <br />알림 링크는 <strong>5분</strong> 이내에만 유효합니다.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 희망 날짜 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">희망 날짜</label>
        <input
          type="date"
          required
          min={new Date().toISOString().split("T")[0]}
          value={form.desiredDate}
          onChange={set("desiredDate")}
          className="w-full border border-blue-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 희망 시간대 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">희망 시간대</label>
        <div className="space-y-1.5">
          {TIME_RANGES.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setForm((f) => ({ ...f, timeRange: i }))}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                form.timeRange === i
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-blue-100 text-gray-700 hover:bg-blue-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 인원 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">인원</label>
        <select
          value={form.partySize}
          onChange={set("partySize")}
          className="w-full border border-blue-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n}명</option>
          ))}
        </select>
      </div>

      {/* 이름 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">이름</label>
        <input
          type="text"
          required
          placeholder="홍길동"
          value={form.guestName}
          onChange={set("guestName")}
          className="w-full border border-blue-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 전화번호 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">전화번호</label>
        <input
          type="tel"
          required
          placeholder="010-0000-0000"
          value={form.guestPhone}
          onChange={set("guestPhone")}
          className="w-full border border-blue-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 이메일 (알림 수신용) */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          이메일 <span className="text-blue-500">(알림 수신용, 권장)</span>
        </label>
        <input
          type="email"
          placeholder="example@email.com"
          value={form.guestEmail}
          onChange={set("guestEmail")}
          className="w-full border border-blue-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={loading || !form.desiredDate}
        className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold
                   disabled:opacity-40 disabled:cursor-not-allowed
                   hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        {loading ? "신청 중…" : "빈자리 알림 신청"}
      </button>
    </form>
  );
}
