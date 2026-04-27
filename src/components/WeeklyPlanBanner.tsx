"use client";

import React from "react";
import { CalendarDays } from "lucide-react";

interface WeeklyPlanBannerProps {
  plan: {
    id: string;
    date: string;
    title: string | null;
    description: string | null;
  } | null;
}

export function WeeklyPlanBanner({ plan }: WeeklyPlanBannerProps) {
  if (!plan) return null;

  return (
    <div className="w-full bg-[#FFDAC1]/30 border border-[#FFDAC1]/40 rounded-xl px-5 py-4 mb-6 flex items-start gap-4">
      <div className="p-2 bg-white/60 rounded-lg">
        <CalendarDays className="w-5 h-5 text-[#d97706]" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-[#b45309] uppercase tracking-wider mb-1">
          This Week&apos;s Plan
        </p>
        <h3 className="text-base font-semibold text-stone-800">
          {plan.title || "No plan title"}
        </h3>
        {plan.description && (
          <p className="text-sm text-stone-500 mt-1">{plan.description}</p>
        )}
      </div>
    </div>
  );
}
