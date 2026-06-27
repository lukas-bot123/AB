import { Redirect } from "expo-router";

import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/components/AuthProvider";
import { useChapter } from "@/components/ChapterProvider";

export default function IndexRoute() {
  const { isLoading, session } = useAuth();
  const { activeChapter, isLoading: isChapterLoading } = useChapter();

  if (isLoading || (session && isChapterLoading)) {
    return <LoadingState message="Opening Charter..." />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return <Redirect href={activeChapter ? "/dashboard" : "/chapter/setup"} />;
}
