import { Suspense } from "react";
import CalendarPageClient from "@/components/CalendarPageClient";
import { getEventsForMonth, getTeamMembers } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const [events, teamMembers] = await Promise.all([
    getEventsForMonth(now.getFullYear(), now.getMonth()),
    getTeamMembers(),
  ]);

  return (
    <Suspense fallback={<div className="p-10 text-stone-400">Loading calendar...</div>}>
      <CalendarPageClient initialEvents={events} initialTeamMembers={teamMembers} />
    </Suspense>
  );
}
