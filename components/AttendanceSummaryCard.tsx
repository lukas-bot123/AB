import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/lib/theme";
import type { AttendanceSummary } from "@/types/models";

type AttendanceSummaryCardProps = {
  summary: AttendanceSummary;
};

const rows: { key: keyof AttendanceSummary; label: string }[] = [
  { key: "present", label: "Present" },
  { key: "absent", label: "Absent" },
  { key: "late", label: "Late" },
  { key: "excused", label: "Excused" },
  { key: "notMarked", label: "Not marked" },
];

export function AttendanceSummaryCard({ summary }: AttendanceSummaryCardProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Attendance Summary</Text>

      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row.key} style={styles.item}>
            <Text style={styles.value}>{summary[row.key]}</Text>
            <Text style={styles.label}>{row.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  item: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexBasis: "31%",
    flexGrow: 1,
    gap: spacing.xs,
    minWidth: 96,
    padding: spacing.md,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  panel: {
    gap: spacing.md,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  value: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
  },
});
