import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const EVENT_TYPE_COLORS: Record<string, string> = {
  ANNUAL_LEAVE:  "#93C5FD",
  HALFDAY:       "#C4B5FD",
  FLEXI_HALFDAY: "#86EFAC",
  TRAINING:      "#FCD34D",
  EVENT:         "#FFDAC1",
  MEDICAL_LEAVE: "#AEC6CF",
  WFH:           "#B5EAD7",
  PUBLIC_HOLIDAY:"#D1D5DB",
  MEETING:       "#FFAB91",
};

export function getEventTypeBgClass(type: string): string {
  const map: Record<string, string> = {
    ANNUAL_LEAVE:  "bg-[#93C5FD]",
    HALFDAY:       "bg-[#C4B5FD]",
    FLEXI_HALFDAY: "bg-[#86EFAC]",
    TRAINING:      "bg-[#FCD34D]",
    EVENT:         "bg-[#FFDAC1]",
    MEDICAL_LEAVE: "bg-[#AEC6CF]",
    WFH:           "bg-[#B5EAD7]",
    PUBLIC_HOLIDAY:"bg-[#D1D5DB]",
    MEETING:       "bg-[#FFAB91]",
  };
  return map[type] ?? "bg-stone-300";
}
