import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/lib/theme";
import type { RsvpSummary } from "@/types/models";

type RsvpSummaryCardProps = {
  summary: RsvpSummary;
};

const rows: { key: keyof RsvpSummary; label: string }[] = [
  { key: "yes", label: "Yes" },
  { key: "no", label: "No" },
  { key: "maybe", label: "Maybe" },
  { key: "noResponse", label: "No response" },
  { key: "expectedAttendance", label: "Expected attendance" },
];

export function RsvpSummaryCard({ summary }: RsvpSummaryCardProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>RSVP Summary</Text>

      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.key} style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{summary[row.key]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  row: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 40,
    paddingTop: spacing.sm,
  },
  rows: {
    gap: spacing.sm,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  value: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
});
