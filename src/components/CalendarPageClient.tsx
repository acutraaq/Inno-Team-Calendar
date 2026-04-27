"use client";

import React, { useState, useMemo } from "react";
import { SafeEvent, SafeTeamMember, EventType } from "@/types";
import { format, addMonths, subMonths } from "date-fns";
import { CalendarGrid } from "@/components/CalendarGrid";
import { Sidebar } from "@/components/Sidebar";
import { WeeklyPlanBanner } from "@/components/WeeklyPlanBanner";
import { DayDetailSheet } from "@/components/DayDetailSheet";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface CalendarPageClientProps {
  initialEvents: SafeEvent[];
  initialTeamMembers: SafeTeamMember[];
}

export default function CalendarPageClient({
  initialEvents,
  initialTeamMembers,
}: CalendarPageClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<SafeEvent[]>(initialEvents);
  const [teamMembers] = useState<SafeTeamMember[]>(initialTeamMembers);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    initialTeamMembers.map((m) => m.id)
  );
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([
    "HOLIDAY",
    "MEDICAL_LEAVE",
    "WFH",
    "PUBLIC_HOLIDAY",
    "WEEKLY_PLAN",
  ]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const typeMatch = selectedTypes.includes(e.type as EventType);
      const memberMatch = e.type === "PUBLIC_HOLIDAY" || e.type === "WEEKLY_PLAN" ||
        (e.teamMemberId && selectedMembers.includes(e.teamMemberId));
      return typeMatch && memberMatch;
    });
  }, [events, selectedMembers, selectedTypes]);

  const weeklyPlan = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0];
    return filteredEvents.find(
      (e) => e.type === "WEEKLY_PLAN" && e.date === weekStartStr
    );
  }, [filteredEvents]);

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type as EventType)
        ? prev.filter((t) => t !== type)
        : [...prev, type as EventType]
    );
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSheetOpen(true);
  };

  const handleEventChange = () => {
    window.location.reload();
  };

  const dayEvents = selectedDate
    ? filteredEvents.filter((e) => e.date === selectedDate)
    : [];

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar
        teamMembers={teamMembers}
        selectedMembers={selectedMembers}
        onToggleMember={toggleMember}
        eventTypeFilter={selectedTypes}
        onToggleType={toggleType}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-stone-100 rounded-xl">
              <Calendar className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">
                Innovation Team Calendar
              </h1>
              <p className="text-sm text-stone-400">
                Track holidays, WFH, and team plans
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-stone-500" />
            </button>
            <span className="text-sm font-semibold text-stone-700 min-w-[120px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-stone-500" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="ml-2 px-3 py-1.5 text-xs font-medium text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50 transition-colors"
            >
              Today
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {weeklyPlan && (
            <WeeklyPlanBanner
              plan={{
                id: weeklyPlan.id,
                date: weeklyPlan.date,
                title: weeklyPlan.title,
                description: weeklyPlan.description,
              }}
            />
          )}

          <CalendarGrid
            year={year}
            month={month}
            events={filteredEvents}
            onDayClick={handleDayClick}
          />
        </div>
      </div>

      <DayDetailSheet
        date={selectedDate || ""}
        events={dayEvents}
        teamMembers={teamMembers}
        isOpen={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSelectedDate(null);
        }}
        onEventChange={handleEventChange}
      />
    </div>
  );
}
