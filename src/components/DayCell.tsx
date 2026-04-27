import React from "react";

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
  onClick: () => void;
}

export function DayCell({
  day,
  isCurrentMonth,
  isToday,
  isWeekend,
  isPublicHoliday,
  events,
  onClick,
}: DayCellProps) {
  // Sort events: WFH, Medical, Holiday, Weekly Plan, Public Holiday
  const visibleEvents = events.slice(0, 4);

  return (
    <div
      onClick={onClick}
      className={`
        relative min-h-[80px] p-2 border border-stone-100 rounded-md
        cursor-pointer transition-all duration-150 ease-out
        flex flex-col gap-1
        ${!isCurrentMonth ? "bg-stone-50/50 text-stone-300" : "bg-white text-stone-700"}
        ${isWeekend && isCurrentMonth ? "bg-stone-50/70" : ""}
        ${isPublicHoliday ? "bg-stone-200/40 opacity-80" : ""}
        ${isToday ? "ring-2 ring-stone-300 z-10" : ""}
        hover:shadow-sm hover:bg-stone-50/90
      `}
    >
      <span
        className={`
          text-xs font-bold
          ${isToday ? "text-stone-900" : ""}
          ${!isCurrentMonth ? "text-stone-300" : "text-stone-500"}
        `}
      >
        {day}
      </span>
      <div className="flex flex-col gap-[2px] mt-auto">
        {visibleEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-1.5 text-[10px] truncate"
            title={event.title || event.type}
          >
            {(event.teamMember || event.type === "PUBLIC_HOLIDAY") && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    event.type === "PUBLIC_HOLIDAY"
                      ? "#a8a29e"
                      : event.teamMember?.color || "#d6d3d1",
                }}
              />
            )}
            <span className="truncate text-stone-600">
              {event.type === "WEEKLY_PLAN"
                ? "Weekly Plan"
                : event.type === "PUBLIC_HOLIDAY"
                ? event.title || "Holiday"
                : `${event.teamMember?.name || "Event"}${
                    event.session !== "FULL_DAY" ? ` (${event.session})` : ""
                  }`}
            </span>
          </div>
        ))}
        {events.length > 4 && (
          <span className="text-[9px] text-stone-400 pl-1">
            +{events.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
}
