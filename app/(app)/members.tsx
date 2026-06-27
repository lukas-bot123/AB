import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Screen } from "@/components/Screen";
import { useChapter } from "@/components/ChapterProvider";
import { colors, spacing } from "@/lib/theme";
import { listChapterMembers } from "@/services/members";
import type { ChapterRosterMember } from "@/types/models";

function labelRole(role: string) {
  return role === "officer" ? "Officer" : "Member";
}

export default function MembersScreen() {
  const { activeChapter } = useChapter();
  const [members, setMembers] = useState<ChapterRosterMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadMembers() {
      if (!activeChapter) {
        setMembers([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const nextMembers = await listChapterMembers(activeChapter.chapter.id);

        if (isActive) {
          setMembers(nextMembers);
          setError(null);
        }
      } catch (nextError) {
        if (isActive) {
          setError(nextError instanceof Error ? nextError.message : "Unable to load members.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      isActive = false;
    };
  }, [activeChapter]);

  if (isLoading) {
    return <LoadingState message="Loading members..." />;
  }

  return (
    <Screen
      subtitle={activeChapter ? activeChapter.chapter.name : "Chapter roster"}
      title="Members"
    >
      <View style={styles.stack}>
        {error ? <ErrorState message={error} title="Members failed to load" /> : null}

        {!activeChapter ? (
          <EmptyState message="Create or join a chapter to view members." title="No chapter" />
        ) : null}

        {activeChapter && members.length === 0 ? (
          <EmptyState message="No members are visible yet." title="No members" />
        ) : null}

        {members.map((member) => (
          <View key={member.membership.id} style={styles.memberRow}>
            <View style={styles.memberCopy}>
              <Text style={styles.memberName}>{member.profile.fullName}</Text>
              <Text style={styles.memberEmail}>{member.profile.email}</Text>
            </View>
            <Text style={styles.roleBadge}>{labelRole(member.membership.role)}</Text>
          </View>
        ))}

        <Button onPress={() => router.push("/dashboard")} variant="secondary">
          Back to Dashboard
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  memberCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  memberEmail: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  memberName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  memberRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  roleBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stack: {
    gap: spacing.md,
  },
});
