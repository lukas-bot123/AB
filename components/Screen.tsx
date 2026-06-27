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
    alignSelf: "center",
    flexGrow: 1,
    maxWidth: 720,
    padding: spacing.xl,
    width: "100%",
  },
  footer: {
    alignSelf: "center",
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    maxWidth: 720,
    padding: spacing.lg,
    width: "100%",
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
    alignSelf: "center",
    flex: 1,
    maxWidth: 720,
    padding: spacing.xl,
    width: "100%",
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
