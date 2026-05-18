"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SafeEvent } from "@/types";

type TxClient = Prisma.TransactionClient;

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

const VALID_TYPES = new Set([
  "ANNUAL_LEAVE",
  "HALFDAY",
  "FLEXI_HALFDAY",
  "TRAINING",
  "EVENT",
  "MEDICAL_LEAVE",
  "WFH",
  "PUBLIC_HOLIDAY",
  "MEETING",
]);
const VALID_SESSIONS = new Set(["FULL_DAY", "AM", "PM"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateEventInput(input: {
  type?: string;
  session?: string;
  date?: string;
  endDate?: string | null;
  title?: string;
  description?: string;
}) {
  if (input.type !== undefined && !VALID_TYPES.has(input.type)) {
    throw new Error(`Invalid event type: ${input.type}`);
  }
  if (input.session !== undefined && !VALID_SESSIONS.has(input.session)) {
    throw new Error(`Invalid session: ${input.session}`);
  }
  if (input.date !== undefined && !DATE_RE.test(input.date)) {
    throw new Error(`Invalid date format (expected YYYY-MM-DD): ${input.date}`);
  }
  if (input.endDate && !DATE_RE.test(input.endDate)) {
    throw new Error(`Invalid endDate format (expected YYYY-MM-DD): ${input.endDate}`);
  }
  if (input.endDate && input.date && input.endDate < input.date) {
    throw new Error("End date cannot be before start date");
  }
  if (input.title !== undefined && input.title.length > 200) {
    throw new Error("Title is too long (max 200 characters)");
  }
  if (input.description !== undefined && input.description.length > 2000) {
    throw new Error("Description is too long (max 2000 characters)");
  }
}

async function getWeeklyWfhUnits(
  client: TxClient | typeof prisma,
  teamMemberId: string,
  date: string,
  excludeId?: string
) {
  const { start, end } = getISOWeekBounds(date);
  const events = await client.event.findMany({
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

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

function validateTeamMemberName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");
  if (trimmed.length > 60) throw new Error("Name is too long (max 60 characters)");
  return trimmed;
}

function validateColor(color: string) {
  if (!HEX_COLOR_RE.test(color)) {
    throw new Error("Color must be a hex value like #RRGGBB");
  }
}

export async function createTeamMember(name: string, color: string) {
  const cleanName = validateTeamMemberName(name);
  validateColor(color);
  const existing = await prisma.teamMember.findUnique({ where: { name: cleanName } });
  if (existing) throw new Error("Team member already exists");
  return prisma.teamMember.create({
    data: { name: cleanName, color },
    select: { id: true, name: true, color: true },
  });
}

export async function updateTeamMember(id: string, color: string) {
  validateColor(color);
  return prisma.teamMember.update({
    where: { id },
    data: { color },
    select: { id: true, name: true, color: true },
  });
}

export async function deleteTeamMember(id: string) {
  const eventCount = await prisma.event.count({ where: { teamMemberId: id } });
  if (eventCount > 0) {
    throw new Error(
      `Cannot delete member: they have ${eventCount} event${eventCount === 1 ? "" : "s"}. Remove their events first.`
    );
  }
  return prisma.teamMember.delete({
    where: { id },
    select: { id: true },
  });
}

// --- Events ---
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

export async function getEventsByTitle(year: number, title: string) {
  if (!title || title.trim().length === 0) {
    return [] as SafeEvent[];
  }
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return prisma.event.findMany({
    where: {
      title: { contains: title.trim(), mode: "insensitive" },
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
    select: EVENT_SELECT,
  }) as Promise<SafeEvent[]>;
}

export async function searchEventTitles(year: number, query: string) {
  const q = query?.trim() ?? "";
  if (q.length === 0) return [] as { title: string; date: string }[];
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const events = await prisma.event.findMany({
    where: {
      title: { contains: q, mode: "insensitive" },
      date: { gte: start, lte: end },
    },
    distinct: ["title"],
    orderBy: { date: "asc" },
    take: 20,
    select: { title: true, date: true },
  });
  return events.filter((e): e is { title: string; date: string } => !!e.title && !!e.date);
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
  validateEventInput(data);

  return prisma.$transaction(async (tx) => {
    if (data.type === "WFH" && data.teamMemberId) {
      const currentUnits = await getWeeklyWfhUnits(tx, data.teamMemberId, data.date);
      const incomingUnits = wfhUnitsForSession(data.session || "FULL_DAY");
      if (currentUnits + incomingUnits > 2) {
        throw new Error(
          "WFH limit reached (2/2 this week). Delete or edit an existing entry first."
        );
      }
    }

    return tx.event.create({
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
    });
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
  validateEventInput(data);

  return prisma.$transaction(async (tx) => {
    // Fetch the existing record so we can validate using the full effective values,
    // even when only a subset of fields is being updated (e.g. session-only change)
    const existing = await tx.event.findUniqueOrThrow({
      where: { id },
      select: { type: true, date: true, session: true, teamMemberId: true },
    });

    const effectiveType = data.type ?? existing.type;
    const effectiveDate = data.date ?? existing.date;
    const effectiveSession = data.session ?? existing.session;
    const effectiveMemberId =
      data.teamMemberId !== undefined ? data.teamMemberId : existing.teamMemberId;

    if (effectiveType === "WFH" && effectiveMemberId) {
      const currentUnits = await getWeeklyWfhUnits(tx, effectiveMemberId, effectiveDate, id);
      const incomingUnits = wfhUnitsForSession(effectiveSession);
      if (currentUnits + incomingUnits > 2) {
        throw new Error(
          "WFH limit reached (2/2 this week). Delete or edit an existing entry first."
        );
      }
    }

    return tx.event.update({
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
    });
  }) as Promise<SafeEvent>;
}

export async function getWeeklyWfhUsage(
  teamMemberId: string,
  date: string,
  excludeId?: string
): Promise<number> {
  return getWeeklyWfhUnits(prisma, teamMemberId, date, excludeId);
}

export async function deleteEvent(id: string) {
  return prisma.event.delete({
    where: { id },
    select: { id: true },
  });
}
