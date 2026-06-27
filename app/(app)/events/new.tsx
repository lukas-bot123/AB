import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useChapter } from "@/components/ChapterProvider";
import { parseEventDateTimeInput } from "@/lib/dates";
import { colors, spacing } from "@/lib/theme";
import { createEvent } from "@/services/events";

type FormErrors = {
  endsAt?: string;
  startsAt?: string;
  title?: string;
};

export default function NewEventScreen() {
  const { activeChapter, profile } = useChapter();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isOfficer = activeChapter?.membership.role === "officer";

  async function handleCreateEvent() {
    const nextErrors: FormErrors = {};
    const parsedStartsAt = parseEventDateTimeInput(startsAt);
    const parsedEndsAt = endsAt.trim() ? parseEventDateTimeInput(endsAt) : null;

    if (!title.trim()) {
      nextErrors.title = "Event title is required.";
    }

    if (!startsAt.trim()) {
      nextErrors.startsAt = "Start date and time are required.";
    } else if (!parsedStartsAt) {
      nextErrors.startsAt = "Use YYYY-MM-DD HH:MM.";
    }

    if (endsAt.trim() && !parsedEndsAt) {
      nextErrors.endsAt = "Use YYYY-MM-DD HH:MM.";
    }

    if (parsedStartsAt && parsedEndsAt && new Date(parsedEndsAt) < new Date(parsedStartsAt)) {
      nextErrors.endsAt = "End time cannot be before start time.";
    }

    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!activeChapter || !profile) {
      setFormError("Chapter information is still loading. Try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const event = await createEvent({
        chapterId: activeChapter.chapter.id,
        createdBy: profile.id,
        description,
        endsAt: parsedEndsAt,
        isRequired,
        location,
        startsAt: parsedStartsAt ?? "",
        title,
      });

      router.replace(`/events/${event.id}`);
    } catch (nextError) {
      setFormError(nextError instanceof Error ? nextError.message : "Unable to create event.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOfficer) {
    return (
      <Screen subtitle="Only chapter officers can create events." title="Create Event">
        <View style={styles.stack}>
          <ErrorState
            message="You can view chapter events, but event creation is limited to officers."
            title="Officer access required"
          />
          <Button onPress={() => router.replace("/events")} variant="secondary">
            Back to Events
          </Button>
        </View>
      </Screen>
    );
  }

  return (
    <Screen subtitle={activeChapter?.chapter.name ?? "Chapter event"} title="Create Event">
      <View style={styles.stack}>
        {formError ? <ErrorState message={formError} title="Event failed to save" /> : null}

        <View style={styles.panel}>
          <TextField
            editable={!isSubmitting}
            error={errors.title}
            label="Title"
            onChangeText={setTitle}
            placeholder="Event title"
            value={title}
          />

          <TextField
            editable={!isSubmitting}
            error={errors.startsAt}
            keyboardType="numbers-and-punctuation"
            label="Starts At"
            onChangeText={setStartsAt}
            placeholder="YYYY-MM-DD HH:MM"
            value={startsAt}
          />

          <TextField
            editable={!isSubmitting}
            error={errors.endsAt}
            keyboardType="numbers-and-punctuation"
            label="Ends At"
            onChangeText={setEndsAt}
            placeholder="Optional"
            value={endsAt}
          />

          <TextField
            autoCapitalize="words"
            editable={!isSubmitting}
            label="Location"
            onChangeText={setLocation}
            placeholder="Optional"
            value={location}
          />

          <TextField
            editable={!isSubmitting}
            label="Description"
            multiline
            onChangeText={setDescription}
            placeholder="Optional"
            style={styles.descriptionInput}
            value={description}
          />

          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleLabel}>Required Event</Text>
              <Text style={styles.toggleMeta}>{isRequired ? "Required" : "Optional"}</Text>
            </View>
            <Switch
              disabled={isSubmitting}
              onValueChange={setIsRequired}
              trackColor={{ false: colors.line, true: colors.primarySoft }}
              thumbColor={isRequired ? colors.primary : colors.muted}
              value={isRequired}
            />
          </View>

          <Button loading={isSubmitting} onPress={handleCreateEvent}>
            Create Event
          </Button>
        </View>

        <Button onPress={() => router.push("/events")} variant="secondary">
          Back to Events
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  descriptionInput: {
    minHeight: 110,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  stack: {
    gap: spacing.md,
  },
  toggleCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  toggleLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  toggleMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  toggleRow: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: spacing.lg,
  },
});
