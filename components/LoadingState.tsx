import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/lib/theme";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.xl,
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});
