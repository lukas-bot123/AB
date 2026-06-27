import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { createChapter, getActiveChapter, joinChapter } from "@/services/chapters";
import { ensureProfile } from "@/services/profiles";
import type { ActiveChapter, Profile } from "@/types/models";

type CreateChapterInput = {
  name: string;
  university: string;
};

type ChapterContextValue = {
  activeChapter: ActiveChapter | null;
  error: string | null;
  isLoading: boolean;
  profile: Profile | null;
  createChapter: (input: CreateChapterInput) => Promise<ActiveChapter>;
  joinChapter: (inviteCode: string) => Promise<ActiveChapter>;
  refreshChapter: () => Promise<void>;
};

const ChapterContext = createContext<ChapterContextValue | null>(null);

export function ChapterProvider({ children }: PropsWithChildren) {
  const { isLoading: isAuthLoading, user } = useAuth();
  const [activeChapter, setActiveChapter] = useState<ActiveChapter | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadChapterState() {
    if (!user) {
      setActiveChapter(null);
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const nextProfile = await ensureProfile(user);
      const nextChapter = await getActiveChapter(user.id);

      setProfile(nextProfile);
      setActiveChapter(nextChapter);
      setError(null);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Unable to load chapter information.",
      );
      setActiveChapter(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    loadChapterState();
  }, [isAuthLoading, user?.id]);

  const value = useMemo<ChapterContextValue>(
    () => ({
      activeChapter,
      error,
      isLoading,
      profile,
      createChapter: async (input) => {
        if (!user) {
          throw new Error("You must be signed in to create a chapter.");
        }

        const nextProfile = profile ?? (await ensureProfile(user));
        const nextChapter = await createChapter(nextProfile.id, input);

        setProfile(nextProfile);
        setActiveChapter(nextChapter);
        setError(null);

        return nextChapter;
      },
      joinChapter: async (inviteCode) => {
        if (!user) {
          throw new Error("You must be signed in to join a chapter.");
        }

        const nextProfile = profile ?? (await ensureProfile(user));
        const nextChapter = await joinChapter(nextProfile.id, inviteCode);

        setProfile(nextProfile);
        setActiveChapter(nextChapter);
        setError(null);

        return nextChapter;
      },
      refreshChapter: loadChapterState,
    }),
    [activeChapter, error, isLoading, profile, user],
  );

  return <ChapterContext.Provider value={value}>{children}</ChapterContext.Provider>;
}

export function useChapter() {
  const context = useContext(ChapterContext);

  if (!context) {
    throw new Error("useChapter must be used inside ChapterProvider.");
  }

  return context;
}
