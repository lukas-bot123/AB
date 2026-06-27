import { PropsWithChildren, useEffect } from "react";
import { router, useSegments } from "expo-router";

import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/components/AuthProvider";

const authRouteGroup = "(auth)";

export function AuthRouteGuard({ children }: PropsWithChildren) {
  const segments = useSegments();
  const { isLoading, session } = useAuth();
  const currentRoot = segments[0];
  const isAuthRoute = currentRoot === authRouteGroup;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!session && !isAuthRoute) {
      router.replace("/login");
      return;
    }

    if (session && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [isAuthRoute, isLoading, session]);

  if (isLoading) {
    return <LoadingState message="Restoring your session..." />;
  }

  return children;
}
