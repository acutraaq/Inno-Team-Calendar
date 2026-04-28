import React from "react";
import { Flag } from "lucide-react";
import { SafeEvent } from "@/types";
import { EventTypeDot } from "./EventTypeIcon";

interface DayCellProps {
  day: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  publicHoliday: SafeEvent | null;
  events: {
    id: string;
    type: string;
    session: string;
    teamMember: { name: string; color: string } | null;
    title: string | null;
  }[];
  onClick: (dateStr: string) => void;
}

function DayCellInner({
  day,
  dateStr,
  isCurrentMonth,
  isToday,
  isWeekend,
  publicHoliday,
  events,
  onClick,
}: DayCellProps) {
  const nonHolidayEvents = events.filter((e) => e.type !== "PUBLIC_HOLIDAY");
  const MAX_VISIBLE = 3;
  const visibleEvents = nonHolidayEvents.slice(0, MAX_VISIBLE);
  const overflowCount = nonHolidayEvents.length - MAX_VISIBLE;

  let cellBg = isCurrentMonth ? "bg-white" : "bg-stone-50/50";
  if (publicHoliday) cellBg = isCurrentMonth ? "bg-orange-50" : "bg-orange-50/40";
  else if (isWeekend && isCurrentMonth) cellBg = "bg-stone-50/70";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(dateStr)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(dateStr)}
      className={`
        relative min-h-[80px] p-2 cursor-pointer transition-colors duration-150 ease-out
        flex flex-col gap-1 rounded-md
        ${cellBg}
        ${publicHoliday ? "border border-orange-200" : "border border-stone-100"}
        ${isToday ? "ring-2 ring-stone-300 z-10 shadow-sm" : ""}
        ${!isCurrentMonth ? "text-stone-400" : "text-stone-800"}
        hover:bg-stone-50/80 hover:shadow-sm
      `}
    >
      <span
        className={`
          text-xs font-bold
          ${isToday ? "text-stone-900" : ""}
          ${!isCurrentMonth ? "text-stone-400" : publicHoliday ? "text-orange-700" : isToday ? "text-stone-900" : "text-stone-600"}
        `}
      >
        {day}
      </span>

      {publicHoliday && (
        <div className="flex items-start gap-1 mt-0.5">
          <Flag className={`w-3 h-3 flex-shrink-0 mt-px ${isCurrentMonth ? "text-orange-400" : "text-orange-300"}`} strokeWidth={2.5} />
          <span className={`text-xs font-semibold leading-tight line-clamp-2 ${isCurrentMonth ? "text-orange-600" : "text-orange-400"}`}>
            {publicHoliday.title ?? "Public Holiday"}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-[2px] mt-auto">
        {visibleEvents.map((event) => {
          const sessionSuffix =
            event.session !== "FULL_DAY" ? ` (${event.session})` : "";
          const label = event.teamMember
            ? `${event.teamMember.name}${sessionSuffix}`
            : event.title || event.type.replace(/_/g, " ");

          return (
            <div
              key={event.id}
              className="flex items-center gap-1.5 text-xs truncate"
              title={label}
            >
              <EventTypeDot type={event.type} />
              <span className="truncate text-stone-700 font-medium">{label}</span>
            </div>
          );
        })}
        {overflowCount > 0 && (
          <span className="text-[11px] font-medium text-stone-500 pl-1">
            +{overflowCount} more
          </span>
        )}
      </div>
    </div>
  );
}

export const DayCell = React.memo(DayCellInner);
