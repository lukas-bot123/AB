import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import {
  getSession,
  listenToAuthChanges,
  signIn,
  signOut,
  signUp,
  type SignInInput,
  type SignUpInput,
} from "@/services/auth";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  restoreError: string | null;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      try {
        const restoredSession = await getSession();

        if (isActive) {
          setSession(restoredSession);
          setRestoreError(null);
        }
      } catch (error) {
        if (isActive) {
          setRestoreError(error instanceof Error ? error.message : "Unable to restore session.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    const unsubscribe = listenToAuthChanges((nextSession) => {
      setSession(nextSession);
    });

    restoreSession();

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      restoreError,
      signIn,
      signOut,
      signUp,
    }),
    [isLoading, restoreError, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
