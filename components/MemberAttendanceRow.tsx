import { StyleSheet, Text, View } from "react-native";

import { AttendanceStatusBadge } from "@/components/AttendanceStatusBadge";
import { Button } from "@/components/Button";
import { colors, radii, spacing } from "@/lib/theme";
import type { AttendanceStatus, EventAttendanceBoardMember, RSVPStatus } from "@/types/models";

type MemberAttendanceRowProps = {
  disabled?: boolean;
  member: EventAttendanceBoardMember;
  onSetStatus: (profileId: string, status: AttendanceStatus) => void;
  updatingStatus?: AttendanceStatus | null;
};

const statusOptions: { label: string; status: AttendanceStatus }[] = [
  { label: "Present", status: "present" },
  { label: "Absent", status: "absent" },
  { label: "Late", status: "late" },
  { label: "Excused", status: "excused" },
];

function labelRole(role: string) {
  return role === "officer" ? "Officer" : "Member";
}

function labelRsvp(status: RSVPStatus | null) {
  if (status === "yes") {
    return "RSVP: Yes";
  }

  if (status === "no") {
    return "RSVP: No";
  }

  if (status === "maybe") {
    return "RSVP: Maybe";
  }

  return "RSVP: No response";
}

export function MemberAttendanceRow({
  disabled = false,
  member,
  onSetStatus,
  updatingStatus = null,
}: MemberAttendanceRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.name}>{member.fullName}</Text>
          <Text style={styles.meta}>{labelRole(member.role)}</Text>
        </View>
        <AttendanceStatusBadge status={member.attendanceStatus} />
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.rsvp}>{labelRsvp(member.rsvpStatus)}</Text>
        {member.attendanceMethod ? (
          <Text style={styles.method}>
            {member.attendanceMethod === "code" ? "Code check-in" : "Manual correction"}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {statusOptions.map((option) => {
          const isSelected = member.attendanceStatus === option.status;
          const isUpdating = updatingStatus === option.status;

          return (
            <Button
              disabled={disabled}
              fullWidth={false}
              key={option.status}
              loading={isUpdating}
              onPress={() => onSetStatus(member.profileId, option.status)}
              style={styles.action}
              variant={isSelected ? "secondary" : "ghost"}
            >
              {option.label}
            </Button>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 46,
    paddingHorizontal: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  method: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  name: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  rsvp: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "900",
  },
  statusRow: {
    gap: spacing.xs,
  },
});
