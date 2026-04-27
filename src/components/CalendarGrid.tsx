"use client";

import React from "react";
import { SafeEvent } from "@/types";
import { DayCell } from "./DayCell";

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

  const todayStr = new Date().toISOString().split("T")[0];

  const getEventsForDay = (dateStr: string) =>
    events.filter((e) => e.date === dateStr);

  const renderCell = (day: number, isCurrentMonth: boolean, monthOffset: number) => {
    const actualMonth = month + monthOffset;
    const actualYear = year + (actualMonth < 0 ? -1 : actualMonth > 11 ? 1 : 0);
    const actualMonthIndex = ((actualMonth % 12) + 12) % 12;

    const dateStr = `${actualYear}-${String(actualMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isToday = dateStr === todayStr;
    const dayOfWeek = new Date(dateStr).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayEvents = getEventsForDay(dateStr);
    const isPublicHoliday = dayEvents.some((e) => e.type === "PUBLIC_HOLIDAY");

    return (
      <DayCell
        key={`${actualYear}-${actualMonthIndex}-${day}`}
        day={day}
        dateStr={dateStr}
        isCurrentMonth={isCurrentMonth}
        isToday={isToday}
        isWeekend={isWeekend}
        isPublicHoliday={isPublicHoliday}
        events={dayEvents}
        onClick={() => onDayClick(dateStr)}
      />
    );
  };

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-stone-400 py-1 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {prevMonthDays.map((day) => renderCell(day, false, -1))}
        {currentMonthDays.map((day) => renderCell(day, true, 0))}
        {nextMonthDays.map((day) => renderCell(day, false, 1))}
      </div>
    </div>
  );
}
