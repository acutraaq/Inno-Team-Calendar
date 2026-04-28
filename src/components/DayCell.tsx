import React from "react";
import { cn, getEventTypeBgClass, getEventBadgeBgClass } from "@/lib/utils";

interface DayCellProps {
  day: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isPublicHoliday: boolean;
  events: {
    id: string;
    type: string;
    session: string;
    teamMember: { name: string; color: string } | null;
    title: string | null;
  }[];
  onClick: (dateStr: string) => void;
}

const HALFDAY_TYPES = new Set(["HALFDAY", "FLEXI_HALFDAY"]);

function DayCellInner({
  day,
  dateStr,
  isCurrentMonth,
  isToday,
  isWeekend,
  isPublicHoliday,
  events,
  onClick,
}: DayCellProps) {
  const visibleEvents = events.slice(0, 4);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(dateStr)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(dateStr)}
      className={`
        relative min-h-[80px] p-2 border border-stone-100 rounded-md
        cursor-pointer transition-all duration-150 ease-out
        flex flex-col gap-1
        ${!isCurrentMonth ? "bg-stone-50/50 text-stone-500" : "bg-white text-stone-800"}
        ${isWeekend && isCurrentMonth ? "bg-stone-50/70" : ""}
        ${isPublicHoliday ? "bg-stone-200/50" : ""}
        ${isToday ? "ring-2 ring-stone-400 bg-stone-50 z-10 shadow-sm" : ""}
        hover:scale-[1.02] hover:shadow-md hover:bg-white
      `}
    >
      <span
        className={`
          text-xs font-bold
          ${isToday ? "text-stone-900" : ""}
          ${!isCurrentMonth ? "text-stone-500" : "text-stone-600"}
        `}
      >
        {day}
      </span>
      <div className="flex flex-col gap-[2px] mt-auto">
        {visibleEvents.map((event) => {
          const isHalfDay = HALFDAY_TYPES.has(event.type);
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
              <span
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  isHalfDay
                    ? getEventBadgeBgClass(event.type, event.session)
                    : getEventTypeBgClass(event.type)
                )}
              />
              <span className="truncate text-stone-700 font-medium">{label}</span>
            </div>
          );
        })}
        {events.length > 4 && (
          <span className="text-[11px] font-medium text-stone-500 pl-1">
            +{events.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
}

export const DayCell = React.memo(DayCellInner);
