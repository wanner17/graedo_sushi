"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./ui/cn";

const navItems = [
  { href: "/admin/store", label: "가게 정보", icon: "🏪" },
  { href: "/admin/menu", label: "메뉴 관리", icon: "📋" },
  { href: "/admin/preview/menu", label: "손님 화면", icon: "👁️" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-stone-900 text-white"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-stone-900"
            )}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
