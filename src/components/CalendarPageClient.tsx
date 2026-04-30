"use client";

import { useState, useMemo, useTransition, useCallback } from "react";
import { SafeEvent, SafeTeamMember, EventType } from "@/types";
import { format, addMonths, subMonths, addDays, startOfWeek } from "date-fns";
import { CalendarGrid } from "@/components/CalendarGrid";
import { Sidebar } from "@/components/Sidebar";
import { WeeklyPlanBanner } from "@/components/WeeklyPlanBanner";
import { WeekView } from "@/components/WeekView";
import { DayDetailSheet } from "@/components/DayDetailSheet";
import { RelatedEventsSheet } from "@/components/RelatedEventsSheet";
import { EventSearch } from "@/components/EventSearch";
import { getEventsForMonth } from "@/lib/actions";
import { ChevronLeft, ChevronRight, Sparkles, LayoutGrid, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const teamMembers: SafeTeamMember[] = initialTeamMembers;
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    initialTeamMembers.map((m) => m.id)
  );
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([
    "ANNUAL_LEAVE",
    "HALFDAY",
    "FLEXI_HALFDAY",
    "MEDICAL_LEAVE",
    "WFH",
    "TRAINING",
    "MEETING",
    "EVENT",
    "PUBLIC_HOLIDAY",
  ]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [relatedSheetOpen, setRelatedSheetOpen] = useState(false);
  const [relatedTitle, setRelatedTitle] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchEvents = useCallback((date: Date) => {
    startTransition(async () => {
      try {
        const fresh = await getEventsForMonth(date.getFullYear(), date.getMonth());
        setEvents(fresh as SafeEvent[]);
        setFetchError(null);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Failed to load events");
      }
    });
  }, []);

  const navigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
    fetchEvents(newDate);
  }, [fetchEvents]);

  const handlePrev = useCallback(() => {
    navigate(viewMode === "week" ? addDays(currentDate, -7) : subMonths(currentDate, 1));
  }, [navigate, viewMode, currentDate]);

  const handleNext = useCallback(() => {
    navigate(viewMode === "week" ? addDays(currentDate, 7) : addMonths(currentDate, 1));
  }, [navigate, viewMode, currentDate]);

  const handleToday = useCallback(() => navigate(new Date()), [navigate]);

  const handleEventChange = useCallback(() => {
    fetchEvents(currentDate);
  }, [fetchEvents, currentDate]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((e) => {
      const typeMatch = selectedTypes.includes(e.type);
      const memberMatch =
        !e.teamMemberId || selectedMembers.includes(e.teamMemberId);
      const searchMatch = !query ||
        (e.title?.toLowerCase().includes(query) ?? false) ||
        (e.description?.toLowerCase().includes(query) ?? false);
      return typeMatch && memberMatch && searchMatch;
    });
  }, [events, selectedMembers, selectedTypes, searchQuery]);

  const weeklyPlan = useMemo(() => {
    const weekStartStr = format(startOfWeek(currentDate), "yyyy-MM-dd");
    return filteredEvents.find(
      (e) => e.type === "EVENT" && e.date === weekStartStr
    );
  }, [filteredEvents, currentDate]);

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

  const handleJumpToDate = useCallback((dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    setCurrentDate(target);
    setViewMode("month");
    fetchEvents(target);
    setSelectedDate(dateStr);
    setSheetOpen(true);
  }, [fetchEvents]);

  const dayEvents = selectedDate
    ? filteredEvents.filter((e) => {
        const start = e.date;
        const end = e.endDate || e.date;
        return selectedDate >= start && selectedDate <= end;
      })
    : [];

  // Whether the current view is showing today's period (hides the Today button when true)
  const isCurrentPeriod = useMemo(() => {
    const today = new Date();
    if (viewMode === "month") {
      return (
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()
      );
    }
    // Week view: check today falls within the displayed week
    const ws = format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const we = format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), "yyyy-MM-dd");
    const todayStr = format(today, "yyyy-MM-dd");
    return todayStr >= ws && todayStr <= we;
  }, [currentDate, viewMode]);

  // Navigation label
  const navLabel = useMemo(() => {
    if (isPending) return "Loading…";
    if (viewMode === "week") {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = addDays(ws, 6);
      return `${format(ws, "d MMM")} – ${format(we, "d MMM yyyy")}`;
    }
    return format(currentDate, "MMMM yyyy");
  }, [isPending, viewMode, currentDate]);

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar
        teamMembers={teamMembers}
        selectedMembers={selectedMembers}
        onToggleMember={toggleMember}
        onSetMembers={setSelectedMembers}
        eventTypeFilter={selectedTypes}
        onToggleType={toggleType}
        onSetTypes={(types) => setSelectedTypes(types as EventType[])}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white/60 backdrop-blur-md border-b border-stone-200/50 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl ring-1 ring-orange-200/60 shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-600" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">Inno Team Planner</h1>
              <p className="text-sm text-stone-500 font-medium">
                The innovation team&apos;s weekly pulse
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block w-64">
              <EventSearch
                year={year}
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onSelectResult={(title) => {
                  setSearchQuery(title);
                  setRelatedTitle(title);
                  setRelatedSheetOpen(true);
                }}
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-stone-100 rounded-lg p-1 gap-1">
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                  viewMode === "month"
                    ? "bg-white text-stone-800 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Month
              </button>
              <button
                type="button"
                onClick={() => setViewMode("week")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                  viewMode === "week"
                    ? "bg-white text-stone-800 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                )}
              >
                <Rows3 className="w-3.5 h-3.5" />
                Week
              </button>
            </div>

            {/* Navigation */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={isPending}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:opacity-50"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-stone-600" />
            </button>
            <span className="text-sm font-semibold text-stone-700 min-w-[160px] text-center">
              {navLabel}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={isPending}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:opacity-50"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-stone-600" />
            </button>
            {!isCurrentPeriod && (
              <button
                type="button"
                onClick={handleToday}
                disabled={isPending}
                className="ml-2 px-3 py-1.5 text-sm font-semibold text-stone-700 border border-stone-300 rounded-md hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-colors disabled:opacity-50"
              >
                Today
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-[1400px] mx-auto">
            {viewMode === "month" && weeklyPlan && (
              <WeeklyPlanBanner
                plan={{
                  id: weeklyPlan.id,
                  date: weeklyPlan.date,
                  title: weeklyPlan.title,
                  description: weeklyPlan.description,
                }}
                onEdit={() => handleDayClick(weeklyPlan.date)}
              />
            )}

            {fetchError && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 flex items-center justify-between gap-3">
                <span>Couldn&apos;t load events: {fetchError}</span>
                <button
                  type="button"
                  onClick={() => fetchEvents(currentDate)}
                  className="text-xs font-semibold underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!fetchError && events.length > 0 && filteredEvents.length === 0 && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                Nothing to show — adjust the team member or event type filters in the sidebar.
              </div>
            )}

            {viewMode === "month" ? (
              <CalendarGrid
                year={year}
                month={month}
                events={filteredEvents}
                onDayClick={handleDayClick}
              />
            ) : (
              <WeekView
                currentDate={currentDate}
                events={filteredEvents}
                teamMembers={teamMembers}
                onDayClick={handleDayClick}
              />
            )}
          </div>
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
        onViewRelated={(title) => {
          if (!title) return;
          setRelatedTitle(title);
          setRelatedSheetOpen(true);
        }}
      />

      <RelatedEventsSheet
        title={relatedTitle}
        year={year}
        isOpen={relatedSheetOpen}
        onClose={() => setRelatedSheetOpen(false)}
        onJumpToDate={handleJumpToDate}
      />
    </div>
  );
}
