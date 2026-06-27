import { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, spacing } from "@/lib/theme";

type ScreenProps = PropsWithChildren<{
  footer?: ReactNode;
  scroll?: boolean;
  subtitle?: string;
  title?: string;
}>;

export function Screen({ children, footer, scroll = true, subtitle, title }: ScreenProps) {
  const Body = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <Body
          contentContainerStyle={scroll ? styles.content : undefined}
          style={!scroll ? styles.staticContent : undefined}
        >
          {(title || subtitle) && (
            <View style={styles.header}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          )}
          {children}
        </Body>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  footer: {
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  keyboard: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  staticContent: {
    flex: 1,
    padding: spacing.xl,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 38,
  },
});
