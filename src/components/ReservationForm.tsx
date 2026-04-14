"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIME_SLOTS = [
  "11:30", "12:00", "12:30", "13:00", "13:30",
  "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
];

export default function ReservationForm() {
  const [step, setStep] = useState<"form" | "done">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    date: "",
    time: "",
    partySize: "2",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    notes: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const dateTime = `${form.date}T${form.time}:00+09:00`;
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateTime,
          partySize: Number(form.partySize),
          guestName: form.guestName,
          guestPhone: form.guestPhone,
          guestEmail: form.guestEmail || undefined,
          notes: form.notes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "예약 실패");
      }
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6 space-y-3"
      >
        <div className="text-4xl">🍣</div>
        <p className="font-semibold text-gray-800">예약이 완료되었습니다!</p>
        <p className="text-sm text-gray-500">
          {form.date} {form.time} · {form.partySize}인
        </p>
        <button
          onClick={() => { setStep("form"); setForm((f) => ({ ...f, date: "", time: "" })); }}
          className="text-sm text-gray-400 underline mt-2"
        >
          다른 예약하기
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 날짜 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">날짜</label>
        <input
          type="date"
          required
          min={new Date().toISOString().split("T")[0]}
          value={form.date}
          onChange={set("date")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* 시간 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">시간</label>
        <div className="grid grid-cols-4 gap-2">
          {TIME_SLOTS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, time: t }))}
              className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                form.time === t
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t}
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
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* 이메일 (선택) */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">이메일 (선택)</label>
        <input
          type="email"
          placeholder="example@email.com"
          value={form.guestEmail}
          onChange={set("guestEmail")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {/* 요청사항 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">요청사항 (선택)</label>
        <textarea
          placeholder="알레르기, 생일 등 특이사항을 적어주세요"
          value={form.notes}
          onChange={set("notes")}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
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
        disabled={loading || !form.date || !form.time}
        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold
                   disabled:opacity-40 disabled:cursor-not-allowed
                   hover:bg-gray-800 active:scale-[0.98] transition-all"
      >
        {loading ? "예약 중…" : "예약하기"}
      </button>
    </form>
  );
}
