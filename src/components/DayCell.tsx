import React, { useState } from "react";
import { Flag } from "lucide-react";
import { SafeEvent } from "@/types";
import { EventTypeDot, EVENT_TYPE_PILL_BG } from "./EventTypeIcon";
import { cn } from "@/lib/utils";

const MAX_VISIBLE = 3;

interface DayCellProps {
  day: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  publicHoliday: SafeEvent | null;
  events: {
    id: string;
    date: string;
    endDate: string | null;
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
  const [expanded, setExpanded] = useState(false);

  const nonHolidayEvents = events.filter((e) => e.type !== "PUBLIC_HOLIDAY");
  const overflowCount = nonHolidayEvents.length - MAX_VISIBLE;
  const visibleEvents = expanded ? nonHolidayEvents : nonHolidayEvents.slice(0, MAX_VISIBLE);

  let cellBg = isCurrentMonth ? "bg-white" : "bg-stone-50/50";
  if (publicHoliday) cellBg = isCurrentMonth ? "bg-orange-50" : "bg-orange-50/40";
  else if (isWeekend && isCurrentMonth) cellBg = "bg-stone-50/70";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(dateStr)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(dateStr)}
      className={cn(
        "relative min-h-[64px] md:min-h-[80px] p-1.5 md:p-2 cursor-pointer transition-colors duration-150 ease-out",
        "flex flex-col gap-0.5 md:gap-1 rounded-md group",
        cellBg,
        publicHoliday ? "border border-orange-200" : "border border-stone-100",
        "hover:bg-stone-50/80 hover:shadow-sm",
        !isCurrentMonth ? "text-stone-400" : "text-stone-800"
      )}
    >
      {/* Day number — filled dark circle for today */}
      <span
        className={cn(
          "text-xs font-bold leading-none",
          isToday
            ? "w-5 h-5 inline-flex items-center justify-center bg-stone-900 text-white rounded-full"
            : !isCurrentMonth
            ? "text-stone-400"
            : publicHoliday
            ? "text-orange-700"
            : "text-stone-600"
        )}
      >
        {day}
      </span>

      {publicHoliday && (
        <div className="flex items-start gap-1 mt-0.5">
          <Flag
            className={cn("w-3 h-3 flex-shrink-0 mt-px", isCurrentMonth ? "text-orange-400" : "text-orange-300")}
            strokeWidth={2.5}
          />
          <span className={cn("text-xs font-semibold leading-tight line-clamp-2", isCurrentMonth ? "text-orange-600" : "text-orange-400")}>
            {publicHoliday.title ?? "Public Holiday"}
          </span>
        </div>
      )}

      {/* Event pills — colored chips, multi-day aware */}
      <div className="flex flex-col gap-[2px] mt-auto">
        {visibleEvents.map((event) => {
          const isMultiDay = !!(event.endDate && event.endDate !== event.date);
          const isStart = dateStr === event.date;
          const isEnd = dateStr === (event.endDate ?? event.date);
          const sessionSuffix = event.session !== "FULL_DAY" ? ` ${event.session}` : "";
          const label = event.teamMember
            ? `${event.teamMember.name}${sessionSuffix}`
            : event.title || event.type.replace(/_/g, " ");
          const pillBg = EVENT_TYPE_PILL_BG[event.type] ?? "bg-stone-100 text-stone-700";

          return (
            <div
              key={event.id}
              title={label}
              className={cn(
                "flex items-center gap-1 text-[10px] font-semibold py-[2px] px-1.5 w-full truncate",
                pillBg,
                isStart && isEnd && "rounded",
                isStart && !isEnd && "rounded-l rounded-r-none",
                !isStart && isEnd && "rounded-l-none rounded-r",
                !isStart && !isEnd && "rounded-none opacity-70"
              )}
            >
              <>
                <EventTypeDot type={event.type} className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </>
            </div>
          );
        })}

        {/* Expand / collapse toggle */}
        {overflowCount > 0 && !expanded && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            className="text-[11px] font-medium text-stone-400 hover:text-stone-600 text-left pl-1 transition-colors"
          >
            +{overflowCount} more
          </button>
        )}
        {expanded && nonHolidayEvents.length > MAX_VISIBLE && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            className="text-[11px] font-medium text-stone-400 hover:text-stone-600 text-left pl-1 transition-colors"
          >
            show less
          </button>
        )}
      </div>

      {/* Empty-day hint on hover */}
      {nonHolidayEvents.length === 0 && isCurrentMonth && (
        <span className="absolute bottom-2 right-2 text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
          + add
        </span>
      )}
    </div>
  );
}

export const DayCell = React.memo(DayCellInner);
