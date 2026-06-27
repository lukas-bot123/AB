import { StyleSheet, Text, View } from "react-native";

import { AttendanceSummaryCard } from "@/components/AttendanceSummaryCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { MemberAttendanceRow } from "@/components/MemberAttendanceRow";
import { colors, radii, spacing } from "@/lib/theme";
import type {
  AttendanceStatus,
  AttendanceSummary,
  EventAttendanceBoardMember,
} from "@/types/models";

type OfficerAttendanceBoardProps = {
  error?: string | null;
  isLoading?: boolean;
  members: EventAttendanceBoardMember[];
  onSetStatus: (profileId: string, status: AttendanceStatus) => void;
  summary: AttendanceSummary;
  updatingProfileId?: string | null;
  updatingStatus?: AttendanceStatus | null;
};

export function OfficerAttendanceBoard({
  error = null,
  isLoading = false,
  members,
  onSetStatus,
  summary,
  updatingProfileId = null,
  updatingStatus = null,
}: OfficerAttendanceBoardProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Board</Text>
        <Text style={styles.count}>{members.length} members</Text>
      </View>

      <AttendanceSummaryCard summary={summary} />

      {isLoading ? <Text style={styles.loading}>Loading attendance...</Text> : null}
      {error ? <ErrorState message={error} title="Attendance board issue" /> : null}

      {!isLoading && members.length === 0 ? (
        <EmptyState
          message="No chapter members are visible for this event."
          title="No members"
        />
      ) : null}

      <View style={styles.list}>
        {members.map((member) => (
          <MemberAttendanceRow
            disabled={updatingProfileId !== null}
            key={member.profileId}
            member={member}
            onSetStatus={onSetStatus}
            updatingStatus={updatingProfileId === member.profileId ? updatingStatus : null}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  count: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  list: {
    gap: spacing.md,
  },
  loading: {
    color: colors.muted,
    fontSize: 15,
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
  title: {
    color: colors.ink,
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
  },
});
