import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type {
  Attendance,
  AttendanceStatus,
  AttendanceSummary,
  EventAttendanceBoardMember,
  RSVPStatus,
} from "@/types/models";

type AttendanceRow = Database["public"]["Tables"]["attendance"]["Row"];
type ChapterMembershipRow = Database["public"]["Tables"]["chapter_members"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type RsvpRow = Pick<Database["public"]["Tables"]["rsvps"]["Row"], "profile_id" | "status">;

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

function readRpcAttendance(data: AttendanceRow | AttendanceRow[] | null): Attendance {
  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error("Attendance update did not return a row.");
  }

  return mapAttendance(row);
}

export function buildAttendanceSummary(
  members: EventAttendanceBoardMember[],
): AttendanceSummary {
  return members.reduce<AttendanceSummary>(
    (summary, member) => {
      if (member.attendanceStatus === "present") {
        return { ...summary, present: summary.present + 1 };
      }

      if (member.attendanceStatus === "absent") {
        return { ...summary, absent: summary.absent + 1 };
      }

      if (member.attendanceStatus === "late") {
        return { ...summary, late: summary.late + 1 };
      }

      if (member.attendanceStatus === "excused") {
        return { ...summary, excused: summary.excused + 1 };
      }

      return { ...summary, notMarked: summary.notMarked + 1 };
    },
    {
      absent: 0,
      excused: 0,
      late: 0,
      notMarked: 0,
      present: 0,
    },
  );
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

export async function getEventAttendanceBoard(
  eventId: string,
  chapterId: string,
): Promise<EventAttendanceBoardMember[]> {
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

  const { data: rsvps, error: rsvpsError } = await supabase
    .from("rsvps")
    .select("profile_id,status")
    .eq("event_id", eventId)
    .in("profile_id", profileIds);

  if (rsvpsError) {
    throw new Error(rsvpsError.message);
  }

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("*")
    .eq("event_id", eventId)
    .in("profile_id", profileIds);

  if (attendanceError) {
    throw new Error(attendanceError.message);
  }

  const profilesById = new Map(
    ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
  );
  const rsvpsByProfileId = new Map(
    ((rsvps ?? []) as RsvpRow[]).map((rsvp) => [
      rsvp.profile_id,
      rsvp.status as RSVPStatus,
    ]),
  );
  const attendanceByProfileId = new Map(
    ((attendance ?? []) as AttendanceRow[]).map((row) => [row.profile_id, mapAttendance(row)]),
  );

  return ((memberships ?? []) as ChapterMembershipRow[])
    .map((membership) => {
      const profile = profilesById.get(membership.profile_id);

      if (!profile) {
        return null;
      }

      const attendanceRow = attendanceByProfileId.get(membership.profile_id) ?? null;

      return {
        attendanceMethod: attendanceRow?.method ?? null,
        attendanceStatus: attendanceRow?.status ?? null,
        checkedInAt: attendanceRow?.checkedInAt ?? null,
        email: profile.email,
        fullName: profile.full_name,
        profileId: membership.profile_id,
        role: membership.role,
        rsvpStatus: rsvpsByProfileId.get(membership.profile_id) ?? null,
      };
    })
    .filter((member): member is EventAttendanceBoardMember => member !== null);
}

export async function setManualAttendanceStatus(
  eventId: string,
  profileId: string,
  status: AttendanceStatus,
): Promise<Attendance> {
  assertSupabaseConfigured();

  const { data, error } = await supabase.rpc("set_event_attendance_status", {
    p_event_id: eventId,
    p_profile_id: profileId,
    p_status: status,
  });

  if (error) {
    throw new Error(error.message);
  }

  return readRpcAttendance(data);
}
