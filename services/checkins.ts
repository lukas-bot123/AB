import { getMyAttendanceForEvent } from "@/services/attendance";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { ChapterEvent, CheckInSubmission } from "@/types/models";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type CheckInResultRow = Database["public"]["Functions"]["check_in_with_code"]["Returns"][number];

const missingSupabaseMessage =
  "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.";

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(missingSupabaseMessage);
  }
}

function mapEvent(row: EventRow): ChapterEvent {
  return {
    chapterId: row.chapter_id,
    checkinClosesAt: row.checkin_closes_at,
    checkinCode: row.checkin_code,
    checkinOpensAt: row.checkin_opens_at,
    createdAt: row.created_at,
    createdBy: row.created_by,
    description: row.description,
    endsAt: row.ends_at,
    id: row.id,
    isRequired: row.is_required,
    location: row.location,
    startsAt: row.starts_at,
    title: row.title,
  };
}

function readRpcEvent(data: EventRow | EventRow[] | null): ChapterEvent {
  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error("Check-in update did not return an event.");
  }

  return mapEvent(row);
}

function readCheckInResult(rows: CheckInResultRow[] | null): CheckInResultRow {
  const result = rows?.[0];

  if (!result) {
    throw new Error("Check-in did not return a result.");
  }

  return result;
}

export async function startCheckIn(eventId: string): Promise<ChapterEvent> {
  assertSupabaseConfigured();

  const { data, error } = await supabase.rpc("start_event_checkin", {
    p_event_id: eventId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return readRpcEvent(data);
}

export async function closeCheckIn(eventId: string): Promise<ChapterEvent> {
  assertSupabaseConfigured();

  const { data, error } = await supabase.rpc("close_event_checkin", {
    p_event_id: eventId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return readRpcEvent(data);
}

export async function submitCheckInCode(
  eventId: string,
  profileId: string,
  code: string,
): Promise<CheckInSubmission> {
  assertSupabaseConfigured();

  const { data, error } = await supabase.rpc("check_in_with_code", {
    p_code: code.trim(),
    p_event_id: eventId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = readCheckInResult(data);
  const attendance =
    result.result === "checked_in" || result.result === "already_checked_in"
      ? await getMyAttendanceForEvent(eventId, profileId)
      : null;

  return {
    attendance,
    message: result.message,
    result: result.result,
  };
}
