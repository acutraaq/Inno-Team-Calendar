"use client";

import { useState, useEffect } from "react";
import { SafeEvent, SafeTeamMember } from "@/types";
import type { EventType, EventSession } from "@/types";
import { X, Plus, Trash2, Pencil, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_ICONS,
  EVENT_TYPE_ICON_COLORS,
  EVENT_TYPE_PILL_BG,
  EVENT_TYPE_LABEL,
  EVENT_TYPE_SHORT,
} from "./EventTypeIcon";
import { createEvent, updateEvent, deleteEvent, getWeeklyWfhUsage } from "@/lib/actions";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

interface DayDetailSheetProps {
  date: string;
  events: SafeEvent[];
  teamMembers: SafeTeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onEventChange: () => void;
  onViewRelated?: (title: string | null) => void;
}

const TYPE_ORDER: EventType[] = [
  "ANNUAL_LEAVE",
  "HALFDAY",
  "FLEXI_HALFDAY",
  "MEDICAL_LEAVE",
  "WFH",
  "TRAINING",
  "MEETING",
  "EVENT",
  "PUBLIC_HOLIDAY",
];

// Types that require or allow a team member selection
const MEMBER_REQUIRED_TYPES: EventType[] = ["ANNUAL_LEAVE", "HALFDAY", "FLEXI_HALFDAY", "MEDICAL_LEAVE", "WFH"];
const MEMBER_OPTIONAL_TYPES: EventType[] = ["TRAINING", "MEETING", "EVENT"];

// Types where session (AM/PM) is selectable
const SESSION_TYPES: EventType[] = ["WFH", "ANNUAL_LEAVE", "HALFDAY", "FLEXI_HALFDAY"];
// Types that force AM/PM only (no FULL_DAY)
const HALFDAY_ONLY_TYPES: EventType[] = ["HALFDAY", "FLEXI_HALFDAY"];

export function DayDetailSheet({
  date,
  events,
  teamMembers,
  isOpen,
  onClose,
  onEventChange,
  onViewRelated,
}: DayDetailSheetProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<EventType>("WFH");
  const [formSession, setFormSession] = useState<EventSession>("FULL_DAY");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formMemberId, setFormMemberId] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [wfhUsage, setWfhUsage] = useState<number | null>(null);

  useEffect(() => {
    if (!showForm || formType !== "WFH" || !formMemberId) return;
    let cancelled = false;
    getWeeklyWfhUsage(formMemberId, date, editingId ?? undefined)
      .then((units) => {
        if (!cancelled) setWfhUsage(units);
      })
      .catch(() => {
        if (!cancelled) setWfhUsage(null);
      });
    return () => {
      cancelled = true;
    };
  }, [showForm, formType, formMemberId, date, editingId]);

  const resetForm = () => {
    setFormType("WFH");
    setFormTitle("");
    setFormDesc("");
    setFormMemberId("");
    setFormEndDate("");
    setFormSession("FULL_DAY");
    setError("");
    setEditingId(null);
  };

  const handleTypeChange = (type: EventType) => {
    setFormType(type);
    if (HALFDAY_ONLY_TYPES.includes(type)) {
      setFormSession("AM");
    } else if (!SESSION_TYPES.includes(type)) {
      setFormSession("FULL_DAY");
    }
  };

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = (event: SafeEvent) => {
    setEditingId(event.id);
    setFormType(event.type);
    setFormTitle(event.title || "");
    setFormDesc(event.description || "");
    setFormMemberId(event.teamMemberId || "");
    setFormEndDate(event.endDate || "");
    setFormSession((event.session as EventSession) || "FULL_DAY");
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (editingId) {
        await updateEvent(editingId, {
          date,
          endDate: formEndDate || null,
          type: formType,
          session: formSession,
          title: formTitle,
          description: formDesc,
          teamMemberId: formMemberId,
        });
      } else {
        await createEvent({
          date,
          endDate: formEndDate || undefined,
          type: formType,
          session: formSession,
          title: formTitle,
          description: formDesc,
          teamMemberId: formMemberId,
        });
      }
      resetForm();
      setShowForm(false);
      onEventChange();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId || loading) return;
    const id = deleteConfirmId;
    setLoading(true);
    try {
      await deleteEvent(id);
      setDeleteConfirmId(null);
      onEventChange();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setDeleteConfirmId(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const [dateYear, dateMo, dateDay] = date.split("-").map(Number);
  const dateObj = new Date(dateYear, dateMo - 1, dateDay);
  const dateLabel = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isMemberRequired = MEMBER_REQUIRED_TYPES.includes(formType);
  const showMember = isMemberRequired || MEMBER_OPTIONAL_TYPES.includes(formType);
  const showSession = SESSION_TYPES.includes(formType);
  const halfDayOnly = HALFDAY_ONLY_TYPES.includes(formType);

  return (
    <>
      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white/90 backdrop-blur-xl shadow-2xl z-50 flex flex-col border-l border-stone-200/50">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200/50">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">Events</h2>
            <p className="text-sm text-stone-400 mt-0.5">{dateLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {events.length === 0 && !showForm && (
            <div className="text-center py-16">
              <p className="text-stone-400 text-sm mb-4">No events for this day.</p>
              <button
                type="button"
                onClick={handleAddClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-700 text-white text-sm rounded-lg hover:bg-stone-800 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Event
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="border border-stone-100 rounded-lg p-4 hover:shadow-sm transition-shadow group relative"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const Icon = EVENT_TYPE_ICONS[ev.type];
                      const iconColor = EVENT_TYPE_ICON_COLORS[ev.type] ?? "text-stone-500";
                      return (
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1",
                            EVENT_TYPE_PILL_BG[ev.type] ?? "bg-stone-100 text-stone-700"
                          )}
                        >
                          {Icon && <Icon className={cn("w-3 h-3", iconColor)} strokeWidth={2.5} />}
                          {EVENT_TYPE_SHORT[ev.type] ?? ev.type}
                        </span>
                      );
                    })()}
                    {ev.teamMember && (
                      <span className="text-xs text-stone-500">
                        {ev.teamMember.name}
                      </span>
                    )}
                    {ev.session !== "FULL_DAY" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                        {ev.session}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {ev.title && onViewRelated && (
                      <button
                        type="button"
                        onClick={() => onViewRelated(ev.title)}
                        className="p-1.5 hover:bg-stone-100 rounded-md transition-colors"
                        title="View related events"
                        aria-label="View related events"
                      >
                        <Link2 className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEditClick(ev)}
                      className="p-1.5 hover:bg-stone-100 rounded-md transition-colors"
                      aria-label="Edit event"
                    >
                      <Pencil className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(ev.id)}
                      className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                {ev.title && (
                  <p className="text-sm font-medium text-stone-800">{ev.title}</p>
                )}
                {ev.description && (
                  <p className="text-xs text-stone-500 mt-1">{ev.description}</p>
                )}
              </div>
            ))}
          </div>

          {!showForm && events.length > 0 && (
            <button
              type="button"
              onClick={handleAddClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-stone-200 rounded-lg text-sm text-stone-500 hover:border-stone-300 hover:bg-stone-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Event
            </button>
          )}

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="border border-stone-200 rounded-xl p-5 bg-stone-50/50"
            >
              <h3 className="text-sm font-semibold text-stone-700 mb-4">
                {editingId ? "Edit Event" : "New Event"}
              </h3>

              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="formType" className="text-xs font-medium text-stone-500 mb-1.5 block">
                    Event Type
                  </label>
                  <select
                    id="formType"
                    value={formType}
                    onChange={(e) => handleTypeChange(e.target.value as EventType)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200"
                  >
                    {TYPE_ORDER.map((value) => (
                      <option key={value} value={value}>
                        {EVENT_TYPE_LABEL[value] ?? value}
                      </option>
                    ))}
                  </select>
                </div>

                {showMember && (
                  <div>
                    <label htmlFor="formMemberId" className="text-xs font-medium text-stone-500 mb-1.5 block">
                      Team Member {isMemberRequired && <span className="text-red-400">(required)</span>}
                    </label>
                    <select
                      id="formMemberId"
                      value={formMemberId}
                      onChange={(e) => setFormMemberId(e.target.value)}
                      required={isMemberRequired}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200"
                    >
                      <option value="">Select a member...</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {showSession && (
                  <div>
                    <label htmlFor="formSession" className="text-xs font-medium text-stone-500 mb-1.5 block">
                      Session
                    </label>
                    <select
                      id="formSession"
                      value={formSession}
                      onChange={(e) => setFormSession(e.target.value as EventSession)}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200"
                    >
                      {!halfDayOnly && <option value="FULL_DAY">Full Day</option>}
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                )}

                {formType === "WFH" && formMemberId && wfhUsage !== null && (
                  <div className={cn(
                    "text-xs px-3 py-2 rounded-md border",
                    wfhUsage >= 2
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : wfhUsage >= 1.5
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-stone-50 border-stone-200 text-stone-600"
                  )}>
                    {wfhUsage} / 2 WFH days used this week
                    {editingId && " (excluding this entry)"}
                  </div>
                )}

                <div>
                  <label htmlFor="formEndDate" className="text-xs font-medium text-stone-500 mb-1.5 block">
                    End Date <span className="text-stone-400">(optional)</span>
                  </label>
                  <input
                    id="formEndDate"
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    min={date}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <div>
                  <label htmlFor="formTitle" className="text-xs font-medium text-stone-500 mb-1.5 block">
                    Title <span className="text-stone-400">(optional)</span>
                  </label>
                  <input
                    id="formTitle"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Optional title..."
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <div>
                  <label htmlFor="formDesc" className="text-xs font-medium text-stone-500 mb-1.5 block">
                    Description <span className="text-stone-400">(optional)</span>
                  </label>
                  <textarea
                    id="formDesc"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    rows={3}
                    placeholder="Optional description..."
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200 resize-none"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 mt-3 bg-red-50 p-2 rounded-md">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-stone-700 text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? "Saving..." : editingId ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {deleteConfirmId && (
        <>
          <div className="fixed inset-0 bg-stone-900/40 z-[60]" onClick={() => !loading && setDeleteConfirmId(null)} />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[340px] bg-white rounded-xl shadow-2xl p-6 border border-stone-200"
          >
            <h3 id="confirm-title" className="text-sm font-semibold text-stone-800 mb-1">
              Delete event?
            </h3>
            <p id="confirm-desc" className="text-xs text-stone-500 mb-5">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={loading}
                className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
