"use client";

import {
  TreePalm, Clock, Zap, Thermometer, House,
  GraduationCap, Users, PartyPopper, Flag,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const EVENT_TYPE_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  ANNUAL_LEAVE:   TreePalm,
  HALFDAY:        Clock,
  FLEXI_HALFDAY:  Zap,
  MEDICAL_LEAVE:  Thermometer,
  WFH:            House,
  TRAINING:       GraduationCap,
  MEETING:        Users,
  EVENT:          PartyPopper,
  PUBLIC_HOLIDAY: Flag,
};

// Vivid per-type icon colors — readable on light cream background
export const EVENT_TYPE_ICON_COLORS: Record<string, string> = {
  ANNUAL_LEAVE:   "text-cyan-600",
  HALFDAY:        "text-violet-600",
  FLEXI_HALFDAY:  "text-emerald-600",
  MEDICAL_LEAVE:  "text-rose-500",
  WFH:            "text-blue-600",
  TRAINING:       "text-amber-600",
  MEETING:        "text-indigo-600",
  EVENT:          "text-pink-600",
  PUBLIC_HOLIDAY: "text-orange-500",
};

// Long, descriptive labels — used in dropdowns and the sidebar filter list
export const EVENT_TYPE_LABEL: Record<string, string> = {
  ANNUAL_LEAVE:   "Annual Leave (AL)",
  HALFDAY:        "Half Day",
  FLEXI_HALFDAY:  "Flexi Half Day",
  MEDICAL_LEAVE:  "MC (Medical Leave)",
  WFH:            "WFH",
  TRAINING:       "Training",
  MEETING:        "Meeting",
  EVENT:          "Event",
  PUBLIC_HOLIDAY: "Public Holiday",
};

// Short labels for compact pills/chips in cells and weekly grid
export const EVENT_TYPE_SHORT: Record<string, string> = {
  ANNUAL_LEAVE:   "AL",
  HALFDAY:        "Half Day",
  FLEXI_HALFDAY:  "Flexi HD",
  MEDICAL_LEAVE:  "MC",
  WFH:            "WFH",
  TRAINING:       "Training",
  MEETING:        "Meeting",
  EVENT:          "Event",
  PUBLIC_HOLIDAY: "Public Holiday",
};

// Soft tinted pill backgrounds for type badges — pastel-friendly, AA contrast with -800 text
export const EVENT_TYPE_PILL_BG: Record<string, string> = {
  ANNUAL_LEAVE:   "bg-cyan-100 text-cyan-800",
  HALFDAY:        "bg-violet-100 text-violet-800",
  FLEXI_HALFDAY:  "bg-emerald-100 text-emerald-800",
  MEDICAL_LEAVE:  "bg-rose-100 text-rose-800",
  WFH:            "bg-blue-100 text-blue-800",
  TRAINING:       "bg-amber-100 text-amber-800",
  MEETING:        "bg-indigo-100 text-indigo-800",
  EVENT:          "bg-pink-100 text-pink-800",
  PUBLIC_HOLIDAY: "bg-orange-100 text-orange-800",
};

interface EventTypeDotProps {
  type: string;
  className?: string;
}

// Colorful icon — vivid and emoji-like on cream background
export function EventTypeDot({ type, className }: EventTypeDotProps) {
  const Icon = EVENT_TYPE_ICONS[type];
  const color = EVENT_TYPE_ICON_COLORS[type] ?? "text-stone-400";
  if (!Icon) return null;
  return (
    <Icon
      className={cn("w-3.5 h-3.5 flex-shrink-0", color, className)}
      strokeWidth={2.2}
    />
  );
}
