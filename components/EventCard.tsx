import { Pressable, StyleSheet, Text, View } from "react-native";

import { RequiredBadge } from "@/components/RequiredBadge";
import { formatEventDateRange, getEventTimingLabel } from "@/lib/dates";
import { colors, spacing } from "@/lib/theme";
import type { ChapterEvent } from "@/types/models";

type EventCardProps = {
  event: ChapterEvent;
  onPress: () => void;
};

export function EventCard({ event, onPress }: EventCardProps) {
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
