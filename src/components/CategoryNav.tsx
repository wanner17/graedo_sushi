"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "./ui/cn";

type Category = { id: string; name: string };

export function CategoryNav({ categories }: { categories: Category[] }) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? "");
  const navRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((prev, curr) =>
            prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
          );
          setActiveId(top.target.id);
        }
      },
      { rootMargin: "-10% 0px -65% 0px", threshold: 0 }
    );

    for (const cat of categories) {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    const nav = navRef.current;
    const btn = activeButtonRef.current;
    if (!nav || !btn) return;

    const navLeft = nav.scrollLeft;
    const navWidth = nav.offsetWidth;
    const btnLeft = btn.offsetLeft;
    const btnWidth = btn.offsetWidth;

    if (btnLeft < navLeft + 16 || btnLeft + btnWidth > navLeft + navWidth - 16) {
      nav.scrollTo({
        left: btnLeft - navWidth / 2 + btnWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeId]);

  function scrollToCategory(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActiveId(id);
  }

  if (categories.length === 0) return null;

  return (
    <div className="sticky top-0 z-20 border-b border-[#e8ddd3] bg-white/97 shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4">
        <div
          ref={navRef}
          className="flex gap-1 overflow-x-auto py-2.5 scrollbar-hide"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              ref={activeId === cat.id ? activeButtonRef : null}
              onClick={() => scrollToCategory(cat.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                activeId === cat.id
                  ? "bg-sushi-red text-white shadow-sm"
                  : "text-stone-500 hover:bg-sushi-cream hover:text-stone-800"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
