"use server";

import { prisma } from "@/lib/prisma";

// --- Helpers ---
function getISOWeekBounds(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    start: startOfWeek.toISOString().split("T")[0],
    end: endOfWeek.toISOString().split("T")[0],
  };
}

export type SafeEvent = {
  id: string;
  date: string;
  type: string;
  session: string;
  title: string | null;
  description: string | null;
  teamMemberId: string | null;
  teamMember: { name: string; color: string } | null;
  createdAt: Date;
};

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

  return events.reduce((sum, event) => sum + wfhUnitsForSession(event.session), 0);
}

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
    select: {
      id: true,
      date: true,
      type: true,
      session: true,
      title: true,
      description: true,
      teamMemberId: true,
      teamMember: { select: { name: true, color: true } },
      createdAt: true,
    },
  });
}

export async function getEventsForMonth(year: number, month: number) {
  const startDate = new Date(year, month, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
  return prisma.event.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      type: true,
      session: true,
      title: true,
      description: true,
      teamMemberId: true,
      teamMember: { select: { name: true, color: true } },
      createdAt: true,
    },
  });
}

export async function getEventsForDay(date: string) {
  return prisma.event.findMany({
    where: { date },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      date: true,
      type: true,
      session: true,
      title: true,
      description: true,
      teamMemberId: true,
      teamMember: { select: { name: true, color: true } },
      createdAt: true,
    },
  });
}

export async function getWeeklyPlanForCurrentWeek() {
  const today = new Date();
  const day = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - day);
  const weekStartStr = startOfWeek.toISOString().split("T")[0];

  return prisma.event.findFirst({
    where: {
      date: weekStartStr,
      type: "WEEKLY_PLAN",
    },
    select: {
      id: true,
      date: true,
      title: true,
      description: true,
    },
  });
}

export async function createEvent(data: {
  date: string;
  type: string;
  session?: string;
  title?: string;
  description?: string;
  teamMemberId?: string;
}) {
  // Validate WFH limit
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
      type: data.type,
      session: data.session || "FULL_DAY",
      title: data.title || null,
      description: data.description || null,
      teamMemberId: data.teamMemberId || null,
    },
    select: {
      id: true,
      date: true,
      type: true,
      session: true,
      title: true,
      description: true,
      teamMemberId: true,
      teamMember: { select: { name: true, color: true } },
      createdAt: true,
    },
  }) as Promise<SafeEvent>;
}

export async function updateEvent(
  id: string,
  data: {
    date?: string;
    type?: string;
    session?: string;
    title?: string;
    description?: string;
    teamMemberId?: string | null;
  }
) {
  // Validate WFH limit if changing to WFH or changing date
  if (data.type === "WFH" && data.teamMemberId && data.date) {
    const currentUnits = await getWeeklyWfhUnits(data.teamMemberId, data.date, id);
    const incomingUnits = wfhUnitsForSession(data.session || "FULL_DAY");
    if (currentUnits + incomingUnits > 2) {
      throw new Error(
        "WFH limit reached (2/2 this week). Delete or edit an existing entry first."
      );
    }
  }

  return prisma.event.update({
    where: { id },
    data: {
      ...(data.date && { date: data.date }),
      ...(data.type && { type: data.type }),
      ...(data.session && { session: data.session }),
      title: data.title,
      description: data.description,
      ...(data.teamMemberId !== undefined && {
        teamMemberId: data.teamMemberId || null,
      }),
    },
    select: {
      id: true,
      date: true,
      type: true,
      session: true,
      title: true,
      description: true,
      teamMemberId: true,
      teamMember: { select: { name: true, color: true } },
      createdAt: true,
    },
  }) as Promise<SafeEvent>;
}

export async function deleteEvent(id: string) {
  return prisma.event.delete({
    where: { id },
    select: { id: true },
  });
}
