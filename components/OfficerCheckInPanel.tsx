import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { getEventCheckInState } from "@/lib/checkins";
import { colors, radii, spacing } from "@/lib/theme";
import type { ChapterEvent } from "@/types/models";

type OfficerCheckInPanelProps = {
  error?: string | null;
  event: ChapterEvent;
  isClosing?: boolean;
  isStarting?: boolean;
  onClose: () => void;
  onStart: () => void;
  success?: string | null;
};

export function OfficerCheckInPanel({
  error,
  event,
  isClosing = false,
  isStarting = false,
  onClose,
  onStart,
  success,
}: OfficerCheckInPanelProps) {
  const state = getEventCheckInState(event);
  const isBusy = isClosing || isStarting;

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Check-In</Text>

        {state === "open" ? <Text style={styles.open}>Open</Text> : null}
        {state === "closed" ? <Text style={styles.closed}>Closed</Text> : null}
        {state === "not_open" ? <Text style={styles.muted}>Not open</Text> : null}
      </View>

      {state === "not_open" ? (
        <View style={styles.stack}>
          <Text style={styles.copy}>Start check-in when members are ready to enter the code.</Text>
          <Button disabled={isBusy} loading={isStarting} onPress={onStart}>
            Start Check-In
          </Button>
        </View>
      ) : null}

      {state === "open" ? (
        <View style={styles.stack}>
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Code</Text>
            <Text style={styles.code}>{event.checkinCode ?? "----"}</Text>
          </View>
          <Button
            disabled={isBusy}
            loading={isClosing}
            onPress={onClose}
            variant="secondary"
          >
            Close Check-In
          </Button>
        </View>
      ) : null}

      {state === "closed" ? (
        <Text style={styles.copy}>Check-in is closed for this event.</Text>
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
  code: {
    color: colors.ink,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 46,
    textAlign: "center",
  },
  codeBox: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  codeLabel: {
    color: colors.primaryDark,
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
  stack: {
    gap: spacing.md,
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
