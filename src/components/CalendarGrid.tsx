"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { SafeEvent } from "@/types";
import { DayCell } from "./DayCell";
import { format } from "date-fns";
import { buildEventsByDate } from "@/lib/dates";

interface CalendarGridProps {
  year: number;
  month: number; // 0-11
  events: SafeEvent[];
  onDayClick: (dateStr: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({ year, month, events, onDayClick }: CalendarGridProps) {
  // Get the first day of the month, and how many days in the month  
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Previous month trailing days
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from(
    { length: startDayOfWeek },
    (_, i) => daysInPrevMonth - startDayOfWeek + i + 1
  );

  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Total cells = 42 (6 weeks x 7 days) for consistent grid
  const totalCells = 42;
  const filledCells = startDayOfWeek + daysInMonth;
  const nextMonthDays = Array.from(
    { length: totalCells - filledCells },
    (_, i) => i + 1
  );

  // useState + useEffect prevents SSR/client mismatch for UTC+ timezones
  const [todayStr, setTodayStr] = useState("");
  useEffect(() => {
    setTodayStr(format(new Date(), "yyyy-MM-dd"));
  }, []);

  const eventsByDate = useMemo(() => buildEventsByDate(events), [events]);

  const handleDayClick = useCallback(
    (dateStr: string) => onDayClick(dateStr),
    [onDayClick]
  );

  const renderCell = (day: number, isCurrentMonth: boolean, monthOffset: number) => {
    const actualMonth = month + monthOffset;
    const actualYear = year + (actualMonth < 0 ? -1 : actualMonth > 11 ? 1 : 0);
    const actualMonthIndex = ((actualMonth % 12) + 12) % 12;

    const dateStr = `${actualYear}-${String(actualMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isToday = dateStr === todayStr;
    // Parse locally to avoid UTC-offset weekday mismatch for UTC+ timezones
    const [dy, dm, dd] = dateStr.split("-").map(Number);
    const dayOfWeek = new Date(dy, dm - 1, dd).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayEvents = eventsByDate.get(dateStr) ?? [];
    const publicHoliday = dayEvents.find((e) => e.type === "PUBLIC_HOLIDAY") ?? null;

    return (
      <DayCell
        key={`${actualYear}-${actualMonthIndex}-${day}`}
        day={day}
        dateStr={dateStr}
        isCurrentMonth={isCurrentMonth}
        isToday={isToday}
        isWeekend={isWeekend}
        publicHoliday={publicHoliday}
        events={dayEvents}
        onClick={handleDayClick}
      />
    );
  };

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] md:text-xs font-semibold text-stone-500 py-1 uppercase tracking-wider"
          >
            <span className="hidden md:inline">{d}</span>
            <span className="md:hidden">{d.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1.5">
        {prevMonthDays.map((day) => renderCell(day, false, -1))}
        {currentMonthDays.map((day) => renderCell(day, true, 0))}
        {nextMonthDays.map((day) => renderCell(day, false, 1))}
      </div>
    </div>
  );
}
