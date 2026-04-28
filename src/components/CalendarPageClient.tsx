"use client";

import { useState, useMemo, useTransition, useCallback } from "react";
import { SafeEvent, SafeTeamMember, EventType } from "@/types";
import { format, addMonths, subMonths, startOfWeek } from "date-fns";
import { CalendarGrid } from "@/components/CalendarGrid";
import { Sidebar } from "@/components/Sidebar";
import { WeeklyPlanBanner } from "@/components/WeeklyPlanBanner";
import { DayDetailSheet } from "@/components/DayDetailSheet";
import { getEventsForMonth } from "@/lib/actions";
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
  const [isPending, startTransition] = useTransition();
  const teamMembers: SafeTeamMember[] = initialTeamMembers;
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    initialTeamMembers.map((m) => m.id)
  );
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([
    "HOLIDAY",
    "MEDICAL_LEAVE",
    "WFH",
    "PUBLIC_HOLIDAY",
    "WEEKLY_PLAN",
    "MEETING",
  ]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchEvents = useCallback((date: Date) => {
    startTransition(async () => {
      const fresh = await getEventsForMonth(date.getFullYear(), date.getMonth());
      setEvents(fresh as SafeEvent[]);
    });
  }, []);

  const navigateMonth = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
    fetchEvents(newDate);
  }, [fetchEvents]);

  const handleEventChange = useCallback(() => {
    fetchEvents(currentDate);
  }, [fetchEvents, currentDate]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const typeMatch = selectedTypes.includes(e.type as EventType);
      const memberMatch =
        !e.teamMemberId || selectedMembers.includes(e.teamMemberId);
      return typeMatch && memberMatch;
    });
  }, [events, selectedMembers, selectedTypes]);

  const weeklyPlan = useMemo(() => {
    const weekStartStr = format(startOfWeek(new Date()), "yyyy-MM-dd");
    return filteredEvents.find(
      (e) => e.type === "WEEKLY_PLAN" && e.date === weekStartStr
    );
  }, [filteredEvents]);

  const toggleMember = useCallback((id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }, []);

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type as EventType)
        ? prev.filter((t) => t !== type)
        : [...prev, type as EventType]
    );
  }, []);

  const handleDayClick = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    setSheetOpen(true);
  }, []);

  const dayEvents = selectedDate
    ? filteredEvents.filter((e) => {
        const start = e.date;
        const end = e.endDate || e.date;
        return selectedDate >= start && selectedDate <= end;
      })
    : [];

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar
        teamMembers={teamMembers}
        selectedMembers={selectedMembers}
        onToggleMember={toggleMember}
        eventTypeFilter={selectedTypes}
        onToggleType={toggleType}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white/60 backdrop-blur-md border-b border-stone-200/50 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-stone-100 rounded-xl">
              <Calendar className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">
                Inno Team Planner
              </h1>
              <p className="text-sm text-stone-500 font-medium">
                Track holidays, WFH, and team plans
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateMonth(subMonths(currentDate, 1))}
              disabled={isPending}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:opacity-50"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-stone-600" />
            </button>
            <span className="text-sm font-semibold text-stone-700 min-w-[120px] text-center">
              {isPending ? "Loading…" : format(currentDate, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth(addMonths(currentDate, 1))}
              disabled={isPending}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:opacity-50"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-stone-600" />
            </button>
            <button
              type="button"
              onClick={() => navigateMonth(new Date())}
              disabled={isPending}
              className="ml-2 px-3 py-1.5 text-sm font-semibold text-stone-700 border border-stone-300 rounded-md hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors disabled:opacity-50"
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
