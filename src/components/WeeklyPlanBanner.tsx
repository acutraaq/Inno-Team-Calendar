"use client";

import React from "react";
import { CalendarDays, Pencil } from "lucide-react";

interface WeeklyPlanBannerProps {
  plan: {
    id: string;
    date: string;
    title: string | null;
    description: string | null;
  } | null;
  onEdit?: () => void;
}

export function WeeklyPlanBanner({ plan, onEdit }: WeeklyPlanBannerProps) {
  if (!plan) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#FFAB91]/30 to-[#FFDAC1]/40 border border-[#FFAB91]/30 rounded-2xl px-6 py-5 mb-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FFAB91] to-[#FFDAC1]" />
      <div className="p-2.5 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
        <CalendarDays className="w-5 h-5 text-[#b45309] group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-[#b45309] uppercase tracking-wider mb-1">
          This Week&apos;s Plan
        </p>
        <h3 className="text-base font-semibold text-stone-800">
          {plan.title || "No plan title"}
        </h3>
        {plan.description && (
          <p className="text-sm text-stone-700 font-medium mt-1">{plan.description}</p>
        )}
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="p-2 rounded-lg bg-white/60 hover:bg-white/90 transition-colors text-[#b45309] shadow-sm"
          aria-label="Edit weekly plan"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
