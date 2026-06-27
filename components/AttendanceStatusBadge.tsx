import { StyleSheet, Text } from "react-native";

import { colors, radii, spacing } from "@/lib/theme";
import type { AttendanceStatus } from "@/types/models";

type AttendanceStatusBadgeProps = {
  status: AttendanceStatus | null;
};

function getStatusLabel(status: AttendanceStatus | null) {
  if (status === "present") {
    return "Present";
  }

  if (status === "absent") {
    return "Absent";
  }

  if (status === "late") {
    return "Late";
  }

  if (status === "excused") {
    return "Excused";
  }

  return "Not marked";
}

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  return (
    <Text
      style={[
        styles.badge,
        status === "present" && styles.present,
        status === "absent" && styles.absent,
        status === "late" && styles.late,
        status === "excused" && styles.excused,
        status === null && styles.empty,
      ]}
    >
      {getStatusLabel(status)}
    </Text>
  );
}

const styles = StyleSheet.create({
  absent: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
  },
  badge: {
    borderRadius: radii.md,
    fontSize: 13,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  empty: {
    backgroundColor: colors.surfaceMuted,
    color: colors.muted,
  },
  excused: {
    backgroundColor: colors.surfaceMuted,
    color: colors.accent,
  },
  late: {
    backgroundColor: colors.surfaceMuted,
    color: colors.warning,
  },
  present: {
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
  },
});
