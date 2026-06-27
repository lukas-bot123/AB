import { Pressable, StyleSheet, Text, View } from "react-native";

import { RequiredBadge } from "@/components/RequiredBadge";
import { getEventCheckInLabel, getEventCheckInState } from "@/lib/checkins";
import { formatEventDateRange, getEventTimingLabel } from "@/lib/dates";
import { colors, spacing } from "@/lib/theme";
import type { ChapterEvent, RSVPStatus } from "@/types/models";

type EventCardProps = {
  event: ChapterEvent;
  onPress: () => void;
  rsvpStatus?: RSVPStatus | null;
};

function formatRsvpStatus(status: RSVPStatus | null) {
  if (status === "yes") {
    return "RSVP: Going";
  }

  if (status === "no") {
    return "RSVP: Not going";
  }

  if (status === "maybe") {
    return "RSVP: Maybe";
  }

  return "Needs RSVP";
}

export function EventCard({ event, onPress, rsvpStatus }: EventCardProps) {
  const checkInState = getEventCheckInState(event);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={styles.titleStack}>
          <Text numberOfLines={2} style={styles.title}>
            {event.title}
          </Text>
          <Text style={styles.meta}>{formatEventDateRange(event.startsAt, event.endsAt)}</Text>
        </View>
        <RequiredBadge isRequired={event.isRequired} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.status}>{getEventTimingLabel(event.startsAt)}</Text>
        {event.location ? (
          <Text numberOfLines={1} style={styles.location}>
            {event.location}
          </Text>
        ) : null}
      </View>

      {rsvpStatus !== undefined ? (
        <Text style={[styles.rsvp, rsvpStatus === null && styles.rsvpNeeded]}>
          {formatRsvpStatus(rsvpStatus)}
        </Text>
      ) : null}

      <Text style={[styles.checkIn, checkInState === "open" && styles.checkInOpen]}>
        {getEventCheckInLabel(event)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  checkIn: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900",
  },
  checkInOpen: {
    color: colors.primaryDark,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  location: {
    color: colors.muted,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    transform: [{ translateY: 1 }],
  },
  rsvp: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "900",
  },
  rsvpNeeded: {
    color: colors.warning,
  },
  status: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  titleStack: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
});
