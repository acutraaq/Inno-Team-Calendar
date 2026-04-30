import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MobileDateBadgeProps {
  date: Date;
  isToday: boolean;
  tone: "default" | "muted" | "holiday";
  size?: "sm" | "md";
}

export function MobileDateBadge({ date, isToday, tone, size = "md" }: MobileDateBadgeProps) {
  const weekdayClass =
    tone === "holiday"
      ? "text-orange-500"
      : isToday
      ? "text-stone-900"
      : tone === "muted"
      ? "text-stone-400"
      : "text-stone-500";

  const numberClass = isToday
    ? cn(
        "mt-0.5 inline-flex items-center justify-center rounded-full bg-stone-900 text-white",
        size === "md" ? "h-9 w-9 text-lg" : "h-7 w-7 text-base"
      )
    : tone === "holiday"
    ? "text-orange-700"
    : tone === "muted"
    ? "text-stone-400"
    : "text-stone-800";

  return (
    <div className="flex w-12 flex-shrink-0 flex-col items-center pt-0.5">
      <span className={cn("text-[10px] font-bold uppercase tracking-wider", weekdayClass)}>
        {format(date, "EEE")}
      </span>
      <span
        className={cn(
          "font-bold leading-tight",
          size === "md" ? "text-xl" : "text-base font-semibold",
          numberClass
        )}
      >
        {format(date, "d")}
      </span>
    </div>
  );
}
