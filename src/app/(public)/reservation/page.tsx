import { Suspense } from "react";
import ReservationDashboard from "@/components/ReservationDashboard";
import ReservationForm from "@/components/ReservationForm";
import WaitingListForm from "@/components/WaitingListForm";

export const metadata = {
  title: "예약 | 그래도스시",
  description: "그래도스시 예약 및 빈자리 알림 신청",
};

export default function ReservationPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-gray-900 text-white px-6 py-8">
        <h1 className="text-2xl font-bold">예약</h1>
        <p className="text-gray-400 text-sm mt-1">그래도스시 자리 예약 및 빈자리 알림</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* 실시간 매장 현황 */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">실시간 매장 현황</h2>
          <div className="border border-gray-100 rounded-2xl p-4 shadow-sm">
            <Suspense fallback={<div className="h-32 animate-pulse bg-gray-50 rounded-xl" />}>
              <ReservationDashboard />
            </Suspense>
          </div>
        </section>

        {/* 예약하기 */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">예약하기</h2>
          <div className="border border-gray-100 rounded-2xl p-4 shadow-sm">
            <ReservationForm />
          </div>
        </section>

        {/* 빈자리 알림 신청 */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-1">빈자리 알림 신청</h2>
          <p className="text-xs text-gray-400 mb-3">
            원하는 날짜가 꽉 찼을 때, 취소가 생기면 이메일로 알려드립니다.
          </p>
          <div className="border border-blue-50 bg-blue-50/30 rounded-2xl p-4 shadow-sm">
            <WaitingListForm />
          </div>
        </section>
      </div>
    </main>
  );
}
