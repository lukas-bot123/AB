import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { EventCard } from "@/components/EventCard";
import { LoadingState } from "@/components/LoadingState";
import { Screen } from "@/components/Screen";
import { useChapter } from "@/components/ChapterProvider";
import { spacing } from "@/lib/theme";
import { getChapterEvents } from "@/services/events";
import { getRsvpsForChapterEvents, type RsvpStatusByEventId } from "@/services/rsvps";
import type { ChapterEvent } from "@/types/models";

export default function EventsScreen() {
  const { activeChapter, profile } = useChapter();
  const [events, setEvents] = useState<ChapterEvent[]>([]);
  const [rsvpStatuses, setRsvpStatuses] = useState<RsvpStatusByEventId>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOfficer = activeChapter?.membership.role === "officer";

  useEffect(() => {
    let isActive = true;

    async function loadEvents() {
      if (!activeChapter) {
        setEvents([]);
        setRsvpStatuses({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const nextEvents = await getChapterEvents(activeChapter.chapter.id);
        const nextRsvpStatuses = profile
          ? await getRsvpsForChapterEvents(
              nextEvents.map((event) => event.id),
              profile.id,
            )
          : {};

        if (isActive) {
          setEvents(nextEvents);
          setRsvpStatuses(nextRsvpStatuses);
          setError(null);
        }
      } catch (nextError) {
        if (isActive) {
          setError(nextError instanceof Error ? nextError.message : "Unable to load events.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isActive = false;
    };
  }, [activeChapter, profile]);

  if (isLoading) {
    return <LoadingState message="Loading events..." />;
  }

  return (
    <Screen
      subtitle={activeChapter ? activeChapter.chapter.name : "Chapter events"}
      title="Events"
    >
      <View style={styles.stack}>
        {error ? <ErrorState message={error} title="Events failed to load" /> : null}

        {isOfficer ? (
          <Button onPress={() => router.push("/events/new")}>Create Event</Button>
        ) : null}

        {!activeChapter ? (
          <EmptyState message="Create or join a chapter to view events." title="No chapter" />
        ) : null}

        {activeChapter && events.length === 0 ? (
          <EmptyState message="New chapter events will appear here." title="No events yet" />
        ) : null}

        {events.map((event) => (
          <EventCard
            event={event}
            key={event.id}
            onPress={() => router.push(`/events/${event.id}`)}
            rsvpStatus={profile ? rsvpStatuses[event.id] ?? null : undefined}
          />
        ))}

        <Button onPress={() => router.push("/dashboard")} variant="secondary">
          Back to Dashboard
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
});
