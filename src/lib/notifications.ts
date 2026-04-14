/**
 * 빈자리 알림 발송 로직
 * Resend(이메일) — RESEND_API_KEY 없으면 콘솔 로그만 출력
 */
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.NOTIFY_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export interface NotifyPayload {
  waitingId: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string;
  desiredDate: Date;
  desiredTimeFrom: string;
  desiredTimeTo: string;
  claimToken: string;
}

/** 대기자에게 빈자리 알림을 발송합니다. */
export async function sendVacancyNotification(payload: NotifyPayload) {
  const {
    guestName,
    guestEmail,
    guestPhone,
    desiredDate,
    desiredTimeFrom,
    desiredTimeTo,
    claimToken,
  } = payload;

  const claimUrl = `${APP_URL}/reservation/claim?token=${claimToken}`;
  const dateStr = desiredDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `[그래도 스시] ${dateStr} ${desiredTimeFrom}~${desiredTimeTo} 빈자리 알림`;
  const html = buildEmailHtml({ guestName, dateStr, desiredTimeFrom, desiredTimeTo, claimUrl });

  if (!resend || !guestEmail) {
    console.log("📧 [DEV] 빈자리 알림 (이메일 미전송)");
    console.log(`  수신: ${guestEmail ?? guestPhone}`);
    console.log(`  선점 링크: ${claimUrl}`);
    return { success: true, dev: true };
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: guestEmail,
    subject,
    html,
  });

  if (error) {
    console.error("Resend 발송 실패:", error);
    return { success: false, error };
  }

  return { success: true };
}

function buildEmailHtml({
  guestName,
  dateStr,
  desiredTimeFrom,
  desiredTimeTo,
  claimUrl,
}: {
  guestName: string;
  dateStr: string;
  desiredTimeFrom: string;
  desiredTimeTo: string;
  claimUrl: string;
}) {
  return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f9f9f9;padding:24px;">
  <div style="max-width:480px;margin:auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <h2 style="color:#1a1a1a;margin-bottom:8px;">그래도 스시</h2>
    <p style="color:#555;margin-bottom:24px;">빈자리 알림</p>
    <p style="font-size:16px;color:#1a1a1a;">${guestName}님, 기다리시던 자리가 생겼습니다!</p>
    <div style="background:#fef9f0;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;color:#92400e;font-weight:600;">
        ${dateStr} ${desiredTimeFrom} ~ ${desiredTimeTo}
      </p>
    </div>
    <p style="color:#555;font-size:14px;">아래 버튼을 눌러 지금 바로 예약을 선점하세요.<br>
    <strong>링크는 5분 후 만료됩니다.</strong></p>
    <a href="${claimUrl}"
       style="display:inline-block;margin-top:16px;padding:14px 28px;background:#1a1a1a;color:#fff;
              text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">
      지금 예약하기
    </a>
    <p style="margin-top:32px;font-size:12px;color:#aaa;">
      본 메일은 그래도 스시 빈자리 알림 신청자에게 자동 발송됩니다.
    </p>
  </div>
</body>
</html>`;
}
