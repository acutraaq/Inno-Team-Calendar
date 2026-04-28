"use server";

import { prisma } from "@/lib/prisma";
import type { SafeEvent } from "@/types";

// --- Helpers ---
function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getISOWeekBounds(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0 = Sunday
  const startOfWeek = new Date(y, m - 1, d - day);
  const endOfWeek = new Date(y, m - 1, d - day + 6);
  return {
    start: toDateStr(startOfWeek),
    end: toDateStr(endOfWeek),
  };
}

function wfhUnitsForSession(session: string) {
  return session === "AM" || session === "PM" ? 0.5 : 1;
}

async function getWeeklyWfhUnits(teamMemberId: string, date: string, excludeId?: string) {
  const { start, end } = getISOWeekBounds(date);
  const events = await prisma.event.findMany({
    where: {
      teamMemberId,
      type: "WFH",
      date: { gte: start, lte: end },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { session: true },
  });
  return events.reduce((sum, e) => sum + wfhUnitsForSession(e.session), 0);
}

const EVENT_SELECT = {
  id: true,
  date: true,
  endDate: true,
  type: true,
  session: true,
  title: true,
  description: true,
  teamMemberId: true,
  teamMember: { select: { name: true, color: true } },
  createdAt: true,
} as const;

// --- Team Members ---
export async function getTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, color: true },
  });
}

export async function createTeamMember(name: string, color: string) {
  const existing = await prisma.teamMember.findUnique({ where: { name } });
  if (existing) throw new Error("Team member already exists");
  return prisma.teamMember.create({
    data: { name, color },
    select: { id: true, name: true, color: true },
  });
}

export async function updateTeamMember(id: string, color: string) {
  return prisma.teamMember.update({
    where: { id },
    data: { color },
    select: { id: true, name: true, color: true },
  });
}

export async function deleteTeamMember(id: string) {
  return prisma.teamMember.delete({
    where: { id },
    select: { id: true },
  });
}

// --- Events ---
export async function getEvents() {
  return prisma.event.findMany({
    orderBy: { date: "asc" },
    select: EVENT_SELECT,
  }) as Promise<SafeEvent[]>;
}

export async function getEventsForMonth(year: number, month: number) {
  // Pad 7 days before/after to cover leading+trailing calendar cells and
  // weekly-plan events whose date falls in the preceding week
  const paddedStart = toDateStr(new Date(year, month, -5)); // ~7 days before month start
  const paddedEnd = toDateStr(new Date(year, month + 1, 7)); // ~7 days after month end

  return prisma.event.findMany({
    where: {
      OR: [
        // Events starting within the padded window
        { date: { gte: paddedStart, lte: paddedEnd } },
        // Multi-day events that start before the window but extend into it
        { date: { lt: paddedStart }, endDate: { gte: paddedStart } },
      ],
    },
    orderBy: { date: "asc" },
    select: EVENT_SELECT,
  }) as Promise<SafeEvent[]>;
}

export async function getEventsForDay(date: string) {
  return prisma.event.findMany({
    where: {
      OR: [
        { date },
        { date: { lte: date }, endDate: { gte: date } },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: EVENT_SELECT,
  }) as Promise<SafeEvent[]>;
}

export async function createEvent(data: {
  date: string;
  endDate?: string;
  type: string;
  session?: string;
  title?: string;
  description?: string;
  teamMemberId?: string;
}) {
  if (data.type === "WFH" && data.teamMemberId) {
    const currentUnits = await getWeeklyWfhUnits(data.teamMemberId, data.date);
    const incomingUnits = wfhUnitsForSession(data.session || "FULL_DAY");
    if (currentUnits + incomingUnits > 2) {
      throw new Error(
        "WFH limit reached (2/2 this week). Delete or edit an existing entry first."
      );
    }
  }

  return prisma.event.create({
    data: {
      date: data.date,
      endDate: data.endDate || null,
      type: data.type,
      session: data.session || "FULL_DAY",
      title: data.title || null,
      description: data.description || null,
      teamMemberId: data.teamMemberId || null,
    },
    select: EVENT_SELECT,
  }) as Promise<SafeEvent>;
}

export async function updateEvent(
  id: string,
  data: {
    date?: string;
    endDate?: string | null;
    type?: string;
    session?: string;
    title?: string;
    description?: string;
    teamMemberId?: string | null;
  }
) {
  // Fetch the existing record so we can validate using the full effective values,
  // even when only a subset of fields is being updated (e.g. session-only change)
  const existing = await prisma.event.findUniqueOrThrow({
    where: { id },
    select: { type: true, date: true, session: true, teamMemberId: true },
  });

  const effectiveType = data.type ?? existing.type;
  const effectiveDate = data.date ?? existing.date;
  const effectiveSession = data.session ?? existing.session;
  const effectiveMemberId =
    data.teamMemberId !== undefined ? data.teamMemberId : existing.teamMemberId;

  if (effectiveType === "WFH" && effectiveMemberId) {
    const currentUnits = await getWeeklyWfhUnits(effectiveMemberId, effectiveDate, id);
    const incomingUnits = wfhUnitsForSession(effectiveSession);
    if (currentUnits + incomingUnits > 2) {
      throw new Error(
        "WFH limit reached (2/2 this week). Delete or edit an existing entry first."
      );
    }
  }

  return prisma.event.update({
    where: { id },
    data: {
      ...(data.date !== undefined && { date: data.date }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.session !== undefined && { session: data.session }),
      ...(data.title !== undefined && { title: data.title || null }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.teamMemberId !== undefined && { teamMemberId: data.teamMemberId || null }),
    },
    select: EVENT_SELECT,
  }) as Promise<SafeEvent>;
}

export async function deleteEvent(id: string) {
  return prisma.event.delete({
    where: { id },
    select: { id: true },
  });
}
