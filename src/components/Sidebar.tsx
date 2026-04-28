"use client";

import React from "react";
import { SafeTeamMember } from "@/types";
import { Users } from "lucide-react";
import { cn, getMemberColorClass } from "@/lib/utils";

interface SidebarProps {
  teamMembers: SafeTeamMember[];
  selectedMembers: string[];
  onToggleMember: (id: string) => void;
  eventTypeFilter: string[];
  onToggleType: (type: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  HOLIDAY: "Holiday",
  MEDICAL_LEAVE: "Medical Leave",
  WFH: "Work From Home",
  PUBLIC_HOLIDAY: "Public Holiday",
  WEEKLY_PLAN: "Weekly Plan",
  MEETING: "Meeting / Event",
};

export function Sidebar({ teamMembers, selectedMembers, onToggleMember, eventTypeFilter, onToggleType }: SidebarProps) {
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
          <span className="text-stone-500 text-xs font-medium">{selectedMembers.length}/{teamMembers.length}</span>
        </div>

        <div className="flex flex-col gap-1 mb-6">
          {teamMembers.map((member) => (
            <label
              key={member.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer
                         hover:bg-stone-50/60 hover:translate-x-1 transition-all group"
            >
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={() => onToggleMember(member.id)}
                className="w-3.5 h-3.5 accent-stone-400 rounded cursor-pointer"
              />
              <span
                className={cn("w-3 h-3 rounded-full flex-shrink-0", getMemberColorClass(member.color))}
              />
              <span className="text-sm text-stone-700 group-hover:text-stone-900">
                {member.name}
              </span>
            </label>
          ))}
        </div>

        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
          Event Types
        </div>

        <div className="flex flex-col gap-1">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <label
              key={type}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer
                         hover:bg-stone-50/60 hover:translate-x-1 transition-all"
            >
              <input
                type="checkbox"
                checked={eventTypeFilter.includes(type)}
                onChange={() => onToggleType(type)}
                className="w-3.5 h-3.5 accent-stone-400 rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-stone-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
