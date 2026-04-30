import { format } from "date-fns";
import { SafeEvent } from "@/types";

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function buildEventsByDate(events: SafeEvent[]): Map<string, SafeEvent[]> {
  const map = new Map<string, SafeEvent[]>();
  for (const e of events) {
    const end = e.endDate || e.date;
    let cur = e.date;
    while (cur <= end) {
      const list = map.get(cur) ?? [];
      list.push(e);
      map.set(cur, list);
      const [y, m, d] = cur.split("-").map(Number);
      cur = format(new Date(y, m - 1, d + 1), "yyyy-MM-dd");
    }
  }
  return map;
}
