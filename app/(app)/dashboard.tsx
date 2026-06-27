import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/components/AuthProvider";
import { colors, spacing } from "@/lib/theme";

export default function DashboardScreen() {
  const { signOut, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setError(null);
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to log out.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Screen scroll={false} subtitle="You are signed in." title="Charter">
      <View style={styles.content}>
        {error ? <ErrorState message={error} title="Logout failed" /> : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Protected Dashboard</Text>
          <Text style={styles.panelText}>
            {user?.email ? `Signed in as ${user.email}.` : "Your session is active."}
          </Text>
        </View>

        <Button loading={isSigningOut} onPress={handleLogout} variant="secondary">
          Log Out
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  panelText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
});
