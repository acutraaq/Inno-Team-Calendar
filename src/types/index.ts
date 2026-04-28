export type EventType = "ANNUAL_LEAVE" | "HALFDAY" | "FLEXI_HALFDAY" | "TRAINING" | "EVENT" | "MEDICAL_LEAVE" | "WFH" | "PUBLIC_HOLIDAY" | "MEETING";
export type EventSession = "FULL_DAY" | "AM" | "PM";

export type SafeEvent = {
  id: string;
  date: string;
  endDate: string | null;
  type: string;
  session: string;
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
