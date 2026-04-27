import { Suspense } from "react";
import CalendarPageClient from "@/components/CalendarPageClient";
import { getEvents } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [events, teamMembers] = await Promise.all([
    getEvents(),
    prisma.teamMember.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <Suspense fallback={<div className="p-10 text-stone-400">Loading calendar...</div>}>
      <CalendarPageClient initialEvents={events} initialTeamMembers={teamMembers} />
    </Suspense>
  );
}
