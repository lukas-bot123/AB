import { PropsWithChildren, useEffect } from "react";
import { router, useSegments } from "expo-router";

import { useChapter } from "@/components/ChapterProvider";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/components/AuthProvider";

const authRouteGroup = "(auth)";
const appRouteGroup = "(app)";

export function AuthRouteGuard({ children }: PropsWithChildren) {
  const segments = useSegments();
  const { isLoading, session } = useAuth();
  const { activeChapter, isLoading: isChapterLoading } = useChapter();
  const routeSegments = segments.map((segment) => String(segment));
  const currentRoot = routeSegments[0];
  const isAuthRoute = currentRoot === authRouteGroup;
  const isChapterSetupRoute =
    currentRoot === appRouteGroup &&
    routeSegments[1] === "chapter" &&
    routeSegments[2] === "setup";

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!session && !isAuthRoute) {
      router.replace("/login");
      return;
    }

    if (session && isChapterLoading) {
      return;
    }

    if (session && isAuthRoute) {
      router.replace(activeChapter ? "/dashboard" : "/chapter/setup");
      return;
    }

    if (session && !activeChapter && !isChapterSetupRoute) {
      router.replace("/chapter/setup");
      return;
    }

    if (session && activeChapter && isChapterSetupRoute) {
      router.replace("/dashboard");
    }
  }, [activeChapter, isAuthRoute, isChapterLoading, isChapterSetupRoute, isLoading, session]);

  if (isLoading || (session && isChapterLoading)) {
    return <LoadingState message="Restoring your session..." />;
  }

  return children;
}
