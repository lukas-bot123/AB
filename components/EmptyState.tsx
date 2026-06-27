import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/lib/theme";

type EmptyStateProps = {
  message: string;
  title: string;
};

export function EmptyState({ message, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
});
