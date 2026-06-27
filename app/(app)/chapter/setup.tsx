import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useChapter } from "@/components/ChapterProvider";
import { colors, spacing } from "@/lib/theme";

type CreateErrors = {
  name?: string;
};

type JoinErrors = {
  inviteCode?: string;
};

function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase();
}

export default function ChapterSetupScreen() {
  const { createChapter, error, isLoading, joinChapter } = useChapter();
  const [chapterName, setChapterName] = useState("");
  const [university, setUniversity] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [createErrors, setCreateErrors] = useState<CreateErrors>({});
  const [joinErrors, setJoinErrors] = useState<JoinErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  if (isLoading) {
    return <LoadingState message="Checking your chapter..." />;
  }

  const isBusy = isCreating || isJoining;

  async function handleCreateChapter() {
    const nextErrors: CreateErrors = {};
    const name = chapterName.trim();

    if (!name) {
      nextErrors.name = "Chapter name is required.";
    }

    setCreateErrors(nextErrors);
    setJoinErrors({});
    setFormError(null);
    setSuccessMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsCreating(true);

    try {
      await createChapter({ name, university });
      setSuccessMessage("Chapter created.");
      router.replace("/dashboard");
    } catch (nextError) {
      setFormError(nextError instanceof Error ? nextError.message : "Unable to create chapter.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleJoinChapter() {
    const nextErrors: JoinErrors = {};
    const normalizedCode = normalizeInviteCode(inviteCode);

    if (!normalizedCode) {
      nextErrors.inviteCode = "Invite code is required.";
    }

    setJoinErrors(nextErrors);
    setCreateErrors({});
    setFormError(null);
    setSuccessMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsJoining(true);

    try {
      await joinChapter(normalizedCode);
      setSuccessMessage("Chapter joined.");
      router.replace("/dashboard");
    } catch (nextError) {
      setFormError(nextError instanceof Error ? nextError.message : "Unable to join chapter.");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <Screen subtitle="Create a chapter or join one with an invite code." title="Chapter Setup">
      <View style={styles.stack}>
        <EmptyState
          message="A chapter connects your account to the roster and protected workspace."
          title="No chapter yet"
        />

        {error ? <ErrorState message={error} title="Chapter load failed" /> : null}
        {formError ? <ErrorState message={formError} title="Request failed" /> : null}
        {successMessage ? (
          <View style={styles.success}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create a Chapter</Text>
          <TextField
            autoCapitalize="words"
            editable={!isBusy}
            error={createErrors.name}
            label="Chapter Name"
            onChangeText={setChapterName}
            placeholder="Chapter name"
            value={chapterName}
          />
          <TextField
            autoCapitalize="words"
            editable={!isBusy}
            label="University"
            onChangeText={setUniversity}
            placeholder="Optional"
            value={university}
          />
          <Button disabled={isBusy} loading={isCreating} onPress={handleCreateChapter}>
            Create Chapter
          </Button>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Join a Chapter</Text>
          <TextField
            autoCapitalize="characters"
            editable={!isBusy}
            error={joinErrors.inviteCode}
            label="Invite Code"
            onChangeText={(value) => setInviteCode(normalizeInviteCode(value))}
            placeholder="ABC123"
            value={inviteCode}
          />
          <Button
            disabled={isBusy}
            loading={isJoining}
            onPress={handleJoinChapter}
            variant="secondary"
          >
            Join Chapter
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  stack: {
    gap: spacing.lg,
  },
  success: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing.lg,
  },
  successText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
});
