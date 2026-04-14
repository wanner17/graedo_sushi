import Link from "next/link";
import { SectionHeader } from "@/components/ui/ui";
import { ExcelImporter } from "./ExcelImporter";

export default function MenuImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link
          href="/admin/menu"
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-stone-500 transition hover:bg-neutral-50"
          aria-label="메뉴 관리로 돌아가기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <SectionHeader
          icon="📥"
          title="엑셀 일괄 등록"
          description="엑셀 파일(.xlsx, .xls)로 메뉴를 한꺼번에 등록하거나 업데이트할 수 있습니다."
        />
      </div>

      {/* 양식 안내 */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-800">
          <span>📋</span> 엑셀 파일 양식
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="bg-blue-100">
                {["A: 카테고리*", "B: 메뉴명*", "C: 가격*", "D: 설명", "E: BEST", "F: 품절", "G: 정렬순서"].map((h) => (
                  <th key={h} className="border border-blue-200 px-3 py-1.5 text-left font-semibold text-blue-800">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="border border-blue-200 px-3 py-1.5 text-stone-700">초밥</td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-700">연어초밥</td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-700">12000</td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-500">신선한 노르웨이산 연어...</td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-500">Y</td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-400"></td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-500">10</td>
              </tr>
              <tr className="bg-blue-50/50">
                <td className="border border-blue-200 px-3 py-1.5 text-stone-700">롤</td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-700">참치마요롤</td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-700">9000</td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-400"></td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-400"></td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-400"></td>
                <td className="border border-blue-200 px-3 py-1.5 text-stone-400"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="mt-3 space-y-1 text-xs text-blue-700">
          <li>• <strong>*</strong> 표시된 열은 필수입니다.</li>
          <li>• 1행은 헤더(제목) 행으로 자동으로 건너뜁니다.</li>
          <li>• BEST/품절: <code className="bg-blue-100 px-1 rounded">Y, y, O, o, 1, TRUE, true</code> 입력 시 활성화됩니다.</li>
          <li>• 같은 카테고리에 같은 메뉴명이 이미 있으면 <strong>업데이트</strong>, 없으면 <strong>새로 추가</strong>됩니다.</li>
          <li>• 새 카테고리명을 입력하면 자동으로 카테고리가 생성됩니다.</li>
        </ul>
      </div>

      {/* 업로드 컴포넌트 */}
      <ExcelImporter />
    </div>
  );
}
