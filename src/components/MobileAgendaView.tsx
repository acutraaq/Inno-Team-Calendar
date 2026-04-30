"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Flag, Plus } from "lucide-react";
import { SafeEvent } from "@/types";
import { cn } from "@/lib/utils";
import { buildEventsByDate, parseLocalDate } from "@/lib/dates";
import { MobileDateBadge } from "./MobileDateBadge";
import { MobileEventChip } from "./MobileEventChip";

interface MobileAgendaViewProps {
  year: number;
  month: number; // 0-11
  events: SafeEvent[];
  onDayClick: (dateStr: string) => void;
}

export function MobileAgendaView({ year, month, events, onDayClick }: MobileAgendaViewProps) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventsByDate = useMemo(() => buildEventsByDate(events), [events]);

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = eventsByDate.get(dateStr) ?? [];
    const publicHoliday = dayEvents.find((e) => e.type === "PUBLIC_HOLIDAY") ?? null;
    const nonHoliday = dayEvents.filter((e) => e.type !== "PUBLIC_HOLIDAY");
    return { dateStr, dayEvents, publicHoliday, nonHoliday };
  });

  const monthHasAnyEvents = days.some((d) => d.dayEvents.length > 0);

  return (
    <div className="flex flex-col gap-2.5">
      {!monthHasAnyEvents && (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white/50 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-stone-700">No events this month</p>
          <p className="mt-1 text-xs text-stone-500">Tap any date below to add one.</p>
        </div>
      )}

      {days.map(({ dateStr, publicHoliday, nonHoliday }) => {
        const date = parseLocalDate(dateStr);
        const isToday = dateStr === todayStr;
        const dow = date.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const isEmpty = nonHoliday.length === 0 && !publicHoliday;

        if (isEmpty) {
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDayClick(dateStr)}
              className={cn(
                "group flex items-center gap-3 rounded-xl border border-stone-100 bg-white/40 px-3 py-2 text-left transition-colors hover:bg-white/70 active:bg-stone-50",
                isWeekend && "bg-stone-50/40"
              )}
            >
              <MobileDateBadge date={date} isToday={isToday} tone="muted" size="sm" />
              <span className="flex-1 text-xs text-stone-400">No events</span>
              <Plus
                className="h-4 w-4 text-stone-300 opacity-0 transition-opacity group-hover:opacity-100"
                strokeWidth={2.5}
              />
            </button>
          );
        }

        return (
          <button
            key={dateStr}
            type="button"
            onClick={() => onDayClick(dateStr)}
            className={cn(
              "flex items-stretch gap-3 rounded-2xl border p-3 text-left shadow-sm transition-colors active:bg-stone-50",
              publicHoliday
                ? "border-orange-200 bg-orange-50/70"
                : isToday
                ? "border-stone-300 bg-white"
                : "border-stone-100 bg-white"
            )}
          >
            <MobileDateBadge
              date={date}
              isToday={isToday}
              tone={publicHoliday ? "holiday" : "default"}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              {publicHoliday && (
                <div className="flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5 flex-shrink-0 text-orange-500" strokeWidth={2.5} />
                  <span className="truncate text-sm font-semibold text-orange-700">
                    {publicHoliday.title ?? "Public Holiday"}
                  </span>
                </div>
              )}
              {nonHoliday.map((event) => (
                <MobileEventChip
                  key={event.id}
                  event={event}
                  variant={event.teamMember ? "member" : "type"}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
