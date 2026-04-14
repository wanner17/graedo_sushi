/**
 * 빈자리 선점 페이지
 * 이메일 링크 → /reservation/claim?token=XXX
 * 5분 만료 토큰 검증 → 트랜잭션으로 선착순 1명만 예약 확정
 */
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";

type Phase = "idle" | "countdown" | "claiming" | "success" | "fail";

function ClaimContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(300); // 5분 카운트다운
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 페이지 진입 즉시 카운트다운 시작
  useEffect(() => {
    if (!token) return;
    setPhase("countdown");

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("fail");
          setError("링크가 만료되었습니다. (5분 초과)");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [token]);

  async function handleClaim() {
    if (phase !== "countdown") return;
    clearInterval(intervalRef.current!);
    setPhase("claiming");

    try {
      const res = await fetch("/api/reservations/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPhase("fail");
        setError(data.error ?? "예약에 실패했습니다.");
        return;
      }
      setPhase("success");
    } catch {
      setPhase("fail");
      setError("네트워크 오류가 발생했습니다.");
    }
  }

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const urgency = secondsLeft < 60;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <AnimatePresence mode="wait">
          {/* 토큰 없음 */}
          {!token && (
            <motion.div key="no-token" className="text-center space-y-3">
              <p className="text-2xl">🔗</p>
              <p className="font-semibold text-gray-700">유효하지 않은 링크입니다.</p>
            </motion.div>
          )}

          {/* 카운트다운 */}
          {phase === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-md p-8 text-center space-y-6"
            >
              <p className="text-lg font-bold text-gray-800">빈자리가 생겼습니다!</p>
              <p className="text-sm text-gray-500">
                아래 버튼을 눌러 지금 바로 예약을 선점하세요.
              </p>

              {/* 타이머 */}
              <motion.div
                className={`text-4xl font-mono font-bold ${
                  urgency ? "text-red-500" : "text-gray-800"
                }`}
                animate={urgency ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: urgency ? Infinity : 0 }}
              >
                {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </motion.div>

              {/* 진행 바 */}
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${urgency ? "bg-red-400" : "bg-green-400"}`}
                  animate={{ width: `${(secondsLeft / 300) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {urgency && (
                <motion.p
                  className="text-xs text-red-500 font-medium"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  1분 미만 남았습니다!
                </motion.p>
              )}

              <button
                onClick={handleClaim}
                className="w-full bg-gray-900 text-white rounded-xl py-4 text-base font-bold
                           hover:bg-gray-800 active:scale-[0.97] transition-all shadow-lg"
              >
                지금 예약 선점하기
              </button>
              <p className="text-xs text-gray-400">
                동시에 여러 명이 클릭해도 선착순 1명만 예약됩니다.
              </p>
            </motion.div>
          )}

          {/* 처리 중 */}
          {phase === "claiming" && (
            <motion.div
              key="claiming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <motion.div
                className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-gray-600 font-medium">예약 처리 중…</p>
            </motion.div>
          )}

          {/* 성공 */}
          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-md p-8 text-center space-y-4"
            >
              <motion.div
                className="text-5xl"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                🎉
              </motion.div>
              <p className="text-xl font-bold text-gray-800">예약 완료!</p>
              <p className="text-sm text-gray-500">
                예약이 확정되었습니다. 방문을 기다리겠습니다.
              </p>
              <a
                href="/"
                className="inline-block mt-2 text-sm text-gray-400 underline"
              >
                홈으로 돌아가기
              </a>
            </motion.div>
          )}

          {/* 실패 */}
          {phase === "fail" && (
            <motion.div
              key="fail"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-md p-8 text-center space-y-4"
            >
              <div className="text-4xl">😔</div>
              <p className="font-semibold text-gray-700">{error}</p>
              <p className="text-xs text-gray-400">
                빈자리 알림은 먼저 신청하신 순서대로 발송됩니다.
              </p>
              <a
                href="/reservation"
                className="inline-block mt-2 text-sm text-blue-500 underline"
              >
                다시 대기 신청하기
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ClaimContent />
    </Suspense>
  );
}
