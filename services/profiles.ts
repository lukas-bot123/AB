import type { User } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { Profile } from "@/types/models";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const missingSupabaseMessage =
  "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.";

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(missingSupabaseMessage);
  }
}

function mapProfile(row: ProfileRow): Profile {
  return {
    createdAt: row.created_at,
    email: row.email,
    fullName: row.full_name,
    id: row.id,
  };
}

function getFullNameFromUser(user: User) {
  const metadataName = user.user_metadata.full_name ?? user.user_metadata.name;

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  const emailName = user.email?.split("@")[0]?.trim();

  if (emailName) {
    return emailName;
  }

  return "Charter User";
}

export async function ensureProfile(user: User) {
  assertSupabaseConfigured();

  if (!user.email) {
    throw new Error("An email address is required to create a profile.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        email: user.email,
        full_name: getFullNameFromUser(user),
        id: user.id,
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}
