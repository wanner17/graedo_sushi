import { prisma } from "@/lib/prisma";
import { upsertStoreSettings } from "./actions";
import { Card, Input, Textarea, Label, Divider, SectionHeader } from "@/components/ui/ui";
import { FormAction } from "@/components/ui/FormAction";
import { SubmitButton } from "@/components/ui/SubmitButton";

const STORE_ID = "main";

export default async function AdminStorePage() {
  const [s, stats] = await Promise.all([
    prisma.storeSettings
      .findUnique({ where: { id: STORE_ID } })
      .then(
        (row) =>
          row ??
          prisma.storeSettings.create({
            data: {
              id: STORE_ID,
              name: "그래도스시",
              phone: "",
              address: "",
              open: "11:00",
              close: "21:00",
              noticeEnabled: true,
            },
          })
      ),
    // 대시보드 통계
    Promise.all([
      prisma.category.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.menuItem.count({ where: { isActive: true } }),
      prisma.menuItem.count({ where: { isActive: true, isSoldOut: true } }),
      prisma.menuItem.count({ where: { isActive: true, isBest: true } }),
    ]),
  ]);

  const [totalCat, activeCat, totalItems, soldOutItems, bestItems] = stats;

  return (
    <div className="space-y-8">
      <SectionHeader
        icon="🏪"
        title="가게 정보"
        description="손님 화면에 표시될 정보를 관리합니다."
      />

      {/* ── 대시보드 통계 ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="카테고리" value={`${activeCat} / ${totalCat}`} icon="📂" />
        <StatCard label="활성 메뉴" value={`${totalItems}개`} icon="🍱" />
        <StatCard
          label="품절"
          value={`${soldOutItems}개`}
          icon="🚫"
          highlight={soldOutItems > 0}
        />
        <StatCard label="BEST" value={`${bestItems}개`} icon="⭐" />
      </div>

      <FormAction action={upsertStoreSettings} successMsg="가게 정보가 저장되었습니다." className="space-y-5">
        {/* ── 기본 정보 ── */}
        <Card title="기본 정보" description="가게명 · 연락처 · 주소">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>가게명</Label>
              <Input name="name" defaultValue={s.name} required placeholder="예: 그래도스시" />
            </div>

            <div>
              <Label>한 줄 소개</Label>
              <Input
                name="tagline"
                defaultValue={s.tagline ?? ""}
                placeholder="예: 매일 신선한 초밥"
              />
            </div>

            <div>
              <Label>전화번호</Label>
              <Input
                name="phone"
                defaultValue={s.phone}
                required
                placeholder="예: 02-123-4567"
              />
            </div>

            <div>
              <Label>주차 안내</Label>
              <Input
                name="parking"
                defaultValue={s.parking ?? ""}
                placeholder="예: 1시간 무료"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>주소</Label>
              <Input
                name="address"
                defaultValue={s.address}
                required
                placeholder="예: 서울시 강남구 ..."
              />
            </div>
          </div>
        </Card>

        {/* ── 영업 시간 ── */}
        <Card title="영업 시간" description="영업 시간 · 브레이크 · 휴무일">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label>오픈</Label>
              <Input name="open" defaultValue={s.open} required placeholder="11:00" />
            </div>

            <div>
              <Label>마감</Label>
              <Input name="close" defaultValue={s.close} required placeholder="21:00" />
            </div>

            <div>
              <Label>브레이크 시작</Label>
              <Input
                name="breakStart"
                defaultValue={s.breakStart ?? ""}
                placeholder="15:00"
              />
            </div>

            <div>
              <Label>브레이크 종료</Label>
              <Input
                name="breakEnd"
                defaultValue={s.breakEnd ?? ""}
                placeholder="17:00"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>라스트오더</Label>
              <Input
                name="lastOrder"
                defaultValue={s.lastOrder ?? ""}
                placeholder="예: 20:30"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>휴무일</Label>
              <Input
                name="closedDays"
                defaultValue={s.closedDays ?? ""}
                placeholder="예: 매주 월요일"
              />
            </div>
          </div>
        </Card>

        {/* ── 링크 ── */}
        <Card title="외부 링크" description="손님 페이지 버튼으로 연결됩니다.">
          <div className="space-y-3">
            <div>
              <Label>지도 URL</Label>
              <Input
                name="mapUrl"
                defaultValue={s.mapUrl ?? ""}
                placeholder="카카오맵 / 구글맵 링크"
              />
            </div>
            <div>
              <Label>네이버 플레이스</Label>
              <Input
                name="naverPlace"
                defaultValue={s.naverPlace ?? ""}
                placeholder="https://map.naver.com/..."
              />
            </div>
            <div>
              <Label>인스타그램</Label>
              <Input
                name="instagram"
                defaultValue={s.instagram ?? ""}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <Label>카카오 문의 URL</Label>
              <Input
                name="kakaoOrderUrl"
                defaultValue={s.kakaoOrderUrl ?? ""}
                placeholder="https://pf.kakao.com/..."
              />
            </div>
          </div>
        </Card>

        {/* ── 공지 ── */}
        <Card
          title="공지"
          description="공지 ON이면 손님 화면 상단에 고정 표시됩니다."
          right={
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100">
              <input
                type="checkbox"
                name="noticeEnabled"
                defaultChecked={s.noticeEnabled}
                className="h-3.5 w-3.5 rounded accent-amber-500"
              />
              공지 활성
            </label>
          }
        >
          <div>
            <Label>공지 내용</Label>
            <Textarea
              name="noticeText"
              defaultValue={s.noticeText ?? ""}
              placeholder="예: 오늘은 재료 소진으로 조기 마감합니다."
            />
          </div>

          <Divider />

          <div className="flex justify-end">
            <SubmitButton variant="primary">
              💾 저장하기
            </SubmitButton>
          </div>
        </Card>
      </FormAction>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-4 transition",
        highlight
          ? "border-rose-200 bg-rose-50"
          : "border-neutral-200 bg-white",
      ].join(" ")}
    >
      <div className="mb-2 text-xl">{icon}</div>
      <div
        className={[
          "text-xl font-bold",
          highlight ? "text-rose-600" : "text-stone-900",
        ].join(" ")}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-neutral-400">{label}</div>
    </div>
  );
}
