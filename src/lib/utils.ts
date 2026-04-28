import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMemberColorClass(colorHex?: string | null): string {
  const map: Record<string, string> = {
    "#7EB5C4": "bg-[#7EB5C4]",
    "#FF8A80": "bg-[#FF8A80]",
    "#80CBC4": "bg-[#80CBC4]",
    "#B39DDB": "bg-[#B39DDB]",
    "#FFAB91": "bg-[#FFAB91]",
    "#FFF176": "bg-[#FFF176]",
    "#FF7043": "bg-[#FF7043]",
    "#64B5F6": "bg-[#64B5F6]",
    "#AED581": "bg-[#AED581]",
  };
  return colorHex && map[colorHex] ? map[colorHex] : "bg-stone-300";
}
