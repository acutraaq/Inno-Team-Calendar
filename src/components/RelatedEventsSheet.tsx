"use client";

import { useState, useEffect } from "react";
import { SafeEvent } from "@/types";
import { X, CalendarDays } from "lucide-react";
import { getEventsByTitle } from "@/lib/actions";
import {
  EVENT_TYPE_ICONS,
  EVENT_TYPE_ICON_COLORS,
  EVENT_TYPE_PILL_BG,
  EVENT_TYPE_SHORT,
} from "./EventTypeIcon";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface RelatedEventsSheetProps {
  title: string | null;
  year: number;
  isOpen: boolean;
  onClose: () => void;
  onJumpToDate: (dateStr: string) => void;
}

export function RelatedEventsSheet({
  title,
  year,
  isOpen,
  onClose,
  onJumpToDate,
}: RelatedEventsSheetProps) {
  const [events, setEvents] = useState<SafeEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !title) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEventsByTitle(year, title)
      .then((data) => {
        if (!cancelled) setEvents(data as SafeEvent[]);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, title, year]);

  if (!isOpen || !title) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white/90 backdrop-blur-xl shadow-2xl z-50 flex flex-col border-l border-stone-200/50">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200/50">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-stone-800">Related Events</h2>
            <p className="text-sm text-stone-400 mt-0.5 truncate">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading && <p className="text-sm text-stone-400">Loading occurrences…</p>}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}
          {!loading && !error && events.length === 0 && (
            <p className="text-sm text-stone-400">No occurrences found.</p>
          )}
          <div className="flex flex-col gap-3">
            {events.map((ev) => {
              const Icon = EVENT_TYPE_ICONS[ev.type];
              const iconColor = EVENT_TYPE_ICON_COLORS[ev.type] ?? "text-stone-500";
              const dateLabel = (() => {
                try {
                  const [y, m, d] = ev.date.split("-").map(Number);
                  return format(new Date(y, m - 1, d), "EEE, d MMM yyyy");
                } catch {
                  return ev.date;
                }
              })();
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    onJumpToDate(ev.date);
                    onClose();
                  }}
                  className="text-left border border-stone-100 rounded-lg p-4 hover:shadow-sm hover:bg-stone-50/60 transition-all group"
                >
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {Icon && (
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1",
                          EVENT_TYPE_PILL_BG[ev.type] ?? "bg-stone-100 text-stone-700"
                        )}
                      >
                        <Icon className={cn("w-3 h-3", iconColor)} strokeWidth={2.5} />
                        {EVENT_TYPE_SHORT[ev.type] ?? ev.type}
                      </span>
                    )}
                    {ev.teamMember && (
                      <span className="text-xs text-stone-500">{ev.teamMember.name}</span>
                    )}
                    {ev.session !== "FULL_DAY" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                        {ev.session}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-700">
                    <CalendarDays className="w-4 h-4 text-stone-400" />
                    <span className="font-medium">{dateLabel}</span>
                    {ev.endDate && ev.endDate !== ev.date && (
                      <span className="text-stone-400">– {ev.endDate}</span>
                    )}
                  </div>
                  {ev.description && (
                    <p className="text-xs text-stone-500 mt-1.5 line-clamp-2">
                      {ev.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
