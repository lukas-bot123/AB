import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { Attendance } from "@/types/models";

type AttendanceRow = Database["public"]["Tables"]["attendance"]["Row"];

const missingSupabaseMessage =
  "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.";

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(missingSupabaseMessage);
  }
}

export function mapAttendance(row: AttendanceRow): Attendance {
  return {
    checkedInAt: row.checked_in_at,
    createdAt: row.created_at,
    eventId: row.event_id,
    id: row.id,
    method: row.method,
    profileId: row.profile_id,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export async function getMyAttendanceForEvent(
  eventId: string,
  profileId: string,
): Promise<Attendance | null> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("event_id", eventId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapAttendance(data) : null;
}
