"use client";

import React from "react";
import { SafeTeamMember } from "@/types";
import { Users } from "lucide-react";

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
}


export function Sidebar({
  teamMembers,
  selectedMembers,
  onToggleMember,
  onSetMembers,
  eventTypeFilter,
  onToggleType,
  onSetTypes,
}: SidebarProps) {
  const allMemberIds = teamMembers.map((m) => m.id);
  const allTypes = TYPE_ORDER;
  return (
    <div className="w-64 bg-white/40 backdrop-blur-xl border-r border-stone-200/50 flex flex-col h-full shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20">
      <div className="p-5 border-b border-stone-100">
        <h2 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-stone-500" />
          Team Members
        </h2>
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
          {teamMembers.map((member) => (
            <label
              key={member.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer
                         hover:bg-stone-50/60 transition-colors group"
            >
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={() => onToggleMember(member.id)}
                className="w-3.5 h-3.5 accent-stone-400 rounded cursor-pointer"
              />
              <span className="text-sm text-stone-700 group-hover:text-stone-900">
                {member.name}
              </span>
            </label>
          ))}
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
    </div>
  );
}
