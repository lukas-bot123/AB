import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { getEventCheckInState } from "@/lib/checkins";
import { colors, radii, spacing } from "@/lib/theme";
import type { Attendance, ChapterEvent } from "@/types/models";

type MemberCheckInBoxProps = {
  attendance: Attendance | null;
  error?: string | null;
  event: ChapterEvent;
  isSubmitting?: boolean;
  onSubmit: (code: string) => void;
  success?: string | null;
};

function cleanCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 4);
}

export function MemberCheckInBox({
  attendance,
  error,
  event,
  isSubmitting = false,
  onSubmit,
  success,
}: MemberCheckInBoxProps) {
  const [code, setCode] = useState("");
  const state = getEventCheckInState(event);
  const isCheckedIn = attendance?.status === "present" && attendance.checkedInAt !== null;
  const isMarkedLate = attendance?.status === "late";
  const isMarkedAbsent = attendance?.status === "absent";
  const isMarkedExcused = attendance?.status === "excused";
  const hasManualAttendance = attendance?.method === "manual" && !isCheckedIn;
  const canSubmitCode = state === "open" && !isCheckedIn && !hasManualAttendance;

  function handleSubmit() {
    onSubmit(code);
  }

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>Check-In</Text>

        {isCheckedIn ? <Text style={styles.open}>Checked in</Text> : null}
        {hasManualAttendance ? <Text style={styles.muted}>Attendance marked</Text> : null}
        {canSubmitCode ? <Text style={styles.open}>Check-in open</Text> : null}
        {!isCheckedIn && !hasManualAttendance && state === "closed" ? (
          <Text style={styles.closed}>Check-in closed</Text>
        ) : null}
        {!isCheckedIn && !hasManualAttendance && state === "not_open" ? (
          <Text style={styles.muted}>Not open</Text>
        ) : null}
      </View>

      {isCheckedIn ? (
        <Text style={styles.copy}>You're checked in for this event.</Text>
      ) : null}

      {!isCheckedIn && isMarkedLate ? (
        <Text style={styles.copy}>An officer marked you late for this event.</Text>
      ) : null}

      {!isCheckedIn && isMarkedAbsent ? (
        <Text style={styles.copy}>An officer marked you absent for this event.</Text>
      ) : null}

      {!isCheckedIn && isMarkedExcused ? (
        <Text style={styles.copy}>An officer marked you excused for this event.</Text>
      ) : null}

      {!isCheckedIn && !hasManualAttendance && state === "not_open" ? (
        <Text style={styles.copy}>Check-in is not open yet.</Text>
      ) : null}

      {!isCheckedIn && !hasManualAttendance && state === "closed" ? (
        <Text style={styles.copy}>Check-in is closed for this event.</Text>
      ) : null}

      {canSubmitCode ? (
        <View style={styles.form}>
          <TextField
            error={null}
            inputMode="numeric"
            keyboardType="number-pad"
            label="4-digit code"
            maxLength={4}
            onChangeText={(value) => setCode(cleanCode(value))}
            placeholder="1234"
            returnKeyType="done"
            value={code}
          />
          <Button
            disabled={code.length !== 4 || isSubmitting}
            loading={isSubmitting}
            onPress={handleSubmit}
          >
            Submit Check-In
          </Button>
        </View>
      ) : null}

      {success ? <Text style={styles.success}>{success}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  closed: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  copy: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  form: {
    gap: spacing.md,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  open: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  success: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  title: {
    color: colors.ink,
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
  },
});
