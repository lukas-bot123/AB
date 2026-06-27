import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { ChapterMembership, ChapterRosterMember, Profile } from "@/types/models";

type MembershipRow = Database["public"]["Tables"]["chapter_members"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const missingSupabaseMessage =
  "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.";

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(missingSupabaseMessage);
  }
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

function mapProfile(row: ProfileRow): Profile {
  return {
    createdAt: row.created_at,
    email: row.email,
    fullName: row.full_name,
    id: row.id,
  };
}

export async function listChapterMembers(chapterId: string): Promise<ChapterRosterMember[]> {
  assertSupabaseConfigured();

  const { data: memberships, error: membershipsError } = await supabase
    .from("chapter_members")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: true });

  if (membershipsError) {
    throw new Error(membershipsError.message);
  }

  if (!memberships?.length) {
    return [];
  }

  const profileIds = memberships.map((membership) => membership.profile_id);
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", profileIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, mapProfile(profile)]));

  return memberships
    .map((membership) => {
      const profile = profilesById.get(membership.profile_id);

      if (!profile) {
        return null;
      }

      return {
        membership: mapMembership(membership),
        profile,
      };
    })
    .filter((member): member is ChapterRosterMember => member !== null);
}
