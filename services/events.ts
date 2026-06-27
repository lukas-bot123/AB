import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { ChapterEvent, CreateEventInput } from "@/types/models";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

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

function normalizeOptionalText(value: string) {
  return value.trim() || null;
}

export async function getChapterEvents(chapterId: string): Promise<ChapterEvent[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapEvent);
}

export async function getEventById(eventId: string, chapterId: string): Promise<ChapterEvent | null> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("chapter_id", chapterId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapEvent(data) : null;
}

export async function createEvent(input: CreateEventInput): Promise<ChapterEvent> {
  assertSupabaseConfigured();

  const title = input.title.trim();

  if (!title) {
    throw new Error("Event title is required.");
  }

  const eventInsert: EventInsert = {
    chapter_id: input.chapterId,
    created_by: input.createdBy,
    description: normalizeOptionalText(input.description),
    ends_at: input.endsAt,
    is_required: input.isRequired,
    location: normalizeOptionalText(input.location),
    starts_at: input.startsAt,
    title,
  };

  const { data, error } = await supabase
    .from("events")
    .insert(eventInsert)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapEvent(data);
}
