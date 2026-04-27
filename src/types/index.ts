export type EventType = "HOLIDAY" | "MEDICAL_LEAVE" | "WFH" | "PUBLIC_HOLIDAY" | "WEEKLY_PLAN";

export type SafeEvent = {
  id: string;
  date: string;
  type: string;
  title: string | null;
  description: string | null;
  teamMemberId: string | null;
  teamMember: {
    name: string;
    color: string;
  } | null;
  createdAt: Date;
};

export type SafeTeamMember = {
  id: string;
  name: string;
  color: string;
};

export type EventFilter = {
  types?: string[];
  teamMembers?: string[];
};
