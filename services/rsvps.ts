import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { RSVP, RSVPStatus, RsvpSummary } from "@/types/models";

type RsvpRow = Database["public"]["Tables"]["rsvps"]["Row"];
type RsvpInsert = Database["public"]["Tables"]["rsvps"]["Insert"];

export type RsvpStatusByEventId = Record<string, RSVPStatus>;

const emptySummary: RsvpSummary = {
  expectedAttendance: 0,
  maybe: 0,
  no: 0,
  noResponse: 0,
  yes: 0,
};

const missingSupabaseMessage =
  "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment.";

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(missingSupabaseMessage);
  }
}

function mapRsvp(row: RsvpRow): RSVP {
  return {
    createdAt: row.created_at,
    eventId: row.event_id,
    id: row.id,
    profileId: row.profile_id,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function buildSummary(rows: Pick<RsvpRow, "status">[], chapterMemberCount: number): RsvpSummary {
  const summary = rows.reduce<RsvpSummary>(
    (current, row) => ({
      ...current,
      [row.status]: current[row.status] + 1,
    }),
    { ...emptySummary },
  );
  const totalResponses = summary.yes + summary.no + summary.maybe;

  return {
    ...summary,
    expectedAttendance: summary.yes,
    noResponse: Math.max(chapterMemberCount - totalResponses, 0),
  };
}

export async function getMyRsvpForEvent(
  eventId: string,
  profileId: string,
): Promise<RSVP | null> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .eq("event_id", eventId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRsvp(data) : null;
}

export async function upsertMyRsvp(
  eventId: string,
  profileId: string,
  status: RSVPStatus,
): Promise<RSVP> {
  assertSupabaseConfigured();

  const rsvp: RsvpInsert = {
    event_id: eventId,
    profile_id: profileId,
    status,
  };

  const { data, error } = await supabase
    .from("rsvps")
    .upsert(rsvp, { onConflict: "event_id,profile_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRsvp(data);
}

export async function getRsvpSummaryForEvent(
  eventId: string,
  chapterId: string,
): Promise<RsvpSummary> {
  assertSupabaseConfigured();

  const { data: rsvps, error: rsvpsError } = await supabase
    .from("rsvps")
    .select("status")
    .eq("event_id", eventId);

  if (rsvpsError) {
    throw new Error(rsvpsError.message);
  }

  const { count, error: membersError } = await supabase
    .from("chapter_members")
    .select("id", { count: "exact", head: true })
    .eq("chapter_id", chapterId);

  if (membersError) {
    throw new Error(membersError.message);
  }

  return buildSummary(rsvps ?? [], count ?? 0);
}

export async function getRsvpsForChapterEvents(
  eventIds: string[],
  profileId: string,
): Promise<RsvpStatusByEventId> {
  assertSupabaseConfigured();

  if (eventIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("rsvps")
    .select("event_id,status")
    .eq("profile_id", profileId)
    .in("event_id", eventIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reduce<RsvpStatusByEventId>((current, row) => {
    current[row.event_id] = row.status;
    return current;
  }, {});
}
