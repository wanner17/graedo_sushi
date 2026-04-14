"use client";

import { useFormStatus } from "react-dom";
import { useFormPendingCtx } from "./FormAction";
import { cn } from "./cn";

interface SubmitButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

/**
 * 제출 버튼.
 * - FormAction 컨텍스트 내부: 컨텍스트의 isPending 사용
 * - 일반 <form action={serverAction}> 내부: useFormStatus 사용
 */
export function SubmitButton({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  const ctxPending = useFormPendingCtx();
  const { pending: statusPending } = useFormStatus();
  const isPending = ctxPending !== null ? ctxPending : statusPending;

  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all outline-none " +
    "disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-400";

  const sizes = size === "sm" ? "h-8 px-3 text-xs gap-1.5" : "h-10 px-4 text-sm gap-2";

  const variants =
    variant === "primary"
      ? "bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 active:bg-amber-600 shadow-sm"
      : variant === "secondary"
      ? "border border-neutral-200 bg-white text-stone-700 hover:bg-neutral-50 hover:border-neutral-300"
      : variant === "danger"
      ? "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300"
      : "text-neutral-600 hover:bg-neutral-100 hover:text-stone-900";

  return (
    <button
      type="submit"
      disabled={isPending || disabled}
      {...props}
      className={cn(base, sizes, variants, className)}
    >
      {isPending ? (
        <>
          <svg
            className="animate-spin h-3.5 w-3.5 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          처리 중…
        </>
      ) : (
        children
      )}
    </button>
  );
}
