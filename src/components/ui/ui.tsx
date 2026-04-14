import { cn } from "./cn";

export function Card({
  title,
  description,
  right,
  children,
  className,
}: {
  title?: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm", className)}>
      {(title || right) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title ? (
              <h2 className="text-base font-semibold tracking-tight text-stone-900">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-neutral-400">{description}</p>
            ) : null}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500", className)}>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition",
        "border-neutral-200 text-stone-900",
        "focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20",
        "placeholder:text-neutral-300",
        "disabled:bg-neutral-50 disabled:text-neutral-400",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-lg border bg-white p-3 text-sm outline-none transition",
        "border-neutral-200 text-stone-900",
        "focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20",
        "placeholder:text-neutral-300",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition",
        "border-neutral-200 text-stone-900",
        "focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20",
        props.className
      )}
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}) {
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

  return <button {...props} className={cn(base, sizes, variants, className)} />;
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "best" | "soldout" | "inactive";
}) {
  const styles = {
    best: "bg-amber-500 text-white",
    soldout: "bg-rose-100 text-rose-600 border border-rose-200",
    inactive: "bg-neutral-100 text-neutral-400 border border-neutral-200",
    neutral: "bg-neutral-100 text-neutral-600 border border-neutral-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
        styles[tone]
      )}
    >
      {children}
    </span>
  );
}

export function Divider() {
  return <div className="my-4 h-px w-full bg-neutral-100" />;
}

export function SectionHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon ? (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-base">
          {icon}
        </span>
      ) : null}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900">{title}</h1>
        {description ? <p className="mt-0.5 text-sm text-neutral-400">{description}</p> : null}
      </div>
    </div>
  );
}
