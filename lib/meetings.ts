export const meetingTypes = ["intro", "recruiter", "technical"] as const;

export type MeetingType = (typeof meetingTypes)[number];

export type MeetingDefinition = {
  readonly type: MeetingType;
  readonly durationMinutes: number;
  readonly title: string;
  readonly description: string;
};

export const meetings: Record<MeetingType, MeetingDefinition> = {
  intro: {
    type: "intro",
    durationMinutes: 15,
    title: "Intro Call",
    description: "Quick introduction and opportunity discussion."
  },
  recruiter: {
    type: "recruiter",
    durationMinutes: 30,
    title: "Recruiter Discussion",
    description: "Role, company, expectations and hiring process discussion."
  },
  technical: {
    type: "technical",
    durationMinutes: 60,
    title: "Technical Discussion",
    description: "Technical interview, engineering challenges and project deep dive."
  }
};

export function isMeetingType(value: unknown): value is MeetingType {
  return typeof value === "string" && meetingTypes.includes(value as MeetingType);
}

export function getMeeting(type: MeetingType): MeetingDefinition {
  return meetings[type];
}
