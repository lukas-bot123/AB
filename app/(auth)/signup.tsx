import { Link } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/components/AuthProvider";
import { colors, spacing } from "@/lib/theme";

type SignupErrors = {
  email?: string;
  fullName?: string;
  password?: string;
};

function validateSignup(fullName: string, email: string, password: string) {
  const errors: SignupErrors = {};

  if (!fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!email.includes("@")) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  return errors;
}

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors = validateSignup(fullName, email, password);
    setErrors(nextErrors);
    setFormError(null);
    setSuccessMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp({ email, fullName, password });
      setSuccessMessage(
        "Account created. If email confirmation is required, confirm your email before signing in.",
      );
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen subtitle="Create your account to continue to Charter." title="Create Account">
      <View style={styles.form}>
        {formError ? <ErrorState message={formError} title="Signup failed" /> : null}
        {successMessage ? (
          <View style={styles.success}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <TextField
          autoComplete="name"
          error={errors.fullName}
          label="Full Name"
          onChangeText={setFullName}
          placeholder="Full name"
          textContentType="name"
          value={fullName}
        />

        <TextField
          autoComplete="email"
          error={errors.email}
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@example.com"
          textContentType="emailAddress"
          value={email}
        />

        <TextField
          autoComplete="new-password"
          error={errors.password}
          label="Password"
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
          textContentType="newPassword"
          value={password}
        />

        <Button loading={isSubmitting} onPress={handleSubmit}>
          Create Account
        </Button>

        <Text style={styles.switchText}>
          Already have an account?{" "}
          <Link href="/login" style={styles.switchLink}>
            Sign in
          </Link>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
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
  switchLink: {
    color: colors.primaryDark,
    fontWeight: "900",
  },
  switchText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
});
