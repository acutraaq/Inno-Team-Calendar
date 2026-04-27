"use client";

import React, { useState } from "react";
import { SafeEvent, SafeTeamMember } from "@/types";
import type { EventType, EventSession } from "@/types";
import { X, Plus, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { createEvent, updateEvent, deleteEvent } from "@/lib/actions";

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
}

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "HOLIDAY", label: "Holiday" },
  { value: "MEDICAL_LEAVE", label: "Medical Leave" },
  { value: "WFH", label: "Work From Home" },
  { value: "PUBLIC_HOLIDAY", label: "Public Holiday" },
  { value: "WEEKLY_PLAN", label: "Weekly Plan" },
];

const TYPE_COLORS: Record<EventType, string> = {
  HOLIDAY: "bg-[#C3B1E1]",
  MEDICAL_LEAVE: "bg-[#AEC6CF]",
  WFH: "bg-[#B5EAD7]",
  PUBLIC_HOLIDAY: "bg-stone-300",
  WEEKLY_PLAN: "bg-[#FFDAC1]",
};

const TYPE_TEXT: Record<EventType, string> = {
  HOLIDAY: "Holiday",
  MEDICAL_LEAVE: "Medical Leave",
  WFH: "Work From Home",
  PUBLIC_HOLIDAY: "Public Holiday",
  WEEKLY_PLAN: "Weekly Plan",
};

const SESSION_OPTIONS: { value: EventSession; label: string }[] = [
  { value: "FULL_DAY", label: "Full Day" },
  { value: "AM", label: "AM (Half Day)" },
  { value: "PM", label: "PM (Half Day)" },
];

export function DayDetailSheet({
  date,
  events,
  teamMembers,
  isOpen,
  onClose,
  onEventChange,
}: DayDetailSheetProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<string>("WFH");
  const [formSession, setFormSession] = useState<EventSession>("FULL_DAY");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formMemberId, setFormMemberId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormType("WFH");
    setFormTitle("");
    setFormDesc("");
    setFormMemberId("");
    setFormSession("FULL_DAY");
    setError("");
    setEditingId(null);
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
    setFormSession((event.session as EventSession) || "FULL_DAY");
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (editingId) {
        await updateEvent(editingId, {
          date,
          type: formType,
          session: formSession,
          title: formTitle,
          description: formDesc,
          teamMemberId: formMemberId,
        });
      } else {
        await createEvent({
          date,
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setLoading(true);
    try {
      await deleteEvent(id);
      onEventChange();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const dateObj = new Date(date);
  const dateLabel = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">Events</h2>
            <p className="text-sm text-stone-400 mt-0.5">{dateLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {events.length === 0 && !showForm && (
            <div className="text-center py-16">
              <p className="text-stone-400 text-sm mb-4">No events for this day.</p>
              <button
                onClick={handleAddClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors"
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
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        TYPE_COLORS[ev.type as EventType],
                        "text-stone-800"
                      )}
                    >
                      {TYPE_TEXT[ev.type as EventType]}
                    </span>
                    {ev.teamMember && (
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: ev.teamMember.color }}
                        />
                        {ev.teamMember.name}
                      </span>
                    )}
                    {ev.session !== "FULL_DAY" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                        {ev.session}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(ev)}
                      className="p-1.5 hover:bg-stone-100 rounded-md transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
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
                  <label className="text-xs font-medium text-stone-500 mb-1.5 block">
                    Event Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as EventType)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1.5 block">
                    Team Member {formType === "WFH" && "(required)"}
                  </label>
                  <select
                    value={formMemberId}
                    onChange={(e) => setFormMemberId(e.target.value)}
                    required={formType === "WFH"}
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

                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1.5 block">
                    Duration
                  </label>
                  <select
                    value={formSession}
                    onChange={(e) => setFormSession(e.target.value as EventSession)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200"
                  >
                    {SESSION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1.5 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Optional title..."
                    className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1.5 block">
                    Description
                  </label>
                  <textarea
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
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
