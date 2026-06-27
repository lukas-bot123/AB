export type AuthFormState = {
  email: string;
  password: string;
};

export type ChapterRole = "officer" | "member";

export type RSVPStatus = "yes" | "no" | "maybe";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type AttendanceMethod = "code" | "manual";

export type CheckInResultStatus =
  | "already_checked_in"
  | "checked_in"
  | "closed"
  | "not_open"
  | "wrong_code";

export type Profile = {
  createdAt: string;
  email: string;
  fullName: string;
  id: string;
};

export type Chapter = {
  createdAt: string;
  id: string;
  inviteCode: string;
  name: string;
  university: string | null;
};

export type ChapterMembership = {
  chapterId: string;
  createdAt: string;
  id: string;
  profileId: string;
  role: ChapterRole;
};

export type ActiveChapter = {
  chapter: Chapter;
  membership: ChapterMembership;
};

export type ChapterRosterMember = {
  membership: ChapterMembership;
  profile: Profile;
};

export type ChapterEvent = {
  chapterId: string;
  checkinClosesAt: string | null;
  checkinCode: string | null;
  checkinOpensAt: string | null;
  createdAt: string;
  createdBy: string;
  description: string | null;
  endsAt: string | null;
  id: string;
  isRequired: boolean;
  location: string | null;
  startsAt: string;
  title: string;
};

export type CreateEventInput = {
  chapterId: string;
  createdBy: string;
  description: string;
  endsAt: string | null;
  isRequired: boolean;
  location: string;
  startsAt: string;
  title: string;
};

export type RSVP = {
  createdAt: string;
  eventId: string;
  id: string;
  profileId: string;
  status: RSVPStatus;
  updatedAt: string;
};

export type RsvpSummary = {
  expectedAttendance: number;
  maybe: number;
  no: number;
  noResponse: number;
  yes: number;
};

export type Attendance = {
  checkedInAt: string | null;
  createdAt: string;
  eventId: string;
  id: string;
  method: AttendanceMethod;
  profileId: string;
  status: AttendanceStatus;
  updatedAt: string;
};

export type CheckInSubmission = {
  attendance: Attendance | null;
  message: string;
  result: CheckInResultStatus;
};
