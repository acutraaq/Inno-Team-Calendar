import { SafeEvent } from "@/types";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_ICONS,
  EVENT_TYPE_ICON_COLORS,
  EVENT_TYPE_PILL_BG,
  EVENT_TYPE_SHORT,
} from "./EventTypeIcon";

interface MobileEventChipProps {
  event: SafeEvent;
  /** "member" → show member name + (type, session). "type" → show type + session. */
  variant: "member" | "type";
}

export function MobileEventChip({ event, variant }: MobileEventChipProps) {
  const Icon = EVENT_TYPE_ICONS[event.type];
  const iconColor = EVENT_TYPE_ICON_COLORS[event.type] ?? "text-stone-500";
  const pillBg = EVENT_TYPE_PILL_BG[event.type] ?? "bg-stone-100 text-stone-700";
  const typeShort = EVENT_TYPE_SHORT[event.type] ?? event.type;
  const sessionSuffix = event.session !== "FULL_DAY" ? ` · ${event.session}` : "";

  let primary: string;
  let secondary: string | null;
  if (variant === "member" && event.teamMember) {
    primary = event.teamMember.name;
    secondary = `${typeShort}${sessionSuffix}`;
  } else {
    primary = event.title || typeShort;
    secondary = event.session !== "FULL_DAY" ? event.session : null;
  }

  return (
    <div className={cn("flex items-center gap-2 rounded-lg px-2.5 py-1.5", pillBg)}>
      {Icon && <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", iconColor)} strokeWidth={2.5} />}
      <span className="truncate text-sm font-semibold">{primary}</span>
      {secondary && (
        <span className="ml-auto truncate text-[11px] font-semibold opacity-70">{secondary}</span>
      )}
    </div>
  );
}
