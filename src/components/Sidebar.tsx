"use client";

import React, { useEffect } from "react";
import { SafeTeamMember } from "@/types";
import { Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { EventTypeDot, EVENT_TYPE_LABEL } from "./EventTypeIcon";

const TYPE_ORDER: string[] = [
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

interface SidebarProps {
  teamMembers: SafeTeamMember[];
  selectedMembers: string[];
  onToggleMember: (id: string) => void;
  onSetMembers: (ids: string[]) => void;
  eventTypeFilter: string[];
  onToggleType: (type: string) => void;
  onSetTypes: (types: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}


export function Sidebar({
  teamMembers,
  selectedMembers,
  onToggleMember,
  onSetMembers,
  eventTypeFilter,
  onToggleType,
  onSetTypes,
  isOpen,
  onClose,
}: SidebarProps) {
  const allMemberIds = teamMembers.map((m) => m.id);
  const allTypes = TYPE_ORDER;

  // Lock body scroll when sidebar drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const panelContent = (
    <>
      <div className="p-5 border-b border-stone-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-stone-500" />
          Team Members
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1.5 hover:bg-stone-100 rounded-md transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4 text-stone-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>People</span>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSetMembers(allMemberIds)}
              className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition-colors normal-case tracking-normal"
            >
              All
            </button>
            <span className="text-stone-300">·</span>
            <button
              type="button"
              onClick={() => onSetMembers([])}
              className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition-colors normal-case tracking-normal"
            >
              None
            </button>
            <span className="text-stone-300">·</span>
            <span className="text-stone-500 text-xs font-medium">{selectedMembers.length}/{teamMembers.length}</span>
          </span>
        </div>

        <div className="flex flex-col gap-1 mb-6">
          {teamMembers.map((member) => {
            const isSelected = selectedMembers.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onToggleMember(member.id)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer w-full text-left transition-colors hover:bg-stone-50/60"
              >
                {/* Color dot swatch — solid when selected, outline ring when not */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-150"
                  style={
                    isSelected
                      ? { backgroundColor: member.color }
                      : { border: `2px solid ${member.color}`, backgroundColor: "transparent" }
                  }
                />
                <span className={cn(
                  "text-sm transition-colors",
                  isSelected ? "text-stone-800 font-medium" : "text-stone-400"
                )}>
                  {member.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Event Types</span>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSetTypes(allTypes)}
              className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition-colors normal-case tracking-normal"
            >
              All
            </button>
            <span className="text-stone-300">·</span>
            <button
              type="button"
              onClick={() => onSetTypes([])}
              className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition-colors normal-case tracking-normal"
            >
              None
            </button>
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {TYPE_ORDER.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer
                         hover:bg-stone-50/60 transition-colors"
            >
              <input
                type="checkbox"
                checked={eventTypeFilter.includes(type)}
                onChange={() => onToggleType(type)}
                className="w-3.5 h-3.5 accent-stone-400 rounded cursor-pointer"
              />
              <EventTypeDot type={type} />
              <span className="text-sm text-stone-700">{EVENT_TYPE_LABEL[type] ?? type}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar: always visible */}
      <aside className="hidden lg:flex w-64 bg-white/40 backdrop-blur-xl border-r border-stone-200/50 flex-col h-full shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20">
        {panelContent}
      </aside>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer: slides in from left */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 w-[280px] bg-white/95 backdrop-blur-xl z-50 flex flex-col h-full shadow-xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {panelContent}
      </aside>
    </>
  );
}
