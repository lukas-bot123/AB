export type AuthFormState = {
  email: string;
  password: string;
};

export type ChapterRole = "officer" | "member";

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
