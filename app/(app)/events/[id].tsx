import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { RequiredBadge } from "@/components/RequiredBadge";
import { RSVPButtons } from "@/components/RSVPButtons";
import { RsvpSummaryCard } from "@/components/RsvpSummaryCard";
import { Screen } from "@/components/Screen";
import { useChapter } from "@/components/ChapterProvider";
import { formatEventDateRange, getEventTimingLabel } from "@/lib/dates";
import { colors, spacing } from "@/lib/theme";
import { getEventById } from "@/services/events";
import { getMyRsvpForEvent, getRsvpSummaryForEvent, upsertMyRsvp } from "@/services/rsvps";
import type { ChapterEvent, RSVP, RSVPStatus, RsvpSummary } from "@/types/models";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const eventId = firstParam(id);
  const { activeChapter, profile } = useChapter();
  const [event, setEvent] = useState<ChapterEvent | null>(null);
  const [myRsvp, setMyRsvp] = useState<RSVP | null>(null);
  const [rsvpSummary, setRsvpSummary] = useState<RsvpSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<RSVPStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [rsvpSuccess, setRsvpSuccess] = useState<string | null>(null);
  const isOfficer = activeChapter?.membership.role === "officer";

  useEffect(() => {
    let isActive = true;

    async function loadEvent() {
      if (!activeChapter || !eventId || !profile) {
        setEvent(null);
        setMyRsvp(null);
        setRsvpSummary(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const nextEvent = await getEventById(eventId, activeChapter.chapter.id);
        const nextRsvp = nextEvent ? await getMyRsvpForEvent(eventId, profile.id) : null;
        const nextSummary =
          nextEvent && activeChapter.membership.role === "officer"
            ? await getRsvpSummaryForEvent(eventId, activeChapter.chapter.id)
            : null;

        if (isActive) {
          setEvent(nextEvent);
          setMyRsvp(nextRsvp);
          setRsvpSummary(nextSummary);
          setError(null);
          setRsvpError(null);
          setRsvpSuccess(null);
        }
      } catch (nextError) {
        if (isActive) {
          setError(nextError instanceof Error ? nextError.message : "Unable to load event.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      isActive = false;
    };
  }, [activeChapter, eventId, profile]);

  async function handleRsvpSelect(status: RSVPStatus) {
    if (!activeChapter || !event || !profile || savingStatus) {
      return;
    }

    setSavingStatus(status);
    setRsvpError(null);
    setRsvpSuccess(null);

    try {
      const nextRsvp = await upsertMyRsvp(event.id, profile.id, status);
      const nextSummary = isOfficer
        ? await getRsvpSummaryForEvent(event.id, activeChapter.chapter.id)
        : rsvpSummary;

      setMyRsvp(nextRsvp);
      setRsvpSummary(nextSummary);
      setRsvpSuccess("RSVP saved.");
    } catch (nextError) {
      setRsvpError(nextError instanceof Error ? nextError.message : "Unable to save RSVP.");
    } finally {
      setSavingStatus(null);
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading event..." />;
  }

  return (
    <Screen subtitle={activeChapter?.chapter.name ?? "Chapter event"} title="Event">
      <View style={styles.stack}>
        {error ? <ErrorState message={error} title="Event failed to load" /> : null}

        {!event ? (
          <EmptyState message="This event is not available." title="Event not found" />
        ) : (
          <View style={styles.panel}>
            <View style={styles.header}>
              <View style={styles.titleStack}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.meta}>{getEventTimingLabel(event.startsAt)}</Text>
              </View>
              <RequiredBadge isRequired={event.isRequired} />
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>When</Text>
              <Text style={styles.detailValue}>
                {formatEventDateRange(event.startsAt, event.endsAt)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Where</Text>
              <Text style={styles.detailValue}>{event.location ?? "Location not listed"}</Text>
            </View>

            {event.description ? (
              <View style={styles.descriptionBlock}>
                <Text style={styles.detailLabel}>Details</Text>
                <Text style={styles.description}>{event.description}</Text>
              </View>
            ) : null}
          </View>
        )}

        {event ? (
          <View style={styles.stack}>
            <RSVPButtons
              disabled={!profile}
              onSelect={handleRsvpSelect}
              savingStatus={savingStatus}
              value={myRsvp?.status ?? null}
            />

            {rsvpSuccess ? <Text style={styles.success}>{rsvpSuccess}</Text> : null}
            {rsvpError ? <ErrorState message={rsvpError} title="RSVP failed" /> : null}
          </View>
        ) : null}

        {event && isOfficer && rsvpSummary ? <RsvpSummaryCard summary={rsvpSummary} /> : null}

        <Button onPress={() => router.push("/events")} variant="secondary">
          Back to Events
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  description: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  descriptionBlock: {
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  detailRow: {
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  detailValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  meta: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  stack: {
    gap: spacing.md,
  },
  success: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "800",
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32,
  },
  titleStack: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
});
