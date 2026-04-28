"use client";

import { useMemo } from "react";
import { addDays, startOfWeek, format, isSameDay } from "date-fns";
import { SafeEvent, SafeTeamMember } from "@/types";
import { cn } from "@/lib/utils";
import { EVENT_TYPE_ICONS, EVENT_TYPE_ICON_COLORS, EVENT_TYPE_PILL_BG } from "./EventTypeIcon";

const TYPE_SHORT: Record<string, string> = {
  ANNUAL_LEAVE:  "AL",
  HALFDAY:       "½ Day",
  FLEXI_HALFDAY: "Flexi HD",
  MEDICAL_LEAVE: "MC",
  WFH:           "WFH",
  TRAINING:      "Training",
  MEETING:       "Meeting",
  EVENT:         "Event",
  PUBLIC_HOLIDAY:"Public Holiday",
};

interface WeekViewProps {
  currentDate: Date;
  events: SafeEvent[];
  teamMembers: SafeTeamMember[];
  onDayClick: (dateStr: string) => void;
}

export function WeekView({ currentDate, events, teamMembers, onDayClick }: WeekViewProps) {
  const today = new Date();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekDayStrs = weekDays.map((d) => format(d, "yyyy-MM-dd"));
  const weekStartStr = weekDayStrs[0];
  const weekEndStr = weekDayStrs[6];

  const weekEvents = useMemo(() => {
    return events.filter((e) => {
      const end = e.endDate || e.date;
      return e.date <= weekEndStr && end >= weekStartStr;
    });
  }, [events, weekStartStr, weekEndStr]);

  const highlights = useMemo(
    () => weekEvents.filter((e) => e.type === "MEETING" || e.type === "EVENT"),
    [weekEvents]
  );

  const publicHolidays = useMemo(
    () => weekEvents.filter((e) => e.type === "PUBLIC_HOLIDAY"),
    [weekEvents]
  );

  function getMemberDayEvents(memberId: string, dayStr: string) {
    return weekEvents.filter(
      (e) =>
        e.teamMemberId === memberId &&
        dayStr >= e.date &&
        dayStr <= (e.endDate || e.date)
    );
  }

  function getDayPublicHoliday(dayStr: string) {
    return publicHolidays.find(
      (e) => dayStr >= e.date && dayStr <= (e.endDate || e.date)
    );
  }

  // Safe local date parse (avoids UTC shift)
  function parseLocalDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Highlighted events & meetings */}
      {highlights.length > 0 && (
        <div className="bg-white/70 border border-stone-100 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Events &amp; Meetings This Week
          </p>
          <div className="flex flex-col gap-2">
            {highlights.map((ev) => {
              const PillIcon = EVENT_TYPE_ICONS[ev.type];
              return (
              <div key={ev.id} className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
                    EVENT_TYPE_PILL_BG[ev.type] ?? "bg-stone-100 text-stone-700"
                  )}
                >
                  {PillIcon && <PillIcon className="w-3 h-3" strokeWidth={2.5} />}
                  {TYPE_SHORT[ev.type] ?? ev.type}
                </span>
                <span className="text-sm font-semibold text-stone-700">
                  {format(parseLocalDate(ev.date), "EEE, d MMM")}
                  {ev.endDate && ev.endDate !== ev.date &&
                    ` – ${format(parseLocalDate(ev.endDate), "d MMM")}`}
                </span>
                {ev.title && (
                  <span className="text-sm text-stone-500">{ev.title}</span>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team schedule grid */}
      <div className="bg-white/70 border border-stone-100 rounded-xl overflow-auto shadow-sm">
        <table className="w-full border-collapse" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              <th className="px-4 py-3 text-left border-b border-r border-stone-100 bg-stone-50/60 w-36">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Member</span>
              </th>
              {weekDays.map((day, i) => {
                const dayStr = weekDayStrs[i];
                const isToday = isSameDay(day, today);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const ph = getDayPublicHoliday(dayStr);
                return (
                  <th
                    key={dayStr}
                    className={cn(
                      "px-3 py-3 text-center border-b border-r border-stone-100 font-normal",
                      isWeekend ? "bg-stone-50/80" : "bg-stone-50/30",
                      isToday && "bg-stone-100",
                      ph && "bg-orange-50 border-b-orange-200"
                    )}
                  >
                    <p className={cn("text-[10px] font-semibold uppercase", ph ? "text-orange-500" : "text-stone-400")}>
                      {format(day, "EEE")}
                    </p>
                    <p className={cn("text-sm font-bold mt-0.5", isToday ? "text-stone-900" : ph ? "text-orange-700" : "text-stone-600")}>
                      {format(day, "d")}
                    </p>
                    {ph && (
                      <p className="text-[10px] font-semibold text-orange-600 mt-0.5 truncate max-w-[80px] mx-auto" title={ph.title ?? "Public Holiday"}>
                        {ph.title ?? "PH"}
                      </p>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member, idx) => (
              <tr key={member.id} className={idx < teamMembers.length - 1 ? "border-b border-stone-100" : ""}>
                <td className="px-4 py-3 border-r border-stone-100 bg-stone-50/20">
                  <span className="text-sm font-medium text-stone-700">{member.name}</span>
                </td>
                {weekDays.map((day, i) => {
                  const dayStr = weekDayStrs[i];
                  const dayEvents = getMemberDayEvents(member.id, dayStr);
                  const isToday = isSameDay(day, today);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const ph = getDayPublicHoliday(dayStr);
                  return (
                    <td
                      key={dayStr}
                      onClick={() => onDayClick(dayStr)}
                      className={cn(
                        "px-2 py-2 border-r border-stone-100 min-w-[80px] h-14 cursor-pointer align-top transition-colors",
                        isWeekend ? "bg-stone-50/40" : "",
                        isToday ? "bg-stone-50" : "",
                        ph ? "bg-orange-50/40" : "",
                        "hover:bg-stone-50/80"
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        {dayEvents.map((ev) => {
                          const Icon = EVENT_TYPE_ICONS[ev.type];
                          const iconColor = EVENT_TYPE_ICON_COLORS[ev.type] ?? "text-stone-500";
                          return (
                            <span
                              key={ev.id}
                              className={cn(
                                "text-[10px] font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 leading-snug",
                                EVENT_TYPE_PILL_BG[ev.type] ?? "bg-stone-100 text-stone-700"
                              )}
                            >
                              {Icon && <Icon className={cn("w-2.5 h-2.5 flex-shrink-0", iconColor)} strokeWidth={2.5} />}
                              {TYPE_SHORT[ev.type] ?? ev.type}
                              {ev.session !== "FULL_DAY" && (
                                <span className="opacity-80">{ev.session}</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
