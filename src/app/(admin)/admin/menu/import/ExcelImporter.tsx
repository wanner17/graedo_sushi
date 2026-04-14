"use client";

import { useRef, useState, useTransition } from "react";
import { importMenuFromExcel, type ImportRow } from "../actions";

type PreviewRow = ImportRow & { _rowNum: number; _error?: string };
type ImportResult = { created: number; updated: number; errors: string[] };

function parseTruthy(v: unknown): boolean {
  if (!v) return false;
  const s = String(v).trim().toLowerCase();
  return ["y", "o", "1", "true", "yes"].includes(s);
}

function parseRows(data: unknown[][]): PreviewRow[] {
  return data.slice(1).map((row, i) => {
    const rowNum = i + 2;
    const category = String(row[0] ?? "").trim();
    const name = String(row[1] ?? "").trim();
    const rawPrice = row[2];
    const price = Number(rawPrice);
    const description = String(row[3] ?? "").trim() || undefined;
    const isBest = parseTruthy(row[4]);
    const isSoldOut = parseTruthy(row[5]);
    const sortOrder = row[6] !== undefined && row[6] !== "" ? Number(row[6]) : 0;

    let _error: string | undefined;
    if (!category) _error = "카테고리 없음";
    else if (!name) _error = "메뉴명 없음";
    else if (!Number.isFinite(price) || price < 0) _error = "가격 오류";

    return { _rowNum: rowNum, category, name, price: isNaN(price) ? 0 : price, description, isBest, isSoldOut, sortOrder, _error };
  }).filter((r) => r.category || r.name); // 완전 빈 행 제거
}

async function downloadTemplate() {
  const { utils, writeFile } = await import("xlsx");

  const headers = ["카테고리", "메뉴명", "가격", "설명", "BEST", "품절", "정렬순서"];
  const samples = [
    ["초밥", "연어초밥", 12000, "신선한 노르웨이산 연어를 올린 초밥", "Y", "", 10],
    ["초밥", "참치초밥", 11000, "", "", "", 20],
    ["롤", "참치마요롤", 9000, "참치와 마요네즈의 조화", "", "", 10],
    ["롤", "새우튀김롤", 10000, "", "Y", "", 20],
    ["사이드", "된장국", 2000, "", "", "", 10],
  ];

  const ws = utils.aoa_to_sheet([headers, ...samples]);

  // 열 너비 설정
  ws["!cols"] = [
    { wch: 12 }, // 카테고리
    { wch: 16 }, // 메뉴명
    { wch: 10 }, // 가격
    { wch: 30 }, // 설명
    { wch: 8 },  // BEST
    { wch: 8 },  // 품절
    { wch: 10 }, // 정렬순서
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "메뉴");
  writeFile(wb, "그래도스시_메뉴_양식.xlsx");
}

export function ExcelImporter() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError("");
    setPreview(null);
    setResult(null);

    try {
      const { read, utils } = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "" });

      if (data.length < 2) {
        setParseError("데이터가 없습니다. 헤더 아래에 최소 1행 이상 입력하세요.");
        return;
      }

      const rows = parseRows(data as unknown[][]);
      setPreview(rows);
    } catch (err) {
      setParseError("파일을 읽을 수 없습니다. .xlsx 또는 .xls 파일인지 확인하세요.");
    }
  }

  function handleImport() {
    if (!preview) return;
    const validRows = preview.filter((r) => !r._error);
    if (validRows.length === 0) return;

    startTransition(async () => {
      const res = await importMenuFromExcel(
        validRows.map(({ _rowNum: _r, _error: _e, ...row }) => row)
      );
      setResult(res);
      setPreview(null);
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function handleReset() {
    setPreview(null);
    setFileName("");
    setParseError("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const validCount = preview?.filter((r) => !r._error).length ?? 0;
  const errorCount = preview?.filter((r) => r._error).length ?? 0;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
      {/* 양식 다운로드 */}
      <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-green-800">엑셀 양식 파일</p>
          <p className="text-xs text-green-600">샘플 데이터가 포함된 양식을 다운로드하세요.</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          양식 다운로드
        </button>
      </div>

      {/* 파일 업로드 */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          엑셀 파일 선택 (.xlsx, .xls)
        </label>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="flex-1 text-sm text-neutral-600 file:mr-3 file:rounded-xl file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
          />
          {preview || result ? (
            <button
              onClick={handleReset}
              className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-50"
            >
              초기화
            </button>
          ) : null}
        </div>
      </div>

      {/* 파싱 에러 */}
      {parseError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {parseError}
        </div>
      ) : null}

      {/* 가져오기 결과 */}
      {result ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 space-y-1">
          <p className="font-bold text-green-800">✅ 가져오기 완료</p>
          <p className="text-sm text-green-700">새로 추가: <strong>{result.created}개</strong> / 업데이트: <strong>{result.updated}개</strong></p>
          {result.errors.length > 0 ? (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-semibold text-rose-700">오류 ({result.errors.length}건):</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-rose-600">• {e}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 미리보기 테이블 */}
      {preview && preview.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-800">
              미리보기 — 총 {preview.length}행
              {validCount > 0 ? <span className="ml-2 text-green-700">({validCount}개 가져오기 가능)</span> : null}
              {errorCount > 0 ? <span className="ml-1 text-rose-600">({errorCount}개 오류)</span> : null}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50">
                  <th className="border-b border-neutral-200 px-3 py-2 text-left text-neutral-500">행</th>
                  <th className="border-b border-neutral-200 px-3 py-2 text-left text-neutral-500">카테고리</th>
                  <th className="border-b border-neutral-200 px-3 py-2 text-left text-neutral-500">메뉴명</th>
                  <th className="border-b border-neutral-200 px-3 py-2 text-right text-neutral-500">가격</th>
                  <th className="border-b border-neutral-200 px-3 py-2 text-left text-neutral-500">설명</th>
                  <th className="border-b border-neutral-200 px-3 py-2 text-center text-neutral-500">BEST</th>
                  <th className="border-b border-neutral-200 px-3 py-2 text-center text-neutral-500">품절</th>
                  <th className="border-b border-neutral-200 px-3 py-2 text-center text-neutral-500">상태</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row) => (
                  <tr
                    key={row._rowNum}
                    className={row._error ? "bg-rose-50" : "bg-white hover:bg-stone-50"}
                  >
                    <td className="border-b border-neutral-100 px-3 py-2 text-neutral-400">{row._rowNum}</td>
                    <td className="border-b border-neutral-100 px-3 py-2 font-medium text-stone-700">{row.category}</td>
                    <td className="border-b border-neutral-100 px-3 py-2 text-stone-900">{row.name}</td>
                    <td className="border-b border-neutral-100 px-3 py-2 text-right text-stone-700">{row.price.toLocaleString()}원</td>
                    <td className="border-b border-neutral-100 px-3 py-2 max-w-[120px] truncate text-stone-500">{row.description ?? ""}</td>
                    <td className="border-b border-neutral-100 px-3 py-2 text-center">
                      {row.isBest ? <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-700">BEST</span> : null}
                    </td>
                    <td className="border-b border-neutral-100 px-3 py-2 text-center">
                      {row.isSoldOut ? <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">품절</span> : null}
                    </td>
                    <td className="border-b border-neutral-100 px-3 py-2 text-center">
                      {row._error ? (
                        <span className="text-rose-600" title={row._error}>⚠ {row._error}</span>
                      ) : (
                        <span className="text-green-600">✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={isPending || validCount === 0}
            className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "가져오는 중..." : `${validCount}개 메뉴 가져오기`}
          </button>
        </div>
      ) : null}

      {!preview && !result && !parseError && (
        <div className="rounded-xl border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-400">
          파일을 선택하면 미리보기가 표시됩니다
        </div>
      )}
    </div>
  );
}
