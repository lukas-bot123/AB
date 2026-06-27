import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/components/AuthProvider";
import { AuthRouteGuard } from "@/components/AuthRouteGuard";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AuthRouteGuard>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </AuthRouteGuard>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
