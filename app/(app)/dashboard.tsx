import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/components/AuthProvider";
import { useChapter } from "@/components/ChapterProvider";
import { colors, spacing } from "@/lib/theme";

function labelRole(role: string) {
  return role === "officer" ? "Officer" : "Member";
}

export default function DashboardScreen() {
  const { signOut, user } = useAuth();
  const { activeChapter, error: chapterError } = useChapter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOfficer = activeChapter?.membership.role === "officer";

  async function handleLogout() {
    setError(null);
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to log out.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Screen scroll={false} subtitle="Your chapter workspace is ready." title="Charter">
      <View style={styles.content}>
        {error ? <ErrorState message={error} title="Logout failed" /> : null}
        {chapterError ? <ErrorState message={chapterError} title="Chapter load failed" /> : null}

        {activeChapter ? (
          <View style={styles.panel}>
            <Text style={styles.kicker}>Chapter</Text>
            <Text style={styles.chapterName}>{activeChapter.chapter.name}</Text>
            {activeChapter.chapter.university ? (
              <Text style={styles.panelText}>{activeChapter.chapter.university}</Text>
            ) : null}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role</Text>
              <Text style={styles.detailValue}>{labelRole(activeChapter.membership.role)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invite Code</Text>
              <Text style={styles.detailValue}>{activeChapter.chapter.inviteCode}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Signed In</Text>
              <Text style={styles.detailValue}>{user?.email ?? "Active session"}</Text>
            </View>
          </View>
        ) : (
          <EmptyState
            message="Create or join a chapter to continue."
            title="Chapter setup required"
          />
        )}

        <Button onPress={() => router.push("/events")} variant="ghost">
          View Events
        </Button>

        {isOfficer ? (
          <Button onPress={() => router.push("/events/new")}>Create Event</Button>
        ) : null}

        <Button onPress={() => router.push("/members")} variant="ghost">
          View Members
        </Button>

        <Button loading={isSigningOut} onPress={handleLogout} variant="secondary">
          Log Out
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  chapterName: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  detailRow: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  detailValue: {
    color: colors.ink,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },
  kicker: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  panelText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
});
