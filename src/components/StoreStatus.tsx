"use client";

import { useEffect, useState } from "react";

type Props = {
  open: string;       // "11:00"
  close: string;      // "21:00"
  breakStart?: string | null;
  breakEnd?: string | null;
  lastOrder?: string | null;
  closedDays?: string | null;
};

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getNowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getStatus(now: number, props: Props): "open" | "break" | "lastorder" | "closed" {
  const openMin = toMinutes(props.open);
  const closeMin = toMinutes(props.close);
  const loMin = props.lastOrder ? toMinutes(props.lastOrder) : null;
  const bsMin = props.breakStart ? toMinutes(props.breakStart) : null;
  const beMin = props.breakEnd ? toMinutes(props.breakEnd) : null;

  if (now < openMin || now >= closeMin) return "closed";
  if (bsMin !== null && beMin !== null && now >= bsMin && now < beMin) return "break";
  if (loMin !== null && now >= loMin) return "lastorder";
  return "open";
}

export function StoreStatus(props: Props) {
  const [status, setStatus] = useState<"open" | "break" | "lastorder" | "closed" | null>(null);

  useEffect(() => {
    const update = () => setStatus(getStatus(getNowMinutes(), props));
    update();
    const timer = setInterval(update, 30_000); // 30초마다 갱신
    return () => clearInterval(timer);
  }, [props.open, props.close, props.breakStart, props.breakEnd, props.lastOrder]);

  if (status === null) return null;

  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
        영업 중
      </span>
    );
  }

  if (status === "lastorder") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
        라스트오더
      </span>
    );
  }

  if (status === "break") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-700/50 px-3 py-1 text-xs font-semibold text-stone-400">
        <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
        브레이크타임
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-700/50 px-3 py-1 text-xs font-semibold text-stone-400">
      <span className="h-1.5 w-1.5 rounded-full bg-stone-500" />
      마감
    </span>
  );
}
