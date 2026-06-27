import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors, radii, spacing } from "@/lib/theme";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: ButtonVariant;
};

export function Button({
  children,
  disabled = false,
  fullWidth = true,
  loading = false,
  onPress,
  style,
  variant = "primary",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.white : colors.primaryDark} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.58,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  ghost: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
  },
  ghostLabel: {
    color: colors.ink,
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
  },
  pressed: {
    transform: [{ translateY: 1 }],
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryLabel: {
    color: colors.white,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
  },
  secondaryLabel: {
    color: colors.primaryDark,
  },
});
