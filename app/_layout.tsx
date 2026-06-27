import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/components/AuthProvider";
import { AuthRouteGuard } from "@/components/AuthRouteGuard";
import { ChapterProvider } from "@/components/ChapterProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ChapterProvider>
          <AuthRouteGuard>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </AuthRouteGuard>
        </ChapterProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
