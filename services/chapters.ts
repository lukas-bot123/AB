import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { ActiveChapter, Chapter, ChapterMembership } from "@/types/models";

type ChapterRow = Database["public"]["Tables"]["chapters"]["Row"];
type MembershipRow = Database["public"]["Tables"]["chapter_members"]["Row"];
type ChapterRpcRow =
  Database["public"]["Functions"]["create_chapter_with_membership"]["Returns"][number];

type CreateChapterInput = {
  name: string;
  university: string;
};

const missingSupabaseMessage =
  "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.";

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(missingSupabaseMessage);
  }
}

function mapChapter(row: ChapterRow): Chapter {
  return {
    createdAt: row.created_at,
    id: row.id,
    inviteCode: row.invite_code,
    name: row.name,
    university: row.university,
  };
}

function mapMembership(row: MembershipRow): ChapterMembership {
  return {
    chapterId: row.chapter_id,
    createdAt: row.created_at,
    id: row.id,
    profileId: row.profile_id,
    role: row.role,
  };
}

function mapRpcRow(row: ChapterRpcRow, profileId: string): ActiveChapter {
  return {
    chapter: {
      createdAt: row.chapter_created_at,
      id: row.chapter_id,
      inviteCode: row.invite_code,
      name: row.chapter_name,
      university: row.university,
    },
    membership: {
      chapterId: row.chapter_id,
      createdAt: row.membership_created_at,
      id: row.membership_id,
      profileId,
      role: row.role,
    },
  };
}

function normalizeInviteCode(inviteCode: string) {
  return inviteCode.trim().toUpperCase();
}

function generateInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function firstRpcRow(rows: ChapterRpcRow[] | null) {
  const row = rows?.[0];

  if (!row) {
    throw new Error("The chapter request did not return a result.");
  }

  return row;
}

function isInviteCollision(error: Error) {
  return error.message.toLowerCase().includes("invite_code");
}

export async function getActiveChapter(profileId: string) {
  assertSupabaseConfigured();

  const { data: memberships, error: membershipError } = await supabase
    .from("chapter_members")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const membership = memberships?.[0];

  if (!membership) {
    return null;
  }

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", membership.chapter_id)
    .single();

  if (chapterError) {
    throw new Error(chapterError.message);
  }

  return {
    chapter: mapChapter(chapter),
    membership: mapMembership(membership),
  };
}

export async function createChapter(profileId: string, input: CreateChapterInput) {
  assertSupabaseConfigured();

  const name = input.name.trim();

  if (!name) {
    throw new Error("Chapter name is required.");
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = generateInviteCode();
    const { data, error } = await supabase.rpc("create_chapter_with_membership", {
      p_invite_code: inviteCode,
      p_name: name,
      p_university: input.university.trim() || null,
    });

    if (!error) {
      return mapRpcRow(firstRpcRow(data), profileId);
    }

    const nextError = new Error(error.message);

    if (!isInviteCollision(nextError)) {
      throw nextError;
    }
  }

  throw new Error("Unable to generate a unique invite code. Try again.");
}

export async function joinChapter(profileId: string, inviteCode: string) {
  assertSupabaseConfigured();

  const normalizedCode = normalizeInviteCode(inviteCode);

  if (!normalizedCode) {
    throw new Error("Invite code is required.");
  }

  const { data, error } = await supabase.rpc("join_chapter_by_invite_code", {
    p_invite_code: normalizedCode,
  });

  if (error) {
    throw new Error(error.message);
  }

  return mapRpcRow(firstRpcRow(data), profileId);
}
