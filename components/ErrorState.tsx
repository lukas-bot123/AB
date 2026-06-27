import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/lib/theme";

type ErrorStateProps = {
  message: string;
  title?: string;
};

export function ErrorState({ message, title = "Something went wrong" }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  message: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21,
  },
  title: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "900",
  },
});
