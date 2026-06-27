import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/lib/theme";
import type { RSVPStatus } from "@/types/models";

type RSVPButtonsProps = {
  disabled?: boolean;
  onSelect: (status: RSVPStatus) => void;
  savingStatus?: RSVPStatus | null;
  value: RSVPStatus | null;
};

const options: { label: string; status: RSVPStatus }[] = [
  { label: "Going", status: "yes" },
  { label: "Not going", status: "no" },
  { label: "Maybe", status: "maybe" },
];

function statusLabel(status: RSVPStatus | null) {
  if (status === "yes") {
    return "Going";
  }

  if (status === "no") {
    return "Not going";
  }

  if (status === "maybe") {
    return "Maybe";
  }

  return "No RSVP yet";
}

export function RSVPButtons({
  disabled = false,
  onSelect,
  savingStatus = null,
  value,
}: RSVPButtonsProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>Your RSVP</Text>
        <Text style={styles.current}>{statusLabel(value)}</Text>
      </View>

      <View style={styles.actions}>
        {options.map((option) => {
          const isSelected = value === option.status;
          const isSaving = savingStatus === option.status;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                busy: isSaving,
                disabled: disabled || savingStatus !== null,
                selected: isSelected,
              }}
              disabled={disabled || savingStatus !== null}
              key={option.status}
              onPress={() => onSelect(option.status)}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                pressed && !disabled && savingStatus === null && styles.optionPressed,
                (disabled || savingStatus !== null) && styles.optionDisabled,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.primaryDark} />
              ) : (
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  current: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "900",
  },
  header: {
    gap: spacing.xs,
  },
  option: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  optionDisabled: {
    opacity: 0.72,
  },
  optionLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  optionLabelSelected: {
    color: colors.primaryDark,
  },
  optionPressed: {
    transform: [{ translateY: 1 }],
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
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
    fontSize: 18,
    fontWeight: "900",
  },
});
