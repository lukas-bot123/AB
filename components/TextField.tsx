import { TextInput, TextInputProps, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/lib/theme";

type TextFieldProps = TextInputProps & {
  error?: string | null;
  label: string;
};

export function TextField({ error, label, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        accessibilityLabel={label}
        accessibilityState={{ disabled: inputProps.editable === false }}
        placeholderTextColor={colors.muted}
        style={[styles.input, error && styles.inputError, style]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  field: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  inputError: {
    borderColor: colors.danger,
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
