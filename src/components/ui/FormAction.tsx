"use client";

import { createContext, useContext, useTransition } from "react";

/** null = FormAction 컨텍스트 외부 */
type PendingCtx = boolean | null;
const FormPendingContext = createContext<PendingCtx>(null);

export function useFormPendingCtx() {
  return useContext(FormPendingContext);
}

interface FormActionProps {
  action: (fd: FormData) => Promise<unknown>;
  /** 성공 시 alert 메시지. 생략하면 알림 없음 */
  successMsg?: string;
  /** 제출 전 confirm 메시지. 생략하면 바로 실행 */
  confirmMsg?: string;
  className?: string;
  encType?: string;
  children: React.ReactNode;
}

/**
 * Server Action 폼 래퍼.
 * - 제출 중 isPending → SubmitButton 스피너 표시
 * - 성공 → successMsg alert
 * - 오류 → 오류 메시지 alert
 */
export function FormAction({
  action,
  successMsg,
  confirmMsg,
  className,
  encType,
  children,
}: FormActionProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await action(fd);
        if (successMsg) alert(successMsg);
      } catch (err) {
        alert(
          "오류: " +
            (err instanceof Error ? err.message : "처리 중 오류가 발생했습니다.")
        );
      }
    });
  }

  return (
    <FormPendingContext.Provider value={isPending}>
      <form onSubmit={handleSubmit} className={className} encType={encType}>
        {children}
      </form>
    </FormPendingContext.Provider>
  );
}
