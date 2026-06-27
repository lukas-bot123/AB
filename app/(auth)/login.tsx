import { Link } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/components/AuthProvider";
import { colors, spacing } from "@/lib/theme";

type LoginErrors = {
  email?: string;
  password?: string;
};

function validateLogin(email: string, password: string) {
  const errors: LoginErrors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!email.includes("@")) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors = validateLogin(email, password);
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn({ email, password });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen subtitle="Sign in to continue to Charter." title="Charter">
      <View style={styles.form}>
        {formError ? <ErrorState message={formError} title="Sign in failed" /> : null}

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
          autoComplete="password"
          error={errors.password}
          label="Password"
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
          textContentType="password"
          value={password}
        />

        <Button loading={isSubmitting} onPress={handleSubmit}>
          Sign In
        </Button>

        <Text style={styles.switchText}>
          New to Charter?{" "}
          <Link href="/signup" style={styles.switchLink}>
            Create an account
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
