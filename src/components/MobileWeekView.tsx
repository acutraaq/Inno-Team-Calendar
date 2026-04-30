"use client";

import { useMemo } from "react";
import { addDays, startOfWeek, format, isSameDay } from "date-fns";
import { Flag } from "lucide-react";
import { SafeEvent } from "@/types";
import { cn } from "@/lib/utils";
import { parseLocalDate } from "@/lib/dates";
import {
  EVENT_TYPE_ICONS,
  EVENT_TYPE_PILL_BG,
  EVENT_TYPE_SHORT,
} from "./EventTypeIcon";
import { MobileDateBadge } from "./MobileDateBadge";
import { MobileEventChip } from "./MobileEventChip";

interface MobileWeekViewProps {
  currentDate: Date;
  events: SafeEvent[];
  onDayClick: (dateStr: string) => void;
}

export function MobileWeekView({ currentDate, events, onDayClick }: MobileWeekViewProps) {
  const today = new Date();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekDayStrs = weekDays.map((d) => format(d, "yyyy-MM-dd"));
  const weekStartStr = weekDayStrs[0];
  const weekEndStr = weekDayStrs[6];

  const weekEvents = useMemo(
    () =>
      events.filter((e) => {
        const end = e.endDate || e.date;
        return e.date <= weekEndStr && end >= weekStartStr;
      }),
    [events, weekStartStr, weekEndStr]
  );

  const highlights = useMemo(
    () => weekEvents.filter((e) => e.type === "MEETING" || e.type === "EVENT"),
    [weekEvents]
  );

  function getDayPublicHoliday(dayStr: string) {
    return weekEvents.find(
      (e) =>
        e.type === "PUBLIC_HOLIDAY" &&
        dayStr >= e.date &&
        dayStr <= (e.endDate || e.date)
    );
  }

  function getDayMemberEvents(dayStr: string) {
    return weekEvents.filter(
      (e) =>
        e.type !== "PUBLIC_HOLIDAY" &&
        e.teamMemberId &&
        dayStr >= e.date &&
        dayStr <= (e.endDate || e.date)
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {highlights.length > 0 && (
        <div className="rounded-2xl border border-stone-100 bg-white/70 p-4 shadow-sm">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            Events &amp; Meetings This Week
          </p>
          <div className="flex flex-col gap-1.5">
            {highlights.map((ev) => {
              const PillIcon = EVENT_TYPE_ICONS[ev.type];
              const pillBg = EVENT_TYPE_PILL_BG[ev.type] ?? "bg-stone-100 text-stone-700";
              return (
                <div key={ev.id} className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      pillBg
                    )}
                  >
                    {PillIcon && <PillIcon className="h-3 w-3" strokeWidth={2.5} />}
                    {EVENT_TYPE_SHORT[ev.type] ?? ev.type}
                  </span>
                  <span className="text-sm font-semibold text-stone-700">
                    {format(parseLocalDate(ev.date), "EEE, d MMM")}
                    {ev.endDate && ev.endDate !== ev.date &&
                      ` – ${format(parseLocalDate(ev.endDate), "d MMM")}`}
                  </span>
                  {ev.title && <span className="text-sm text-stone-500">{ev.title}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {weekDays.map((day, i) => {
        const dayStr = weekDayStrs[i];
        const isToday = isSameDay(day, today);
        const dow = day.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const ph = getDayPublicHoliday(dayStr);
        const memberEvents = getDayMemberEvents(dayStr);

        return (
          <button
            key={dayStr}
            type="button"
            onClick={() => onDayClick(dayStr)}
            className={cn(
              "rounded-2xl border p-3.5 text-left shadow-sm transition-colors active:bg-stone-50",
              ph
                ? "border-orange-200 bg-orange-50/70"
                : isToday
                ? "border-stone-300 bg-white"
                : "border-stone-100 bg-white",
              isWeekend && !isToday && !ph && "bg-stone-50/60"
            )}
          >
            <div className="mb-2 flex items-center gap-2.5">
              <MobileDateBadge
                date={day}
                isToday={isToday}
                tone={ph ? "holiday" : "default"}
              />
              {ph && (
                <div className="flex min-w-0 items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5 flex-shrink-0 text-orange-500" strokeWidth={2.5} />
                  <span className="truncate text-sm font-semibold text-orange-700">
                    {ph.title ?? "Public Holiday"}
                  </span>
                </div>
              )}
              {!ph && memberEvents.length === 0 && (
                <span className="text-xs text-stone-400">No team activity</span>
              )}
              {!ph && memberEvents.length > 0 && (
                <span className="ml-auto text-[11px] font-semibold text-stone-400">
                  {memberEvents.length} {memberEvents.length === 1 ? "entry" : "entries"}
                </span>
              )}
            </div>

            {memberEvents.length > 0 && (
              <div className="ml-[60px] flex flex-col gap-1">
                {memberEvents.map((ev) => (
                  <MobileEventChip key={ev.id} event={ev} variant="member" />
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
