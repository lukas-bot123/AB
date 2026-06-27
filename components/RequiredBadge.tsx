import { StyleSheet, Text } from "react-native";

import { colors, radii, spacing } from "@/lib/theme";

type RequiredBadgeProps = {
  isRequired: boolean;
};

export function RequiredBadge({ isRequired }: RequiredBadgeProps) {
  return (
    <Text style={[styles.badge, isRequired ? styles.required : styles.optional]}>
      {isRequired ? "Required" : "Optional"}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.md,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optional: {
    backgroundColor: colors.surfaceMuted,
    color: colors.muted,
  },
  required: {
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
  },
});
